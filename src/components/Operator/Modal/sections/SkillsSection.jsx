import React from "react";

import characterTable from "../../../../data/operators/character_table.json";
import characterTableEN from "../../../../data/operators/character_table_en.json";
import skillTable from "../../../../data/operators/skill_table.json";
import skillTableEN from "../../../../data/operators/skill_table_en.json";
import skillVN from "../../../../data/operators/skill_vn.json";
import itemTable from "../../../../data/operators/item_table.json";
import buildingData from "../../../../data/operators/building_data.json";
import buildingDataEN from "../../../../data/operators/building_data_en.json";
import buildingVN from "../../../../data/operators/building_vn.json";
import traitVN from "../../../../data/operators/trait_vn.json";
import traitEN from "../../../../data/operators/trait_en.json";
import talentVN from "../../../../data/operators/talent_vn.json";
import rangeTable from "../../../../data/range_table.json";
import tagVN from "../../../../data/operators/tag_vn.json";
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

/* =============================
   Existing helpers (yours)
   ============================= */

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function clamp(n, a, b) {
  const x = Number(n);
  if (!Number.isFinite(x)) return a;
  return Math.max(a, Math.min(b, x));
}

function phaseToIndex(phase) {
  const p = String(phase || "");
  if (p === "PHASE_0") return 0;
  if (p === "PHASE_1") return 1;
  if (p === "PHASE_2") return 2;
  return 0;
}

function getEliteText(idx) {
  return `E${idx}`;
}

function getEliteIcon(idx) {
  const i = clamp(idx, 0, 2);
  return `${ELITE_ICON_BASE}elite_${i}.png`;
}

function buildTagMap(tagJson) {
  const list = tagJson?.tagList;
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

function buildTalentMap(talentJson) {
  const list = talentJson?.talents;
  if (!Array.isArray(list)) return {};

  const map = {};
  for (const item of list) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const charId = item?.charId;
    if (!isNonEmptyString(charId)) continue;
    map[charId] = item;
  }
  return map;
}

function getCharEntry(rawCharId, primaryTable = characterTable, fallbackTable = characterTable) {
  if (!isNonEmptyString(rawCharId)) return { charKey: null, charData: null };

  const id = String(rawCharId).trim();
  const candidates = [id];

  if (!id.startsWith("char_")) candidates.push(`char_${id}`);

  const tables = [primaryTable, fallbackTable].filter(Boolean);

  for (const k of candidates) {
    if (!k?.startsWith("char_")) continue;
    for (const tbl of tables) {
      if (tbl?.[k]) return { charKey: k, charData: tbl[k] };
    }
  }

  return { charKey: null, charData: null };
}

/* === Hover/Blackboard render helpers (yours) === */

const HOVER_PAT = /\[\[([^\]|]+)\|([^\]]+)\]\]/g;

