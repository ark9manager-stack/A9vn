import characterTable from "../data/operators/character_table.json";
import characterTableEN from "../data/operators/character_table_en.json";

import charPatchTable from "../data/operators/char_patch_table.json";
import charPatchTableEN from "../data/operators/char_patch_table_en.json";

import handbookTable from "../data/profile/handbook_info_table.json";
import handbookTableEN from "../data/profile/handbook_info_table_en.json";

import skinTable from "../data/skins/skin_table.json";

import uniequipTable from "../data/module/uniequip_table.json";
import battleEquipTable from "../data/module/battle_equip_table.json";

import charWordTable from "../data/voiceline/charword_table.json";
import charWordTableEN from "../data/voiceline/charword_table_en.json";


// =========================
// BASE MERGE
// =========================

const patchChars = charPatchTable?.patchChars || {};
const patchCharsEN = charPatchTableEN?.patchChars || {};

export const characterTableFinal = {
  ...characterTable,
  ...patchChars,
};

export const characterTableENFinal = {
  ...characterTableEN,
  ...patchChars,
  ...patchCharsEN,
};


// =========================
// AMIYA DETECT
// =========================

const AMIYA_FORMS = ["char_1001_amiya2", "char_1037_amiya3"];

export const getRealCharId = (charId) => {
  if (AMIYA_FORMS.includes(charId)) return "char_002_amiya";
  return charId;
};


// =========================
// MAIN ACCESS FUNCTION
// =========================

export const getOperatorData = (charId, lang = "vn") => {
  const isEN = lang === "en";

  const table = isEN ? characterTableENFinal : characterTableFinal;
  const baseTable = isEN ? characterTableEN : characterTable;

  const realCharId = getRealCharId(charId);

  const operator = table[charId] || table[realCharId];

  // ===== A: SKILL FIX =====
  const baseOperator = table[realCharId];

  const allSkillLvlup =
    operator?.allSkillLvlup || baseOperator?.allSkillLvlup || [];

  const skills = (operator?.skills || []).map((s, i) => {
    const baseSkill = baseOperator?.skills?.[i];

    return {
      ...s,
      levelUpCost: s.levelUpCost || baseSkill?.levelUpCost || [],
    };
  });

  // ===== B: SKIN FIX =====
  const skins = Object.values(skinTable || {}).filter((s) => {
    return (
      s.charId === charId ||
      s.charId === realCharId
    );
  });

  // ===== C: HANDBOOK FIX =====
  let handbook = handbookTable[charId];

  if (!handbook) {
    const parent = handbookTable[realCharId];
    handbook =
      parent?.storyTextAudio?.[charId] ||
      parent?.handbookAvgList?.find?.(x => x.charId === charId) ||
      parent;
  }

  // ===== D: MODULE FIX =====
  const modules = Object.values(uniequipTable || {}).filter((m) => {
    return (
      m.charId === charId ||
      m.charId === realCharId
    );
  });

  const battleModules = Object.values(battleEquipTable || {}).filter((m) => {
    return (
      m.charId === charId ||
      m.charId === realCharId
    );
  });

  // ===== E: VOICE FIX =====
  const voiceData =
    charWordTable[charId] ||
    charWordTable[realCharId] ||
    {};

  const voiceDataEN =
    charWordTableEN[charId] ||
    charWordTableEN[realCharId] ||
    {};

  return {
    ...operator,
    allSkillLvlup,
    skills,
    skins,
    handbook,
    modules,
    battleModules,
    voiceData,
    voiceDataEN,
    realCharId,
  };
};