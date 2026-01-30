import React from "react";

import characterTable from "../../../../data/operators/character_table.json";
import traitVN from "../../../../data/operators/trait_vn.json";

import StatHover, { renderInlineItalic } from "../../../StatHover";

/** Icons (Elite) */
const ELITE_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/elite_hub/";

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

function InfoTable({ title, titleRight, children }) {
  return (
    <div className="bg-[#1b1b1b] rounded-xl p-4 text-white">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[1.375rem] font-semibold leading-snug">{title}</h3>
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

      <InfoTable title="Thiên phú/Talent">
        <span className="text-white/40 italic">-</span>
      </InfoTable>

      <InfoTable title="Kỹ năng">
        <span className="text-white/40 italic">-</span>
      </InfoTable>
    </div>
  );
}