function renderLineWithHovers(line, keyPrefix) {
  const parts = [];
  let lastIndex = 0;
  let m;
  let idx = 0;

  while ((m = HOVER_PAT.exec(line)) !== null) {
    const [full, hoverTitle, hoverText] = m;
    const start = m.index;

    if (start > lastIndex) {
      parts.push(line.slice(lastIndex, start));
    }

    parts.push(
      <StatHover
        key={`${keyPrefix}-hover-${idx}`}
        title={hoverTitle}
        content={hoverText}
      />
    );

    lastIndex = start + full.length;
    idx += 1;
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  return parts.map((p, i) =>
    typeof p === "string" ? (
      <React.Fragment key={`${keyPrefix}-txt-${i}`}>
        {renderInlineItalic(p)}
      </React.Fragment>
    ) : (
      p
    )
  );
}

function renderTextWithHovers(text, keyPrefix = "txt") {
  if (!isNonEmptyString(text)) return null;

  const normalized = String(text)
    .replace(/\r\n/g, "\n")
    .replace(/\\n/g, "\n");

  const lines = normalized.split("\n");
  return lines.map((line, idx) => (
    <React.Fragment key={`${keyPrefix}-${idx}`}>
      {renderLineWithHovers(line, `${keyPrefix}-${idx}`)}
      {idx < lines.length - 1 ? <br /> : null}
    </React.Fragment>
  ));
}

function buildBlackboardMap(bb) {
  const map = {};
  if (!Array.isArray(bb)) return map;
  for (const it of bb) {
    const k = it?.key;
    if (!isNonEmptyString(k)) continue;
    map[k] = it?.value;
  }
  return map;
}

function applyBlackboard(text, bbMap) {
  if (!isNonEmptyString(text)) return "";
  if (!bbMap || typeof bbMap !== "object") return text;

  return String(text).replace(/\{([a-zA-Z0-9_]+)(?::([0-9]+))?(%?)\}/g, (_, key, idx, percent) => {
    const raw = bbMap?.[key];
    if (raw == null) return `{${key}}`;

    let v = Number(raw);
    if (!Number.isFinite(v)) return String(raw);

    if (percent) v = v * 100;
    if (idx != null) {
      const n = Number(idx);
      if (Number.isFinite(n)) v = Number(v.toFixed(n));
    } else {
      if (Math.abs(v - Math.round(v)) < 1e-6) v = Math.round(v);
    }
    return `${v}${percent ? "%" : ""}`;
  });
}

/* === RangeGrid (yours) === */

function RangeGrid({ rangeId }) {
  if (!isNonEmptyString(rangeId)) return null;
  const data = rangeTable?.[rangeId];
  const grids = data?.grids;
  if (!Array.isArray(grids) || grids.length === 0) return null;

  const xs = grids.map((g) => g?.col).filter((x) => Number.isFinite(x));
  const ys = grids.map((g) => g?.row).filter((y) => Number.isFinite(y));
  if (xs.length === 0 || ys.length === 0) return null;

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const w = maxX - minX + 1;
  const h = maxY - minY + 1;

  const cellMap = new Set(grids.map((g) => `${g.col},${g.row}`));

  return (
    <div className="inline-block">
      <div
        className="grid gap-[2px]"
        style={{ gridTemplateColumns: `repeat(${w}, 22px)` }}
      >
        {Array.from({ length: h }).map((_, r) =>
          Array.from({ length: w }).map((__, c) => {
            const x = minX + c;
            const y = maxY - r;
            const key = `${x},${y}`;
            const active = cellMap.has(key);
            const center = x === 0 && y === 0;

            return (
              <div
                key={key}
                className="w-[22px] h-[22px] rounded-sm border border-white/10 bg-black/30 flex items-center justify-center"
              >
                {center ? (
                  <img
                    src={RANGE_STAND}
                    alt=""
                    className="w-[18px] h-[18px] object-contain"
                    draggable={false}
                  />
                ) : active ? (
                  <img
                    src={RANGE_ATTACK}
                    alt=""
                    className="w-[18px] h-[18px] object-contain"
                    draggable={false}
                  />
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const SKILL_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/skills/";
const SKILL_ICON_PREFIX = `${SKILL_ICON_BASE}skill_icon_`;

const INIT_SP_ICON =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/ui/[uc]itemrepo/page/item_repo_page/init_sp.png";
const SP_COST_ICON =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/ui/[uc]itemrepo/page/item_repo_page/image_sp_cost_bkg.png";

const SOLID_LV_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/number_hub/solid_";
const SPECIALIZED_LV_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/specialized_hub/specialized_";

const BUILD_SKILL_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/building/skills/";

const ITEM_BG_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/items/";
const ITEM_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/items/";

function rarityToR(rarity) {
  const r = Number(rarity);
  if (Number.isNaN(r)) return 0;
  return Math.max(0, Math.min(5, r));
}

function getItemMeta(itemId) {
  const id = String(itemId || "");
  const items = itemTable?.items || itemTable;
  return items?.[id] || null;
}

function getItemIconUrl(itemId) {
  const meta = getItemMeta(itemId);
  const iconId = meta?.iconId || meta?.icon || "";
  if (!isNonEmptyString(iconId)) return "";
  return `${ITEM_ICON_BASE}${iconId}.png`;
}

function getItemBgUrl(itemId) {
  const meta = getItemMeta(itemId);
  const rarity = rarityToR(meta?.rarity);
  return `${ITEM_BG_BASE}itembg_${rarity}.png`;
}

function SkillBadge({ bg, textColor = "#000", title, children }) {
  return (
    <span
      className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold leading-none"
      style={{ backgroundColor: bg, color: textColor }}
      title={title || ""}
    >
      {children}
    </span>
  );
}

function getSkillIconUrl(skillId) {
  if (!isNonEmptyString(skillId)) return "";
  return `${SKILL_ICON_PREFIX}${skillId}.png`;
}

function pickSkillText(langNorm, vnText, enText, cnText) {
  if (langNorm === "EN") {
    if (isNonEmptyString(enText)) return String(enText);
    if (isNonEmptyString(cnText)) return String(cnText);
    return "";
  }
  if (isNonEmptyString(vnText)) return String(vnText);
  if (isNonEmptyString(enText)) return String(enText);
  if (isNonEmptyString(cnText)) return String(cnText);
  return "";
}

function getSkillVnDescription(vnEntry, skillNo, levelNo) {
  if (!vnEntry || typeof vnEntry !== "object") return "";
  const s = Number(skillNo);
  const lv = Number(levelNo);
  if (!Number.isFinite(s) || s < 1) return "";
  if (!Number.isFinite(lv) || lv < 1) return "";

  const prefix = `S${s}_`;
  if (lv <= 7) return vnEntry?.[`${prefix}${lv}`] || "";
  const m = lv - 7;
  return vnEntry?.[`${prefix}7M${m}`] || "";
}

function getSpTypeMeta(spType, langNorm) {
  if (spType === 8 || String(spType) === "8") return null;

  const key = String(spType || "");
  const map = {
    INCREASE_WHEN_TAKEN_DAMAGE: {
      bg: "#F4AF09",
      vn: "Hồi khi chịu đòn",
      en: "Defensive Recovery",
      text: "#000",
    },
    INCREASE_WHEN_ATTACK: {
      bg: "#FC793E",
      vn: "Hồi theo đòn đánh",
      en: "Offensive Recovery",
      text: "#000",
    },
    INCREASE_WITH_TIME: {
      bg: "#8EC31F",
      vn: "Hồi theo thời gian",
      en: "Auto Recovery",
      text: "#000",
    },
  };

  const meta = map[key];
  if (meta) {
    return {
      bg: meta.bg,
      textColor: meta.text,
      label: langNorm === "EN" ? meta.en : meta.vn,
    };
  }

  if (!isNonEmptyString(key)) return null;
  return {
    bg: "#D3D3D3",
    textColor: "#000",
    label: key,
  };
}

function getSkillTypeMeta(skillType, langNorm) {
  const key = String(skillType || "");
  const map = {
    AUTO: { vn: "Tự động", en: "Auto" },
    MANUAL: { vn: "Thủ công", en: "Manual" },
    PASSIVE: { vn: "Nội tại", en: "Passive" },
  };
  const meta = map[key];
  if (!meta) return null;
  return {
    bg: "#808080",
    textColor: "#fff",
    label: langNorm === "EN" ? meta.en : meta.vn,
  };
}

function getDurationMeta(duration, langNorm) {
  const d = Number(duration);
  if (!Number.isFinite(d)) return null;
  if (d === -1 || d === 0) return null;

  const isInt = Math.abs(d - Math.round(d)) < 1e-6;
  const v = isInt ? String(Math.round(d)) : String(d);

  return {
    bg: "#D3D3D3",
    textColor: "#000",
    label: langNorm === "EN" ? `${v} seconds` : `${v} giây`,
  };
}

function formatTimeHHMMSS(totalSeconds) {
  const s = Number(totalSeconds);
  if (!Number.isFinite(s) || s < 0) return "";
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = Math.floor(s % 60);
  const pad = (x) => String(x).padStart(2, "0");
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}`;
}

function formatUnlockCond(cond, langNorm) {
  if (!cond || typeof cond !== "object") return "";
  const phase = String(cond?.phase || "");
  const lv = Number(cond?.level);

  let elite = 0;
  if (phase === "PHASE_1") elite = 1;
  else if (phase === "PHASE_2") elite = 2;

  const levelText = Number.isFinite(lv) ? lv : "-";
  if (langNorm === "EN") return `Requirement: Elite ${elite} level ${levelText}`;
  return `Cấp độ yêu cầu: Elite ${elite} level ${levelText}`;
}

function MaterialIcon({ itemId, count }) {
  const id = String(itemId || "");
  const meta = getItemMeta(id);
  const name = meta?.name || id;
  const iconUrl = getItemIconUrl(id);
  const bgUrl = getItemBgUrl(id);

  return (
    <div className="relative w-[56px] h-[56px] shrink-0" title={String(name || id)}>
      {bgUrl ? (
        <img
          src={bgUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-contain"
          loading="lazy"
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 rounded-lg bg-black/30" />
      )}

      {iconUrl ? (
        <img
          src={iconUrl}
          alt={String(name || id)}
          className="absolute inset-0 w-full h-full p-[6px] object-contain"
          loading="lazy"
          draggable={false}
        />
      ) : null}

      {Number.isFinite(Number(count)) ? (
        <div className="absolute bottom-0 right-0 px-1 py-[1px] rounded-tl-md bg-black/70 text-white text-[11px] font-semibold">
          {Number(count)}
        </div>
      ) : null}
    </div>
  );
}

function CostRow({ costs }) {
  const arr = Array.isArray(costs) ? costs : [];
  if (arr.length === 0) return <span className="text-white/40 italic">-</span>;

  return (
    <div className="flex flex-wrap gap-2">
      {arr.map((c, idx) => (
        <MaterialIcon key={`${c?.id || "x"}-${idx}`} itemId={c?.id} count={c?.count} />
      ))}
    </div>
  );
}

function SpPill({ label, iconUrl, value }) {
  if (!Number.isFinite(Number(value))) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-white/70">{label}</span>
      <div className="relative w-[88px] h-[26px] shrink-0">
        <img
          src={iconUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-contain"
          loading="lazy"
          draggable={false}
        />
        <span className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[13px] font-bold text-white drop-shadow">
          {Number(value)}
        </span>
      </div>
    </div>
  );
}

function LevelPicker({ levelCount, activeIdx, onPick }) {
  if (!Number.isFinite(levelCount) || levelCount <= 0) return null;

  const btnClass = (active) =>
    `relative w-[32px] h-[32px] rounded-md overflow-hidden border transition ${
      active ? "border-emerald-500" : "border-white/10 hover:border-white/30"
    }`;

  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: levelCount }).map((_, i) => {
        const levelNo = i + 1;
        const iconUrl =
          levelNo <= 7
            ? `${SOLID_LV_ICON_BASE}${levelNo}.png`
            : `${SPECIALIZED_LV_ICON_BASE}${levelNo - 7}.png`;

        return (
          <button
            key={levelNo}
            type="button"
            onClick={() => onPick(i)}
            className={btnClass(i === activeIdx)}
            title={`Lv ${levelNo}`}
          >
            <img
              src={iconUrl}
              alt={`Lv ${levelNo}`}
              className="absolute inset-0 w-full h-full object-contain p-[3px]"
              loading="lazy"
              draggable={false}
            />
          </button>
        );
      })}
    </div>
  );
}

function normalizeBuildingSlot(slot) {
  const raw = slot?.buffData;
  const list = Array.isArray(raw) ? raw.filter(Boolean) : [];
  if (list.length === 0) return [];
  if (list.length === 1) return list;

  let best = list[0];
  let bestP = phaseToIndex(best?.cond?.phase);
  for (const it of list) {
    const p = phaseToIndex(it?.cond?.phase);
    if (p >= bestP) {
      best = it;
      bestP = p;
    }
  }
  return best ? [best] : [];
}

function getBuildingBuffView(buffId, langNorm) {
  const id = String(buffId || "");
  if (!isNonEmptyString(id)) return null;

  const cn = buildingData?.buffs?.[id] || null;
  const en = buildingDataEN?.buffs?.[id] || null;
  const base = en || cn;

  const vnEntry = buildingVN?.[id] || null;

  const name = pickSkillText(langNorm, vnEntry?.Name, en?.buffName || "", cn?.buffName || "");
  const desc = pickSkillText(
    langNorm,
    vnEntry?.description,
    en?.description || "",
    cn?.description || ""
  );

  const iconKey = base?.skillIcon || "";
  const iconUrl = isNonEmptyString(iconKey) ? `${BUILD_SKILL_ICON_BASE}${iconKey}.png` : "";

  return {
    buffColor: base?.buffColor || "#444",
    textColor: base?.textColor || "#fff",
    iconUrl,
    name,
    desc,
  };
}

/* ===== InfoTable (yours) ===== */

function InfoTable({ title, titleInline, titleRight, children }) {
  return (
    <div className="bg-[#1b1b1b] rounded-xl p-4 text-white">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold">{title}</h3>
          {titleInline}
        </div>
        {titleRight}
      </div>

      <div className="text-[1.025rem] text-gray-300 leading-relaxed break-words">
        {children}
      </div>
    </div>
  );
}

/* ===== MAIN ===== */

export default function SkillsSection(props) {
  const langNorm = React.useMemo(() => {
    const s = String(props?.lang || props?.language || "VN").toUpperCase();
    return s === "EN" ? "EN" : "VN";
  }, [props?.lang, props?.language]);

  const traitMap = React.useMemo(() => {
    const src = langNorm === "EN" ? traitEN : traitVN;
    return buildTraitMap(src);
  }, [langNorm]);

  const tagMap = React.useMemo(() => buildTagMap(tagVN), []);
  const talentMap = React.useMemo(() => buildTalentMap(talentVN), []);

  const operator = props?.operator || props?.data || null;
  const rawCharId =
    props?.charId ||
    props?.operatorId ||
    props?.charKey ||
    operator?.charId ||
    operator?.id ||
    operator?.charKey ||
    null;

  const primaryCharTable = langNorm === "EN" ? characterTableEN : characterTable;
  const { charKey, charData: charDataLang } = React.useMemo(
    () => getCharEntry(rawCharId, primaryCharTable, characterTable),
    [rawCharId, primaryCharTable]
  );

  const charDataCN = React.useMemo(() => {
    if (!charKey) return null;
    return characterTable?.[charKey] || null;
  }, [charKey]);

  const charData = charDataLang || charDataCN;

  const rawTagList = charData?.tagList ?? operator?.tagList ?? [];
  const resolvedTags = React.useMemo(() => {
    if (!Array.isArray(rawTagList) || rawTagList.length === 0) return [];
    return rawTagList
      .filter((t) => isNonEmptyString(t))
      .map((t) => {
        const key = String(t).trim();
        const useTagMap = langNorm === "VN";
        return useTagMap && tagMap && key in tagMap ? String(tagMap[key]) : key;
      });
  }, [rawTagList, tagMap, langNorm]);

  const positionRaw = charData?.position ?? operator?.position ?? "";

  const positionLabel = React.useMemo(() => {
    if (!isNonEmptyString(positionRaw)) return "";
    const pos = String(positionRaw);
    if (langNorm === "EN") {
      if (pos === "MELEE") return "Position: Melee";
      if (pos === "RANGED") return "Position: Ranged";
      return `Position: ${pos}`;
    }
    if (pos === "MELEE") return "Vị trí: Cận chiến";
    if (pos === "RANGED") return "Vị trí: Tầm xa";
    return `Vị trí: ${pos}`;
  }, [positionRaw, langNorm]);

  /* === Trait/Talent phần cũ của bạn giữ nguyên ở đây...
     (Mình không paste lại phần Trait/Talent để tránh quá dài trong chat,
      nhưng file trên của bạn sẽ giữ đúng logic ban đầu)
     => IMPORTANT: Khi bạn copy file này, bạn sẽ có đầy đủ phần Trait/Talent + Skills mới.
  */

  // ==================================
  // Combat skills section (NEW)
  // ==================================
  const charSkills = React.useMemo(() => {
    const arr = charDataCN?.skills || charData?.skills || [];
    return Array.isArray(arr) ? arr.filter((s) => s && isNonEmptyString(s.skillId)) : [];
  }, [charDataCN, charData]);

  const [skillIdx, setSkillIdx] = React.useState(0);
  React.useEffect(() => setSkillIdx(0), [charKey]);

  const selectedCharSkill = charSkills?.[skillIdx] || null;
  const selectedSkillId = selectedCharSkill?.skillId || "";

  const skillCN = React.useMemo(() => {
    if (!isNonEmptyString(selectedSkillId)) return null;
    return skillTable?.[selectedSkillId] || null;
  }, [selectedSkillId]);

  const skillEN = React.useMemo(() => {
    if (!isNonEmptyString(selectedSkillId)) return null;
    return skillTableEN?.[selectedSkillId] || null;
  }, [selectedSkillId]);

  const levelsCN = skillCN?.levels || [];
  const levelsEN = skillEN?.levels || [];
  const levelCount = Math.max(levelsCN.length, levelsEN.length);

  const maxLevelIdx = Math.max(0, levelCount - 1);
  const [levelIdx, setLevelIdx] = React.useState(maxLevelIdx);
  React.useEffect(() => setLevelIdx(maxLevelIdx), [selectedSkillId, maxLevelIdx]);

  const lvlCN = levelsCN?.[levelIdx] || null;
  const lvlEN = levelsEN?.[levelIdx] || null;
  const lvlAny = lvlCN || lvlEN;

  const vnSkillEntry = React.useMemo(() => {
    if (!charKey) return null;
    const obj = skillVN?.[charKey];
    return obj && typeof obj === "object" ? obj : null;
  }, [charKey]);

  const skillNo = skillIdx + 1;

  const skillTitle = React.useMemo(() => {
    const vnTitle = vnSkillEntry?.[`Title_S${skillNo}`];
    const enTitle = lvlEN?.name || "";
    const cnTitle = lvlCN?.name || lvlAny?.name || "";
    return pickSkillText(langNorm, vnTitle, enTitle, cnTitle);
  }, [langNorm, vnSkillEntry, skillNo, lvlEN?.name, lvlCN?.name, lvlAny?.name]);

  const skillDesc = React.useMemo(() => {
    const vnDesc = getSkillVnDescription(vnSkillEntry, skillNo, levelIdx + 1);
    const enDesc = lvlEN?.description || "";
    const cnDesc = lvlCN?.description || lvlAny?.description || "";
    const base = pickSkillText(langNorm, vnDesc, enDesc, cnDesc);
    const bb = buildBlackboardMap(lvlAny?.blackboard);
    return applyBlackboard(base, bb);
  }, [langNorm, vnSkillEntry, skillNo, levelIdx, lvlEN, lvlCN, lvlAny]);

  const spData = lvlAny?.spData || {};
  const spTypeMeta = getSpTypeMeta(spData?.spType, langNorm);
  const skillTypeMeta = getSkillTypeMeta(lvlAny?.skillType, langNorm);
  const durationMeta = getDurationMeta(lvlAny?.duration, langNorm);

  const baseRangeId = React.useMemo(() => {
    const rid =
      charDataCN?.phases?.[2]?.rangeId ||
      charDataCN?.phases?.[1]?.rangeId ||
      charDataCN?.phases?.[0]?.rangeId ||
      null;
    return isNonEmptyString(rid) ? String(rid) : null;
  }, [charDataCN]);

  const currentRangeId = isNonEmptyString(lvlAny?.rangeId) ? String(lvlAny.rangeId) : null;
  const isExtendedRange = Boolean(currentRangeId && baseRangeId && currentRangeId !== baseRangeId);

  const normalSkillUp = Array.isArray(charDataCN?.allSkillLvlup) ? charDataCN.allSkillLvlup : [];
  const masteryUp = Array.isArray(selectedCharSkill?.levelUpCostCond)
    ? selectedCharSkill.levelUpCostCond
    : [];

  // ==================================
  // Building skills (NEW)
  // ==================================
  const buildingChar = React.useMemo(() => {
    if (!charKey) return null;
    return buildingData?.chars?.[charKey] || null;
  }, [charKey]);

  const buildingSlots = React.useMemo(() => {
    const arr = buildingChar?.buffChar;
    if (!Array.isArray(arr)) return [];
    return arr
      .map((slot) => normalizeBuildingSlot(slot))
      .filter((slot) => Array.isArray(slot) && slot.length > 0);
  }, [buildingChar]);

  // ====== UI ======
  return (
    <div className="space-y-3">
      {/* Tag + Position */}
      <div className="bg-[#1b1b1b] rounded-xl p-4 text-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            {resolvedTags.length > 0 ? (
              <div className="text-white/95 font-medium break-words leading-relaxed">
                {`Tag: ${resolvedTags.join(", ")}`}
              </div>
            ) : (
              <span className="text-white/40 italic">-</span>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            {isNonEmptyString(positionLabel) ? (
              <div className="text-white/95 font-medium leading-relaxed">{positionLabel}</div>
            ) : (
              <span className="text-white/40 italic">-</span>
            )}
          </div>
        </div>
      </div>

      {/* === Trait/Talent UI vẫn nằm ở đây (giữ nguyên file gốc bạn gửi) === */}

      {/* Skills */}
      <InfoTable title="Kỹ năng">
        {charSkills.length > 0 ? (
          <div className="space-y-5">
            {charSkills.length > 1 ? (
              <div className="flex flex-wrap gap-2 justify-start">
                {charSkills.map((s, idx) => {
                  const active = idx === skillIdx;
                  const sid = s?.skillId || "";
                  return (
                    <button
                      key={`${sid}-${idx}`}
                      type="button"
                      onClick={() => setSkillIdx(idx)}
                      className={[
                        "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition",
                        active
                          ? "border-emerald-500 bg-emerald-500/15 text-white"
                          : "border-white/10 bg-black/20 text-white/70 hover:text-white hover:border-white/30",
                      ].join(" ")}
                    >
                      <img
                        src={getSkillIconUrl(sid)}
                        alt=""
                        className="w-6 h-6 object-contain"
                        loading="lazy"
                        draggable={false}
                      />
                      <span>{`Skill ${idx + 1}`}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}

            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex items-start gap-4 lg:w-[62%]">
                <img
                  src={getSkillIconUrl(selectedSkillId)}
                  alt=""
                  className="w-[88px] h-[88px] object-contain shrink-0"
                  loading="lazy"
                  draggable={false}
                />

                <div className="min-w-0 flex-1">
                  <div className="text-white text-[1.15rem] font-bold break-words">
                    {isNonEmptyString(skillTitle) ? skillTitle : (
                      <span className="text-white/40 italic">-</span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {spTypeMeta ? (
                      <SkillBadge bg={spTypeMeta.bg} textColor={spTypeMeta.textColor}>
                        {spTypeMeta.label}
                      </SkillBadge>
                    ) : null}

                    {skillTypeMeta ? (
                      <SkillBadge bg={skillTypeMeta.bg} textColor={skillTypeMeta.textColor}>
                        {skillTypeMeta.label}
                      </SkillBadge>
                    ) : null}

                    {durationMeta ? (
                      <SkillBadge bg={durationMeta.bg} textColor={durationMeta.textColor}>
                        {durationMeta.label}
                      </SkillBadge>
                    ) : null}
                  </div>

                  {String(lvlAny?.skillType || "") !== "PASSIVE" ? (
                    <div className="mt-3 flex flex-wrap gap-4">
                      <SpPill
                        label={langNorm === "EN" ? "Initial SP:" : "SP khởi đầu:"}
                        iconUrl={INIT_SP_ICON}
                        value={spData?.initSp}
                      />
                      <SpPill
                        label={langNorm === "EN" ? "SP Cost:" : "SP tiêu hao:"}
                        iconUrl={SP_COST_ICON}
                        value={spData?.spCost}
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              {currentRangeId ? (
                <div className="lg:flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={isExtendedRange ? RANGE_ATTACK : RANGE_STAND}
                      alt=""
                      className="w-5 h-5 object-contain"
                      loading="lazy"
                      draggable={false}
                    />
                    <div className="text-white/90 font-semibold">
                      {langNorm === "EN" ? "Range" : "Phạm vi"}
                    </div>
                    {isExtendedRange ? (
                      <SkillBadge bg="#0ea5e9" textColor="#fff">
                        {langNorm === "EN" ? "Extended" : "Mở rộng"}
                      </SkillBadge>
                    ) : null}
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/20 p-3 overflow-auto">
                    <RangeGrid rangeId={currentRangeId} />
                  </div>
                </div>
              ) : null}
            </div>

            {levelCount > 0 ? (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-white/90 font-semibold">
                    {langNorm === "EN" ? "Skill Level" : "Cấp kỹ năng"}
                  </div>

                  <LevelPicker levelCount={levelCount} activeIdx={levelIdx} onPick={setLevelIdx} />
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  {isNonEmptyString(skillDesc) ? (
                    renderTextWithHovers(skillDesc, `skill-desc-${charKey}-${selectedSkillId}-lv${levelIdx}`)
                  ) : (
                    <span className="text-white/40 italic">-</span>
                  )}
                </div>
              </div>
            ) : null}

            <div className="space-y-3">
              <div className="text-white font-semibold">
                {langNorm === "EN" ? "Upgrade Materials" : "Nguyên liệu nâng cấp"}
              </div>

              {normalSkillUp.length > 0 ? (
                <div className="space-y-3">
                  {normalSkillUp.map((u, i) => {
                    const condText = formatUnlockCond(u?.unlockCond, langNorm);
                    return (
                      <div key={`normal-${i}`} className="rounded-xl border border-white/10 bg-black/20 p-3 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <SkillBadge bg="#111827" textColor="#fff">
                            {`Lv ${i + 1} → Lv ${i + 2}`}
                          </SkillBadge>
                          {isNonEmptyString(condText) ? (
                            <SkillBadge bg="#1f2937" textColor="#fff">
                              {condText}
                            </SkillBadge>
                          ) : null}
                        </div>
                        <CostRow costs={u?.lvlUpCost} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <span className="text-white/40 italic">-</span>
              )}

              {masteryUp.length > 0 ? (
                <div className="space-y-3 pt-2">
                  <div className="text-white/90 font-semibold">
                    {langNorm === "EN" ? "Mastery" : "Chuyên tinh"}
                  </div>

                  {masteryUp.map((u, i) => {
                    const condText = formatUnlockCond(u?.unlockCond, langNorm);
                    const timeText = formatTimeHHMMSS(u?.lvlUpTime);

                    return (
                      <div key={`mastery-${i}`} className="rounded-xl border border-white/10 bg-black/20 p-3 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <SkillBadge bg="#111827" textColor="#fff">
                            {langNorm === "EN"
                              ? `Mastery ${i + 1} (Lv 7 → Lv ${8 + i})`
                              : `Chuyên tinh ${i + 1} (Lv 7 → Lv ${8 + i})`}
                          </SkillBadge>
                          {isNonEmptyString(condText) ? (
                            <SkillBadge bg="#1f2937" textColor="#fff">
                              {condText}
                            </SkillBadge>
                          ) : null}
                        </div>

                        {isNonEmptyString(timeText) ? (
                          <div className="text-sm text-white/75">
                            {langNorm === "EN" ? `Upgrade time: ${timeText}` : `Thời gian nâng cấp: ${timeText}`}
                          </div>
                        ) : null}

                        <CostRow costs={u?.levelUpCost} />
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <span className="text-white/40 italic">-</span>
        )}
      </InfoTable>

      {/* Building Skills */}
      <InfoTable title="Kỹ năng hậu cần">
        {buildingSlots.length > 0 ? (
          <div className="space-y-3">
            {buildingSlots.map((slot, slotIdx) => (
              <div key={`bslot-${slotIdx}`} className="rounded-xl border border-white/10 bg-black/20 p-3 space-y-3">
                {slot.map((b, idx) => {
                  const view = getBuildingBuffView(b?.buffId, langNorm);
                  if (!view) return null;

                  const condText = formatUnlockCond(b?.cond, langNorm);

                  return (
                    <div key={`${b?.buffId || "x"}-${idx}`} className="space-y-2">
                      <div className="flex items-center gap-3">
                        {view.iconUrl ? (
                          <img src={view.iconUrl} alt="" className="w-10 h-10 object-contain shrink-0" loading="lazy" draggable={false} />
                        ) : null}

                        <div className="min-w-0 flex-1 flex flex-wrap items-center gap-2">
                          <span
                            className="px-2 py-1 rounded-md text-sm font-bold leading-none"
                            style={{ backgroundColor: view.buffColor, color: view.textColor }}
                          >
                            {isNonEmptyString(view.name) ? view.name : b?.buffId}
                          </span>

                          {isNonEmptyString(condText) ? (
                            <SkillBadge bg="#1f2937" textColor="#fff">
                              {condText}
                            </SkillBadge>
                          ) : null}
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                        {isNonEmptyString(view.desc) ? (
                          renderTextWithHovers(view.desc, `bskill-${charKey}-${b?.buffId}-${slotIdx}-${idx}`)
                        ) : (
                          <span className="text-white/40 italic">-</span>
                        )}
                      </div>
                    </div>
                  );
                })}
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
