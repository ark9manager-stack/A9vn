import React from "react";

import characterTable from "../../../../data/operators/character_table.json";
import characterTableEN from "../../../../data/operators/character_table_en.json";
import traitVN from "../../../../data/operators/trait_vn.json";
import traitEN from "../../../../data/operators/trait_en.json";
import talentVN from "../../../../data/operators/talent_vn.json";
import rangeTable from "../../../../data/range_table.json";
import tagVN from "../../../../data/operators/tag_vn.json";
import skillTable from "../../../../data/operators/skill_table.json";
import skillTableEN from "../../../../data/operators/skill_table_en.json";
import skillVN from "../../../../data/operators/skill_vn.json";
import buildingData from "../../../../data/operators/building_data.json";
import buildingDataEN from "../../../../data/operators/building_data_en.json";
import buildingVN from "../../../../data/operators/building_vn.json";
import itemTable from "../../../../data/operators/item_table.json";
import StatHover, { renderInlineItalic } from "../../../StatHover";

/** Icons (Elite) */
const ELITE_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/arts/elite_hub/";

/** Icons (Range + Potential) */
const UI_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/arts/ui/[uc]common/charattrdetail/";

const RANGE_STAND = `${UI_ICON_BASE}attack_range_stand.png`;
const RANGE_ATTACK = `${UI_ICON_BASE}attack_range_attack.png`;
/** Icons (Skill Range) */
const BATTLE_UI_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/arts/ui/[uc]battlecommon/ui_battle_new/";
const RANGE_ATTACK_SKILL = `${BATTLE_UI_ICON_BASE}attack_range_attack.png`;

/** Icons (Skills) */
const SKILL_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/arts/skills/skill_icon_";

/** Icons (Skill SP) */
const INIT_SP_ICON =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/ui/[uc]itemrepo/page/item_repo_page/init_sp.png";
const SP_COST_ICON =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/ui/[uc]itemrepo/page/item_repo_page/image_sp_cost_bkg.png";

/** Icons (Skill Level) */
const LEVEL_SOLID_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/arts/number_hub/solid_";
const LEVEL_SPECIALIZED_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/arts/specialized_hub/specialized_";

/** Icons (Building Skills) */
const BUILDING_SKILL_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/arts/building/skills/";

/** Materials */
const ITEM_BG_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/ui/[uc]home/mail/panel_mail_item/";
const ITEM_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/arts/items/icons/";

const POT_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/cn/assets/dyn/arts/potential_hub/";

const getPotIcon = (idx0) => `${POT_ICON_BASE}potential_${idx0}.png`;

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function formatNestedNoteTags(input) {
  if (!isNonEmptyString(input)) return "";
  let s = String(input);
  s = s.replace(/<[@$][a-zA-Z0-9_.-]+>/g, "");
  s = s.replace(/<\/>/g, "");
  return s;
}

function matchCloseTagAt(str, i) {
  if (typeof str !== "string") return 0;
  if (str.startsWith("</>", i)) return 3;

  if (str.startsWith("</ >", i)) return 4;

  if (str[i] === "<" && str[i + 1] === "/") {
    let j = i + 2;
    while (j < str.length && /\s/.test(str[j])) j += 1;
    if (str[j] === ">") return j - i + 1;
  }

  return 0;
}

function parseMarkupSegment(
  str,
  keyPrefix,
  noteKeyCtx = null,
  startIndex = 0,
  stopAtClose = false
) {
  const nodes = [];
  let i = startIndex;
  let buf = "";

  const flush = () => {
    if (buf === "") return;
    const kp = `${keyPrefix}-t-${i}-${nodes.length}`;

    if (isNonEmptyString(noteKeyCtx)) {
      if (String(buf).trim() === "") {
        // Preserve pure whitespace between markup tokens
        nodes.push(<React.Fragment key={kp}>{buf}</React.Fragment>);
      } else {
        nodes.push(<StatHover key={kp} label={buf} noteKey={noteKeyCtx} />);
      }
    } else {
      if (String(buf).trim() === "") {
        // IMPORTANT: don't drop whitespace-only chunks, or words will stick together (e.g. "Steals70")
        nodes.push(<React.Fragment key={kp}>{buf}</React.Fragment>);
      } else {
        nodes.push(...renderInlineItalic(buf, kp));
      }
    }
    buf = "";
  };

  while (i < str.length) {
    const closeLen = matchCloseTagAt(str, i);
    if (closeLen) {
      flush();
      i += closeLen;

      if (stopAtClose) return { nodes, index: i };
      continue;
    }

    if (str[i] === "\n") {
      flush();
      nodes.push(<br key={`${keyPrefix}-br-${i}-${nodes.length}`} />);
      i += 1;
      continue;
    }

    // [[label|noteKey]]
    if (str.startsWith("[[", i)) {
      const close = str.indexOf("]]", i + 2);
      if (close === -1) {
        buf += str[i];
        i += 1;
        continue;
      }

      flush();

      const inner = str.slice(i + 2, close);
      const barIdx = inner.indexOf("|");
      if (barIdx === -1) {
        buf += str.slice(i, close + 2);

      i = close + 2;
        continue;
      }

      const rawLabel = inner.slice(0, barIdx);
      const noteKey = inner.slice(barIdx + 1).trim();
      const label = formatNestedNoteTags(rawLabel);

      nodes.push(
        <StatHover key={`${keyPrefix}-h-${i}`} label={label} noteKey={noteKey} />
      );

      i = close + 2;
      continue;
    }

    // <@...> or <$...>
    if (str[i] === "<" && (str[i + 1] === "@" || str[i + 1] === "$")) {
      const gt = str.indexOf(">", i + 2);
      if (gt === -1) {
        buf += str[i];
        i += 1;
        continue;
      }

      flush();

      const type = str[i + 1]; // '@' | '$'
      const key = str.slice(i + 2, gt).trim();
      const inner = parseMarkupSegment(
        str,
        `${keyPrefix}-in-${i}`,
        type === "@" ? key : noteKeyCtx,
        gt + 1,
        true
      );

      const innerNodes = inner.nodes;

      if (type === "$") {
        nodes.push(
          <StatHover key={`${keyPrefix}-term-${i}-${key}`} termId={key}>
            {innerNodes}
          </StatHover>
        );
      } else {
        // '@' tag: styling applied via noteKeyCtx inside recursion
        nodes.push(
          <React.Fragment key={`${keyPrefix}-at-${i}-${key}`}>
            {innerNodes}
          </React.Fragment>
        );
      }

      i = inner.index;
      continue;
    }

    buf += str[i];
    i += 1;
  }

  flush();
  return { nodes, index: i };
}

function parseMarkupHovers(
  str,
  keyPrefix,
  noteKeyCtx = null,
  startIndex = 0,
  stopAtClose = false
) {
  const nodes = [];
  let i = startIndex;
  let buf = "";

  const flush = () => {
    if (buf === "") return;
    const kp = `${keyPrefix}-t-${i}-${nodes.length}`;

    if (isNonEmptyString(noteKeyCtx)) {
      if (String(buf).trim() === "") {
        // Preserve pure whitespace between markup tokens
        nodes.push(<React.Fragment key={kp}>{buf}</React.Fragment>);
      } else {
        nodes.push(<StatHover key={kp} label={buf} noteKey={noteKeyCtx} />);
      }
    } else {
      if (String(buf).trim() === "") {
        // IMPORTANT: don't drop whitespace-only chunks, or words will stick together (e.g. "Steals70")
        nodes.push(<React.Fragment key={kp}>{buf}</React.Fragment>);
      } else {
        nodes.push(...renderInlineItalic(buf, kp));
      }
    }
    buf = "";
  };

  while (i < str.length) {
    const closeLen = matchCloseTagAt(str, i);
    if (closeLen) {
      flush();
      i += closeLen;
      if (stopAtClose) return { nodes, index: i };
      continue;
    }

    if (str[i] === "\n") {
      flush();
      nodes.push(<br key={`${keyPrefix}-br-${i}-${nodes.length}`} />);
      i += 1;
      continue;
    }

    // [[label|noteKey]]
    if (str.startsWith("[[", i)) {
      const close = str.indexOf("]]", i + 2);
      if (close === -1) {
        buf += str[i];
        i += 1;
        continue;
      }

      flush();
      const inner = str.slice(i + 2, close);
      const barIdx = inner.indexOf("|");
      if (barIdx === -1) {
        buf += str.slice(i, close + 2);

      i = close + 2;
        continue;
      }

      const rawLabel = inner.slice(0, barIdx);
      const noteKey = inner.slice(barIdx + 1).trim();
      const label = formatNestedNoteTags(rawLabel);

      nodes.push(
        <StatHover key={`${keyPrefix}-h-${i}`} label={label} noteKey={noteKey} />
      );

      i = close + 2;
      continue;
    }

    // <@...> or <$...>
    if (str[i] === "<" && (str[i + 1] === "@" || str[i + 1] === "$")) {
      const gt = str.indexOf(">", i + 2);
      if (gt === -1) {
        buf += str[i];
        i += 1;
        continue;
      }

      const type = str[i + 1];
      const key = str.slice(i + 2, gt).trim();

      flush();

      const innerKeyPrefix = `${keyPrefix}-${type}${key}-${i}`;
      const inner = parseMarkupHovers(
        str,
        innerKeyPrefix,
        type === "@" ? key : noteKeyCtx,
        gt + 1,
        true
      );
      if (type === "$") {
        nodes.push(
          <StatHover key={`${keyPrefix}-term-${i}-${key}`} termId={key}>
            {inner.nodes}
          </StatHover>
        );
      } else {
        nodes.push(
          <React.Fragment key={`${keyPrefix}-${type}-${i}-${key}`}>{inner.nodes}</React.Fragment>
        );
      }

      i = inner.index;
      continue;
    }

    buf += str[i];
    i += 1;
  }

  flush();
  return { nodes, index: i };
}


