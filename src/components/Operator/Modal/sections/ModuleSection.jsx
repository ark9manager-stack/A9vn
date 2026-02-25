import React from "react";

import characterTable from "../../../../data/operators/character_table.json";
import characterTableEN from "../../../../data/operators/character_table_en.json";
import traitVN from "../../../../data/operators/trait_vn.json";
import traitEN from "../../../../data/operators/trait_en.json";
import talentVN from "../../../../data/operators/talent_vn.json";
import rangeTable from "../../../../data/range_table.json";
import itemTable from "../../../../data/operators/item_table.json";

import uniequipTable from "../../../../data/module/uniequip_table.json";
import uniequipTableEN from "../../../../data/module/uniequip_table_en.json";
import battleEquipTable from "../../../../data/module/battle_equip_table.json";
import battleEquipTableEN from "../../../../data/module/battle_equip_table_en.json";
import moduleVN from "../../../../data/module/Module_vn.json";

import StatHover, { renderInlineItalic } from "../../../StatHover";
import { subProfIconUrl } from "../../../../utils/operatorUtils";

/** Module icons */
const MODULE_DIR_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/uniequipdirection/";
const MODULE_IMG_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/uniequipimg/";
const MODULE_LEVEL_BOARD_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/ui/uniequip/uniequip_level_board/";

/** Materials */
const ITEM_BG_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/ui/[uc]home/mail/panel_mail_item/";
const ITEM_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/items/icons/";

const POT_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/potential_hub/";
const getPotIcon = (idx0) => `${POT_ICON_BASE}potential_${idx0}.png`;

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function phaseToEliteIndex(phase) {
  const p = String(phase || "");
  if (p === "PHASE_2") return 2;
  if (p === "PHASE_1") return 1;
  return 0;
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

// ===== Hover-markup parsing (consistent with SkillsSection) =====
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

function matchOpenNoteAt(str, i) {
  // <$ba.xxx> or <@ba.xxx>
  if (typeof str !== "string") return null;
  if (str[i] !== "<") return null;

  const n1 = str[i + 1];
  if (n1 !== "$" && n1 !== "@") return null;

  let j = i + 2;
  while (j < str.length && /[a-zA-Z0-9_.-]/.test(str[j])) j += 1;
  if (str[j] !== ">") return null;

  const rawKey = str.slice(i + 2, j);
  const noteKey = isNonEmptyString(rawKey) ? rawKey : null;
  return { len: j - i + 1, noteKey };
}

function parseMarkupSegment(str, keyPrefix, noteKeyCtx = null, startIndex = 0, stopAtClose = false) {
  const nodes = [];
  let i = startIndex;

  const pushText = (txt, k) => {
    if (!isNonEmptyString(txt)) return;
    nodes.push(...renderInlineItalic(txt, k));
  };

  while (i < str.length) {
    const closeLen = matchCloseTagAt(str, i);
    if (closeLen && stopAtClose) {
      return { nodes, nextIndex: i + closeLen, closed: true };
    }

    const open = matchOpenNoteAt(str, i);
    if (open) {
      const { len, noteKey } = open;

      const inner = parseMarkupSegment(
        str,
        `${keyPrefix}-n${nodes.length}`,
        noteKey || noteKeyCtx,
        i + len,
        true
      );

      const content = inner.nodes;
      const finalKey = noteKey || noteKeyCtx;

      if (finalKey) {
        nodes.push(
          <StatHover key={`${keyPrefix}-hover-${i}`} noteKey={finalKey}>
            {content}
          </StatHover>
        );
      } else {
        nodes.push(<React.Fragment key={`${keyPrefix}-frag-${i}`}>{content}</React.Fragment>);
      }

      i = inner.nextIndex;
      continue;
    }

    // Plain text chunk
    let j = i;
    while (j < str.length) {
      if (matchOpenNoteAt(str, j)) break;
      if (stopAtClose && matchCloseTagAt(str, j)) break;
      j += 1;
    }

    const chunk = str.slice(i, j);
    if (isNonEmptyString(chunk)) pushText(chunk, `${keyPrefix}-t-${i}`);
    i = j;
  }

  return { nodes, nextIndex: i, closed: false };
}

function parseMarkupHovers(text, keyPrefix = "txt") {
  const s = isNonEmptyString(text) ? String(text) : "";
  if (!s) return { nodes: [] };

  const { nodes } = parseMarkupSegment(s, keyPrefix, null, 0, false);
  return { nodes };
}

function renderTextWithHovers(text, keyPrefix = "txt") {
  if (!isNonEmptyString(text)) return null;

  const normalized = String(text)
    .split("\r\n")
    .join("\n")
    .split("\r")
    .join("\n")
    .split("\\n")
    .join("\n");

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
    <div className="inline-grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${width}, 14px)` }}>
      {Array.from({ length: height }).map((_, rIdx) =>
        Array.from({ length: width }).map((__, cIdx) => {
          const r = minR + rIdx;
          const c = minC + cIdx;
          const isCenter = r === 0 && c === 0;
          const hasCell = keySet.has(`${r},${c}`);
          return (
            <div
              key={`${rangeId}-${r}-${c}`}
              className={`w-[14px] h-[14px] rounded-[2px] ${
                isCenter ? "bg-emerald-500" : hasCell ? "bg-white/70" : "bg-white/10"
              }`}
              title={isCenter ? "Operator" : hasCell ? "In range" : ""}
            />
          );
        })
      )}
    </div>
  );
}

