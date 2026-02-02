import React from "react";

import characterTable from "../../../../data/operators/character_table.json";
import traitVN from "../../../../data/operators/trait_vn.json";
import talentVN from "../../../../data/operators/talent_vn.json";
import rangeTable from "../../../../data/range_table.json";

import StatHover, { renderInlineItalic } from "../../../StatHover";

/** Icons (Elite) */
const ELITE_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/elite_hub/";

/** Icons (Range + Potential) */
const UI_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/[uc]common/charattrdetail/";

const RANGE_STAND = `${UI_ICON_BASE}attack_range_stand.png`;
const RANGE_ATTACK = `${UI_ICON_BASE}attack_range_attack.png`;

const POT_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/potential_hub/";

const getPotIcon = (idx0) => `${POT_ICON_BASE}potential_${idx0}.png`;

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
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

  // Tier 1 uses a dedicated key, e.g. physician1, fearless1, executor1...
  // Avoid matching both physician & physician1 by using exact key only.
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
    const k = row?.key;
    if (!isNonEmptyString(k)) continue;

    // Prefer valueStr if present, otherwise numeric value.
    const v = row?.valueStr != null ? row.valueStr : row?.value;
    map[String(k)] = v;
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

  // Percent formats: 0%, 0.0%, 0.00% ...
  const pm = /^0(?:\.(0+))?%$/.exec(f);
  if (pm) {
    if (!isNum) return rawStr;
    const decimals = pm[1] ? pm[1].length : 0;
    return `${trimFixed(num * 100, decimals)}%`;
  }

  // Number formats: 0, 0.0, 0.00 ...
  const nm = /^0(?:\.(0+))?$/.exec(f);
  if (nm) {
    if (!isNum) return rawStr;
    const decimals = nm[1] ? nm[1].length : 0;
    return trimFixed(num, decimals);
  }

  // Unknown format → fallback
  return isNum ? formatNumberDefault(num) : rawStr;
}

function applyBlackboard(text, bbMap) {
  if (!isNonEmptyString(text)) return "";
  if (!bbMap || typeof bbMap !== "object") return text;

  // {key} or {key:0%} / {key:0.0%} / {key:0.0} ...
  return String(text).replace(/\{([a-zA-Z0-9_.@-]+)(?::([^}]+))?\}/g, (m, key, fmt) => {
    if (!key || !(key in bbMap)) return m;
    return formatPlaceholderValue(bbMap[key], fmt);
  });
}


