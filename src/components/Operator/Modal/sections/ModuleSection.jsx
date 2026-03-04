import React from "react";

import characterTable from "../../../../data/operators/character_table.json";
import characterTableEN from "../../../../data/operators/character_table_en.json";
import traitVN from "../../../../data/operators/trait_vn.json";
import traitEN from "../../../../data/operators/trait_en.json";
import rangeTable from "../../../../data/range_table.json";
import itemTable from "../../../../data/operators/item_table.json";
import statHoverVN from "../../../../data/stathover_vn.json";

import uniequipTable from "../../../../data/module/uniequip_table.json";
import uniequipTableEN from "../../../../data/module/uniequip_table_en.json";
import battleEquipTable from "../../../../data/module/battle_equip_table.json";
import battleEquipTableEN from "../../../../data/module/battle_equip_table_en.json";
import moduleVN from "../../../../data/module/Module_vn.json";
import traitModVN from "../../../../data/module/TraitMod_vn.json";

import StatHover, { renderInlineItalic } from "../../../StatHover";
import { subProfIconUrl } from "../../../../utils/operatorUtils";

import {
  preloadImageCached,
  RANGE_STAND,
  RANGE_ATTACK,
  RANGE_ATTACK_SKILL,
  getItemBgUrl,
  getItemIconUrlForModule as getItemIconUrl,
  getPotIcon,
  getModuleDirIconUrl,
  getModuleImageCandidates,
  getModuleLevelBoardUrl,
  getModuleWarmPreloadUrls,
  imgOnErrorHideVisibility,
  makeModuleCandidateOnError,
} from "../../../../utils/IconArtUrl";
// Module image box size (inline style to ensure it really changes)
const MODULE_IMG_BOX_SIZE = 224;

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

const __STAT_HOVER_VN_KEYS_LOWER__ = new Set(
  Object.keys(statHoverVN || {}).map((k) => String(k).toLowerCase())
);

function hasVnNote(noteKey) {
  const key = String(noteKey || "").trim();
  if (!key) return false;
  if (statHoverVN?.[key]) return true;
  const lower = key.toLowerCase();
  if (statHoverVN?.[lower]) return true;
  return __STAT_HOVER_VN_KEYS_LOWER__.has(lower);
}