function getItemMeta(itemId) {
  if (!itemId) return null;
  const key = String(itemId);
  return itemTable?.items?.[key] || itemTable?.[key] || null;
}

function getItemBgUrl(rarity) {
  const r = Number(rarity);
  const rr = Number.isFinite(r) ? r : 1;
  const idx = Math.min(5, Math.max(1, rr));
  return `${ITEM_BG_BASE}mail_item_bg_${idx}.png`;
}

function getItemIconUrl(meta, itemId) {
  const iconId = meta?.iconId || meta?.icon || itemId;
  if (!iconId) return "";
  return `${ITEM_ICON_BASE}${iconId}.png`;
}

function MaterialIcon({ itemId, count }) {
  const meta = getItemMeta(itemId);
  const name = meta?.name || String(itemId || "Unknown");
  const bgUrl = getItemBgUrl(meta?.rarity);
  const iconUrl = getItemIconUrl(meta, itemId);

  return (
    <div className="relative w-[56px] h-[56px] shrink-0">
      <img
        src={bgUrl}
        alt="bg"
        className="absolute inset-0 w-full h-full object-contain"
        draggable={false}
        loading="lazy"
      />
      <img
        src={iconUrl}
        alt={name}
        className="absolute inset-0 w-full h-full object-contain p-1"
        draggable={false}
        loading="lazy"
        title={name}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <div className="absolute bottom-[2px] right-[2px] px-1.5 rounded bg-black/80 text-[13px] leading-[15px] font-bold text-white tabular-nums">
        {Number(count) || 0}
      </div>
    </div>
  );
}