function getVisibleTalentCandidates(block) {
  const cands = block?.candidates;
  if (!Array.isArray(cands)) return [];

  return cands.filter((c) => {
    if (!c) return false;
    if (c.isHideTalent === true) return false;

    const hasName = typeof c.name === "string" && c.name.trim().length > 0;
    const hasDesc = typeof c.description === "string" && c.description.trim().length > 0;

    // Some placeholder candidates are fully empty (name null, description ""), treat as hidden.
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

function getTalentTitle(vnEntry, talentIdx) {
  if (!vnEntry || typeof vnEntry !== "object") return "";
  const k = talentIdx === 0 ? "TitleTalent1" : "TitleTalent2";
  const v = vnEntry?.[k];
  return isNonEmptyString(v) ? String(v) : "";
}

function getTalentBaseKeyCandidates(talentIdx, phaseIndex) {
  if (talentIdx === 0) {
    if (phaseIndex === 2) return ["Talent1_2"];
    return [`Talent${phaseIndex}`]; // Talent0 / Talent1
  }

  // Talent 2: default is Talent2 (some operators may later have phase-specific keys)
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

      // Prefer level-specific key when available, e.g. Talent1_lv55, Talent0_lv30, Talent1_2_lv60...
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

  // No candidate is applicable for current potential: fallback to lowest requirement.
  return [...candidates].sort(
    (a, b) => Number(a?.requiredPotentialRank || 0) - Number(b?.requiredPotentialRank || 0)
  )[0];
}

function computeTalentResolved({ talentBlock, talentIdx, potRank, vnEntry }) {
  const raw = getVisibleTalentCandidates(talentBlock);
  if (!Array.isArray(raw) || raw.length === 0) return { variants: [], minPhaseIndex: 0 };

  const grouped = groupCandidatesByPhaseLevel(raw);
  const combos = [...grouped.keys()]
    .map((k) => {
      const [p, l] = k.split(":");
      return { phaseIndex: Number(p), level: Number(l) };
    })
    .filter((x) => Number.isFinite(x.phaseIndex) && Number.isFinite(x.level))
    .sort((a, b) => (a.phaseIndex - b.phaseIndex) || (a.level - b.level));

  const variants = combos
    .map(({ phaseIndex, level }) => {
      const key = `${phaseIndex}:${level}`;
      const list = grouped.get(key) || [];
      const picked = pickBestCandidateByPot(list, potRank);
      if (!picked) return null;

      const bbMap = buildBlackboardMap(picked?.blackboard);
      const baseText = resolveTalentText({
        vnEntry,
        talentIdx,
        phaseIndex,
        level,
        requiredPotentialRank: picked?.requiredPotentialRank,
        fallbackText: picked?.description || "",
      });

      const text = applyBlackboard(baseText, bbMap);

      return {
        phaseIndex,
        level,
        requiredPotentialRank: Number(picked?.requiredPotentialRank || 0),
        name: picked?.name || "",
        text,
        rangeId: picked?.rangeId || "",
      };
    })
    .filter(Boolean);

  const minPhaseIndex =
    variants.length > 0 ? Math.min(...variants.map((v) => v.phaseIndex)) : 0;

  return { variants, minPhaseIndex };
}

function collectTalentHeaderOptions(talentBlocks) {
  // Build options like: E1, E1 Lv55 (same icon; Lv label only for higher levels within that phase)
  const map = new Map(); // phaseIndex -> Set(levels)
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

  // Same phase: choose best level <= desiredLevel, otherwise lowest level in that phase
  const samePhase = variants.filter((v) => v.phaseIndex === desiredPhase);
  if (samePhase.length > 0) {
    const le = samePhase
      .filter((v) => v.level <= desiredLevel)
      .sort((a, b) => b.level - a.level)[0];
    return le || samePhase.sort((a, b) => a.level - b.level)[0];
  }

  // Different phase: choose best phase <= desiredPhase, otherwise highest phase
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
      const label = m[1];
      const noteKey = m[2].trim();

      nodes.push(
        <span
          key={`${keyPrefix}-h-${start}`}
          style={{
            textDecoration: "underline",
            textUnderlineOffset: "1px",
            textDecorationSkipInk: "auto",
          }}
        >
          <StatHover label={label} noteKey={noteKey} />
        </span>
      );

      last = end;
      continue;
    }

    // <@noteKey>label</> or <$noteKey>label</>
    if (typeof m[4] === "string" && typeof m[5] === "string") {
      const noteKey = m[4].trim();
      const label = m[5];
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
    .replace(/\r\n/g, "\n")
    // trait_vn.json uses literal "\\n"
    .replace(/\\n/g, "\n");

  const lines = normalized.split("\n");
  return lines.map((line, idx) => (
    <React.Fragment key={`${keyPrefix}-${idx}`}>
      {renderLineWithHovers(line, `${keyPrefix}-${idx}`)}
      {idx < lines.length - 1 ? <br /> : null}
    </React.Fragment>
  ));
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
  const traitMap = React.useMemo(() => buildTraitMap(traitVN), []);

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

  const traitResolved = React.useMemo(() => {
    const subProfessionId = charData?.subProfessionId ?? operator?.subProfessionId;
    const rarity = charData?.rarity ?? operator?.rarity;

    const baseDesc = charData?.description ?? operator?.description ?? "";

    const candidates = getTraitCandidates(charData);

    // No per-phase trait data → just render the base (translated) trait text.
    if (candidates.length === 0) {
      const { mainText, extraText } = resolveTraitTexts(
        { subProfessionId, rarity, description: baseDesc },
        traitMap
      );
      return { variants: [{ phaseIndex: 0, text: mainText, extraText }], showElite: false };
    }

    const variants = candidates.map(({ phaseIndex, cand }) => {
      const desc = isNonEmptyString(cand?.description) ? cand.description : baseDesc;

      const { mainText, extraText } = resolveTraitTexts(
        { subProfessionId, rarity, description: desc },
        traitMap
      );

      const bbMap = buildBlackboardMap(cand?.blackboard);
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
      talentIdx: 0,
      potRank,
      vnEntry: vnTalentEntry,
    }),
  [talentBlocks, potRank, vnTalentEntry]
);

const talent2Resolved = React.useMemo(
  () =>
    computeTalentResolved({
      talentBlock: talentBlocks?.[1],
      talentIdx: 1,
      potRank,
      vnEntry: vnTalentEntry,
    }),
  [talentBlocks, potRank, vnTalentEntry]
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

  const titleName = getTalentTitle(vnTalentEntry, talentIdx) || v?.name || "";
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

  return (
    <div className="space-y-3">
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

      <InfoTable title="Kỹ năng">
        <span className="text-white/40 italic">-</span>
      </InfoTable>
    </div>
  );
}
