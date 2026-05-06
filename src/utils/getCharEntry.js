import characterTable from "../data/operators/character_table.json";
import characterTableEN from "../data/operators/character_table_en.json";

import charPatchTable from "../data/operators/char_patch_table.json";
import charPatchTableEN from "../data/operators/char_patch_table_en.json";

import handbookTable from "../data/operators/handbook_info_table.json";
import handbookTableEN from "../data/operators/handbook_info_table_en.json";

import skinTable from "../data/operators/skin_table.json";
import uniequipTable from "../data/operators/uniequip_table.json";
import battleEquipTable from "../data/operators/battle_equip_table.json";

import charWordTable from "../data/operators/charword_table.json";
import charWordTableEN from "../data/operators/charword_table_en.json";


const patchChars = charPatchTable?.patchChars || {};
const patchCharsEN = charPatchTableEN?.patchChars || {};

const tableFinal = {
  ...characterTable,
  ...patchChars,
};

const tableENFinal = {
  ...patchChars,
  ...characterTableEN,
  ...patchCharsEN,
};

const AMIYA_FORMS = ["char_1001_amiya2", "char_1037_amiya3"];

const getRealCharId = (charId) => {
  return AMIYA_FORMS.includes(charId)
    ? "char_002_amiya"
    : charId;
};


export function getCharEntry(charId, lang = "vn") {
  if (!charId) return { charKey: null, charData: null };

  const isEN = lang === "en";

  const table = isEN ? tableENFinal : tableFinal;
  const handbookSrc = isEN ? handbookTableEN : handbookTable;
  const voiceSrc = isEN ? charWordTableEN : charWordTable;

  const realCharId = getRealCharId(charId);

  const operator = table[charId] || table[realCharId];
  const base = table[realCharId];

  if (!operator) {
    return { charKey: charId, charData: null };
  }

  // ===== A SKILL FIX =====
  const allSkillLvlup =
    operator.allSkillLvlup || base?.allSkillLvlup || [];

  const skills = (operator.skills || []).map((s, i) => ({
    ...s,
    levelUpCost:
      s.levelUpCost ||
      base?.skills?.[i]?.levelUpCost ||
      [],
  }));

  // ===== B SKIN FIX =====
  const skins = Object.values(skinTable).filter(
    (s) =>
      s.charId === charId ||
      s.charId === realCharId
  );

  // ===== C HANDBOOK FIX =====
  let handbook = handbookSrc[charId];

  if (!handbook) {
    const parent = handbookSrc[realCharId];
    handbook =
      parent?.storyTextAudio?.[charId] ||
      parent;
  }

  // ===== D MODULE FIX =====
  const modules = Object.values(uniequipTable).filter(
    (m) =>
      m.charId === charId ||
      m.charId === realCharId
  );

  const battleModules = Object.values(battleEquipTable).filter(
    (m) =>
      m.charId === charId ||
      m.charId === realCharId
  );

  // ===== E VOICE FIX =====
  const voiceData =
    voiceSrc[charId] ||
    voiceSrc[realCharId] ||
    {};

  return {
    charKey: charId,
    charData: {
      ...operator,
      allSkillLvlup,
      skills,
      skins,
      handbook,
      modules,
      battleModules,
      voiceData,
      realCharId,
    },
  };
}