function ModuleImageBox({ src, alt = "module", overlaySrc = "" }) {
  const [ok, setOk] = React.useState(true);

  React.useEffect(() => {
    setOk(true);
  }, [src]);

  if (!isNonEmptyString(src) || !ok) return null;

  return (
    <div className="relative w-[128px] h-[128px] rounded-xl border border-white/10 bg-black/30 overflow-hidden flex items-center justify-center">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain"
        draggable={false}
        loading="lazy"
        onError={() => setOk(false)}
      />
      {isNonEmptyString(overlaySrc) ? (
        <img
          src={overlaySrc}
          alt="overlay"
          className="absolute inset-0 m-auto w-[64px] h-[64px] object-contain"
          draggable={false}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : null}
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

function modTypeLabel(typeName2, isEnglishUI) {
  const t = typeName2 == null ? null : String(typeName2);
  if (!t) return isEnglishUI ? "Original" : "Original";
  if (t === "X") return "Mod X";
  if (t === "Y") return "Mod Y";
  if (t === "D") return "Mod Δ";
  if (t === "A") return "Mod α";
  if (t === "B") return "Mod β";
  return `Mod ${t}`;
}

function modSortKey(typeName2) {
  const t = typeName2 == null ? "" : String(typeName2);
  const map = { X: 0, Y: 1, D: 2, A: 3, B: 4 };
  return t && t in map ? map[t] : 99; // Original/unknown -> last
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

function pickTraitCandidate(phase) {
  const parts = phase?.parts || [];
  for (const part of parts) {
    const cands = part?.overrideTraitDataBundle?.candidates;
    if (!Array.isArray(cands) || cands.length === 0) continue;
    const sorted = [...cands].sort(
      (a, b) => Number(a?.requiredPotentialRank || 0) - Number(b?.requiredPotentialRank || 0)
    );
    return sorted[0] || null;
  }
  return null;
}

function collectTalentUpgradeLines(phase) {
  const parts = phase?.parts || [];
  const raw = [];

  for (const part of parts) {
    const target = String(part?.target || "");
    if (target === "TRAIT") continue; // tránh đụng vào Trait section
    const cands = part?.addOrOverrideTalentDataBundle?.candidates;
    if (!Array.isArray(cands) || cands.length === 0) continue;

    for (const c of cands) {
      raw.push({
        ...c,
        _target: target,
        _isToken: !!part?.isToken,
      });
    }
  }

  // Group theo requiredPotentialRank, pick best per group
  const byReq = new Map();
  for (const c of raw) {
    const req = Number(c?.requiredPotentialRank || 0) || 0;
    if (!byReq.has(req)) byReq.set(req, []);
    byReq.get(req).push(c);
  }

  const lines = [];
  const reqs = [...byReq.keys()].sort((a, b) => a - b);
  for (const req of reqs) {
    const arr = byReq.get(req) || [];
    const best =
      [...arr]
        .sort((a, b) => {
          const aTok = a?._isToken ? 1 : 0;
          const bTok = b?._isToken ? 1 : 0;
          const aHas = isNonEmptyString(a?.upgradeDescription) ? 0 : 1;
          const bHas = isNonEmptyString(b?.upgradeDescription) ? 0 : 1;
          return aHas - bHas || aTok - bTok;
        })[0] || null;

    if (!best) continue;

    lines.push({
      requiredPotentialRank: req,
      name: best?.name || "",
      talentIndex: best?.talentIndex,
      text: best?.upgradeDescription || "",
    });
  }

  return lines;
}

function findTalentTitleFromVN(charKey, talentIndex) {
  if (!isNonEmptyString(charKey)) return "";
  const vnEntry = talentVN?.[charKey] || null;
  if (!vnEntry) return "";

  const idx = Number(talentIndex);
  if (idx === 0) return isNonEmptyString(vnEntry?.TitleTalent1) ? String(vnEntry.TitleTalent1) : "";
  if (idx === 1) return isNonEmptyString(vnEntry?.TitleTalent2) ? String(vnEntry.TitleTalent2) : "";
  return "";
}

function trustToPercent(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 0;
  if (n <= 100) return Math.round(n);
  return Math.min(100, Math.round(n / 100));
}

export default function ModuleSection(props) {
  const isEnglishUI =
    (typeof props?.lang === "string" && props.lang.toLowerCase().startsWith("en")) ||
    (typeof props?.language === "string" && props.language.toLowerCase().startsWith("en")) ||
    (typeof props?.onLang === "string" && props.onLang.toLowerCase().startsWith("en"));

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

  const moduleIds = React.useMemo(() => {
    if (!isNonEmptyString(charKey)) return [];
    const enList = uniequipTableEN?.charEquip?.[charKey];
    const cnList = uniequipTable?.charEquip?.[charKey];
    const base = isEnglishUI && Array.isArray(enList) && enList.length > 0 ? enList : cnList;
    return Array.isArray(base) ? base.filter((x) => isNonEmptyString(x)) : [];
  }, [charKey, isEnglishUI]);

  const modules = React.useMemo(() => {
    const out = [];
    for (const id of moduleIds) {
      const cnMeta = uniequipTable?.equipDict?.[id] || null;
      const enMeta = uniequipTableEN?.equipDict?.[id] || null;
      const meta = isEnglishUI ? (enMeta || cnMeta) : cnMeta;
      if (!meta) continue;

      out.push({
        id,
        metaCN: cnMeta,
        metaEN: enMeta,
        meta,
        typeIcon: meta?.typeIcon || cnMeta?.typeIcon || "original",
        typeName2: meta?.typeName2 ?? cnMeta?.typeName2 ?? null,
        uniEquipIcon: meta?.uniEquipIcon || cnMeta?.uniEquipIcon || "",
        sortKey: modSortKey(meta?.typeName2 ?? cnMeta?.typeName2 ?? null),
      });
    }
    return out.sort((a, b) => a.sortKey - b.sortKey);
  }, [moduleIds, isEnglishUI]);

  const [activeModuleIdx, setActiveModuleIdx] = React.useState(0);

  React.useEffect(() => {
    setActiveModuleIdx(0);
  }, [charKey, moduleIds?.length]);

  const safeModuleIdx = Math.min(Math.max(0, activeModuleIdx), Math.max(0, modules.length - 1));
  const selected = modules?.[safeModuleIdx] || null;

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

  const traitMap = React.useMemo(() => (isEnglishUI ? traitEN : traitVN), [isEnglishUI]);

  const baseTraitText = React.useMemo(() => {
    const subProfessionId = charData?.subProfessionId ?? operator?.subProfessionId;
    const rarity = charData?.rarity ?? operator?.rarity;

    const baseDescCN = charData?.description ?? operator?.description ?? "";
    const baseDescEN = charDataEN?.description ?? "";
    const baseDesc = isEnglishUI ? (baseDescEN || baseDescCN) : baseDescCN;

    return resolveTraitTexts({ subProfessionId, rarity, description: baseDesc }, traitMap).mainText;
  }, [charData, charDataEN, operator, isEnglishUI, traitMap]);

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

  const isDefaultModule = React.useMemo(() => {
    const icon = selected?.uniEquipIcon || "";
    const typeName2 = selected?.typeName2;
    return String(icon) === "original" || typeName2 == null;
  }, [selected?.uniEquipIcon, selected?.typeName2]);

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

  const traitCandidate = React.useMemo(() => {
    const ph1 = phasesByLevel.get(1) || null;
    if (!ph1) return null;
    return pickTraitCandidate(ph1);
  }, [phasesByLevel]);

  const traitOverrideText = React.useMemo(() => {
    return traitCandidate?.overrideDescripton || null;
  }, [traitCandidate]);

  const traitAdditionalText = React.useMemo(() => {
    if (!isEnglishUI && isNonEmptyString(vnOverride?.Trait)) return String(vnOverride.Trait);
    return traitCandidate?.additionalDescription || null;
  }, [traitCandidate, vnOverride, isEnglishUI]);

  const selectedModuleImageUrl = React.useMemo(() => {
    const icon = selected?.uniEquipIcon;
    if (!isNonEmptyString(icon)) return "";
    if (String(icon) === "original") return `${MODULE_IMG_BASE}default.png`;
    return `${MODULE_IMG_BASE}${icon}.png`;
  }, [selected?.uniEquipIcon]);

  const subProfIcon = React.useMemo(() => {
    const subProfessionId = charData?.subProfessionId ?? operator?.subProfessionId;
    return isNonEmptyString(subProfessionId) ? subProfIconUrl(subProfessionId) : "";
  }, [charData, operator]);

  const moduleSelector =
    modules.length > 0 ? (
      <div className="flex items-start gap-3 flex-wrap">
        {modules.map((m, idx0) => {
          const isActive = idx0 === safeModuleIdx;
          const iconKey = m?.typeIcon || "original";
          const iconUrl = `${MODULE_DIR_ICON_BASE}${iconKey}.png`;
          const label = modTypeLabel(m?.typeName2, isEnglishUI);

          return (
            <div key={`${m.id}-${idx0}`} className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveModuleIdx(idx0)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition border ${
                  isActive
                    ? "bg-white text-black border-white"
                    : "bg-white/10 text-white border-white/10 hover:bg-white/20"
                }`}
                title={label}
              >
                <img
                  src={iconUrl}
                  alt={label}
                  className="w-10 h-10 object-contain"
                  draggable={false}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </button>
              <div className="text-xs font-semibold text-white/80">{label}</div>
            </div>
          );
        })}
      </div>
    ) : null;

  const moduleDetailCard = selected ? (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        <div className="shrink-0">
          <ModuleImageBox
            src={selectedModuleImageUrl}
            alt="module"
            overlaySrc={isDefaultModule ? subProfIcon : ""}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[1.35rem] font-semibold text-white leading-snug break-words">
            {isNonEmptyString(displayModuleName) ? (
              displayModuleName
            ) : (
              <span className="text-white/40 italic">-</span>
            )}
          </div>

          <div className="mt-3 space-y-3">
            <div className="text-xs text-white/70">{isEnglishUI ? "Trait" : "Đặc tính/Trait"}</div>

            {isDefaultModule ? (
              <div
                className="min-w-0 text-[1.025rem] text-gray-300 leading-relaxed break-words"
                style={{ overflowWrap: "anywhere" }}
              >
                {isNonEmptyString(baseTraitText) ? (
                  renderTextWithHovers(baseTraitText, `module-trait-base-${charKey || "unknown"}-${selected.id}`)
                ) : (
                  <span className="text-white/40 italic">-</span>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {isNonEmptyString(traitOverrideText) ? (
                  <div>
                    <div className="text-xs text-white/70">
                      {isEnglishUI ? "Improve Trait" : "Cải thiện thiên phú"}
                    </div>
                    <div
                      className="mt-2 min-w-0 text-[1.025rem] text-gray-300 leading-relaxed break-words"
                      style={{ overflowWrap: "anywhere" }}
                    >
                      {renderTextWithHovers(traitOverrideText, `module-trait-override-${selected.id}`)}
                    </div>
                  </div>
                ) : null}

                {isNonEmptyString(traitAdditionalText) ? (
                  <div>
                    <div className="text-xs text-white/70">
                      {isEnglishUI ? "Additional Trait" : "Bổ sung thiên phú"}
                    </div>

                    <div className="mt-2 space-y-2">
                      {isNonEmptyString(baseTraitText) ? (
                        <div
                          className="min-w-0 text-[1.025rem] text-gray-300 leading-relaxed break-words"
                          style={{ overflowWrap: "anywhere" }}
                        >
                          {renderTextWithHovers(baseTraitText, `module-trait-base2-${charKey || "unknown"}-${selected.id}`)}
                        </div>
                      ) : null}

                      <div className="rounded-lg border border-sky-500/30 bg-sky-600/20 px-3 py-2 text-white">
                        <div className="min-w-0 text-[1.025rem] leading-relaxed break-words" style={{ overflowWrap: "anywhere" }}>
                          {renderTextWithHovers(traitAdditionalText, `module-trait-add-${selected.id}`)}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {!isNonEmptyString(traitOverrideText) && !isNonEmptyString(traitAdditionalText) ? (
                  <div className="min-w-0 text-[1.025rem] text-gray-300 leading-relaxed break-words" style={{ overflowWrap: "anywhere" }}>
                    {isNonEmptyString(baseTraitText) ? (
                      renderTextWithHovers(baseTraitText, `module-trait-fallback-${charKey || "unknown"}-${selected.id}`)
                    ) : (
                      <span className="text-white/40 italic">-</span>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : null;

  const levelBoardTable =
    selected && !isDefaultModule && phasesByLevel.size > 0 ? (
      <div className="mt-4 rounded-xl border border-white/10 overflow-hidden">
        <div className="grid grid-cols-3">
          {[1, 2, 3].map((lv) => (
            <div
              key={`board-${selected.id}-${lv}`}
              className={`bg-black/25 p-3 flex items-center justify-center ${lv < 3 ? "border-r border-white/10" : ""}`}
            >
              <img
                src={`${MODULE_LEVEL_BOARD_BASE}img_stg${lv}.png`}
                alt={`lv-${lv}`}
                className="h-10 w-auto object-contain"
                draggable={false}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          ))}

          {[1, 2, 3].map((lv) => {
            const ph = phasesByLevel.get(lv) || null;
            const attrs = Array.isArray(ph?.attributeBlackboard) ? ph.attributeBlackboard : [];
            const rangeId = findFirstRangeId(ph);
            const unlockCond = findFirstUnlockCondition(ph);

            const lines = collectTalentUpgradeLines(ph);

            // VN overrides for upgradeDescription (TalentLv2 / TalentLv2_p4, ...)
            const withOverrides = lines.map((x) => {
              if (!x) return x;
              if (isEnglishUI) return x;
              const req = Number(x.requiredPotentialRank || 0) || 0;
              const keyBase = `TalentLv${lv}`;
              const key = req > 0 ? `${keyBase}_p${req}` : keyBase;
              const override = vnOverride?.[key];
              return isNonEmptyString(override) ? { ...x, text: override } : x;
            });

            const bestForTitle = withOverrides.find((x) => isNonEmptyString(x?.name) || Number(x?.talentIndex) >= 0);
            const vnTalentTitle =
              !isEnglishUI && bestForTitle && Number.isFinite(Number(bestForTitle?.talentIndex))
                ? findTalentTitleFromVN(charKey, bestForTitle.talentIndex)
                : "";
            const titleText = isNonEmptyString(vnTalentTitle) ? vnTalentTitle : bestForTitle?.name || "";

            return (
              <div
                key={`cell-${selected.id}-${lv}`}
                className={`bg-black/15 p-3 ${lv < 3 ? "border-r border-white/10" : ""} border-t border-white/10`}
              >
                <div className="flex gap-3 items-start">
                  <div className="min-w-[92px]">
                    {attrs.length > 0 ? (
                      <div className="space-y-1">
                        {attrs.map((a, idx0) => {
                          const k = a?.key;
                          const v = a?.value;
                          if (!isNonEmptyString(k) || !Number.isFinite(Number(v))) return null;
                          return (
                            <div key={`attr-${selected.id}-${lv}-${k}-${idx0}`} className="text-sm text-white/90 font-semibold tabular-nums">
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
                    {lv === 1 ? (
                      <div className="space-y-2">
                        <div className="text-sm font-semibold text-white">{isEnglishUI ? "Unlock Trait" : "Mở khóa đặc tính"}</div>

                        {unlockCond ? (
                          <div className="text-xs text-white/70">
                            {isEnglishUI
                              ? `Required: Elite ${phaseToEliteIndex(unlockCond?.phase)} level ${Number(unlockCond?.level || 0) || 1}`
                              : `Cấp độ yêu cầu: Elite ${phaseToEliteIndex(unlockCond?.phase)} level ${Number(unlockCond?.level || 0) || 1}`}
                          </div>
                        ) : null}

                        {isNonEmptyString(rangeId) ? (
                          <div className="mt-2 rounded-xl border border-white/10 bg-black/30 p-3 inline-block">
                            <div className="text-sm font-semibold text-white text-center mb-2">{isEnglishUI ? "Range" : "Phạm vi"}</div>
                            <RangeGrid rangeId={rangeId} />
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {isNonEmptyString(titleText) ? (
                          <div className="flex items-center justify-end">
                            <span className="inline-flex items-center rounded-md bg-white px-2 py-1 text-black font-semibold text-xs max-w-full">
                              <span className="truncate">{titleText}</span>
                            </span>
                          </div>
                        ) : null}

                        {withOverrides.length > 0 ? (
                          <div className="space-y-2">
                            {withOverrides.map((x, idx0) => {
                              const req = Number(x?.requiredPotentialRank || 0) || 0;
                              const txt = x?.text || "";
                              if (!isNonEmptyString(txt)) return null;

                              return (
                                <div key={`up-${selected.id}-${lv}-${req}-${idx0}`} className="space-y-1">
                                  {req > 0 ? (
                                    <div className="inline-flex items-center gap-1 rounded-md bg-white/10 border border-white/10 px-2 py-1">
                                      <img src={getPotIcon(req)} alt={`pot-${req}`} className="w-5 h-5 object-contain" draggable={false} loading="lazy" />
                                      <span className="text-xs font-semibold text-white">
                                        {isEnglishUI ? `Requires Pot ${req + 1}` : `Yêu cầu Pot ${req + 1}`}
                                      </span>
                                    </div>
                                  ) : null}

                                  <div className="min-w-0 text-[1.025rem] text-gray-300 leading-relaxed break-words" style={{ overflowWrap: "anywhere" }}>
                                    {renderTextWithHovers(txt, `module-up-${charKey || "unknown"}-${selected.id}-lv${lv}-pot${req}`)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-white/40 italic">-</span>
                        )}

                        {isNonEmptyString(rangeId) ? (
                          <div className="mt-2 rounded-xl border border-white/10 bg-black/30 p-3 inline-block">
                            <div className="text-sm font-semibold text-white text-center mb-2">{isEnglishUI ? "Range" : "Phạm vi"}</div>
                            <RangeGrid rangeId={rangeId} />
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ) : null;

  const missionTexts = React.useMemo(() => {
    if (!selected) return [];
    const ids = selected?.meta?.missionList || selected?.metaCN?.missionList || [];
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
  }, [selected, isEnglishUI, vnOverride]);

  const upgradeCosts = React.useMemo(() => {
    if (!selected) return [];
    const itemCost = selected?.meta?.itemCost || selected?.metaCN?.itemCost || {};
    const unlockFavors = selected?.meta?.unlockFavors || selected?.metaCN?.unlockFavors || {};

    const res = [];
    [1, 2, 3].forEach((lv) => {
      const costs = itemCost?.[String(lv)];
      if (!Array.isArray(costs) || costs.length === 0) return;

      const ph = phasesByLevel.get(lv) || null;
      const unlockCond = findFirstUnlockCondition(ph);
      const trust = unlockFavors?.[String(lv)];

      res.push({
        lv,
        label: `Lv${lv}`,
        unlockCond,
        trust,
        costs,
      });
    });

    return res;
  }, [selected, phasesByLevel]);

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

  return (
    <div className="space-y-4">
      <InfoTable title="Module">
        <div className="space-y-4">
          {moduleSelector}
          {moduleDetailCard}
          {levelBoardTable}
        </div>
      </InfoTable>

      <InfoTable title={isEnglishUI ? "Module Missions" : "Nhiệm vụ mở Module"}>
        {missionTexts.length > 0 ? (
          <div className="space-y-2">
            {missionTexts.map((t, idx0) => (
              <div key={`mis-${selected?.id}-${idx0}`} className="text-white/95 leading-relaxed">
                {renderTextWithHovers(t, `module-mission-${selected?.id}-${idx0}`)}
              </div>
            ))}
          </div>
        ) : (
          <span className="text-white/40 italic">-</span>
        )}
      </InfoTable>

      <InfoTable title={isEnglishUI ? "Upgrade Materials" : "Nguyên liệu nâng cấp"}>
        {upgradeCosts.length > 0 ? (
          <div className="space-y-4">
            {upgradeCosts.map((u) => {
              const elite = u.unlockCond ? phaseToEliteIndex(u.unlockCond?.phase) : null;
              const lvReq = u.unlockCond ? Number(u.unlockCond?.level || 0) || 1 : null;
              const trustPct = trustToPercent(u.trust);

              return (
                <div key={`upcost-${selected?.id}-${u.lv}`} className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-semibold text-white">{u.label}</span>

                    {u.unlockCond ? (
                      <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold text-black" style={{ backgroundColor: "#D3D3D3" }}>
                        {isEnglishUI ? `Required: Elite ${elite} level ${lvReq}` : `Cấp độ yêu cầu: Elite ${elite} level ${lvReq}`}
                      </span>
                    ) : null}

                    <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold text-black" style={{ backgroundColor: "#D3D3D3" }}>
                      {isEnglishUI ? `Trust: ${trustPct}%` : `Tin tưởng: ${trustPct}%`}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-start justify-start gap-y-2 gap-x-1.5 sm:gap-x-2">
                    {Array.isArray(u.costs)
                      ? u.costs
                          .filter((c) => c?.id && Number(c?.count) > 0)
                          .map((c, j) => <MaterialIcon key={`${c.id}-${selected?.id}-${u.lv}-${j}`} itemId={c.id} count={c.count} />)
                      : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <span className="text-white/40 italic">-</span>
        )}
      </InfoTable>

      <InfoTable title={isEnglishUI ? "Story" : "Cốt truyện"}>
        {isNonEmptyString(displayStoryText) ? (
          <div className="text-white/95 leading-relaxed" style={{ overflowWrap: "anywhere" }}>
            {renderTextWithHovers(displayStoryText, `module-story-${selected?.id}`)}
          </div>
        ) : (
          <span className="text-white/40 italic">-</span>
        )}
      </InfoTable>
    </div>
  );
}