function renderTextWithTermNotes(text, keyPrefix) {
  if (!isNonEmptyString(text)) return null;

  // Normalize line breaks without regex literals
  const normalized = String(text)
    .split("\r\n").join("\n")
    .split("\r").join("\n")
    // Some localized strings contain literal "\\n"
    .split("\\n").join("\n");

  const parsed = parseMarkupSegment(normalized, keyPrefix);
  return <>{parsed.nodes}</>;
}



function buildTraitMap(traitJson) {
  const list = traitJson?.traitDescription;
  if (!Array.isArray(list)) return {};

  const map = {};
  for (const item of list) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    for (const [k, v] of Object.entries(item)) {
      map[k] = v;
    }
  }
  return map;
}

function buildTagMap(tagJson) {
  const raw = tagJson?.tagList;
  if (!raw) return {};

  if (!Array.isArray(raw) && typeof raw === "object") {
    const map = {};
    for (const [k, v] of Object.entries(raw)) {
      if (isNonEmptyString(k) && isNonEmptyString(v)) map[String(k)] = String(v);
    }
    return map;
  }

  if (!Array.isArray(raw)) return {};

  const map = {};
  for (const row of raw) {
    const k = row?.tagList ?? row?.key ?? row?.cn ?? row?.tag;
    const v = row?.tagList_vn ?? row?.vn ?? row?.value;
    if (!isNonEmptyString(k) || !isNonEmptyString(v)) continue;
    map[String(k)] = String(v);
  }
  return map;
}

function getCharEntry(rawCharId) {
  if (!isNonEmptyString(rawCharId)) return { charKey: null, charData: null };

  const id = String(rawCharId).trim();
  const candidates = [id];

  if (!id.startsWith("char_")) candidates.push(`char_${id}`);

  for (const k of candidates) {
    if (k?.startsWith("char_") && characterTable?.[k]) {
      return { charKey: k, charData: characterTable[k] };
    }
  }

  return { charKey: null, charData: null };
}

function resolveTraitTexts({ subProfessionId, rarity, description }, traitMap) {
  const base = isNonEmptyString(subProfessionId) ? String(subProfessionId).trim() : "";
  const isTier1 = String(rarity || "") === "TIER_1";
  const keyCandidates = isTier1 ? [`${base}1`, base] : [base];

  // Main text
  let usedKey = null;
  let mainText = "";
  for (const key of keyCandidates) {
    if (!isNonEmptyString(key)) continue;
    const v = traitMap?.[key];
    if (isNonEmptyString(v)) {
      usedKey = key;
      mainText = v;
      break;
    }
  }
  if (!isNonEmptyString(mainText)) mainText = isNonEmptyString(description) ? description : "";

  // Extra text ("*_2")
  const extraKeyCandidates = [];
  if (isNonEmptyString(usedKey)) extraKeyCandidates.push(`${usedKey}_2`);
  for (const key of keyCandidates) {
    if (!isNonEmptyString(key)) continue;
    extraKeyCandidates.push(`${key}_2`);
  }
  // De-dup
  const seen = new Set();
  let extraText = "";
  for (const k of extraKeyCandidates) {
    if (!isNonEmptyString(k) || seen.has(k)) continue;
    seen.add(k);
    const v2 = traitMap?.[k];
    if (isNonEmptyString(v2)) {
      extraText = v2;
      break;
    }
  }

  return { mainText, extraText, usedKey };
}

function phaseToIndex(phase) {
  // e.g. "PHASE_0"
  const m = /PHASE_(\d+)/.exec(String(phase || ""));
  if (m) return Number(m[1]);
  const n = Number(phase);
  return Number.isFinite(n) ? n : 0;
}

function getTraitCandidates(charData) {
  const raw = charData?.trait?.candidates;
  if (!Array.isArray(raw)) return [];

  const byPhase = new Map();
  for (const cand of raw) {
    const idx = phaseToIndex(cand?.unlockCondition?.phase);
    if (!byPhase.has(idx)) byPhase.set(idx, cand);
  }

  return Array.from(byPhase.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([phaseIndex, cand]) => ({ phaseIndex, cand }));
}

function buildBlackboardMap(blackboard) {
  const map = {};
  if (!Array.isArray(blackboard)) return map;

  for (const row of blackboard) {
    const kRaw = row?.key;
    if (!isNonEmptyString(kRaw)) continue;

    const k = String(kRaw);
    const v = row?.valueStr != null ? row.valueStr : row?.value;

    map[k] = v;

    const kl = k.toLowerCase();
    if (!(kl in map)) map[kl] = v;
  }

  return map;
}


const isAlmostInt = (n) => Math.abs(n - Math.round(n)) < 1e-6;

function trimFixed(n, decimals) {
  const x = Number(n);
  if (!Number.isFinite(x)) return String(n ?? "");
  let s = x.toFixed(decimals);
  if (decimals > 0) s = s.replace(/\.?0+$/, "");
  return s;
}

function formatNumberDefault(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return String(n ?? "");
  if (isAlmostInt(x)) return String(Math.round(x));
  return trimFixed(x, 2);
}

function formatPlaceholderValue(raw, fmt) {
  if (raw == null) return "";
  const rawStr = String(raw);

  const num = Number(raw);
  const isNum = Number.isFinite(num);

  if (!fmt || !isNonEmptyString(fmt)) return isNum ? formatNumberDefault(num) : rawStr;

  const f = String(fmt).trim();
  const pm = /^0(?:\.(0+))?%$/.exec(f);
  if (pm) {
    if (!isNum) return rawStr;
    const decimals = pm[1] ? pm[1].length : 0;
    return `${trimFixed(num * 100, decimals)}%`;
  }

  const nm = /^0(?:\.(0+))?$/.exec(f);
  if (nm) {
    if (!isNum) return rawStr;
    const decimals = nm[1] ? nm[1].length : 0;
    return trimFixed(num, decimals);
  }

  return isNum ? formatNumberDefault(num) : rawStr;
}

function buildSkillParamMap(skillLevel) {
  const map = buildBlackboardMap(skillLevel?.blackboard);

  const dn = Number(skillLevel?.duration);
  if (Number.isFinite(dn) && !("duration" in map)) {
    map.duration = dn;
  }

  return map;
}

function applyBlackboard(text, bbMap) {
  if (!isNonEmptyString(text)) return "";
  if (!bbMap || typeof bbMap !== "object") return text;

  const lookup = (k) => {
    if (!isNonEmptyString(k)) return undefined;
    if (k in bbMap) return bbMap[k];
    const kl = String(k).toLowerCase();
    if (kl in bbMap) return bbMap[kl];
    return undefined;
  };

  return String(text).replace(/\{([^}:]+)(?::([^}]+))?\}/g, (m, keyRaw, fmt) => {
    const key0 = String(keyRaw || "").trim();
    if (!key0) return m;

    const direct = lookup(key0);
    if (direct !== undefined) return formatPlaceholderValue(direct, fmt);

    if ((key0.startsWith("-") || key0.startsWith("+")) && key0.length > 1) {
      const k2 = key0.slice(1).trim();
      const v2 = lookup(k2);
      if (v2 !== undefined) {
        if (key0.startsWith("-")) {
          const n = Number(v2);
          const vv = Number.isFinite(n) ? -n : v2;
          return formatPlaceholderValue(vv, fmt);
        }
        return formatPlaceholderValue(v2, fmt);
      }
    }

    return m;
  });
}



function clamp(n, min, max) {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.min(Math.max(x, min), max);
}


const rarityToR = (rarity) => {
  const m = String(rarity || "").match(/TIER_(\d+)/);
  const n = m ? Number(m[1]) : 1;
  return Number.isFinite(n) ? n : 1;
};

const getItemMeta = (itemId) => {
  const id = String(itemId || "");
  return itemTable?.items?.[id] || null;
};

const getItemBgUrl = (rarity) => {
  const r = clamp(rarityToR(rarity), 1, 6);
  return `${ITEM_BG_BASE}sprite_item_r${r}.png`;
};

const getItemIconUrl = (iconId) => {
  const key = String(iconId || "").trim();
  if (!key) return "";
  return `${ITEM_ICON_BASE}${key.toLowerCase()}.png`;
};

const getSkillIconUrl = (skillId, iconId) => {
  const iconKey = String(iconId || "").trim();
  if (iconKey) return `${SKILL_ICON_BASE}${iconKey}.png`;
  const key = String(skillId || "").trim();
  if (!key) return "";
  return `${SKILL_ICON_BASE}${key}.png`;
};

const getSkillLevelIconUrl = (levelNum) => {
  const n = Number(levelNum);
  if (!Number.isFinite(n) || n <= 0) return "";
  if (n <= 7) return `${LEVEL_SOLID_BASE}${n}.png`;
  if (n <= 10) return `${LEVEL_SPECIALIZED_BASE}${n - 7}.png`;
  return "";
};

const phaseToEliteIndex = (phase) => {
  const p = String(phase || "");
  if (p === "PHASE_2") return 2;
  if (p === "PHASE_1") return 1;
  return 0;
};

