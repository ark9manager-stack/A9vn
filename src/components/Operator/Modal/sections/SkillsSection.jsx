import React from "react";

import characterTable from "../../../../data/operators/character_table.json";
import characterTableEN from "../../../../data/operators/character_table_en.json";

import traitVN from "../../../../data/operators/trait_vn.json";
import traitEN from "../../../../data/operators/trait_en.json";
import talentVN from "../../../../data/operators/talent_vn.json";

import skillTable from "../../../../data/operators/skill_table.json";
import skillTableEN from "../../../../data/operators/skill_table_en.json";
import skillVN from "../../../../data/operators/skill_vn.json";

import buildingData from "../../../../data/operators/building_data.json";
import buildingDataEN from "../../../../data/operators/building_data_en.json";
import buildingVN from "../../../../data/operators/building_vn.json";

import itemTable from "../../../../data/operators/item_table.json";
import rangeTable from "../../../../data/range_table.json";
import tagVN from "../../../../data/operators/tag_vn.json";
import StatHover, { renderInlineItalic } from "../../../StatHover";

/** Icons */
const POT_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/[uc]commonicons/ui_common_small/";
const getPotIcon = (idx0) => `${POT_ICON_BASE}potential_${idx0}.png`;

/** Icons (Skills) */
const SKILL_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/skills/skill_icon_";

/** Icons (Skill level) */
const SKILL_LEVEL_SOLID_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/number_hub/solid_";
const SKILL_LEVEL_SPEC_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/specialized_hub/specialized_";

/** Icons (SP UI) */
const SP_UI_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/ui/[uc]itemrepo/page/item_repo_page/";
const INIT_SP_BG = `${SP_UI_BASE}init_sp.png`;
const SP_COST_BG = `${SP_UI_BASE}image_sp_cost_bkg.png`;

/** Icons (Building skills) */
const BUILDING_SKILL_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/building/skills/";

/** Icons (Skill range indicator) */
const RANGE_ATTACK_SKILL =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/[uc]battlecommon/ui_battle_new/attack_range_attack.png";

/** Materials */
const ITEM_BG_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/ui/[uc]home/mail/panel_mail_item/";
const ITEM_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/items/icons/";

const RANGE_STAND =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/[uc]charattrdetail/attack_range_stand.png";

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function normalizeLang(lang) {
  const s = String(lang || "VN").toUpperCase();
  return s === "EN" ? "EN" : "VN";
}

function t(langNorm, vn, en) {
  return langNorm === "EN" ? en : vn;
}

function phaseToElite(phase) {
  const idx = phaseToIndex(phase);
  if (idx <= 0) return 0;
  if (idx === 1) return 1;
  return 2;
}

function formatUnlockCond(cond, langNorm) {
  const elite = phaseToElite(cond?.phase);
  const lvl = Number(cond?.level ?? 1);
  const levelNum = Number.isFinite(lvl) ? lvl : 1;
  return t(
    langNorm,
    `Cấp độ yêu cầu: Elite ${elite} level ${levelNum}`,
    `Required: Elite ${elite} level ${levelNum}`
  );
}