function getBaseRangeIdE2(charData) {
  // Modules are generally unlocked at E2, so we use Phase 2 range as base.
  const phases = charData?.phases;
  if (Array.isArray(phases) && phases.length > 0) {
    const e2 = phases?.[2]?.rangeId;
    if (isNonEmptyString(e2)) return String(e2);
    // fallback: last phase that has rangeId
    for (let i = phases.length - 1; i >= 0; i -= 1) {
      const rid = phases?.[i]?.rangeId;
      if (isNonEmptyString(rid)) return String(rid);
    }
  }
  const rid0 = charData?.rangeId;
  return isNonEmptyString(rid0) ? String(rid0) : "";
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
  stopAtClose = false,
  opts = {}
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
        // IMPORTANT: don't drop whitespace-only chunks, or words will stick together
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
        true,
        opts
      );

      const innerNodes = inner.nodes;

      if (type === "$") {
        const preferNote = !!opts?.preferNoteForDollar;
        const useNote = preferNote && hasVnNote(key);
        nodes.push(
          useNote ? (
            <StatHover key={`${keyPrefix}-term-${i}-${key}`} noteKey={key}>
              {innerNodes}
            </StatHover>
          ) : (
            <StatHover key={`${keyPrefix}-term-${i}-${key}`} termId={key}>
              {innerNodes}
            </StatHover>
          )
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

function renderTextWithTermNotes(text, keyPrefix, options = {}) {
  if (!isNonEmptyString(text)) return null;

  const normalized = String(text)
    .split("\r\n").join("\n")
    .split("\r").join("\n")
    .split("\\n").join("\n");

  const parsed = parseMarkupSegment(normalized, keyPrefix, null, 0, false, options);
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

function clamp(n, min, max) {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.min(Math.max(x, min), max);
}

const getItemMeta = (itemId) => {
  const id = String(itemId || "");
  return itemTable?.items?.[id] || null;
};

function MaterialIcon({ itemId, count }) {
  const meta = getItemMeta(itemId);

  const name = meta?.name || String(itemId || "Unknown");
  const bgUrl = getItemBgUrl(meta?.rarity);
  const iconUrl = getItemIconUrl(itemId, meta?.iconId);

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
              onError={imgOnErrorHideVisibility}
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

      <div className="text-[1.025rem] text-gray-300 leading-relaxed break-words">{children}</div>
    </div>
  );
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

  // Bounding box follows skill range (same idea as SkillsSection)
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

          const key = `${r},${c}`;
          const isInSkill = skillSet.has(key);
          const isBase = isInSkill && baseSet.has(key);

          const icon = isCenter
            ? RANGE_STAND
            : isInSkill
            ? isBase
              ? RANGE_ATTACK
              : RANGE_ATTACK_SKILL
            : "";

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

  return { mainText, usedKey };
}

const phaseToEliteIndex = (phase) => {
  const p = String(phase || "");
  if (p === "PHASE_2") return 2;
  if (p === "PHASE_1") return 1;
  return 0;
};

function modTypeLabel(typeName2) {
  const t = typeName2 == null ? null : String(typeName2);
  if (!t) return "Original";
  if (t === "X") return "Mod X";
  if (t === "Y") return "Mod Y";
  if (t === "D") return "Mod Δ";
  if (t === "A") return "Mod α";
  if (t === "B") return "Mod β";
  return `Mod ${t}`;
}

function modSortKey(typeName2) {
  const t = typeName2 == null ? "" : String(typeName2);
  const map = { "": 0, X: 1, Y: 2, D: 3, A: 4, B: 5 };
  return t in map ? map[t] : 99;
}

function formatAttrKey(key, isEnglishUI) {
  const k = String(key || "");
  const mapVN = {
    atk: "ATK",
    def: "DEF",
    max_hp: "HP",
    block_cnt: "Chặn",
    attack_speed: "ASPD",
    respawn_time: "Thgian tái triển khai",
    magic_resistance: "RES",
    cost: "Phí",
  };
  const mapEN = {
    atk: "ATK",
    def: "DEF",
    max_hp: "HP",
    block_cnt: "Block",
    attack_speed: "ASPD",
    respawn_time: "Redeploy Time",
    magic_resistance: "RES",
    cost: "Cost",
  };
  const map = isEnglishUI ? mapEN : mapVN;
  if (k in map) return map[k];
  return k.toUpperCase();
}

function formatAttrValue(value) {
  const v = Number(value);
  if (!Number.isFinite(v)) return "";
  const isInt = Math.abs(v - Math.round(v)) < 1e-9;
  const n = isInt ? Math.round(v) : Number(v.toFixed(2));
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n}`;
}

function findFirstUnlockCondition(phase) {
  if (!phase) return null;
  const parts = phase?.parts || [];
  for (const part of parts) {
    const c1 = part?.overrideTraitDataBundle?.candidates;
    if (Array.isArray(c1) && c1.length > 0 && c1[0]?.unlockCondition) return c1[0].unlockCondition;
    const c2 = part?.addOrOverrideTalentDataBundle?.candidates;
    if (Array.isArray(c2) && c2.length > 0 && c2[0]?.unlockCondition) return c2[0].unlockCondition;
  }
  return null;
}

function findFirstRangeId(phase) {
  if (!phase) return "";
  const parts = phase?.parts || [];
  for (const part of parts) {
    for (const bundleKey of ["addOrOverrideTalentDataBundle", "overrideTraitDataBundle"]) {
      const cands = part?.[bundleKey]?.candidates;
      if (!Array.isArray(cands)) continue;
      for (const c of cands) {
        const rid = c?.rangeId || c?.displayRangeId;
        if (isNonEmptyString(rid)) return String(rid);
      }
    }
  }
  return "";
}

function pickBestCandidateByPot(candidates, potRank) {
  if (!Array.isArray(candidates) || candidates.length === 0) return null;

  const normalizeReq = (c) => {
    const n = Number(c?.requiredPotentialRank);
    return Number.isFinite(n) ? n : 0;
  };

  const priority = (c) => {
    // lower = better
    const src = String(c?._src || "");
    const srcScore = src === "talent" ? 0 : 1; // prefer talent bundle
    const hasText = isNonEmptyString(c?.upgradeDescription) ? 0 : 1; // prefer lines that actually render
    const hasName = isNonEmptyString(c?.name) ? 0 : 1;
    return hasText * 100 + srcScore * 10 + hasName;
  };

  const withReq = candidates.map((c) => ({ ...c, _req: normalizeReq(c) }));
  const eligible = withReq.filter((c) => c._req <= potRank);

  const pool = eligible.length > 0 ? eligible : withReq;

  pool.sort((a, b) => {
    const dReq = b._req - a._req; // highest pot requirement first (<= potRank)
    if (dReq !== 0) return dReq;
    return priority(a) - priority(b);
  });

  return pool[0] || null;
}

function pickTraitCandidateForPot(phase, potRank) {
  if (!phase) return null;
  const parts = phase?.parts || [];
  for (const part of parts) {
    const cands = part?.overrideTraitDataBundle?.candidates;
    if (!Array.isArray(cands) || cands.length === 0) continue;
    return pickBestCandidateByPot(cands, potRank);
  }
  return null;
}

function collectUpgradeCandidatesForPot(phase) {
  if (!phase) return [];
  const parts = phase?.parts || [];
  const all = [];

  for (const part of parts) {
    const c1 = part?.addOrOverrideTalentDataBundle?.candidates;
    if (Array.isArray(c1)) {
      for (const c of c1) {
        // Only keep upgrade lines (avoid TRAIT candidates that don't have upgradeDescription)
        if (isNonEmptyString(c?.upgradeDescription)) all.push({ ...c, _src: "talent" });
      }
    }

    const c2 = part?.overrideTraitDataBundle?.candidates;
    if (Array.isArray(c2)) {
      for (const c of c2) {
        // Some modules store upgrade lines here; keep only if it has upgradeDescription
        if (isNonEmptyString(c?.upgradeDescription)) all.push({ ...c, _src: "trait" });
      }
    }
  }

  return all;
}

function trustToPercent(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 0;
  if (n <= 100) return Math.round(n);
  return Math.min(100, Math.round(n / 100));
}

/**
 * Module panes (Mode B) for icon-heavy parts.
 * These panes are mounted once per module id and then hidden via CSS when inactive.
 * This prevents repeated image requests (Initiator: Other) when users spam-switch modules.
 */
function ModuleLevelBoardPane({ module, isEnglishUI, potRank, baseRangeIdE2, charKey }) {
  const id = module?.id;
  const selectedBattle = React.useMemo(() => {
    if (!isNonEmptyString(id)) return null;
    const en = battleEquipTableEN?.[id] || null;
    const cn = battleEquipTable?.[id] || null;
    return isEnglishUI ? (en || cn) : cn;
  }, [id, isEnglishUI]);

  const selectedBattleFallbackCN = React.useMemo(() => {
    if (!isNonEmptyString(id)) return null;
    return battleEquipTable?.[id] || null;
  }, [id]);

  const phasesByLevel = React.useMemo(() => {
    const entry = selectedBattle || selectedBattleFallbackCN;
    const phases = entry?.phases;
    if (!Array.isArray(phases)) return new Map();
    const m = new Map();
    for (const ph of phases) {
      const lv = Number(ph?.equipLevel || 0);
      if (!Number.isFinite(lv) || lv <= 0) continue;
      m.set(lv, ph);
    }
    return m;
  }, [selectedBattle, selectedBattleFallbackCN]);

  const vnOverride = React.useMemo(() => {
    if (!isNonEmptyString(id)) return null;
    return moduleVN?.[id] || null;
  }, [id]);

  const isDefaultModule = React.useMemo(() => {
    const mid = id || "";
    const icon = module?.uniEquipIcon || "";
    const typeIcon = module?.typeIcon || "";
    const typeName2 = module?.typeName2;
    return (
      String(mid).startsWith("uniequip_001_") ||
      String(icon) === "original" ||
      String(typeIcon) === "original" ||
      typeName2 == null
    );
  }, [id, module?.uniEquipIcon, module?.typeIcon, module?.typeName2]);

  if (!isNonEmptyString(id) || isDefaultModule || phasesByLevel.size <= 0) return null;

  return (
    <div className="mt-4 rounded-xl border border-white/10 overflow-hidden">
      <div className="divide-y divide-white/10">
        {[1, 2, 3].map((lv) => {
          const ph = phasesByLevel.get(lv) || null;
          const attrs = Array.isArray(ph?.attributeBlackboard) ? ph.attributeBlackboard : [];
          const rangeId = findFirstRangeId(ph);

          let rightName = "";
          let rightText = "";
          let lv1DetailText = "";

          if (lv === 1) {
            rightText = isEnglishUI ? "Unlock Trait" : "Mở khóa đặc tính";
            const suf = isEnglishUI ? "EN" : "VN";
            const keyPot = potRank > 0 ? `TalentLv1_p${potRank}${suf}` : "";
            const keyBase = `TalentLv1${suf}`;

            lv1DetailText =
              (isNonEmptyString(keyPot) && isNonEmptyString(vnOverride?.[keyPot]) && String(vnOverride[keyPot])) ||
              (isNonEmptyString(vnOverride?.[keyBase]) && String(vnOverride[keyBase])) ||
              "";
          } else {
            const cands = collectUpgradeCandidatesForPot(ph);
            const picked = pickBestCandidateByPot(cands, potRank);

            const req = Number(picked?.requiredPotentialRank || 0) || 0;
            rightName = picked?.name || "";
            rightText = picked?.upgradeDescription || "";

            if (!isEnglishUI && vnOverride) {
              const keyBase = `TalentLv${lv}`;
              const key = req > 0 ? `${keyBase}_p${req}` : keyBase;
              const ov = vnOverride?.[key];
              if (isNonEmptyString(ov)) rightText = String(ov);

              const titleKey = `TitleLv${lv}`;
              if (isNonEmptyString(vnOverride?.[titleKey])) rightName = String(vnOverride[titleKey]);
            }
          }

          return (
            <div key={`row-${id}-${lv}`} className="grid grid-cols-5">
              <div className="col-span-1 bg-black/25 p-3 flex items-center justify-center border-r border-white/10">
                <img
                  src={getModuleLevelBoardUrl(lv)}
                  alt={`lv-${lv}`}
                  className="h-10 w-auto object-contain"
                  draggable={false}
                  loading="lazy"
                  onError={imgOnErrorHideVisibility}
                />
              </div>

              <div className="col-span-4 bg-black/15 p-3">
                <div className="flex items-start gap-3">
                  <div className="min-w-[92px]">
                    {attrs.length > 0 ? (
                      <div className="space-y-1">
                        {attrs.map((a, idx0) => {
                          const k = a?.key;
                          const v = a?.value;
                          if (!isNonEmptyString(k) || !Number.isFinite(Number(v))) return null;
                          return (
                            <div
                              key={`attr-${id}-${lv}-${k}-${idx0}`}
                              className="text-sm text-white/90 font-semibold tabular-nums"
                            >
                              {formatAttrKey(k, isEnglishUI)} {formatAttrValue(v)}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-white/40 italic">-</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    {lv >= 2 && isNonEmptyString(rightName) ? (
                      <div className="mb-1">
                        <span className="inline-flex items-center rounded-md bg-white px-2 py-1 text-black font-semibold text-xs max-w-full">
                          <span className="truncate">{rightName}</span>
                        </span>
                      </div>
                    ) : null}

                    <div className={lv === 1 ? "" : "mt-1"}>
                      {lv === 1 ? (
                        <>
                          <div className="text-sm font-semibold text-white">{rightText}</div>

                          <div
                            className="mt-2 min-w-0 text-[1.025rem] text-gray-300 leading-relaxed break-words"
                            style={{ overflowWrap: "anywhere" }}
                          >
                            {isNonEmptyString(lv1DetailText) ? (
                              renderTextWithTermNotes(lv1DetailText, `module-up-${charKey}-${id}-lv1-pot${potRank}`, { preferNoteForDollar: !isEnglishUI })
                            ) : (
                              <span className="text-white/40 italic">-</span>
                            )}
                          </div>
                        </>
                      ) : (
                        <div
                          className="min-w-0 text-[1.025rem] text-gray-300 leading-relaxed break-words"
                          style={{ overflowWrap: "anywhere" }}
                        >
                          {isNonEmptyString(rightText) ? (
                            renderTextWithTermNotes(rightText, `module-up-${charKey}-${id}-lv${lv}-pot${potRank}`, { preferNoteForDollar: !isEnglishUI })
                          ) : (
                            <span className="text-white/40 italic">-</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {isNonEmptyString(rangeId) ? (
                    <div className="shrink-0 self-start rounded-xl border border-white/10 bg-black/30 p-3">
                      <div className="text-sm font-semibold text-white text-center mb-2">
                        {isEnglishUI ? "Range" : "Phạm vi"}
                      </div>
                      {lv === 1 ? (
                        <SkillRangeGrid baseRangeId={baseRangeIdE2} rangeId={rangeId} />
                      ) : (
                        <RangeGrid rangeId={rangeId} />
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ModuleMissionsPane({ module, isEnglishUI, charKey }) {
  const id = module?.id;
  const vnOverride = React.useMemo(() => (isNonEmptyString(id) ? moduleVN?.[id] || null : null), [id]);

  const missionTexts = React.useMemo(() => {
    if (!module) return [];
    const ids = module?.meta?.missionList || module?.metaCN?.missionList || [];
    if (!Array.isArray(ids) || ids.length === 0) return [];

    const out = [];
    ids.forEach((mid, idx0) => {
      const cn = uniequipTable?.missionList?.[mid]?.desc || "";
      const en = uniequipTableEN?.missionList?.[mid]?.desc || "";
      let text = isEnglishUI ? (en || cn) : cn;

      if (!isEnglishUI && vnOverride) {
        const k = idx0 === 0 ? "Mission1" : "Mission2";
        const ov = vnOverride?.[k];
        if (isNonEmptyString(ov)) text = ov;
      }

      if (isNonEmptyString(text)) out.push(text);
    });

    return out;
  }, [module, isEnglishUI, vnOverride]);

  if (!Array.isArray(missionTexts) || missionTexts.length === 0) return null;

  return (
    <InfoTable title={isEnglishUI ? "Module Missions" : "Nhiệm vụ mở Module"}>
      <div className="space-y-2">
        {missionTexts.map((t, idx0) => (
          <div key={`mis-${id}-${idx0}`} className="text-white/95 leading-relaxed flex gap-2">
            <span className="shrink-0">•</span>
            <div className="min-w-0">{renderTextWithTermNotes(t, `module-mission-${id}-${idx0}`, { preferNoteForDollar: !isEnglishUI })}</div>
          </div>
        ))}
      </div>
    </InfoTable>
  );
}

function ModuleUpgradeCostsPane({ module, isEnglishUI, charKey }) {
  const id = module?.id;

  const selectedBattle = React.useMemo(() => {
    if (!isNonEmptyString(id)) return null;
    const en = battleEquipTableEN?.[id] || null;
    const cn = battleEquipTable?.[id] || null;
    return isEnglishUI ? (en || cn) : cn;
  }, [id, isEnglishUI]);

  const selectedBattleFallbackCN = React.useMemo(() => {
    if (!isNonEmptyString(id)) return null;
    return battleEquipTable?.[id] || null;
  }, [id]);

  const phasesByLevel = React.useMemo(() => {
    const entry = selectedBattle || selectedBattleFallbackCN;
    const phases = entry?.phases;
    if (!Array.isArray(phases)) return new Map();
    const m = new Map();
    for (const ph of phases) {
      const lv = Number(ph?.equipLevel || 0);
      if (!Number.isFinite(lv) || lv <= 0) continue;
      m.set(lv, ph);
    }
    return m;
  }, [selectedBattle, selectedBattleFallbackCN]);

  const upgradeCosts = React.useMemo(() => {
    if (!module) return [];
    const itemCost = module?.meta?.itemCost || module?.metaCN?.itemCost || {};
    const unlockFavors = module?.meta?.unlockFavors || module?.metaCN?.unlockFavors || {};

    const res = [];
    [1, 2, 3].forEach((lv) => {
      const costs = itemCost?.[String(lv)];
      if (!Array.isArray(costs) || costs.length === 0) return;

      const ph = phasesByLevel.get(lv) || null;
      const unlockCond = findFirstUnlockCondition(ph);
      const trust = unlockFavors?.[String(lv)];

      res.push({ lv, unlockCond, trust, costs });
    });

    return res;
  }, [module, phasesByLevel]);

  if (!Array.isArray(upgradeCosts) || upgradeCosts.length === 0) return null;

  return (
    <InfoTable title={isEnglishUI ? "Upgrade Materials" : "Nguyên liệu nâng cấp"}>
      <div className="space-y-4">
        {upgradeCosts.map((u) => {
          const elite = u.unlockCond ? phaseToEliteIndex(u.unlockCond?.phase) : null;
          const lvReq = u.unlockCond ? Number(u.unlockCond?.level || 0) || 1 : null;
          const trustPct = u.lv === 1 ? 0 : u.lv === 2 ? 50 : 100;

          return (
            <div key={`upcost-${id}-${u.lv}`} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-semibold text-white">Lv{u.lv}</span>

                {u.unlockCond ? (
                  <span
                    className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold text-black"
                    style={{ backgroundColor: "#D3D3D3" }}
                  >
                    {isEnglishUI ? `Level Required: Elite ${elite} level ${lvReq}` : `Cấp độ yêu cầu: Elite ${elite} level ${lvReq}`}
                  </span>
                ) : null}

                <span
                  className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold text-black"
                  style={{ backgroundColor: "#D3D3D3" }}
                >
                  {isEnglishUI ? `Trust Required: ${trustPct}%` : `Tin tưởng cần đạt: ${trustPct}%`}
                </span>

                {u.lv === 1 ? (
                  <span
                    className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold text-black"
                    style={{ backgroundColor: "#D3D3D3" }}
                  >
                    {isEnglishUI ? "Complete both Module Missions Required" : "Yêu cầu hoàn thành nhiệm vụ mở Module"}
                  </span>
                ) : null}
              </div>

              <div className="mt-3 flex flex-wrap items-start justify-start gap-y-2 gap-x-1.5 sm:gap-x-2">
                {Array.isArray(u.costs)
                  ? u.costs
                      .filter((c) => c?.id && Number(c?.count) > 0)
                      .map((c, j) => (
                        <MaterialIcon key={`${c.id}-${id}-${u.lv}-${j}`} itemId={c.id} count={c.count} />
                      ))
                  : null}
              </div>
            </div>
          );
        })}
      </div>
    </InfoTable>
  );
}

export default function ModuleSection(props) {
  const isEnglishUI =
    (typeof props?.lang === "string" && props.lang.toLowerCase().startsWith("en")) ||
    (typeof props?.language === "string" && props.language.toLowerCase().startsWith("en")) ||
    (typeof props?.locale === "string" && props.locale.toLowerCase().startsWith("en")) ||
    (typeof props?.onLang === "string" && props.onLang.toLowerCase().startsWith("en")) ||
    props?.isEN === true ||
    props?.isEn === true ||
    props?.english === true;

  const traitMap = React.useMemo(() => buildTraitMap(isEnglishUI ? traitEN : traitVN), [isEnglishUI]);

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

  const baseRangeIdE2 = React.useMemo(() => getBaseRangeIdE2(charData), [charData]);


  const moduleIds = React.useMemo(() => {
    if (!isNonEmptyString(charKey)) return [];

    // Prefer CN list as base order, but merge EN list to avoid missing modules
    const cnList = Array.isArray(uniequipTable?.charEquip?.[charKey]) ? uniequipTable.charEquip[charKey] : [];
    const enList = Array.isArray(uniequipTableEN?.charEquip?.[charKey]) ? uniequipTableEN.charEquip[charKey] : [];

    const out = [];
    const seen = new Set();

    const push = (arr) => {
      for (const x of arr) {
        if (!isNonEmptyString(x)) continue;
        const id = String(x);
        if (seen.has(id)) continue;
        seen.add(id);
        out.push(id);
      }
    };

    // CN first to keep expected in-game ordering, then append EN-only ids.
    push(cnList);
    push(enList);

    return out;
  }, [charKey]);

  const modules = React.useMemo(() => {
    const out = [];
    for (const id of moduleIds) {
      const cnMeta = uniequipTable?.equipDict?.[id] || null;
      const enMeta = uniequipTableEN?.equipDict?.[id] || null;
      const meta = isEnglishUI ? (enMeta || cnMeta) : (cnMeta || enMeta);
      if (!meta) continue;

      const metaCharId = cnMeta?.charId || enMeta?.charId || meta?.charId || "";
      if (isNonEmptyString(metaCharId) && isNonEmptyString(charKey) && String(metaCharId) !== String(charKey)) {
        // Defensive: avoid mixing module metadata between different operators
        continue;
      }

      // Treat any uniequip_001_* as the ORIGINAL module
      const forcedOriginal = String(id).startsWith("uniequip_001_");

      const typeName2 = forcedOriginal
        ? null
        : meta?.typeName2 ?? cnMeta?.typeName2 ?? enMeta?.typeName2 ?? null;

      out.push({
        id,
        metaCN: cnMeta,
        metaEN: enMeta,
        meta,
        typeIcon: String(forcedOriginal ? "original" : meta?.typeIcon || cnMeta?.typeIcon || enMeta?.typeIcon || "original").toLowerCase(),
        typeName2,
        uniEquipIcon: forcedOriginal
          ? "original"
          : meta?.uniEquipIcon || cnMeta?.uniEquipIcon || enMeta?.uniEquipIcon || String(id),
        sortKey: modSortKey(typeName2),
        equipOrder: Number(meta?.charEquipOrder ?? cnMeta?.charEquipOrder ?? enMeta?.charEquipOrder ?? 999),
      });
    }

    return out.sort((a, b) => a.sortKey - b.sortKey || a.equipOrder - b.equipOrder);
  }, [moduleIds, isEnglishUI, charKey]);

  const [activeModuleIdx, setActiveModuleIdx] = React.useState(0);
  React.useEffect(() => {
    setActiveModuleIdx(0);
  }, [charKey]);

  const safeModuleIdx = clamp(activeModuleIdx, 0, Math.max(0, modules.length - 1));
  const selected = modules?.[safeModuleIdx] || null;


// Mode B for module sub-panels (materials/level-board/missions):
// keep previously selected module panes mounted so their icon <img> elements don't re-request when switching back.
const [mountedModulePaneIds, setMountedModulePaneIds] = React.useState(() => {
  const s = new Set();
  if (selected?.id) s.add(String(selected.id));
  return s;
});

React.useEffect(() => {
  // Reset when switching operator
  const s = new Set();
  if (selected?.id) s.add(String(selected.id));
  setMountedModulePaneIds(s);
}, [charKey]);

React.useEffect(() => {
  const id = selected?.id;
  if (!isNonEmptyString(id)) return;
  setMountedModulePaneIds((prev) => {
    const sid = String(id);
    if (prev.has(sid)) return prev;
    const next = new Set(prev);
    next.add(sid);
    return next;
  });
}, [selected?.id]);

  const selectedBattle = React.useMemo(() => {
    const id = selected?.id;
    if (!isNonEmptyString(id)) return null;
    const en = battleEquipTableEN?.[id] || null;
    const cn = battleEquipTable?.[id] || null;
    return isEnglishUI ? (en || cn) : cn;
  }, [selected?.id, isEnglishUI]);

  const selectedBattleFallbackCN = React.useMemo(() => {
    const id = selected?.id;
    if (!isNonEmptyString(id)) return null;
    return battleEquipTable?.[id] || null;
  }, [selected?.id]);

  const vnOverride = React.useMemo(() => {
    const id = selected?.id;
    if (!isNonEmptyString(id)) return null;
    return moduleVN?.[id] || null;
  }, [selected?.id]);


  const traitModMapVN = React.useMemo(() => {
    const arr = traitModVN?.overrideTraitDataBundle;
    const m = new Map();
    if (Array.isArray(arr)) {
      for (const row of arr) {
        const k = row?.trait;
        const v = row?.trait_vn;
        if (isNonEmptyString(k) && isNonEmptyString(v)) m.set(String(k), String(v));
      }
    }
    return m;
  }, []);

  const phasesByLevel = React.useMemo(() => {
    const entry = selectedBattle || selectedBattleFallbackCN;
    const phases = entry?.phases;
    if (!Array.isArray(phases)) return new Map();
    const m = new Map();
    for (const ph of phases) {
      const lv = Number(ph?.equipLevel || 0);
      if (!Number.isFinite(lv) || lv <= 0) continue;
      m.set(lv, ph);
    }
    return m;
  }, [selectedBattle, selectedBattleFallbackCN]);

  // Potential ranks that actually exist in module candidates
  const availablePotRanks = React.useMemo(() => {
    const set = new Set([0]);
    for (const ph of phasesByLevel.values()) {
      const parts = ph?.parts || [];
      for (const part of parts) {
        for (const key of ["overrideTraitDataBundle", "addOrOverrideTalentDataBundle"]) {
          const cands = part?.[key]?.candidates;
          if (!Array.isArray(cands) || cands.length === 0) continue;
          for (const c of cands) {
            const r = Number(c?.requiredPotentialRank || 0);
            if (Number.isFinite(r)) set.add(r);
          }
        }
      }
    }

    return [...set].filter((n) => n >= 0 && n <= 5).sort((a, b) => a - b);
  }, [phasesByLevel]);

  const [potRank, setPotRank] = React.useState(0);
  React.useEffect(() => {
    setPotRank(0);
  }, [charKey, selected?.id]);

  const showPotPicker = availablePotRanks.length > 1;
const ALL_POT_RANKS = [0, 1, 2, 3, 4, 5];
const availSet = new Set(availablePotRanks);

// Keep POT icon <img> mounted to avoid repeated requests when switching modules.
// We render ALL ranks, but ranks not available for the current module are moved offscreen
// (not display:none) so they don't affect layout but remain mounted.
const potPicker = (
  <div className="flex items-center gap-1 relative">
    {ALL_POT_RANKS.map((idx0) => {
      const available = availSet.has(idx0);
      const active = idx0 === potRank;

      const offscreen =
        !showPotPicker || !available
          ? {
              position: "absolute",
              left: -100000,
              top: 0,
              width: 1,
              height: 1,
              overflow: "hidden",
              opacity: 0,
              pointerEvents: "none",
              visibility: "hidden",
            }
          : undefined;

      return (
        <button
          key={`pot-${idx0}`}
          type="button"
          onClick={() => setPotRank(idx0)}
          className={`rounded-lg px-2 py-1 transition flex items-center gap-1 ${
            active ? "bg-emerald-600" : "bg-white/10 hover:bg-white/20"
          }`}
          title={`Pot ${idx0 + 1}`}
          style={offscreen}
          disabled={!available}
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
);
const isDefaultModule = React.useMemo(() => {
    const id = selected?.id || "";
    const icon = selected?.uniEquipIcon || "";
    const typeIcon = selected?.typeIcon || "";
    const typeName2 = selected?.typeName2;
    return (
      String(id).startsWith("uniequip_001_") ||
      String(icon) === "original" ||
      String(typeIcon) === "original" ||
      typeName2 == null
    );
  }, [selected?.id, selected?.uniEquipIcon, selected?.typeIcon, selected?.typeName2]);

  const baseTraitText = React.useMemo(() => {
    const subProfessionId = charData?.subProfessionId ?? operator?.subProfessionId;
    const rarity = charData?.rarity ?? operator?.rarity;

    const baseDescCN = charData?.description ?? operator?.description ?? "";
    const baseDescEN = charDataEN?.description ?? "";
    const baseDesc = isEnglishUI ? baseDescEN || baseDescCN : baseDescCN;

    return resolveTraitTexts({ subProfessionId, rarity, description: baseDesc }, traitMap).mainText;
  }, [charData, charDataEN, operator, isEnglishUI, traitMap]);

  // Trait candidate depends on potRank (to match Talent-like behavior)
  const traitCandidate = React.useMemo(() => {
    const ph1 = phasesByLevel.get(1) || null;
    if (!ph1) return null;
    return pickTraitCandidateForPot(ph1, potRank);
  }, [phasesByLevel, potRank]);

  const traitBBMap = React.useMemo(() => buildBlackboardMap(traitCandidate?.blackboard), [traitCandidate]);

  const traitOverrideText = React.useMemo(() => {
    let raw = traitCandidate?.overrideDescripton || "";
    if (!isEnglishUI && isNonEmptyString(raw) && traitModMapVN?.has(raw)) {
      raw = traitModMapVN.get(raw);
    }
    return applyBlackboard(raw, traitBBMap);
  }, [traitCandidate, traitBBMap, isEnglishUI, traitModMapVN]);

  const traitAdditionalText = React.useMemo(() => {
    let raw = "";
    if (!isEnglishUI && isNonEmptyString(vnOverride?.Trait)) {
      raw = String(vnOverride.Trait);
    } else {
      raw = traitCandidate?.additionalDescription || "";
      if (!isEnglishUI && isNonEmptyString(raw) && traitModMapVN?.has(raw)) {
        raw = traitModMapVN.get(raw);
      }
    }
    return applyBlackboard(raw, traitBBMap);
  }, [traitCandidate, vnOverride, isEnglishUI, traitBBMap, traitModMapVN]);

  const displayModuleName = React.useMemo(() => {
    if (!selected) return "";
    const cnName = selected?.metaCN?.uniEquipName || selected?.meta?.uniEquipName || "";
    const enName = selected?.metaEN?.uniEquipName || "";
    if (isEnglishUI) return enName || cnName;
    return (isNonEmptyString(vnOverride?.Name) ? vnOverride.Name : cnName) || "";
  }, [selected, isEnglishUI, vnOverride]);

  const displayStoryText = React.useMemo(() => {
    if (!selected) return "";
    const cn = selected?.metaCN?.uniEquipDesc || "";
    const en = selected?.metaEN?.uniEquipDesc || "";
    if (isEnglishUI) return en || cn;
    return (isNonEmptyString(vnOverride?.description) ? vnOverride.description : cn) || "";
  }, [selected, isEnglishUI, vnOverride]);

  const moduleImageCandidates = React.useMemo(() => {
    if (!selected) return [];
    return getModuleImageCandidates(selected?.id, selected?.uniEquipIcon);
  }, [selected?.id, selected?.uniEquipIcon]);

  const [moduleImgIdx, setModuleImgIdx] = React.useState(0);

/**
 * Mode B (DOM image cache):
 * - Keep previously loaded module images mounted so toggling back/forth doesn't re-request them,
 *   even when spamming the selector.
 * - Hide the previous image immediately when switching to a new one (aesthetic).
 */
const moduleImgLoadedSetRef = React.useRef(new Set());
const moduleImgPendingUrlRef = React.useRef("");
const [mountedModuleImgUrls, setMountedModuleImgUrls] = React.useState(() => new Set());
const [displayModuleImageUrl, setDisplayModuleImageUrl] = React.useState("");
const [moduleImgLoaded, setModuleImgLoaded] = React.useState(false);

React.useEffect(() => {
  // When switching module, reset the visible image state.
  setModuleImgIdx(0);
  setDisplayModuleImageUrl("");
  setModuleImgLoaded(false);
}, [selected?.id, selected?.uniEquipIcon]);

const activeModuleImageUrl = moduleImageCandidates?.[moduleImgIdx] || "";

// Hide old image immediately when switching, but show instantly if the target URL was already loaded.
React.useEffect(() => {
  const url = activeModuleImageUrl;
  moduleImgPendingUrlRef.current = url;

  if (!url) {
    setDisplayModuleImageUrl("");
    setModuleImgLoaded(false);
    return;
  }

  setMountedModuleImgUrls((prev) => {
    if (prev.has(url)) return prev;
    const next = new Set(prev);
    next.add(url);
    return next;
  });

  if (moduleImgLoadedSetRef.current.has(url)) {
    setDisplayModuleImageUrl(url);
    setModuleImgLoaded(true);
  } else {
    // Aesthetic: don't show the old image while the new one is loading
    setDisplayModuleImageUrl("");
    setModuleImgLoaded(false);
  }
}, [activeModuleImageUrl]);

// Warm cache for module images to avoid long stalls (especially when switching or falling back)
React.useEffect(() => {
  const urls = Array.isArray(moduleImageCandidates) ? moduleImageCandidates : [];
  const warm = getModuleWarmPreloadUrls(urls);
  warm.forEach((u) => {
    if (!u) return;
    preloadImageCached(u).catch(() => {});
  });
}, [moduleImageCandidates]);

// If the current image stalls (no load/error), advance to the next candidate quickly
React.useEffect(() => {
  const len = moduleImageCandidates?.length || 0;
  if (!activeModuleImageUrl || len <= 1) return;
  if (moduleImgLoaded) return;
  if (moduleImgIdx >= len - 1) return;

  const t = setTimeout(() => {
    setModuleImgIdx((prev) => {
      const next = prev + 1;
      return next < len ? next : prev;
    });
  }, 2500);

  return () => clearTimeout(t);
}, [activeModuleImageUrl, moduleImgIdx, moduleImgLoaded, moduleImageCandidates]);



const subProfIcon = React.useMemo(() => {
    const subProfessionId = charData?.subProfessionId ?? operator?.subProfessionId;
    return isNonEmptyString(subProfessionId) ? subProfIconUrl(subProfessionId) : "";
  }, [charData, operator]);

if (!isNonEmptyString(charKey) || !charData) {
    return (
      <InfoTable title="Module">
        <span className="text-white/40 italic">-</span>
      </InfoTable>
    );
  }

  if (!Array.isArray(modules) || modules.length === 0) {
    return (
      <InfoTable title="Module">
        <span className="text-white/90">{isEnglishUI ? "This Operator has no module." : "Cán viên này không có module"}</span>
      </InfoTable>
    );
  }

  const moduleSelector = (
    <div className="flex items-start gap-3 flex-wrap">
      {modules.map((m, idx0) => {
        const isActive = idx0 === safeModuleIdx;
        const iconKey = String(m?.typeIcon || "original").toLowerCase();
        const iconUrl = getModuleDirIconUrl(iconKey);
        const label = modTypeLabel(m?.typeName2);

        return (
          <div key={`${m.id}-${idx0}`} className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveModuleIdx(idx0)}
              className={`relative w-[92px] h-[64px] rounded-xl border transition overflow-hidden ${
                isActive
                  ? "bg-black border-emerald-500"
                  : "bg-white/10 border-white/10 hover:bg-white/20"
              }`}
              title={label}
            >
              <img
                src={iconUrl}
                alt={label}
                className={
                  iconKey === "original"
                    ? "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[74px] h-[50px] object-contain"
                    : "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[84px] object-contain"
                }
                draggable={false}
                loading="lazy"
                onError={imgOnErrorHideVisibility}
              />
            </button>
            <div className="text-xs font-semibold text-white/80">{label}</div>
          </div>
        );
      })}
    </div>
  );

  const moduleDetailCard = selected ? (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        <div className="shrink-0">
          {isNonEmptyString(activeModuleImageUrl) ? (
            <div className="relative rounded-2xl border border-white/10 bg-black/30 overflow-hidden flex items-center justify-center" style={{ width: MODULE_IMG_BOX_SIZE, height: MODULE_IMG_BOX_SIZE }}>
              {!moduleImgLoaded ? (
                <div className="absolute inset-0 bg-white/5 animate-pulse" />
              ) : null}

              {Array.from(mountedModuleImgUrls).map((url) => (
                <img
                  key={url}
                  src={url}
                  alt="module"
                  className="absolute inset-0 w-full h-full object-contain transition-opacity duration-150"
                  style={{
                    opacity: displayModuleImageUrl === url && moduleImgLoaded ? 1 : 0,
                    visibility:
                      displayModuleImageUrl === url && moduleImgLoaded ? "visible" : "hidden",
                  }}
                  draggable={false}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  onLoad={() => {
                    moduleImgLoadedSetRef.current.add(url);
                    if (moduleImgPendingUrlRef.current === url) {
                      setDisplayModuleImageUrl(url);
                      setModuleImgLoaded(true);
                    }
                  }}
                  onError={makeModuleCandidateOnError({
                    url,
                    pendingUrlRef: moduleImgPendingUrlRef,
                    setLoaded: setModuleImgLoaded,
                    setDisplayUrl: setDisplayModuleImageUrl,
                    setIndex: setModuleImgIdx,
                    getCandidatesLength: () => (moduleImageCandidates?.length || 0),
                  })}
                />
              ))}{moduleImgLoaded && isDefaultModule && isNonEmptyString(subProfIcon) ? (
                <img
                  src={subProfIcon}
                  alt="overlay"
                  className="absolute inset-0 m-auto w-[44px] h-[44px] object-contain"
                  draggable={false}
                  loading="lazy"
                  onError={imgOnErrorHideVisibility}
                />
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[1.35rem] font-semibold text-white leading-snug break-words">
            {isNonEmptyString(displayModuleName) ? displayModuleName : <span className="text-white/40 italic">-</span>}
          </div>

          <div className="mt-3 space-y-2">
            <div className="text-xs text-white/70">{isEnglishUI ? "Trait" : "Đặc tính/Trait"}</div>

            {isDefaultModule ? (
              <div
                className="min-w-0 text-[1.025rem] text-gray-300 leading-relaxed break-words"
                style={{ overflowWrap: "anywhere" }}
              >
                {isNonEmptyString(baseTraitText) ? (
                  renderTextWithTermNotes(baseTraitText, `module-trait-base-${charKey}-${selected.id}`, { preferNoteForDollar: !isEnglishUI })
                ) : (
                  <span className="text-white/40 italic">-</span>
                )}
              </div>
            ) : (
              <div
                className="min-w-0 text-[1.025rem] text-gray-300 leading-relaxed break-words"
                style={{ overflowWrap: "anywhere" }}
              >
                {/* Improve trait (inline tag, no background block) */}
                {isNonEmptyString(traitOverrideText) ? (
                  <>
                    <span className="inline-flex items-center rounded-md bg-amber-500/20 text-amber-200 px-2 py-1 text-xs font-semibold mr-2">
                      {isEnglishUI ? "Improve Trait" : "Cải thiện đặc tính"}
                    </span>
                    {renderTextWithTermNotes(traitOverrideText, `module-trait-override-${selected.id}-pot${potRank}`, { preferNoteForDollar: !isEnglishUI })}
                    {isNonEmptyString(traitAdditionalText) ? <br /> : null}
                  </>
                ) : null}

                {/* Base trait + additionalDescription MUST be in one block */}
                {isNonEmptyString(traitAdditionalText) ? (
                  <>
                    {isNonEmptyString(baseTraitText)
                      ? renderTextWithTermNotes(baseTraitText, `module-trait-base2-${charKey}-${selected.id}`, { preferNoteForDollar: !isEnglishUI })
                      : null}
                    {isNonEmptyString(baseTraitText) ? <br /> : null}
                    <span className="inline-flex items-center rounded-md bg-sky-500/20 text-sky-200 px-2 py-1 text-xs font-semibold mr-2">
                      {isEnglishUI ? "Additional Trait" : "Thêm đặc tính"}
                    </span>
                    {renderTextWithTermNotes(traitAdditionalText, `module-trait-add-${selected.id}-pot${potRank}`, { preferNoteForDollar: !isEnglishUI })}
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : null;

    return (
    <div className="space-y-4">
      <InfoTable title="Module" titleRight={showPotPicker ? potPicker : null}>
        <div className="space-y-4">
          {moduleSelector}
          {moduleDetailCard}

          {/* Level board (Mode B per module) */}
          <div className="relative">
            {modules.map((m, idx0) => {
              const isActive = idx0 === safeModuleIdx;
              const mid = String(m?.id || "");
              const shouldMount =
                isActive || (isNonEmptyString(mid) && mountedModulePaneIds.has(mid));

              if (!shouldMount) return null;

              const offscreen = !isActive
                ? {
                    position: "absolute",
                    left: -100000,
                    top: 0,
                    width: 1,
                    height: 1,
                    overflow: "hidden",
                    opacity: 0,
                    pointerEvents: "none",
                    visibility: "hidden",
                  }
                : undefined;

              return (
                <div key={`lb-pane-${mid}`} style={offscreen}>
                  <ModuleLevelBoardPane
                    module={m}
                    isEnglishUI={isEnglishUI}
                    potRank={potRank}
                    baseRangeIdE2={baseRangeIdE2}
                    charKey={charKey}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </InfoTable>

      {/* Module Missions (Mode B per module) */}
      <div className="relative">
        {modules.map((m, idx0) => {
          const isActive = idx0 === safeModuleIdx;
          const mid = String(m?.id || "");
          const shouldMount =
            isActive || (isNonEmptyString(mid) && mountedModulePaneIds.has(mid));

          if (!shouldMount) return null;

          const offscreen = !isActive
            ? {
                position: "absolute",
                left: -100000,
                top: 0,
                width: 1,
                height: 1,
                overflow: "hidden",
                opacity: 0,
                pointerEvents: "none",
                visibility: "hidden",
              }
            : undefined;

          return (
            <div key={`mis-pane-${mid}`} style={offscreen}>
              <ModuleMissionsPane module={m} isEnglishUI={isEnglishUI} charKey={charKey} />
            </div>
          );
        })}
      </div>

      {/* Upgrade Materials (Mode B per module) */}
      <div className="relative">
        {modules.map((m, idx0) => {
          const isActive = idx0 === safeModuleIdx;
          const mid = String(m?.id || "");
          const shouldMount =
            isActive || (isNonEmptyString(mid) && mountedModulePaneIds.has(mid));

          if (!shouldMount) return null;

          const offscreen = !isActive
            ? {
                position: "absolute",
                left: -100000,
                top: 0,
                width: 1,
                height: 1,
                overflow: "hidden",
                opacity: 0,
                pointerEvents: "none",
                visibility: "hidden",
              }
            : undefined;

          return (
            <div key={`up-pane-${mid}`} style={offscreen}>
              <ModuleUpgradeCostsPane module={m} isEnglishUI={isEnglishUI} charKey={charKey} />
            </div>
          );
        })}
      </div>

      <InfoTable title={isEnglishUI ? "Story" : "Cốt truyện"}>
        {isNonEmptyString(displayStoryText) ? (
          <div className="text-white/95 leading-relaxed" style={{ overflowWrap: "anywhere" }}>
            {renderTextWithTermNotes(displayStoryText, `module-story-${selected?.id}`, { preferNoteForDollar: !isEnglishUI })}
          </div>
        ) : (
          <span className="text-white/40 italic">-</span>
        )}
      </InfoTable>
    </div>
  );
}