function formatHMS(totalSeconds) {
  const s = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

const SP_TYPE_META = {
  INCREASE_WHEN_TAKEN_DAMAGE: {
    bg: "#F4AF09",
    vi: "Hồi khi chịu đòn",
    en: "Defensive Recovery",
  },
  INCREASE_WHEN_ATTACK: {
    bg: "#FC793E",
    vi: "Hồi theo đòn đánh",
    en: "Offensive Recovery",
  },
  INCREASE_WITH_TIME: {
    bg: "#8EC31F",
    vi: "Hồi theo thời gian",
    en: "Auto Recovery",
  },
};

const SKILL_TYPE_META = {
  AUTO: { vi: "Tự động", en: "Auto" },
  MANUAL: { vi: "Thủ công", en: "Manual" },
  PASSIVE: { vi: "Nội tại", en: "Passive" },
};


function getVisibleTalentCandidates(block) {
  const cands = block?.candidates;
  if (!Array.isArray(cands)) return [];

  return cands.filter((c) => {
    if (!c) return false;
    if (c.isHideTalent === true) return false;

    const hasName = typeof c.name === "string" && c.name.trim().length > 0;
    const hasDesc = typeof c.description === "string" && c.description.trim().length > 0;
    return hasName || hasDesc;
  });
}

function isValidTalentBlock(block) {
  return getVisibleTalentCandidates(block).length > 0;
}

function getTalentVnEntry(charKey) {
  if (!isNonEmptyString(charKey)) return null;
  return talentVN?.[charKey] || null;
}

function getTalentTitle(vnEntry, talentIdx, phaseIndex, level, requiredPotentialRank) {
  if (!vnEntry || typeof vnEntry !== "object") return "";

  const baseKey = talentIdx === 0 ? "TitleTalent1" : "TitleTalent2";
  const phase = Number(phaseIndex ?? 0);
  const req = Number(requiredPotentialRank ?? 0);
  const lvl = Number(level ?? 0);

  const keys = [];

  if (phase === 2) {
    const b2 = `${baseKey}_2`;

    if (Number.isFinite(lvl) && lvl > 1) {
      if (Number.isFinite(req) && req > 0) keys.push(`${b2}_lv${lvl}_p${req}`);
      keys.push(`${b2}_lv${lvl}`);
    }

    if (Number.isFinite(req) && req > 0) keys.push(`${b2}_p${req}`);
    keys.push(b2);
  }

  if (Number.isFinite(lvl) && lvl > 1) {
    if (Number.isFinite(req) && req > 0) keys.push(`${baseKey}_lv${lvl}_p${req}`);
    keys.push(`${baseKey}_lv${lvl}`);
  }

  if (Number.isFinite(req) && req > 0) keys.push(`${baseKey}_p${req}`);
  keys.push(baseKey);

  for (const k of keys) {
    const v = vnEntry?.[k];
    if (isNonEmptyString(v)) return String(v);
  }

  return "";
}


function getTalentBaseKeyCandidates(talentIdx, phaseIndex) {
  if (talentIdx === 0) {
    if (phaseIndex === 2) return ["Talent1_2"];
    return [`Talent${phaseIndex}`]; // Talent0 / Talent1
  }

  return [`Talent2_${phaseIndex}`, "Talent2"];
}

function resolveTalentText({
  vnEntry,
  talentIdx,
  phaseIndex,
  level,
  requiredPotentialRank,
  fallbackText,
}) {
  const bases = getTalentBaseKeyCandidates(talentIdx, phaseIndex);
  const req = Number(requiredPotentialRank || 0);
  const lvl = Number(level || 0);

  if (vnEntry && typeof vnEntry === "object") {
    for (const base of bases) {
      if (!isNonEmptyString(base)) continue;
      if (Number.isFinite(lvl) && lvl > 1) {
        if (req > 0) {
          const kLvPot = `${base}_lv${lvl}_p${req}`;
          const vLvPot = vnEntry?.[kLvPot];
          if (isNonEmptyString(vLvPot)) return String(vLvPot);
        }

        const kLv = `${base}_lv${lvl}`;
        const vLv = vnEntry?.[kLv];
        if (isNonEmptyString(vLv)) return String(vLv);
      }

      if (req > 0) {
        const kPot = `${base}_p${req}`;
        const vPot = vnEntry?.[kPot];
        if (isNonEmptyString(vPot)) return String(vPot);
      }

      const v = vnEntry?.[base];
      if (isNonEmptyString(v)) return String(v);
    }
  }

  return isNonEmptyString(fallbackText) ? String(fallbackText) : "";
}

function groupCandidatesByPhaseLevel(candidates) {
  const map = new Map();
  if (!Array.isArray(candidates)) return map;

  for (const cand of candidates) {
    const phaseIndex = phaseToIndex(cand?.unlockCondition?.phase);
    const level = Number(cand?.unlockCondition?.level || 1);
    const lvl = Number.isFinite(level) ? level : 1;

    const key = `${phaseIndex}:${lvl}`;
    const arr = map.get(key) || [];
    arr.push(cand);
    map.set(key, arr);
  }

  return map;
}

function pickBestCandidateByPot(candidates, potRank) {
  if (!Array.isArray(candidates) || candidates.length === 0) return null;

  let best = null;
  let bestReq = -1;

  for (const c of candidates) {
    const req = Number(c?.requiredPotentialRank || 0);
    if (!Number.isFinite(req)) continue;

    if (req <= potRank && req > bestReq) {
      best = c;
      bestReq = req;
    }
  }

  if (best) return best;
  return [...candidates].sort(
    (a, b) => Number(a?.requiredPotentialRank || 0) - Number(b?.requiredPotentialRank || 0)
  )[0];
}


function findMatchingTalentCandidate(talentBlock, phaseIndex, level, requiredPotentialRank) {
  const raw = getVisibleTalentCandidates(talentBlock);
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const p = Number(phaseIndex ?? 0);
  const l = Number(level ?? 1);
  const r = Number(requiredPotentialRank ?? 0);

  // Exact match first (phase + level + requiredPotentialRank)
  for (const c of raw) {
    const cp = phaseToIndex(c?.unlockCondition?.phase);
    const cl = Number(c?.unlockCondition?.level || 1);
    const cr = Number(c?.requiredPotentialRank || 0);
    if (cp === p && cl === l && cr === r) return c;
  }

  // Fallback: best <= r at same phase+level
  let best = null;
  let bestReq = -1;
  for (const c of raw) {
    const cp = phaseToIndex(c?.unlockCondition?.phase);
    const cl = Number(c?.unlockCondition?.level || 1);
    const cr = Number(c?.requiredPotentialRank || 0);
    if (cp !== p || cl !== l) continue;
    if (cr <= r && cr > bestReq) {
      best = c;
      bestReq = cr;
    }
  }
  return best;
}

function computeTalentResolved({
  talentBlock,
  talentBlockEN,
  talentIdx,
  potRank,
  vnEntry,
  isEnglishUI,
}) {
  const raw = getVisibleTalentCandidates(talentBlock);
  if (!Array.isArray(raw) || raw.length === 0) return { variants: [], minPhaseIndex: 0 };

  const grouped = groupCandidatesByPhaseLevel(raw);
  const combos = [...grouped.keys()]
    .map((k) => {
      const [p, l] = k.split(":");
      return { phaseIndex: Number(p), level: Number(l) };
    })
    .filter((x) => Number.isFinite(x.phaseIndex) && Number.isFinite(x.level))
    .sort((a, b) => a.phaseIndex - b.phaseIndex || a.level - b.level);

  const variants = combos
    .map(({ phaseIndex, level }) => {
      const key = `${phaseIndex}:${level}`;
      const list = grouped.get(key) || [];
      const picked = pickBestCandidateByPot(list, potRank);
      if (!picked) return null;

      const req = Number(picked?.requiredPotentialRank || 0);

      const pickedEN = isEnglishUI
        ? findMatchingTalentCandidate(talentBlockEN, phaseIndex, level, req)
        : null;

      const bbMap = buildBlackboardMap(pickedEN?.blackboard || picked?.blackboard);

      if (isEnglishUI) {
        const baseText = pickedEN?.description || picked?.description || "";
        const text = applyBlackboard(baseText, bbMap);

        return {
          phaseIndex,
          level,
          requiredPotentialRank: req,
          name: pickedEN?.name || picked?.name || "",
          text,
          rangeId: pickedEN?.rangeId || picked?.rangeId || "",
        };
      }

      const baseText = resolveTalentText({
        vnEntry,
        talentIdx,
        phaseIndex,
        level,
        requiredPotentialRank: req,
        fallbackText: picked?.description || "",
      });

      const text = applyBlackboard(baseText, bbMap);

      return {
        phaseIndex,
        level,
        requiredPotentialRank: req,
        name: picked?.name || "",
        text,
        rangeId: picked?.rangeId || "",
      };
    })
    .filter(Boolean);

  const minPhaseIndex = variants.length > 0 ? Math.min(...variants.map((v) => v.phaseIndex)) : 0;

  return { variants, minPhaseIndex };
}


function collectTalentHeaderOptions(talentBlocks) {
  const map = new Map();
  if (!Array.isArray(talentBlocks)) return [];

  for (const tb of talentBlocks) {
    const cands = getVisibleTalentCandidates(tb);
    if (!Array.isArray(cands) || cands.length === 0) continue;

    for (const c of cands) {
      const p = phaseToIndex(c?.unlockCondition?.phase);
      const l = Number(c?.unlockCondition?.level || 1);
      const lvl = Number.isFinite(l) ? l : 1;

      if (!map.has(p)) map.set(p, new Set());
      map.get(p).add(lvl);
    }
  }

  const phases = [...map.keys()].sort((a, b) => a - b);
  const options = [];

  for (const p of phases) {
    const levels = [...(map.get(p) || [])].sort((a, b) => a - b);
    if (levels.length === 0) continue;

    const baseLevel = levels[0];
    options.push({ phaseIndex: p, level: baseLevel, showLv: false });

    for (const lvl of levels.slice(1)) {
      options.push({ phaseIndex: p, level: lvl, showLv: true });
    }
  }

  return options;
}



function collectBuildingHeaderOptions(buffChar) {
  const map = new Map();
  if (!Array.isArray(buffChar)) return [];

  for (const g of buffChar) {
    const arr = Array.isArray(g?.buffData) ? g.buffData : [];
    for (const b of arr) {
      const p = phaseToEliteIndex(b?.cond?.phase);
      const l = Number(b?.cond?.level || 1);
      const lvl = Number.isFinite(l) ? l : 1;

      if (!map.has(p)) map.set(p, new Set());
      map.get(p).add(lvl);
    }
  }

  const phases = [...map.keys()]
    .filter((n) => n >= 0 && n <= 2)
    .sort((a, b) => a - b);

  const options = [];
  for (const p of phases) {
    const levels = [...(map.get(p) || [])].sort((a, b) => a - b);
    if (levels.length === 0) continue;

    const baseLevel = levels[0];
    options.push({ phaseIndex: p, level: baseLevel, showLv: false });

    for (const lvl of levels.slice(1)) {
      options.push({ phaseIndex: p, level: lvl, showLv: true });
    }
  }

  return options;
}
function pickVariantByHeaderOption(variants, opt) {
  if (!Array.isArray(variants) || variants.length === 0) return null;
  if (!opt) return variants[variants.length - 1];

  const desiredPhase = Number(opt.phaseIndex);
  const desiredLevel = Number(opt.level);

  // Exact phase + level
  const exact = variants.find(
    (v) => v.phaseIndex === desiredPhase && v.level === desiredLevel
  );
  if (exact) return exact;
  const samePhase = variants.filter((v) => v.phaseIndex === desiredPhase);
  if (samePhase.length > 0) {
    const le = samePhase
      .filter((v) => v.level <= desiredLevel)
      .sort((a, b) => b.level - a.level)[0];
    return le || samePhase.sort((a, b) => a.level - b.level)[0];
  }

  const lePhase = variants
    .filter((v) => v.phaseIndex <= desiredPhase)
    .sort((a, b) => (b.phaseIndex - a.phaseIndex) || (b.level - a.level))[0];

  return lePhase || variants[variants.length - 1];
}

function renderLineWithHovers(line, keyPrefix) {
  if (!isNonEmptyString(line)) return null;

  // [[label|noteKey]] OR <@noteKey>label</> OR <$noteKey>label</>
  const re = /\[\[([\s\S]*?)\|([\s\S]*?)\]\]|<([@$])([a-zA-Z0-9_.-]+)>([\s\S]*?)<\/>/g;

  const nodes = [];
  let last = 0;
  let m;

  const pushInline = (txt, kp) => {
    if (!isNonEmptyString(txt)) return;
    nodes.push(...renderInlineItalic(txt, kp));
  };

  while ((m = re.exec(line)) !== null) {
    const start = m.index;
    const end = re.lastIndex;

    if (start > last) pushInline(line.slice(last, start), `${keyPrefix}-t-${last}`);

    // [[label|noteKey]]
    if (typeof m[1] === "string" && typeof m[2] === "string") {
      const label = formatNestedNoteTags(m[1]);
      const noteKey = m[2].trim();

      nodes.push(
        <StatHover key={`${keyPrefix}-h-${i}`} label={label} noteKey={noteKey} />
      );last = end;
      continue;
    }

    // <@noteKey>label</> or <$noteKey>label</>
    if (typeof m[4] === "string" && typeof m[5] === "string") {
      const noteKey = m[4].trim();
      const label = formatNestedNoteTags(m[5]);
      nodes.push(<StatHover key={`${keyPrefix}-h-${start}`} label={label} noteKey={noteKey} />);
      last = end;
      continue;
    }

    // Fallback
    pushInline(line.slice(start, end), `${keyPrefix}-u-${start}`);
    last = end;
  }

  if (last < line.length) pushInline(line.slice(last), `${keyPrefix}-t-${last}`);

  return nodes;
}

function renderTextWithHovers(text, keyPrefix = "txt") {
  if (!isNonEmptyString(text)) return null;

  const normalized = String(text)
    .split("\r\n").join("\n")
    .split("\r").join("\n")
    .split("\\n").join("\n");

  const parsed = parseMarkupHovers(normalized, keyPrefix);
  return <>{parsed.nodes}</>;
}

function RangeGrid({ rangeId }) {
  const grids = rangeId ? rangeTable?.[rangeId]?.grids : null;

  if (!rangeId || !Array.isArray(grids)) {
    return <div className="text-sm text-white/60">No range data.</div>;
  }

  const rowVals = [0, ...grids.map((g) => g.row)];
  const colVals = [0, ...grids.map((g) => g.col)];
  const minR = Math.min(...rowVals);
  const maxR = Math.max(...rowVals);
  const minC = Math.min(...colVals);
  const maxC = Math.max(...colVals);

  const height = maxR - minR + 1;
  const width = maxC - minC + 1;

  const keySet = new Set(grids.map((g) => `${g.row},${g.col}`));

  return (
    <div
      className="inline-grid gap-[2px] p-2 rounded-lg bg-black/30"
      style={{
        gridTemplateColumns: `repeat(${width}, 18px)`,
        gridTemplateRows: `repeat(${height}, 18px)`,
      }}
    >
      {Array.from({ length: height }).map((_, rIdx) => {
        const r = maxR - rIdx;
        return Array.from({ length: width }).map((__, cIdx) => {
          const c = minC + cIdx;
          const isCenter = r === 0 && c === 0;
          const isAttack = keySet.has(`${r},${c}`);

          return (
            <div
              key={`${r},${c}`}
              className="w-[18px] h-[18px] rounded-[3px] bg-black/20 border border-white/5 flex items-center justify-center"
              title={isCenter ? "Stand" : isAttack ? "Attack" : ""}
            >
              {isCenter ? (
                <img
                  src={RANGE_STAND}
                  alt="stand"
                  className="w-[14px] h-[14px] object-contain"
                  draggable={false}
                />
              ) : isAttack ? (
                <img
                  src={RANGE_ATTACK}
                  alt="atk"
                  className="w-[14px] h-[14px] object-contain"
                  draggable={false}
                />
              ) : null}
            </div>
          );
        });
      })}
    </div>
  );
}


function SkillRangeGrid({ baseRangeId, rangeId }) {
  const skillGrids = rangeId ? rangeTable?.[rangeId]?.grids : null;
  const baseGrids = baseRangeId ? rangeTable?.[baseRangeId]?.grids : null;

  if (!rangeId || !Array.isArray(skillGrids)) {
    return <div className="text-sm text-white/60">No range data.</div>;
  }

  const skillSet = new Set(skillGrids.map((g) => `${g.row},${g.col}`));
  const baseSet = new Set(
    Array.isArray(baseGrids) ? baseGrids.map((g) => `${g.row},${g.col}`) : []
  );

  const rowVals = [0, ...skillGrids.map((g) => g.row)];
  const colVals = [0, ...skillGrids.map((g) => g.col)];
  const minR = Math.min(...rowVals);
  const maxR = Math.max(...rowVals);
  const minC = Math.min(...colVals);
  const maxC = Math.max(...colVals);

  const height = maxR - minR + 1;
  const width = maxC - minC + 1;

  return (
    <div
      className="inline-grid gap-[2px] p-2 rounded-lg bg-black/30"
      style={{
        gridTemplateColumns: `repeat(${width}, 18px)`,
        gridTemplateRows: `repeat(${height}, 18px)`,
      }}
    >
      {Array.from({ length: height }).map((_, rIdx) => {
        const r = maxR - rIdx;
        return Array.from({ length: width }).map((__, cIdx) => {
          const c = minC + cIdx;
          const isCenter = r === 0 && c === 0;
          const isInSkill = skillSet.has(`${r},${c}`);

          const isBase = isInSkill && baseSet.has(`${r},${c}`);
          const icon = isCenter ? RANGE_STAND : isInSkill ? (isBase ? RANGE_ATTACK : RANGE_ATTACK_SKILL) : "";

          return (
            <div
              key={`${r},${c}`}
              className="w-[18px] h-[18px] rounded-[3px] bg-black/20 border border-white/5 flex items-center justify-center"
              title={isCenter ? "Stand" : isInSkill ? (isBase ? "Base Range" : "Extended Range") : ""}
            >
              {icon ? (
                <img
                  src={icon}
                  alt=""
                  className="w-[14px] h-[14px] object-contain"
                  draggable={false}
                  loading="lazy"
                />
              ) : null}
            </div>
          );
        });
      })}
    </div>
  );
}

function MaterialIcon({ itemId, count }) {
  const meta = getItemMeta(itemId);

  const name = meta?.name || String(itemId || "Unknown");
  const bgUrl = getItemBgUrl(meta?.rarity);
  const iconUrl = getItemIconUrl(meta?.iconId);

  const INNER = 44;
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
              alt={name}
              className="absolute inset-0 w-full h-full object-contain origin-center"
              style={{ transform: `scale(${ICON_SCALE})` }}
              draggable={false}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.visibility = "hidden";
              }}
            />
          ) : null}
        </div>
      </div>

      <div className="absolute bottom-[2px] right-[2px] px-1.5 rounded bg-black/80 text-[13px] leading-[15px] font-bold text-white tabular-nums">
        {count}
      </div>
    </div>
  );
}