function secondsToHMS(sec) {
  const s = Number(sec);
  if (!Number.isFinite(s) || s <= 0) return "";
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = Math.floor(s % 60);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}`;
}

function isAlmostInt(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return false;
  return Math.abs(v - Math.round(v)) < 1e-9;
}

function trimFixed(n, digits = 1) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "";
  const s = v.toFixed(digits);
  return s.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

function formatDurationSeconds(duration, langNorm) {
  const d = Number(duration);
  if (!Number.isFinite(d) || d <= 0) return "";
  const v = isAlmostInt(d) ? String(Math.round(d)) : trimFixed(d, 1);
  return t(langNorm, `${v} giây`, `${v} seconds`);
}

function getSkillIconUrl(skillId) {
  if (!isNonEmptyString(skillId)) return "";
  return `${SKILL_ICON_BASE}${String(skillId).trim()}.png`;
}

function getSkillLevelIconUrl(level) {
  const lv = Number(level);
  if (!Number.isFinite(lv) || lv <= 0) return "";
  if (lv <= 7) return `${SKILL_LEVEL_SOLID_BASE}${lv}.png`;
  const m = lv - 7; // 1..3
  if (m >= 1 && m <= 3) return `${SKILL_LEVEL_SPEC_BASE}${m}.png`;
  return "";
}

function getSkillVnTitleKey(skillNo) {
  const n = Number(skillNo);
  if (!Number.isFinite(n) || n <= 0) return "";
  return `Title_S${n}`;
}

function getSkillVnDescKey(skillNo, level) {
  const n = Number(skillNo);
  const lv = Number(level);
  if (!Number.isFinite(n) || n <= 0) return "";
  if (!Number.isFinite(lv) || lv <= 0) return "";
  if (lv <= 7) return `S${n}_${lv}`;
  const m = lv - 7; // 1..3 (M1..M3)
  if (m >= 1 && m <= 3) return `S${n}_7M${m}`;
  return "";
}

function getBuildingSkillIconUrl(skillIcon) {
  if (!isNonEmptyString(skillIcon)) return "";
  return `${BUILDING_SKILL_ICON_BASE}${String(skillIcon).trim()}.png`;
}

function getItemMeta(itemId) {
  if (!itemId) return null;
  const id = String(itemId);
  return itemTable?.items?.[id] || itemTable?.[id] || null;
}

function getItemBgUrl(rarity) {
  const r = Number(rarity);
  const rr = Number.isFinite(r) ? r : 0;
  const clamped = Math.min(Math.max(rr, 0), 5);
  return `${ITEM_BG_BASE}item_bg_${clamped}.png`;
}

function getItemIconUrl(iconId) {
  if (!isNonEmptyString(iconId)) return "";
  return `${ITEM_ICON_BASE}${String(iconId).trim()}.png`;
}

function normalizeSpType(spType) {
  // Some files store spType as number (e.g. 8), others as string.
  if (typeof spType === "number") return spType;
  if (typeof spType === "string") return spType.trim();
  return spType;
}

function getSpTypeBadge(spType, langNorm) {
  const v = normalizeSpType(spType);

  // Hide if spType is 8 (used by some passive skills)
  if (v === 8 || String(v) === "8") return null;

  if (v === "INCREASE_WHEN_TAKEN_DAMAGE") {
    return {
      bg: "#F4AF09",
      text: t(langNorm, "Hồi khi chịu đòn", "Defensive Recovery"),
    };
  }
  if (v === "INCREASE_WHEN_ATTACK") {
    return {
      bg: "#FC793E",
      text: t(langNorm, "Hồi theo đòn đánh", "Offensive Recovery"),
    };
  }
  if (v === "INCREASE_WITH_TIME") {
    return {
      bg: "#8EC31F",
      text: t(langNorm, "Hồi theo thời gian", "Auto Recovery"),
    };
  }

  // Fallback: show raw spType
  return {
    bg: "#444444",
    text: String(v ?? ""),
  };
}

function getSkillTypeBadge(skillType, langNorm) {
  const v = String(skillType || "").trim().toUpperCase();
  const mapVN = { AUTO: "Tự động", MANUAL: "Thủ công", PASSIVE: "Nội tại" };
  const mapEN = { AUTO: "Auto", MANUAL: "Manual", PASSIVE: "Passive" };
  const label = langNorm === "EN" ? mapEN[v] || v : mapVN[v] || v;

  return {
    bg: "#808080",
    text: label,
  };
}

function buildTraitMap(traitJson) {
  const map = {};
  if (!traitJson || typeof traitJson !== "object") return map;

  // Structure: { [subProfessionId]: { [rarityIndex]: { traitName, traitDesc, ... } } }
  for (const [subProf, rarityObj] of Object.entries(traitJson)) {
    if (!rarityObj || typeof rarityObj !== "object") continue;

    map[subProf] = {};
    for (const [rarityKey, entry] of Object.entries(rarityObj)) {
      if (!entry || typeof entry !== "object") continue;
      map[subProf][rarityKey] = entry;
    }
  }

  return map;
}

function buildTagMap(tagJson) {
  const map = {};
  if (!tagJson || typeof tagJson !== "object") return map;

  for (const [k, v] of Object.entries(tagJson)) {
    if (isNonEmptyString(k) && isNonEmptyString(v)) map[k] = v;
  }

  return map;
}

function findCharacterKeyByCharId(charId) {
  if (!isNonEmptyString(charId)) return null;
  const key = String(charId).trim();
  if (characterTable?.[key]) return key;

  // Fallback slow scan
  for (const [k, v] of Object.entries(characterTable || {})) {
    if (v?.charId === key) return k;
  }
  return null;
}

function getCharEntry(rawCharId) {
  const charKey = findCharacterKeyByCharId(rawCharId);
  const charData = charKey ? characterTable?.[charKey] : null;
  return { charKey, charData };
}

function rarityIndexFromRarity(rarity) {
  // rarity in char table often 0..5 (★1..★6)
  const r = Number(rarity);
  if (!Number.isFinite(r)) return null;
  return String(r);
}

function phaseToIndex(phase) {
  if (!isNonEmptyString(phase)) return -1;
  const s = String(phase).toUpperCase();
  if (s === "PHASE_0") return 0;
  if (s === "PHASE_1") return 1;
  if (s === "PHASE_2") return 2;
  return -1;
}

function pickTraitVariantIndex(trait) {
  // Some traits have candidates by phase. Pick highest available.
  const cands = trait?.candidates;
  if (!Array.isArray(cands) || cands.length === 0) return -1;

  let best = 0;
  let bestPhase = -1;

  for (let i = 0; i < cands.length; i++) {
    const p = phaseToIndex(cands[i]?.unlockCondition?.phase);
    if (p > bestPhase) {
      best = i;
      bestPhase = p;
    }
  }
  return best;
}

function buildBlackboardMap(bb) {
  const map = {};
  if (!Array.isArray(bb)) return map;
  for (const it of bb) {
    const key = it?.key;
    if (!isNonEmptyString(key)) continue;
    map[key] = it?.value;
  }
  return map;
}

function formatPlaceholderValue(value, fmt) {
  const v = Number(value);
  if (!Number.isFinite(v)) return String(value ?? "");

  // Examples: "0.0%", "0%", "0.0", "0"
  const f = isNonEmptyString(fmt) ? String(fmt) : "";
  const isPercent = f.includes("%");
  const digitsMatch = f.match(/0(?:\.(0+))?/);
  const digits = digitsMatch?.[1]?.length ? digitsMatch[1].length : 0;

  let out = v;
  if (isPercent) out = v * 100;

  const s = digits > 0 ? out.toFixed(digits) : String(Math.round(out));
  return isPercent ? `${s}%` : s;
}

function applyBlackboard(text, bbMap) {
  if (!isNonEmptyString(text)) return "";
  if (!bbMap || typeof bbMap !== "object") return text;
  return String(text).replace(/\{([a-zA-Z0-9_.@-]+)(?::([^}]+))?\}/g, (m, key, fmt) => {
    if (!key || !(key in bbMap)) return m;
    return formatPlaceholderValue(bbMap[key], fmt);
  });
}

function getVisibleTalentCandidates(block) {
  const cands = block?.candidates;
  if (!Array.isArray(cands) || cands.length === 0) return [];

  // filter ones not empty
  const out = cands.filter((c) => c && isNonEmptyString(c?.description));
  return out.length > 0 ? out : cands;
}

function pickBestCandidateIndexByPhase(cands) {
  if (!Array.isArray(cands) || cands.length === 0) return -1;
  let best = 0;
  let bestPhase = -1;

  for (let i = 0; i < cands.length; i++) {
    const p = phaseToIndex(cands[i]?.unlockCondition?.phase);
    if (p > bestPhase) {
      best = i;
      bestPhase = p;
    }
  }
  return best;
}

function getTraitCandidates(charData) {
  const trait = charData?.trait;
  if (!trait) return [];
  const cands = trait?.candidates;
  return Array.isArray(cands) ? cands : [];
}

function resolveTraitTexts(traitMap, charData, pickedCandidateIndex) {
  const subProf = charData?.subProfessionId;
  const rarityKey = rarityIndexFromRarity(charData?.rarity);

  const fallbackTraitName = charData?.trait?.name || "";
  const fallbackTraitDesc =
    charData?.trait?.candidates?.[pickedCandidateIndex]?.description ||
    charData?.trait?.description ||
    "";

  const traitEntry = subProf && rarityKey ? traitMap?.[subProf]?.[rarityKey] : null;

  const traitName =
    isNonEmptyString(traitEntry?.TraitName) ? traitEntry.TraitName : fallbackTraitName;

  // Trait VN json may store multiple keys; keep the fallback chain.
  const traitDescFromMap =
    traitEntry?.Trait ||
    traitEntry?.TraitDesc ||
    traitEntry?.TraitDescription ||
    "";

  const traitDesc = isNonEmptyString(traitDescFromMap)
    ? traitDescFromMap
    : fallbackTraitDesc;

  return { traitName: String(traitName || ""), traitDesc: String(traitDesc || "") };
}

function getTalentVnEntry(charKey) {
  if (!charKey || !talentVN || typeof talentVN !== "object") return null;
  const e = talentVN?.[charKey];
  return e && typeof e === "object" ? e : null;
}

function getTalentTitle(vnEntry, talentIdx, phaseIndex) {
  if (!vnEntry || typeof vnEntry !== "object") return "";
  const baseKey = talentIdx === 0 ? "TitleTalent1" : "TitleTalent2";
  if (Number(phaseIndex) === 2) {
    const k2 = `${baseKey}_2`;
    const v2 = vnEntry?.[k2];
    if (isNonEmptyString(v2)) return String(v2);
  }
  const v = vnEntry?.[baseKey];
  return isNonEmptyString(v) ? String(v) : "";
}

function resolveTalentText(vnEntry, talentIdx, phaseIndex, fallbackText) {
  if (!vnEntry || typeof vnEntry !== "object") return String(fallbackText || "");
  const baseKey = talentIdx === 0 ? "Talent1" : "Talent2";

  // Prefer phase-specific keys (E2+, etc.)
  const phase = Number(phaseIndex);
  const phaseKeys = [];
  if (phase >= 2) {
    phaseKeys.push(`${baseKey}_2`);
    phaseKeys.push(`${baseKey}_3`);
    phaseKeys.push(`${baseKey}_4`);
    phaseKeys.push(`${baseKey}_5`);
    phaseKeys.push(`${baseKey}_6`);
  } else if (phase === 1) {
    phaseKeys.push(`${baseKey}_p4`);
    phaseKeys.push(`${baseKey}_p5`);
    phaseKeys.push(`${baseKey}_p6`);
  }

  for (const k of phaseKeys) {
    const v = vnEntry?.[k];
    if (isNonEmptyString(v)) return String(v);
  }

  const v0 = vnEntry?.[baseKey];
  if (isNonEmptyString(v0)) return String(v0);

  return String(fallbackText || "");
}

function renderTextWithHovers(text, keyPrefix) {
  if (!isNonEmptyString(text)) return null;

  // StatHover already parses tags (color, i, [[hover|...]], etc.)
  // Keep line breaks.
  const lines = String(text).split("\\n");
  return (
    <div className="space-y-1">
      {lines.map((ln, idx) => (
        <div key={`${keyPrefix}-${idx}`} className="leading-relaxed">
          <StatHover text={renderInlineItalic(ln)} />
        </div>
      ))}
    </div>
  );
}

function RangeGrid({ rangeId }) {
  const grid = rangeId ? rangeTable?.[rangeId]?.grids : null;
  if (!Array.isArray(grid) || grid.length === 0) return null;

  const xs = grid.map((g) => g?.col).filter((v) => Number.isFinite(v));
  const ys = grid.map((g) => g?.row).filter((v) => Number.isFinite(v));
  if (xs.length === 0 || ys.length === 0) return null;

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const cols = maxX - minX + 1;
  const rows = maxY - minY + 1;

  const set = new Set(grid.map((g) => `${g.col},${g.row}`));

  const CELL = 18;

  return (
    <div
      className="grid gap-1"
      style={{
        gridTemplateColumns: `repeat(${cols}, ${CELL}px)`,
        gridTemplateRows: `repeat(${rows}, ${CELL}px)`,
      }}
    >
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((__, c) => {
          const col = minX + c;
          const row = maxY - r; // invert to look natural
          const active = set.has(`${col},${row}`);
          const isCenter = col === 0 && row === 0;

          return (
            <div
              key={`${c}-${r}`}
              className={`rounded-sm border ${
                isCenter
                  ? "border-emerald-400 bg-emerald-400/30"
                  : active
                  ? "border-white/25 bg-white/10"
                  : "border-white/10 bg-black/20"
              }`}
              style={{ width: CELL, height: CELL }}
              title={`${col},${row}`}
            />
          );
        })
      )}
    </div>
  );
}

function MaterialIcon({ itemId, count }) {
  const meta = getItemMeta(itemId);
  const name = meta?.name || String(itemId || "Unknown");
  const bgUrl = getItemBgUrl(meta?.rarity);
  const iconUrl = getItemIconUrl(meta?.iconId || meta?.icon || meta?.iconId);

  const INNER = 42;
  const BG_SCALE = 1.42;
  const ICON_SCALE = 1.22;
  const PAD = 2;

  const outer = Math.ceil(INNER * Math.max(BG_SCALE, ICON_SCALE)) + PAD * 2;

  return (
    <div
      className="relative shrink-0"
      style={{ width: outer, height: outer }}
      title={`${name} × ${count}`}
      aria-label={`${name} × ${count}`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative" style={{ width: INNER, height: INNER }}>
          <img
            src={bgUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-contain origin-center"
            style={{ transform: `scale(${BG_SCALE})` }}
            draggable={false}
            loading="lazy"
          />
          {iconUrl ? (
            <img
              src={iconUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-contain origin-center"
              style={{ transform: `scale(${ICON_SCALE})` }}
              draggable={false}
              loading="lazy"
            />
          ) : null}

          <div className="absolute -bottom-1 -right-1 bg-black/80 border border-white/20 rounded px-1 text-[11px] leading-4 font-semibold">
            {count}
          </div>
        </div>
      </div>
    </div>
  );
}

function MaterialRow({ costs }) {
  if (!Array.isArray(costs) || costs.length === 0) return null;

  const mats = costs
    .filter((c) => c && (c.type === "MATERIAL" || c.type == null))
    .map((c) => ({ id: c.id, count: c.count }))
    .filter((x) => x.id && Number(x.count) > 0);

  if (mats.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {mats.map((m) => (
        <MaterialIcon key={`${m.id}-${m.count}`} itemId={m.id} count={m.count} />
      ))}
    </div>
  );
}

function InfoTable({ title, children, titleInline, titleRight }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="text-white font-bold text-lg">{title}</div>
          {titleInline ? <div className="text-white/70 text-sm">{titleInline}</div> : null}
        </div>
        {titleRight ? <div className="shrink-0">{titleRight}</div> : null}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export default function SkillsSection(props) {
  const langNorm = React.useMemo(() => normalizeLang(props?.lang), [props?.lang]);
  const traitMap = React.useMemo(() => buildTraitMap(langNorm === "EN" ? traitEN : traitVN), [langNorm]);
  const tagMap = React.useMemo(() => buildTagMap(tagVN), []);

  const operator = props?.operator;
  const rawCharId = operator?.charId || operator?.id || "";

  const { charKey, charData: charDataBase } = React.useMemo(() => getCharEntry(rawCharId), [rawCharId]);

  const charDataEN = React.useMemo(() => (charKey ? characterTableEN?.[charKey] || null : null), [charKey]);
  const charData = React.useMemo(
    () => (langNorm === "EN" ? charDataEN || charDataBase : charDataBase),
    [langNorm, charDataEN, charDataBase]
  );

  if (!charKey || !charData) {
    return (
      <div className="text-white/60 italic">
        Không tìm thấy dữ liệu nhân vật.
      </div>
    );
  }

  const rawTagList = Array.isArray(charData?.tagList) ? charData.tagList : [];
  const resolvedTags = rawTagList.map((t) => tagMap?.[t] || t).filter(isNonEmptyString);

  const positionLabel = charData?.position === "MELEE" ? "Cận chiến" : charData?.position === "RANGED" ? "Tầm xa" : charData?.position || "-";

  const traitCands = getTraitCandidates(charData);
  const defaultTraitIdx = pickTraitVariantIndex(charData?.trait);
  const [pickedTraitIdx, setPickedTraitIdx] = React.useState(defaultTraitIdx);

  React.useEffect(() => {
    setPickedTraitIdx(defaultTraitIdx);
  }, [charKey]);

  const traitResolved = React.useMemo(() => {
    const idx = Math.min(Math.max(0, pickedTraitIdx), Math.max(0, traitCands.length - 1));
    const { traitName, traitDesc } = resolveTraitTexts(traitMap, charData, idx);

    const bbMap = buildBlackboardMap(traitCands?.[idx]?.blackboard);
    const desc = applyBlackboard(traitDesc, bbMap);
    return { traitName, traitDesc: desc, idx };
  }, [traitMap, charData, pickedTraitIdx]);

  const vnTalentEntry = React.useMemo(() => (langNorm === "VN" ? getTalentVnEntry(charKey) : null), [charKey, langNorm]);

  const talentBlocks = Array.isArray(charData?.talents) ? charData.talents : [];

  const talent1Candidates = talentBlocks?.[0] ? getVisibleTalentCandidates(talentBlocks[0]) : [];
  const talent2Candidates = talentBlocks?.[1] ? getVisibleTalentCandidates(talentBlocks[1]) : [];

  const pickCandidateIdx = (cands) => pickBestCandidateIndexByPhase(cands);

  const bestTalent1Idx = pickCandidateIdx(talent1Candidates);
  const bestTalent2Idx = pickCandidateIdx(talent2Candidates);

  const talent1Resolved = React.useMemo(() => {
    if (bestTalent1Idx < 0) return null;
    const cand = talent1Candidates[bestTalent1Idx];
    const phaseIdx = phaseToIndex(cand?.unlockCondition?.phase);

    const titleVn = getTalentTitle(vnTalentEntry, 0, phaseIdx);
    const title = isNonEmptyString(titleVn) ? titleVn : cand?.name || "";

    const bbMap = buildBlackboardMap(cand?.blackboard);
    const descRaw = resolveTalentText(vnTalentEntry, 0, phaseIdx, cand?.description || "");
    const desc = applyBlackboard(descRaw, bbMap);
    return { title, desc, phaseIdx, cand };
  }, [vnTalentEntry, bestTalent1Idx, charKey]);

  const talent2Resolved = React.useMemo(() => {
    if (bestTalent2Idx < 0) return null;
    const cand = talent2Candidates[bestTalent2Idx];
    const phaseIdx = phaseToIndex(cand?.unlockCondition?.phase);

    const titleVn = getTalentTitle(vnTalentEntry, 1, phaseIdx);
    const title = isNonEmptyString(titleVn) ? titleVn : cand?.name || "";

    const bbMap = buildBlackboardMap(cand?.blackboard);
    const descRaw = resolveTalentText(vnTalentEntry, 1, phaseIdx, cand?.description || "");
    const desc = applyBlackboard(descRaw, bbMap);
    return { title, desc, phaseIdx, cand };
  }, [vnTalentEntry, bestTalent2Idx, charKey]);

  const shouldHideTalent2 = React.useMemo(() => {
    // Hide if empty and VN json doesn't have anything either.
    const cand = talentBlocks?.[1]?.candidates?.[0];
    const baseName = cand?.name || "";
    const baseDesc = cand?.description || "";

    const vnTitle = getTalentTitle(vnTalentEntry, 1, 0);
    const vnText = resolveTalentText(vnTalentEntry, 1, 0, "");

    const emptyBase = !isNonEmptyString(baseName) && !isNonEmptyString(baseDesc);
    const emptyVn = !isNonEmptyString(vnTitle) && !isNonEmptyString(vnText);

    return emptyBase && emptyVn;
  }, [vnTalentEntry, charKey]);

  const potPicker = (
    <div className="flex items-center gap-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <img
          key={`pot-${i}`}
          src={getPotIcon(i)}
          alt={`Potential ${i + 1}`}
          className="w-6 h-6 object-contain opacity-90"
          draggable={false}
          loading="lazy"
        />
      ))}
    </div>
  );

  const talentHeaderElite = (
    <span className="text-white/50 text-sm">
      (E0~E2)
    </span>
  );

  const renderTalentCard = (idx, resolved) => {
    if (!resolved) return null;
    const { title, desc } = resolved;

    return (
      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-white px-2 py-1 text-black font-semibold text-base">
            {title || `Talent ${idx + 1}`}
          </span>
        </div>

        <div className="mt-3 rounded-xl border border-white/10 bg-[#101010] p-3 text-sm leading-relaxed text-gray-200">
          {renderTextWithHovers(desc, `talent-${idx}`)}
        </div>
      </div>
    );
  };


  /** -----------------------------
   * Skills
   * ----------------------------- */
  const skillDefs = React.useMemo(() => {
    const arr = charDataBase?.skills;
    return Array.isArray(arr) ? arr : [];
  }, [charDataBase]);

  const skillIds = React.useMemo(
    () => skillDefs.map((s) => s?.skillId).filter((x) => isNonEmptyString(x)),
    [skillDefs]
  );

  const [skillIdx, setSkillIdx] = React.useState(0);

  React.useEffect(() => {
    setSkillIdx(0);
  }, [charKey]);

  const safeSkillIdx = Math.min(Math.max(0, skillIdx), Math.max(0, skillIds.length - 1));
  const selectedSkillId = skillIds?.[safeSkillIdx] || null;
  const selectedSkillNo = safeSkillIdx + 1;
  const selectedSkillDef = skillDefs?.[safeSkillIdx] || null;

  const selectedSkillCN = React.useMemo(
    () => (selectedSkillId ? skillTable?.[selectedSkillId] || null : null),
    [selectedSkillId]
  );
  const selectedSkillEN = React.useMemo(
    () => (selectedSkillId ? skillTableEN?.[selectedSkillId] || null : null),
    [selectedSkillId]
  );
  const selectedSkillStruct = selectedSkillCN || selectedSkillEN || null;
  const selectedLevels = selectedSkillStruct?.levels;
  const levelCount = Array.isArray(selectedLevels) ? selectedLevels.length : 0;

  const [skillLevelIdx, setSkillLevelIdx] = React.useState(0);

  React.useEffect(() => {
    if (levelCount > 0) setSkillLevelIdx(levelCount - 1);
    else setSkillLevelIdx(0);
  }, [selectedSkillId, levelCount]);

  const safeSkillLevelIdx = Math.min(Math.max(0, skillLevelIdx), Math.max(0, levelCount - 1));
  const currentLevel = safeSkillLevelIdx + 1;

  const levelCN = selectedSkillCN?.levels?.[safeSkillLevelIdx] || null;
  const levelEN = selectedSkillEN?.levels?.[safeSkillLevelIdx] || null;
  const levelStruct = levelEN || levelCN || (Array.isArray(selectedLevels) ? selectedLevels[safeSkillLevelIdx] : null);

  const vnSkillEntry = React.useMemo(() => (charKey ? skillVN?.[charKey] || null : null), [charKey]);

  const skillName = React.useMemo(() => {
    const vnTitleKey = getSkillVnTitleKey(selectedSkillNo);
    const vnName = vnTitleKey ? vnSkillEntry?.[vnTitleKey] : "";
    const enName = levelEN?.name;
    const cnName = levelCN?.name || levelStruct?.name;
    return langNorm === "VN" ? (isNonEmptyString(vnName) ? String(vnName) : isNonEmptyString(enName) ? String(enName) : String(cnName || "")) : (isNonEmptyString(enName) ? String(enName) : String(cnName || ""));
  }, [langNorm, vnSkillEntry, selectedSkillNo, levelEN?.name, levelCN?.name, levelStruct?.name]);

  const skillDescRaw = React.useMemo(() => {
    const vnDescKey = getSkillVnDescKey(selectedSkillNo, currentLevel);
    const vnDesc = vnDescKey ? vnSkillEntry?.[vnDescKey] : "";
    const enDesc = levelEN?.description;
    const cnDesc = levelCN?.description || levelStruct?.description;
    return langNorm === "VN"
      ? (isNonEmptyString(vnDesc) ? String(vnDesc) : isNonEmptyString(enDesc) ? String(enDesc) : String(cnDesc || ""))
      : (isNonEmptyString(enDesc) ? String(enDesc) : String(cnDesc || ""));
  }, [langNorm, vnSkillEntry, selectedSkillNo, currentLevel, levelEN?.description, levelCN?.description, levelStruct?.description]);

  const skillBBMap = React.useMemo(() => buildBlackboardMap(levelStruct?.blackboard), [levelStruct?.blackboard]);
  const skillDesc = React.useMemo(() => applyBlackboard(skillDescRaw, skillBBMap), [skillDescRaw, skillBBMap]);

  const spData = levelStruct?.spData || {};
  const spTypeBadge = React.useMemo(() => getSpTypeBadge(spData?.spType, langNorm), [spData?.spType, langNorm]);
  const skillTypeBadge = React.useMemo(
    () => getSkillTypeBadge(levelStruct?.skillType, langNorm),
    [levelStruct?.skillType, langNorm]
  );

  const durationText = React.useMemo(
    () => formatDurationSeconds(levelStruct?.duration, langNorm),
    [levelStruct?.duration, langNorm]
  );

  const baseRangeId = React.useMemo(() => {
    const phases = charDataBase?.phases;
    if (!Array.isArray(phases)) return null;
    for (let i = Math.min(2, phases.length - 1); i >= 0; i--) {
      const rid = phases?.[i]?.rangeId;
      if (isNonEmptyString(rid)) return rid;
    }
    const rid0 = phases?.[0]?.rangeId;
    return isNonEmptyString(rid0) ? rid0 : null;
  }, [charDataBase]);

  const skillRangeId = levelStruct?.rangeId;
  const showRange = isNonEmptyString(skillRangeId);

  const rangeIcon = showRange
    ? String(skillRangeId) === String(baseRangeId || "")
      ? RANGE_STAND
      : RANGE_ATTACK_SKILL
    : "";

  /** -----------------------------
   * Building skills
   * ----------------------------- */
  const buildingChar = React.useMemo(
    () => (charKey ? buildingData?.chars?.[charKey] || null : null),
    [charKey]
  );

  const buildingCards = React.useMemo(() => {
    const slots = buildingChar?.buffChar;
    if (!Array.isArray(slots)) return [];

    const pickBest = (arr) => {
      let best = null;
      let bestPhase = -1;
      let bestLvl = -1;
      for (const e of arr) {
        const p = phaseToIndex(e?.cond?.phase);
        const l = Number(e?.cond?.level ?? 1);
        const ll = Number.isFinite(l) ? l : 1;
        if (p > bestPhase || (p === bestPhase && ll > bestLvl)) {
          best = e;
          bestPhase = p;
          bestLvl = ll;
        }
      }
      return best ? [best] : [];
    };

    const out = [];
    for (const slot of slots) {
      const data = slot?.buffData;
      if (!Array.isArray(data) || data.length === 0) continue;

      const entries = data.length > 1 ? pickBest(data) : data;

      for (const e of entries) {
        const buffId = e?.buffId;
        if (!isNonEmptyString(buffId)) continue;

        const cn = buildingData?.buffs?.[buffId] || null;
        const en = buildingDataEN?.buffs?.[buffId] || null;
        const vn = buildingVN?.[buffId] || null;

        const title =
          langNorm === "VN"
            ? (isNonEmptyString(vn?.Name) ? String(vn.Name) : isNonEmptyString(en?.buffName) ? String(en.buffName) : String(cn?.buffName || buffId))
            : (isNonEmptyString(en?.buffName) ? String(en.buffName) : String(cn?.buffName || buffId));

        const desc =
          langNorm === "VN"
            ? (isNonEmptyString(vn?.description) ? String(vn.description) : isNonEmptyString(en?.description) ? String(en.description) : String(cn?.description || ""))
            : (isNonEmptyString(en?.description) ? String(en.description) : String(cn?.description || ""));

        out.push({
          buffId,
          cond: e?.cond,
          title,
          desc,
          skillIcon: cn?.skillIcon || en?.skillIcon || "",
          buffColor: cn?.buffColor || en?.buffColor || "#444444",
          textColor: cn?.textColor || en?.textColor || "#ffffff",
        });
      }
    }

    return out;
  }, [buildingChar, langNorm]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {resolvedTags.map((tg) => (
          <span
            key={tg}
            className="rounded-md bg-white/10 border border-white/10 px-2 py-1 text-xs font-semibold text-white/90"
          >
            {tg}
          </span>
        ))}
        <span className="rounded-md bg-white/10 border border-white/10 px-2 py-1 text-xs font-semibold text-white/90">
          {positionLabel}
        </span>
      </div>

      <InfoTable title="Đặc tính/Trait">
        {traitCands.length > 1 ? (
          <div className="flex items-center gap-2 flex-wrap justify-start mb-3">
            {traitCands.map((_, i) => {
              const active = i === traitResolved.idx;
              return (
                <button
                  key={`trait-${i}`}
                  type="button"
                  onClick={() => setPickedTraitIdx(i)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    active ? "bg-emerald-600 text-white" : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  Trait {i + 1}
                </button>
              );
            })}
          </div>
        ) : null}

        {isNonEmptyString(traitResolved.traitName) ? (
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-white px-2 py-1 text-black font-semibold text-base">
                {traitResolved.traitName}
              </span>
            </div>

            <div className="mt-3 rounded-xl border border-white/10 bg-[#101010] p-3 text-sm leading-relaxed text-gray-200">
              {renderTextWithHovers(traitResolved.traitDesc, "trait")}
            </div>
          </div>
        ) : (
          <span className="text-white/40 italic">-</span>
        )}
      </InfoTable>

      <InfoTable title="Thiên phú/Talent" titleInline={talentHeaderElite} titleRight={potPicker}>
        {talentBlocks.length > 0 ? (
          <div className="space-y-3">
            {talentBlocks?.[0] ? renderTalentCard(0, talent1Resolved) : null}
            {!shouldHideTalent2 && talentBlocks?.[1] ? renderTalentCard(1, talent2Resolved) : null}
          </div>
        ) : (
          <span className="text-white/40 italic">-</span>
        )}
      </InfoTable>

      <InfoTable title="Kỹ năng">
        {skillIds.length > 0 && selectedSkillStruct ? (
          <div className="space-y-4">
            {skillIds.length > 1 ? (
              <div className="flex items-center gap-2 flex-wrap justify-start">
                {skillIds.map((sid, idx) => {
                  const active = idx === safeSkillIdx;
                  const label = `Skill ${idx + 1}`;
                  return (
                    <button
                      key={sid}
                      type="button"
                      onClick={() => setSkillIdx(idx)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                        active ? "bg-emerald-600 text-white" : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            ) : null}

            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-start gap-4">
                <img
                  src={getSkillIconUrl(selectedSkillId)}
                  alt={skillName || `Skill ${selectedSkillNo}`}
                  className="w-20 h-20 object-contain shrink-0"
                  draggable={false}
                  loading="lazy"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-white px-2 py-1 text-black font-semibold text-base max-w-full">
                      <span className="truncate">{skillName || `Skill ${selectedSkillNo}`}</span>
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {spTypeBadge ? (
                      <span
                        className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold text-black"
                        style={{ background: spTypeBadge.bg }}
                      >
                        {spTypeBadge.text}
                      </span>
                    ) : null}

                    <span
                      className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold text-white"
                      style={{ background: skillTypeBadge.bg }}
                    >
                      {skillTypeBadge.text}
                    </span>

                    {durationText ? (
                      <span className="inline-flex items-center rounded-md bg-[#D3D3D3] px-2 py-1 text-xs font-semibold text-black">
                        {durationText}
                      </span>
                    ) : null}
                  </div>

                  {String(levelStruct?.skillType || "").toUpperCase() !== "PASSIVE" ? (
                    <div className="mt-3 flex flex-wrap items-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/80">{t(langNorm, "SP khởi đầu:", "Initial SP:")}</span>
                        <div className="relative h-8 w-[92px] shrink-0">
                          <img
                            src={INIT_SP_BG}
                            alt=""
                            className="absolute inset-0 w-full h-full object-contain"
                            draggable={false}
                            loading="lazy"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-semibold text-white">
                            {Number(spData?.initSp ?? 0)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/80">{t(langNorm, "SP tiêu hao:", "SP Cost:")}</span>
                        <div className="relative h-8 w-[92px] shrink-0">
                          <img
                            src={SP_COST_BG}
                            alt=""
                            className="absolute inset-0 w-full h-full object-contain"
                            draggable={false}
                            loading="lazy"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-semibold text-white">
                            {Number(spData?.spCost ?? 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                {showRange ? (
                  <div className="shrink-0 self-start rounded-xl border border-white/10 bg-black/30 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <img src={rangeIcon} alt="" className="w-5 h-5 object-contain" draggable={false} />
                      <div className="text-sm font-semibold text-white">{t(langNorm, "Phạm vi", "Range")}</div>
                    </div>
                    <RangeGrid rangeId={skillRangeId} />
                  </div>
                ) : null}
              </div>

              {/* Skill levels */}
              {levelCount > 0 ? (
                <div className="mt-4">
                  <div className="flex items-center gap-2 flex-wrap justify-start">
                    {Array.from({ length: levelCount }).map((_, idx) => {
                      const lv = idx + 1;
                      const active = idx === safeSkillLevelIdx;
                      const icon = getSkillLevelIconUrl(lv);

                      return (
                        <button
                          key={`lv-${lv}`}
                          type="button"
                          onClick={() => setSkillLevelIdx(idx)}
                          className={`rounded-lg px-2 py-1.5 transition ${
                            active ? "bg-emerald-600" : "bg-white/10 hover:bg-white/20"
                          }`}
                          title={`Lv ${lv}`}
                        >
                          {icon ? (
                            <img src={icon} alt={`Lv ${lv}`} className="w-7 h-7 object-contain" draggable={false} />
                          ) : (
                            <span className="text-sm font-semibold text-white">{lv}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 rounded-xl border border-white/10 bg-[#101010] p-3 text-sm leading-relaxed text-gray-200">
                    {renderTextWithHovers(skillDesc, `skill-desc-${selectedSkillId}-${currentLevel}`)}
                  </div>
                </div>
              ) : null}

              {/* Upgrade materials */}
              <div className="mt-5">
                <div className="text-sm font-semibold text-white mb-2">
                  {t(langNorm, "Nguyên liệu nâng cấp:", "Upgrade Materials:")}
                </div>

                <div className="space-y-3">
                  {Array.isArray(charDataBase?.allSkillLvlup) && charDataBase.allSkillLvlup.length > 0 ? (
                    <div className="space-y-3">
                      {charDataBase.allSkillLvlup.map((row, idx) => (
                        <div key={`skill-lvup-${idx}`} className="rounded-xl border border-white/10 bg-black/20 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="text-sm font-semibold text-white">{`Lv ${idx + 1} → Lv ${idx + 2}`}</div>
                            {row?.unlockCond ? (
                              <div className="text-xs text-white/70">{formatUnlockCond(row.unlockCond, langNorm)}</div>
                            ) : null}
                          </div>
                          <div className="mt-2">
                            <MaterialRow costs={row?.lvlUpCost || []} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {Array.isArray(selectedSkillDef?.levelUpCostCond) && selectedSkillDef.levelUpCostCond.length > 0 ? (
                    <div className="space-y-3">
                      {selectedSkillDef.levelUpCostCond.map((row, idx) => (
                        <div
                          key={`skill-mastery-${idx}`}
                          className="rounded-xl border border-white/10 bg-black/20 p-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="text-sm font-semibold text-white">{`Lv 7 M${idx + 1}`}</div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-white/70">
                              {row?.unlockCond ? (
                                <span>{formatUnlockCond(row.unlockCond, langNorm)}</span>
                              ) : null}
                              {Number(row?.lvlUpTime) > 0 ? (
                                <span>
                                  {t(langNorm, "Thời gian nâng cấp:", "Training time:")} {secondsToHMS(row.lvlUpTime)}
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <div className="mt-2">
                            <MaterialRow costs={row?.levelUpCost || []} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <span className="text-white/40 italic">-</span>
        )}
      </InfoTable>

      <InfoTable title="Kỹ năng hậu cần">
        {buildingCards.length > 0 ? (
          <div className="space-y-3">
            {buildingCards.map((b) => (
              <div key={b.buffId} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-start gap-3">
                  <img
                    src={getBuildingSkillIconUrl(b.skillIcon)}
                    alt={b.title}
                    className="w-14 h-14 object-contain shrink-0"
                    draggable={false}
                    loading="lazy"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="inline-flex items-center rounded-md px-2 py-1 text-sm font-semibold max-w-full"
                        style={{ background: b.buffColor, color: b.textColor }}
                      >
                        <span className="truncate">{b.title}</span>
                      </span>

                      {b?.cond ? (
                        <span className="text-xs text-white/60">
                          {formatUnlockCond(b.cond, langNorm)}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-3 rounded-xl border border-white/10 bg-[#101010] p-3 text-sm leading-relaxed text-gray-200">
                      {renderTextWithHovers(b.desc, `buff-desc-${b.buffId}`)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-white/40 italic">-</span>
        )}
      </InfoTable>
    </div>
  );
}
