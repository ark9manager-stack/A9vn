import React from "react";

import characterTable from "../../../../data/operators/character_table.json";
import traitVN from "../../../../data/operators/trait_vn.json";

import StatHover, { renderInlineItalic } from "../../../StatHover";

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

function resolveTraitText({ subProfessionId, rarity, description }, traitMap) {
  const base = isNonEmptyString(subProfessionId) ? String(subProfessionId).trim() : "";
  const isTier1 = String(rarity || "") === "TIER_1";

  // Tier 1 uses a dedicated key, e.g. physician1, fearless1, executor1...
  // (avoid matching both physician & physician1 by using exact key only)
  const keyCandidates = isTier1 ? [`${base}1`, base] : [base];

  for (const key of keyCandidates) {
    if (!isNonEmptyString(key)) continue;
    const v = traitMap?.[key];
    if (isNonEmptyString(v)) return v;
  }

  return isNonEmptyString(description) ? description : "";
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
        <span key={`${keyPrefix}-h-${start}`} style={{ textDecoration: "underline" }}>
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

function InfoTable({ title, children }) {
  return (
    <div className="bg-[#1b1b1b] rounded-xl p-4 text-white">
      <h3 className="text-[1.375rem] font-semibold leading-snug">{title}</h3>

      <div className="h-px bg-white/10 my-3" />

      {/* Text */}
      <div className="text-[1.025rem] text-gray-300 leading-relaxed break-words">
        {children}
      </div>
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

  const traitText = React.useMemo(() => {
    const subProfessionId = charData?.subProfessionId ?? operator?.subProfessionId;
    const rarity = charData?.rarity ?? operator?.rarity;
    const description = charData?.description ?? operator?.description;

    return resolveTraitText({ subProfessionId, rarity, description }, traitMap);
  }, [charData, operator, traitMap]);

  return (
    <div className="space-y-3">
      <InfoTable title="Đặc tính/Trait">
        {isNonEmptyString(traitText) ? (
          renderTextWithHovers(traitText, `trait-${charKey || "unknown"}`)
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