function InfoTable({ title, titleInline, titleRight, children }) {
  return (
    <div className="bg-[#1b1b1b] rounded-xl p-4 text-white">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <h3 className="text-[1.375rem] font-semibold leading-snug">{title}</h3>
          {titleInline ? <div className="shrink-0">{titleInline}</div> : null}
        </div>
        {titleRight ? <div className="shrink-0">{titleRight}</div> : null}
      </div>

      <div className="h-px bg-white/10 my-3" />

      {/* Text */}
      <div className="text-[1.025rem] text-gray-300 leading-relaxed break-words">{children}</div>
    </div>
  );
}


export default function SkillsSection(props) {
  const isEnglishUI =
    (typeof props?.lang === "string" && props.lang.toLowerCase().startsWith("en")) ||
    (typeof props?.language === "string" && props.language.toLowerCase().startsWith("en")) ||
    (typeof props?.locale === "string" && props.locale.toLowerCase().startsWith("en")) ||
    props?.isEN === true ||
    props?.isEn === true ||
    props?.english === true;

  const traitMap = React.useMemo(() => buildTraitMap(isEnglishUI ? traitEN : traitVN), [isEnglishUI]);
  const tagMap = React.useMemo(() => buildTagMap(tagVN), []);

  // Be tolerant with whatever the parent passes in.
  const operator = props?.operator || props?.data || null;
  const rawCharId =
    props?.charId ||
    props?.operatorId ||
    props?.charKey ||
    operator?.charId ||
    operator?.id ||
    operator?.charKey ||
    null;

  const { charKey, charData } = React.useMemo(() => getCharEntry(rawCharId), [rawCharId]);

  const charDataEN = React.useMemo(() => {
    if (!isNonEmptyString(charKey)) return null;
    return characterTableEN?.[charKey] || null;
  }, [charKey]);

  const rawTagList = charData?.tagList ?? operator?.tagList ?? [];
  const resolvedTags = React.useMemo(() => {
    if (!Array.isArray(rawTagList) || rawTagList.length === 0) return [];
    return rawTagList
      .filter((t) => isNonEmptyString(t))
      .map((t) => {
        const key = String(t).trim();
        return tagMap && key in tagMap ? String(tagMap[key]) : key;
      });
  }, [rawTagList, tagMap]);

  const positionRaw = charData?.position ?? operator?.position ?? "";
  const positionLabel =
    positionRaw === "MELEE"
      ? "Vị trí: Cận chiến"
      : positionRaw === "RANGED"
      ? "Vị trí: Tầm xa"
      : isNonEmptyString(positionRaw)
      ? `Vị trí: ${positionRaw}`
      : "";

  const traitResolved = React.useMemo(() => {
    const subProfessionId = charData?.subProfessionId ?? operator?.subProfessionId;
    const rarity = charData?.rarity ?? operator?.rarity;

    const baseDescCN = charData?.description ?? operator?.description ?? "";
    const baseDescEN = charDataEN?.description ?? "";
    const baseDesc = isEnglishUI ? (baseDescEN || baseDescCN) : baseDescCN;

    const candidates = getTraitCandidates(charData);
    const candidatesEN = getTraitCandidates(charDataEN);
    const candEnByPhase = new Map(candidatesEN.map((x) => [x.phaseIndex, x.cand]));

    // No per-phase trait data → just render the base (translated) trait text.
    if (candidates.length === 0) {
      const { mainText, extraText } = resolveTraitTexts(
        { subProfessionId, rarity, description: baseDesc },
        traitMap
      );
      return { variants: [{ phaseIndex: 0, text: mainText, extraText }], showElite: false };
    }

    const variants = candidates.map(({ phaseIndex, cand }) => {
      const candEN = candEnByPhase.get(phaseIndex) || null;
      const desc = isEnglishUI
        ? (isNonEmptyString(candEN?.description) ? candEN.description : (isNonEmptyString(cand?.description) ? cand.description : baseDesc))
        : (isNonEmptyString(cand?.description) ? cand.description : baseDesc);

      const { mainText, extraText } = resolveTraitTexts(
        { subProfessionId, rarity, description: desc },
        traitMap
      );

      const bbMap = buildBlackboardMap(candEN?.blackboard || cand?.blackboard);
      const text = applyBlackboard(mainText, bbMap);
      const extra = applyBlackboard(extraText, bbMap);

      return { phaseIndex, text, extraText: extra };
    });

    const uniq = new Set(variants.map((v) => `${v.text}||${v.extraText || ""}`));
    const showElite = variants.length > 1 && uniq.size > 1;

    // If all phases render the same text → use ONE (pick highest phase) and hide Elite buttons.
    if (!showElite) {
      return { variants: [variants[variants.length - 1]], showElite: false };
    }

    return { variants, showElite: true };
  }, [charData, operator, traitMap]);

  const [traitVariantIdx, setTraitVariantIdx] = React.useState(0);

  React.useEffect(() => {
    if (traitResolved?.showElite) {
      setTraitVariantIdx(Math.max(0, (traitResolved.variants?.length || 1) - 1));
    } else {
      setTraitVariantIdx(0);
    }
  }, [charKey, traitResolved?.showElite, traitResolved?.variants?.length]);

  const safeTraitVariantIdx = Math.min(
    Math.max(0, traitVariantIdx),
    Math.max(0, (traitResolved.variants?.length || 1) - 1)
  );

  const currentTraitText = traitResolved?.variants?.[safeTraitVariantIdx]?.text || "";
  const currentTraitExtraText = traitResolved?.variants?.[safeTraitVariantIdx]?.extraText || "";

  const traitEliteButtons = traitResolved?.showElite ? (
    <div className="flex items-center gap-2">
      {traitResolved.variants.map((v, idx) => {
        const active = idx === safeTraitVariantIdx;
        const src = `${ELITE_ICON_BASE}elite_${v.phaseIndex}_large.png`;

        return (
          <button
            key={`trait-elite-${v.phaseIndex}-${idx}`}
            type="button"
            onClick={() => setTraitVariantIdx(idx)}
            className={`rounded-lg p-1.5 transition ${
              active ? "bg-emerald-600" : "bg-white/10 hover:bg-white/20"
            }`}
            title={`E${v.phaseIndex}`}
          >
            <img
              src={src}
              alt={`E${v.phaseIndex}`}
              className="w-8 h-8 object-contain"
              draggable={false}
            />
          </button>
        );
      })}
    </div>
  ) : null;

  /** -----------------------------
 * Talents
 * ----------------------------- */
const vnTalentEntry = React.useMemo(() => getTalentVnEntry(charKey), [charKey]);
const talentBlocks = React.useMemo(() => {
  const raw = charData?.talents;
  if (!Array.isArray(raw)) return [];
  // Filter out hidden/placeholder talent blocks (e.g. isHideTalent=true with empty name/description)
  return raw.filter(isValidTalentBlock);
}, [charData]);

const talentBlocksEN = React.useMemo(() => {
  const raw = charDataEN?.talents;
  if (!Array.isArray(raw)) return [];
  return raw.filter(isValidTalentBlock);
}, [charDataEN]);

// Potential ranks that actually exist in this operator's talent candidates
const availablePotRanks = React.useMemo(() => {
  const set = new Set([0]); // Pot 1 always
  for (const tb of talentBlocks) {
    const cands = getVisibleTalentCandidates(tb);
    if (!Array.isArray(cands) || cands.length === 0) continue;
    for (const c of cands) {
      const r = Number(c?.requiredPotentialRank || 0);
      if (Number.isFinite(r)) set.add(r);
    }
  }
  return [...set].filter((n) => n >= 0 && n <= 5).sort((a, b) => a - b);
}, [talentBlocks]);

const [potRank, setPotRank] = React.useState(0); // 0..5 (UI shows 1..6)
React.useEffect(() => {
  // Reset and clamp
  setPotRank(0);
}, [charKey]);

// Elite header options: phase + optional Lv variants (e.g. E1, E1 Lv55)
const talentHeaderOptions = React.useMemo(
  () => collectTalentHeaderOptions(talentBlocks),
  [talentBlocks]
);

const defaultHeaderOptIdx =
  talentHeaderOptions.length > 0 ? talentHeaderOptions.length - 1 : 0;

const [talentHeaderOptIdx, setTalentHeaderOptIdx] = React.useState(defaultHeaderOptIdx);

React.useEffect(() => {
  setTalentHeaderOptIdx(defaultHeaderOptIdx);
}, [charKey, defaultHeaderOptIdx]);

const activeTalentHeaderOpt =
  talentHeaderOptions[Math.min(Math.max(0, talentHeaderOptIdx), Math.max(0, talentHeaderOptions.length - 1))] ||
  { phaseIndex: 0, level: 1, showLv: false };

const talent1Resolved = React.useMemo(
  () =>
    computeTalentResolved({
      talentBlock: talentBlocks?.[0],
      talentBlockEN: talentBlocksEN?.[0],
      talentIdx: 0,
      potRank,
      vnEntry: vnTalentEntry,
      isEnglishUI,
    }),
  [talentBlocks, talentBlocksEN, potRank, vnTalentEntry, isEnglishUI]
);

const talent2Resolved = React.useMemo(
  () =>
    computeTalentResolved({
      talentBlock: talentBlocks?.[1],
      talentBlockEN: talentBlocksEN?.[1],
      talentIdx: 1,
      potRank,
      vnEntry: vnTalentEntry,
      isEnglishUI,
    }),
  [talentBlocks, talentBlocksEN, potRank, vnTalentEntry, isEnglishUI]
);

const showTalentHeaderElite = talentHeaderOptions.length > 1;

const talentHeaderElite = showTalentHeaderElite ? (
  <div className="flex items-center gap-2">
    {talentHeaderOptions.map((opt, idx) => {
      const active = idx === talentHeaderOptIdx;
      const src = `${ELITE_ICON_BASE}elite_${opt.phaseIndex}_large.png`;
      return (
        <button
          key={`talent-header-opt-${opt.phaseIndex}-${opt.level}-${idx}`}
          type="button"
          onClick={() => setTalentHeaderOptIdx(idx)}
          className={`rounded-lg px-2 py-1.5 transition flex items-center gap-1.5 ${
            active ? "bg-emerald-600" : "bg-white/10 hover:bg-white/20"
          }`}
          title={opt.showLv ? `E${opt.phaseIndex} Lv${opt.level}` : `E${opt.phaseIndex}`}
        >
          <img
            src={src}
            alt={`E${opt.phaseIndex}`}
            className="w-7 h-7 object-contain"
            draggable={false}
          />
          {opt.showLv ? (
            <span className="text-xs font-semibold tabular-nums">Lv{opt.level}</span>
          ) : null}
        </button>
      );
    })}
  </div>
) : null;

const showPotPicker = availablePotRanks.length > 1;

const potPicker = showPotPicker ? (
  <div className="flex items-center gap-1">
    {availablePotRanks.map((idx0) => {
      const active = idx0 === potRank;
      return (
        <button
          key={`pot-${idx0}`}
          type="button"
          onClick={() => setPotRank(idx0)}
          className={`rounded-lg px-2 py-1 transition flex items-center gap-1 ${
            active ? "bg-emerald-600" : "bg-white/10 hover:bg-white/20"
          }`}
          title={`Pot ${idx0 + 1}`}
        >
          <img
            src={getPotIcon(idx0)}
            alt={`pot-${idx0}`}
            className="w-6 h-6 object-contain"
            draggable={false}
            loading="lazy"
          />
          <span className="text-sm font-semibold tabular-nums">{idx0 + 1}</span>
        </button>
      );
    })}
  </div>
) : null;

// Hide Talent 2 when it only exists at E2+ and user is viewing E0/E1
const shouldHideTalent2 =
  (talent2Resolved?.variants?.length || 0) > 0 &&
  (talent2Resolved?.minPhaseIndex ?? 0) >= 2 &&
  Number(activeTalentHeaderOpt?.phaseIndex ?? 0) < (talent2Resolved?.minPhaseIndex ?? 2);

const renderTalentCard = (talentIdx, resolved) => {
  const variants = resolved?.variants || [];
  if (variants.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        <span className="text-white/40 italic">-</span>
      </div>
    );
  }

  const v =
    pickVariantByHeaderOption(variants, activeTalentHeaderOpt) ||
    variants[variants.length - 1];

  // Title handling: some operators change Talent 1 name at Elite 2 (PHASE_2).
  // If TitleTalent1_2 is not provided yet, avoid showing the E1 title at E2 when the in-game name actually changed.
  let titleName = "";
  const phaseIndexForTitle = Number(v?.phaseIndex ?? 0);

  if (isEnglishUI) {
    titleName = v?.name || "";
  } else {

  if (talentIdx === 0 && phaseIndexForTitle === 2) {
    const vnTitleE2 = isNonEmptyString(vnTalentEntry?.TitleTalent1_2)
      ? String(vnTalentEntry.TitleTalent1_2)
      : "";

    if (isNonEmptyString(vnTitleE2)) {
      titleName = vnTitleE2;
    } else {
      const vnTitleBase = isNonEmptyString(vnTalentEntry?.TitleTalent1)
        ? String(vnTalentEntry.TitleTalent1)
        : "";

      // Compare against the best non-E2 variant name (usually E1) to detect name changes.
      const ref = [...variants]
        .filter((x) => Number(x?.phaseIndex ?? 0) < 2)
        .sort((a, b) => (a.phaseIndex - b.phaseIndex) || (a.level - b.level))
        .slice(-1)[0];
      const refName = ref?.name || "";
      const currentName = v?.name || "";

      if (isNonEmptyString(currentName) && isNonEmptyString(refName) && currentName !== refName) {
        // Name changed at E2 -> show the in-game name until TitleTalent1_2 is provided.
        titleName = currentName;
      } else {
        titleName = vnTitleBase || currentName;
      }
    }
  } else {
    titleName =
      getTalentTitle(
        vnTalentEntry,
        talentIdx,
        phaseIndexForTitle,
        v?.level,
        v?.requiredPotentialRank
      ) || v?.name || "";
  }
  }

  const badgeText = isNonEmptyString(titleName)
    ? `Talent ${talentIdx + 1}: ${titleName}`
    : `Talent ${talentIdx + 1}`;

  const hasRange = isNonEmptyString(v?.rangeId);

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 min-w-0">
            <span className="inline-flex items-center rounded-md bg-white px-2 py-1 text-black font-semibold text-sm max-w-full">
              <span className="truncate">{badgeText}</span>
            </span>
          </div>

          <div
            className="mt-3 min-w-0 text-[1.025rem] text-gray-300 leading-relaxed break-words"
            style={{ overflowWrap: "anywhere" }}
          >
            {isNonEmptyString(v?.text) ? (
              renderTextWithHovers(
                v.text,
                `talent-${charKey || "unknown"}-${talentIdx}-e${v.phaseIndex}-lv${v.level}-pot${potRank}`
              )
            ) : (
              <span className="text-white/40 italic">-</span>
            )}
          </div>
        </div>

        {hasRange ? (
          <div className="shrink-0 self-start rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="text-sm font-semibold text-white text-center mb-2">Phạm vi</div>
            <RangeGrid rangeId={v.rangeId} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

  // ===== Skills (Kỹ năng) =====

  const skillsList = React.useMemo(() => {
    const raw = charData?.skills ?? operator?.skills ?? [];
    if (!Array.isArray(raw)) return [];
    return raw.filter((s) => isNonEmptyString(s?.skillId));
  }, [charData, operator]);

  const [activeSkillIdx, setActiveSkillIdx] = React.useState(0);
  React.useEffect(() => {
    setActiveSkillIdx(0);
  }, [charKey]);

  const safeSkillIdx = clamp(activeSkillIdx, 0, Math.max(0, skillsList.length - 1));
  const selectedSkillRef = skillsList?.[safeSkillIdx] || null;
  const selectedSkillId = selectedSkillRef?.skillId || "";
  const selectedSkillOrder = safeSkillIdx + 1;

  const skillCnEntry = selectedSkillId ? skillTable?.[selectedSkillId] : null;
  const skillEnEntry = selectedSkillId ? skillTableEN?.[selectedSkillId] : null;
  // Skill icon (Mode B): keep previously loaded icons mounted to avoid repeated requests when toggling.
  const selectedSkillIconUrl = getSkillIconUrl(
    selectedSkillId,
    skillCnEntry?.iconId || skillEnEntry?.iconId
  );

  const skillIconLoadedSetRef = React.useRef(new Set());
  const skillIconPendingUrlRef = React.useRef("");
  const [mountedSkillIconUrls, setMountedSkillIconUrls] = React.useState(() => new Set());
  const [displaySkillIconUrl, setDisplaySkillIconUrl] = React.useState("");
  const [isSkillIconLoading, setIsSkillIconLoading] = React.useState(false);
  const [skillIconError, setSkillIconError] = React.useState(false);

  React.useEffect(() => {
    const url = selectedSkillIconUrl;
    skillIconPendingUrlRef.current = url;
    setSkillIconError(false);

    if (!url) {
      setDisplaySkillIconUrl("");
      setIsSkillIconLoading(false);
      return;
    }

    setMountedSkillIconUrls((prev) => {
      if (prev.has(url)) return prev;
      const next = new Set(prev);
      next.add(url);
      return next;
    });

    if (skillIconLoadedSetRef.current.has(url)) {
      // Instantly show if already loaded
      setDisplaySkillIconUrl(url);
      setIsSkillIconLoading(false);
    } else {
      // Aesthetic: hide old icon while loading the new one
      setDisplaySkillIconUrl("");
      setIsSkillIconLoading(true);
    }
  }, [selectedSkillIconUrl]);


  const skillLevels = React.useMemo(() => {
    const a = skillCnEntry?.levels;
    const b = skillEnEntry?.levels;
    if (Array.isArray(a) && a.length > 0) return a;
    if (Array.isArray(b) && b.length > 0) return b;
    return [];
  }, [skillCnEntry, skillEnEntry]);

  const levelCount = skillLevels.length;

  const [activeSkillLevelIdx, setActiveSkillLevelIdx] = React.useState(0);
  React.useEffect(() => {
    setActiveSkillLevelIdx(levelCount > 0 ? levelCount - 1 : 0);
  }, [selectedSkillId, levelCount]);

  const safeSkillLevelIdx = clamp(activeSkillLevelIdx, 0, Math.max(0, levelCount - 1));
  const currentSkillLevel = skillLevels?.[safeSkillLevelIdx] || null;

  const baseRangeId = React.useMemo(() => {
    const phases = charData?.phases;
    if (!Array.isArray(phases) || phases.length === 0) return "";
    const p2 =
      phases.find((p) => String(p?.phase || "") === "PHASE_2") ||
      phases?.[2] ||
      phases?.[phases.length - 1];
    return isNonEmptyString(p2?.rangeId) ? String(p2.rangeId) : "";
  }, [charData]);

  const vnSkillEntry = React.useMemo(() => {
    if (!isNonEmptyString(charKey)) return null;
    return skillVN?.[charKey] || null;
  }, [charKey]);

  const skillName = React.useMemo(() => {
    const vnTitleKey = `Title_S${selectedSkillOrder}`;
    const vnTitle = isNonEmptyString(vnSkillEntry?.[vnTitleKey])
      ? String(vnSkillEntry[vnTitleKey]).trim()
      : "";

    const enName = skillEnEntry?.levels?.[0]?.name || "";
    const cnName = skillCnEntry?.levels?.[0]?.name || "";
    if (isEnglishUI) return enName || cnName || "";
    return vnTitle || enName || cnName || "";
  }, [vnSkillEntry, selectedSkillOrder, skillEnEntry, skillCnEntry, isEnglishUI]);

  const skillDesc = React.useMemo(() => {
    const levelNum = safeSkillLevelIdx + 1;
    const vnKey =
      levelNum <= 7 ? `S${selectedSkillOrder}_${levelNum}` : `S${selectedSkillOrder}_7M${levelNum - 7}`;

    const vnText = isNonEmptyString(vnSkillEntry?.[vnKey]) ? String(vnSkillEntry[vnKey]) : "";
    const enText = skillEnEntry?.levels?.[safeSkillLevelIdx]?.description || "";
    const cnText = skillCnEntry?.levels?.[safeSkillLevelIdx]?.description || "";
    const rawText = isEnglishUI ? (enText || cnText || "") : (vnText || enText || cnText || "");

    const bbMap = buildSkillParamMap(currentSkillLevel);
    return applyBlackboard(rawText, bbMap);
  }, [
    vnSkillEntry,
    selectedSkillOrder,
    safeSkillLevelIdx,
    currentSkillLevel,
    skillEnEntry,
    skillCnEntry,
      isEnglishUI,
  ]);

  const currentSpType = currentSkillLevel?.spData?.spType;
  const currentSkillType = currentSkillLevel?.skillType;
  const currentDuration = currentSkillLevel?.duration;

  const currentRangeId = currentSkillLevel?.rangeId;

  const currentInitSp = currentSkillLevel?.spData?.initSp;
  const currentSpCost = currentSkillLevel?.spData?.spCost;

  const allSkillLvlup = Array.isArray(charData?.allSkillLvlup) ? charData.allSkillLvlup : [];
  const masteryConds = Array.isArray(selectedSkillRef?.levelUpCostCond)
    ? selectedSkillRef.levelUpCostCond
    : [];


  const selectedUpgradeInfo = React.useMemo(() => {
    const lv = safeSkillLevelIdx + 1;

    // Lv 1 has no upgrade cost
    if (lv <= 1) return null;

    // Lv 2-7
    if (lv <= 7) {
      const row = allSkillLvlup?.[lv - 2] || null;
      if (!row) return null;

      const costs = Array.isArray(row?.lvlUpCost) ? row.lvlUpCost : [];
      const unlockCond = row?.unlockCond || null;

      // Some operators do not have global skill upgrade cost data.
      // Hide the whole section in that case.
      if (!unlockCond && costs.length === 0) return null;

      return {
        label: `Lv ${lv - 1} → ${lv}`,
        unlockCond,
        time: null,
        costs,
      };
    }

    // Lv 7 Mastery 1-3 (mapped from Lv 8-10)
    const m = lv - 7;
    const row = masteryConds?.[m - 1] || null;
    if (!row) return null;

    const costs = Array.isArray(row?.levelUpCost) ? row.levelUpCost : [];
    const unlockCond = row?.unlockCond || null;
    const time = row?.lvlUpTime != null ? formatHMS(row.lvlUpTime) : null;

    if (!unlockCond && !time && costs.length === 0) return null;

    return {
      label: `Lv 7 Mastery ${m}`,
      unlockCond,
      time,
      costs,
    };
  }, [safeSkillLevelIdx, allSkillLvlup, masteryConds]);

  // ===== Building Skills (Kỹ năng hậu cầu) =====
  const buildingCharEntry = React.useMemo(() => {
    if (!isNonEmptyString(charKey)) return null;
    return buildingData?.chars?.[charKey] || buildingDataEN?.chars?.[charKey] || null;
  }, [charKey]);

  const buildingHeaderOptions = React.useMemo(
    () => collectBuildingHeaderOptions(buildingCharEntry?.buffChar),
    [buildingCharEntry]
  );

  const defaultBuildingHeaderOptIdx =
    buildingHeaderOptions.length > 0 ? buildingHeaderOptions.length - 1 : 0;

  const [buildingHeaderOptIdx, setBuildingHeaderOptIdx] = React.useState(
    defaultBuildingHeaderOptIdx
  );

  React.useEffect(() => {
    setBuildingHeaderOptIdx(defaultBuildingHeaderOptIdx);
  }, [charKey, defaultBuildingHeaderOptIdx]);

  const activeBuildingHeaderOpt =
    buildingHeaderOptions[
      Math.min(
        Math.max(0, buildingHeaderOptIdx),
        Math.max(0, buildingHeaderOptions.length - 1)
      )
    ] || { phaseIndex: 0, level: 1, showLv: false };

  const showBuildingEliteHeader = buildingHeaderOptions.length > 1;

  const buildingHeaderElite = showBuildingEliteHeader ? (
    <div className="flex items-center gap-2">
      {buildingHeaderOptions.map((opt, idx) => {
        const active = idx === buildingHeaderOptIdx;
        const src = `${ELITE_ICON_BASE}elite_${opt.phaseIndex}_large.png`;

        return (
          <button
            key={`bskill-header-opt-${charKey || "unknown"}-${opt.phaseIndex}-${opt.level}-${idx}`}
            type="button"
            onClick={() => setBuildingHeaderOptIdx(idx)}
            className={`rounded-lg px-2 py-1.5 transition flex items-center gap-1.5 ${
              active ? "bg-emerald-600" : "bg-white/10 hover:bg-white/20"
            }`}
            title={opt.showLv ? `E${opt.phaseIndex} Lv${opt.level}` : `E${opt.phaseIndex}`}
          >
            <img
              src={src}
              alt={`E${opt.phaseIndex}`}
              className="w-7 h-7 object-contain"
              draggable={false}
              loading="lazy"
              onError={(ev) => {
                ev.currentTarget.style.display = "none";
              }}
            />
            {opt.showLv ? (
              <span className="text-xs font-semibold tabular-nums">
                Lv{opt.level}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  ) : null;

  // Build building-skill cards for EACH header option (Mode B):
// keep previously opened header options mounted so their icons don't re-request when switching back.
const computeBuildingBuffCardsForOpt = (buffChar, opt) => {
  if (!Array.isArray(buffChar)) return [];

  const groups = buffChar
    .map((g, idx) => ({ idx, data: Array.isArray(g?.buffData) ? g.buffData : [] }))
    .filter((g) => Array.isArray(g.data) && g.data.length > 0);

  const selPhase = Number(opt?.phaseIndex ?? 0);
  const selLevel = Number(opt?.level ?? 1);

  const pickBestUpTo = (arr) => {
    const filtered = [...arr].filter((a) => {
      const p = phaseToEliteIndex(a?.cond?.phase);
      const l = Number(a?.cond?.level || 1);
      if (p < selPhase) return true;
      if (p === selPhase) return l <= selLevel;
      return false;
    });

    const sorted = filtered.filter(Boolean).sort((a, b) => {
      const pa = phaseToEliteIndex(a?.cond?.phase);
      const pb = phaseToEliteIndex(b?.cond?.phase);
      if (pa !== pb) return pa - pb;
      const la = Number(a?.cond?.level || 0);
      const lb = Number(b?.cond?.level || 0);
      return la - lb;
    });

    return sorted.length > 0 ? sorted[sorted.length - 1] : null;
  };

  return groups
    .map((g) => {
      const best = pickBestUpTo(g.data);
      if (!best) return null;
      return { groupIndex: g.idx, ...best };
    })
    .filter(Boolean);
};

const buildingBuffCardsByOptIdx = React.useMemo(() => {
  const buffChar = buildingCharEntry?.buffChar;
  if (!Array.isArray(buffChar)) return [];
  return buildingHeaderOptions.map((opt) => computeBuildingBuffCardsForOpt(buffChar, opt));
}, [buildingCharEntry, buildingHeaderOptions]);

const safeBuildingHeaderOptIdx = Math.min(
  Math.max(0, buildingHeaderOptIdx),
  Math.max(0, buildingHeaderOptions.length - 1)
);

const activeBuildingBuffCards = buildingBuffCardsByOptIdx?.[safeBuildingHeaderOptIdx] || [];

const [mountedBuildingHeaderIdxs, setMountedBuildingHeaderIdxs] = React.useState(
  () => new Set([safeBuildingHeaderOptIdx])
);

React.useEffect(() => {
  // Reset cache when switching operator
  setMountedBuildingHeaderIdxs(new Set([safeBuildingHeaderOptIdx]));
}, [charKey, safeBuildingHeaderOptIdx]);

React.useEffect(() => {
  setMountedBuildingHeaderIdxs((prev) => {
    if (prev.has(safeBuildingHeaderOptIdx)) return prev;
    const next = new Set(prev);
    next.add(safeBuildingHeaderOptIdx);
    return next;
  });
}, [safeBuildingHeaderOptIdx]);
return (
    <div className="space-y-3">
      {/* Tag + Position */}
      <div className="bg-[#1b1b1b] rounded-xl p-4 text-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
            {resolvedTags.length > 0 ? (
              <div className="text-white/95 font-medium break-words leading-relaxed">
                {`Tag: ${resolvedTags.join(", ")}`}
              </div>
            ) : (
              <span className="text-white/40 italic">-</span>
            )}
          </div>

          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
            {isNonEmptyString(positionLabel) ? (
              <div className="text-white/95 font-medium leading-relaxed">
                {positionLabel}
              </div>
            ) : (
              <span className="text-white/40 italic">-</span>
            )}
          </div>
        </div>
      </div>
      <InfoTable title="Đặc tính/Trait" titleRight={traitEliteButtons}>
        {isNonEmptyString(currentTraitText) ? (
          <>
            {renderTextWithHovers(
              currentTraitText,
              `trait-${charKey || "unknown"}-p${
                traitResolved?.variants?.[safeTraitVariantIdx]?.phaseIndex ?? 0
              }`
            )}

            {isNonEmptyString(currentTraitExtraText) ? (
              <>
                <div className="h-px bg-white/10 my-4" />

                <details className="mw-collapsible mw-made-collapsible">
                  <summary className="mw-collapsible-toggle cursor-pointer select-none text-white/80 font-semibold">
                    Thông tin bổ sung
                  </summary>

                  <div className="mt-3">
                    {renderTextWithHovers(
                      currentTraitExtraText,
                      `trait-extra-${charKey || "unknown"}-p${
                        traitResolved?.variants?.[safeTraitVariantIdx]?.phaseIndex ?? 0
                      }`
                    )}
                  </div>
                </details>
              </>
            ) : null}
          </>
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

      {skillsList.length > 0 ? (
      <InfoTable title="Kỹ năng">
        {skillsList.length > 0 && isNonEmptyString(selectedSkillId) ? (
          <div className="space-y-4">
            {/* Skill selector */}
            <div className="flex items-center gap-2 flex-wrap">
              {skillsList.map((s, idx0) => {
                const isActive = idx0 === safeSkillIdx;
                return (
                  <button
                    key={`${s.skillId}-${idx0}`}
                    type="button"
                    onClick={() => setActiveSkillIdx(idx0)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition border ${
                      isActive
                        ? "bg-white text-black border-white"
                        : "bg-white/10 text-white border-white/10 hover:bg-white/20"
                    }`}
                  >
                    Skill {idx0 + 1}
                  </button>
                );
              })}
            </div>

            {/* Skill header + range */}
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="shrink-0">
                  <div className="relative" style={{ width: 96, height: 96, minWidth: 96 }}>
                    {Array.from(mountedSkillIconUrls).map((url) => (
                      <img
                        key={url}
                        src={url}
                        alt={selectedSkillId}
                        className="w-24 h-24 object-contain absolute inset-0"
                        style={{
                          width: 96,
                          height: 96,
                          minWidth: 96,
                          opacity:
                            !isSkillIconLoading &&
                            !skillIconError &&
                            displaySkillIconUrl === url
                              ? 1
                              : 0,
                          visibility:
                            !isSkillIconLoading &&
                            !skillIconError &&
                            displaySkillIconUrl === url
                              ? "visible"
                              : "hidden",
                        }}
                        draggable={false}
                        loading="lazy"
                        onLoad={() => {
                          skillIconLoadedSetRef.current.add(url);
                          if (skillIconPendingUrlRef.current === url) {
                            setDisplaySkillIconUrl(url);
                            setIsSkillIconLoading(false);
                          }
                        }}
                        onError={(e) => {
                          e.currentTarget.style.visibility = "hidden";
                          if (skillIconPendingUrlRef.current === url) {
                            setIsSkillIconLoading(false);
                            setSkillIconError(true);
                            setDisplaySkillIconUrl("");
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-lg font-semibold text-white break-words">
                    {isNonEmptyString(skillName) ? skillName : `Skill ${selectedSkillOrder}`}
                  </div>

                  {/* Badges */}
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    {Number(currentSpType) === 8 || String(currentSpType) === "8" ? null : (
                      (() => {
                        const k = String(currentSpType || "");
                        const meta = SP_TYPE_META?.[k];
                        const label = meta
                          ? isEnglishUI
                            ? meta.en
                            : meta.vi
                          : k;
                        const bg = meta?.bg || "#808080";
                        return isNonEmptyString(label) ? (
                          <span
                            className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold"
                            style={{ backgroundColor: bg, color: "#000" }}
                          >
                            {label}
                          </span>
                        ) : null;
                      })()
                    )}

                    {isNonEmptyString(currentSkillType) ? (
                      <span
                        className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold text-white"
                        style={{ backgroundColor: "#808080" }}
                      >
                        {SKILL_TYPE_META?.[currentSkillType]?.[isEnglishUI ? "en" : "vi"] ||
                          String(currentSkillType)}
                      </span>
                    ) : null}

                    {(() => {
                      const d = Number(currentDuration);
                      if (!Number.isFinite(d) || d <= 0 || d === -1) return null;
                      const v = isAlmostInt(d) ? String(Math.round(d)) : trimFixed(d, 1);
                      return (
                        <span
                          className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold text-black"
                          style={{ backgroundColor: "#D3D3D3" }}
                        >
                          {isEnglishUI ? `${v} seconds` : `${v} giây`}
                        </span>
                      );
                    })()}
                  </div>

                  {/* initSp + spCost */}
                  {String(currentSkillType || "") === "PASSIVE" ? null : (
                    <div className="mt-3 flex items-center gap-6 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/70">
                          {isEnglishUI ? "Initial SP:" : "SP khởi đầu:"}
                        </span>
                        <div className="relative w-[52px] h-[28px] shrink-0">
                          <img
                            src={INIT_SP_ICON}
                            alt="init-sp"
                            className="w-full h-full object-contain"
                            draggable={false}
                            loading="lazy"
                          />
                          <span className="absolute right-[7px] top-1/2 -translate-y-1/2 text-[12px] font-bold text-white tabular-nums drop-shadow">
                            {Number(currentInitSp) || 0}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/70">
                          {isEnglishUI ? "SP Cost:" : "SP tiêu hao:"}
                        </span>
                        <div className="relative w-[52px] h-[28px] shrink-0">
                          <img
                            src={SP_COST_ICON}
                            alt="sp-cost"
                            className="w-full h-full object-contain"
                            draggable={false}
                            loading="lazy"
                          />
                          <span className="absolute right-[7px] top-1/2 -translate-y-1/2 text-[12px] font-bold text-white tabular-nums drop-shadow">
                            {Number(currentSpCost) || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Range */}
                {isNonEmptyString(currentRangeId) ? (
                  <div className="shrink-0 self-start rounded-xl border border-white/10 bg-black/30 p-3">
                    <div className="text-sm font-semibold text-white text-center mb-2">
                      {isEnglishUI ? "Range" : "Phạm vi"}
                    </div>
                    <SkillRangeGrid baseRangeId={baseRangeId} rangeId={currentRangeId} />
                  </div>
                ) : null}
              </div>

              {/* Levels + Description */}
              {levelCount > 0 ? (
                <div className="mt-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {skillLevels.map((_, idx0) => {
                      const lv = idx0 + 1;
                      const isActive = idx0 === safeSkillLevelIdx;
                      const icon = getSkillLevelIconUrl(lv);
                      return (
                        <button
                          key={`skill-lv-${lv}`}
                          type="button"
                          onClick={() => setActiveSkillLevelIdx(idx0)}
                          className={`rounded-lg border transition px-2 py-1 text-white ${
                            isActive
                              ? "bg-black/40 border-white ring-1 ring-white/40"
                              : "bg-white/10 border-white/10 hover:bg-white/20"
                          }`}
                          title={lv <= 7 ? `Lv ${lv}` : `Lv 7 Mastery ${lv - 7}`}
                        >
                          {icon ? (
                            <img
                              src={icon}
                              alt={`lv-${lv}`}
                              className="w-7 h-7 object-contain"
                              draggable={false}
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-sm font-semibold tabular-nums">{lv}</span>
                          )}
                        </button>
                      );
                    })}
</div>

                  <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-4">
                    <div
                      className="min-w-0 text-[1.025rem] text-gray-300 leading-relaxed break-words"
                      style={{ overflowWrap: "anywhere" }}
                    >
                      {isNonEmptyString(skillDesc) ? (
                        renderTextWithHovers(
                          skillDesc,
                          `skill-${charKey || "unknown"}-${selectedSkillId}-lv${safeSkillLevelIdx + 1}`
                        )
                      ) : (
                        <span className="text-white/40 italic">-</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

                          </div>

            {selectedUpgradeInfo ? (
              <div className="space-y-2">
                <div className="text-xs text-white/70">
                  {isEnglishUI ? "Upgrade Materials" : "Nguyên liệu nâng cấp"}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-white">{selectedUpgradeInfo.label}</span>

                  {selectedUpgradeInfo.unlockCond ? (
                    <span
                      className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold text-black"
                      style={{ backgroundColor: "#D3D3D3" }}
                    >
                      {(() => {
                        const elite = phaseToEliteIndex(selectedUpgradeInfo.unlockCond?.phase);
                        const lvReq = Number(selectedUpgradeInfo.unlockCond?.level || 0) || 1;
                        return isEnglishUI
                          ? `Required: Elite ${elite} level ${lvReq}`
                          : `Cấp độ yêu cầu: Elite ${elite} level ${lvReq}`;
                      })()}
                    </span>
                  ) : null}

                  {isNonEmptyString(selectedUpgradeInfo.time) ? (
                    <span
                      className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold text-black"
                      style={{ backgroundColor: "#D3D3D3" }}
                    >
                      {isEnglishUI
                        ? `Training time: ${selectedUpgradeInfo.time}`
                        : `Thời gian nâng cấp: ${selectedUpgradeInfo.time}`}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-start justify-start gap-y-2 gap-x-1.5 sm:gap-x-2">
                  {Array.isArray(selectedUpgradeInfo.costs)
                    ? selectedUpgradeInfo.costs.map((c, j) =>
                        c?.type === "MATERIAL" && c?.id && Number(c?.count) > 0 ? (
                          <MaterialIcon
                            key={`${c.id}-${selectedSkillId}-${safeSkillLevelIdx}-${j}`}
                            itemId={c.id}
                            count={c.count}
                          />
                        ) : null
                      )
                    : null}
                </div>
              </div>
            ) : null}

          </div>
        ) : (
          <span className="text-white/40 italic">-</span>
        )}
      </InfoTable>
      ) : null}

      
{Array.isArray(activeBuildingBuffCards) && activeBuildingBuffCards.length > 0 ? (
  <InfoTable title="Kỹ năng hậu cầu" titleInline={buildingHeaderElite}>
    {/* Mode B: keep previously opened header options mounted (hidden) */}
    {buildingHeaderOptions.map((opt, optIdx) => {
      const isActive = optIdx === safeBuildingHeaderOptIdx;
      const shouldMount = isActive || mountedBuildingHeaderIdxs.has(optIdx);
      if (!shouldMount) return null;

      const cards = buildingBuffCardsByOptIdx?.[optIdx] || [];
      if (!Array.isArray(cards) || cards.length === 0) return null;

      return (
        <div key={`bskill-pane-${charKey || "unknown"}-${opt.phaseIndex}-${opt.level}-${optIdx}`} style={{ display: isActive ? "block" : "none" }}>
          <div className="space-y-3">
            {cards.map((b) => {
              const buffId = b?.buffId;

              const cn = buffId ? buildingData?.buffs?.[buffId] : null;
              const en = buffId ? buildingDataEN?.buffs?.[buffId] : null;
              const def = en || cn || null;

              const vn = buffId ? buildingVN?.[buffId] : null;

              const name = isEnglishUI
                ? (def?.buffName || String(buffId || ""))
                : ((isNonEmptyString(vn?.Name) ? String(vn.Name) : "") || def?.buffName || String(buffId || ""));

              const desc = isEnglishUI
                ? (def?.description || "")
                : ((isNonEmptyString(vn?.description) ? String(vn.description) : "") || def?.description || "");

              const iconKey = def?.skillIcon || "";
              const iconUrl = isNonEmptyString(iconKey)
                ? `${BUILDING_SKILL_ICON_BASE}${String(iconKey).trim().toLowerCase()}.png`
                : "";

              const bg = def?.buffColor || "#FFFFFF";
              const tc = def?.textColor || "#000000";
              const bdescKeyPrefix = `bskill-${charKey || "unknown"}-${buffId || "unknown"}`;
              const descRender = isNonEmptyString(desc)
                ? renderTextWithHovers(desc, bdescKeyPrefix)
                : null;

              return (
                <div key={`bskill-${buffId || "unknown"}`} className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start gap-3">
                    {iconUrl ? (
                      <img
                        src={iconUrl}
                        alt={String(buffId || "")}
                        className="w-12 h-12 object-contain shrink-0"
                        draggable={false}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.visibility = "hidden";
                        }}
                      />
                    ) : null}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="inline-flex items-center rounded-md px-2 py-1 text-sm font-semibold max-w-full"
                          style={{ backgroundColor: bg, color: tc }}
                          title={name}
                        >
                          <span className="truncate">{name}</span>
                        </span>
                      </div>

                      <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-4">
                        <div
                          className="min-w-0 text-[1.025rem] text-gray-300 leading-relaxed break-words"
                          style={{ overflowWrap: "anywhere" }}
                        >
                          {descRender ? descRender : <span className="text-white/40 italic">-</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    })}
  </InfoTable>
) : null}
    </div>
  );
}
