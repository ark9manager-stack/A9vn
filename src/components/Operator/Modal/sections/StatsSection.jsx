import React, { useEffect, useMemo, useState } from "react";
import StatBar from "../../../UI/StatBar";

import characterTable from "../../../../data/operators/character_table.json";
import itemTable from "../../../../data/operators/item_table.json";
import rangeTable from "../../../../data/range_table.json";
import potVN from "../../../../data/operators/pot_vn.json";
import nameVN from "../../../../data/operators/name_vn.json";

import { getOperatorCharId } from "../../../../utils/operatorAvatar";

/** Icons */
const UI_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/[uc]common/charattrdetail/";

const STAT_ICON = {
  maxHp: `${UI_ICON_BASE}icon_hp.png`,
  atk: `${UI_ICON_BASE}icon_atk.png`,
  def: `${UI_ICON_BASE}icon_def.png`,
  magicResistance: `${UI_ICON_BASE}icon_res.png`,
  respawnTime: `${UI_ICON_BASE}icon_time.png`,
  cost: `${UI_ICON_BASE}icon_cost.png`,
  blockCnt: `${UI_ICON_BASE}icon_block.png`,
  baseAttackTime: `${UI_ICON_BASE}icon_attack_speed.png`,
};

const RANGE_STAND = `${UI_ICON_BASE}attack_range_stand.png`;
const RANGE_ATTACK = `${UI_ICON_BASE}attack_range_attack.png`;

const ELITE_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/elite_hub/";

const POT_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/potential_hub/";

const getPotIcon = (idx1) => `${POT_ICON_BASE}potential_${idx1}_small.png`;

/** Materials (Promotion Requirements) */
const ITEM_BG_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/ui/[uc]home/mail/panel_mail_item/";
const ITEM_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/items/icons/";

const GOLD_ITEM_ID = "4001";

const getGoldCostForPromotion = (rarity, fromElite, toElite) => {
  const r = String(rarity || "");
  const key = `${fromElite}-${toElite}`;

  const map = {
    TIER_3: { "0-1": 10000 },
    TIER_4: { "0-1": 15000, "1-2": 60000 },
    TIER_5: { "0-1": 20000, "1-2": 120000 },
    TIER_6: { "0-1": 30000, "1-2": 180000 },
  };

  return Number(map?.[r]?.[key] || 0);
};

const getItemMeta = (itemId) => {
  const id = String(itemId || "");
  return itemTable?.items?.[id] || null;
};

const rarityToR = (rarity) => {
  const m = String(rarity || "").match(/TIER_(\d+)/);
  const n = m ? Number(m[1]) : 1;
  return Number.isFinite(n) ? n : 1;
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


/* Summon/Token */
const CHARAVATAR_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/charavatars/";
const SKILL_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/skills/";

const SUMMON_AVATAR_OVERRIDE = {
  token_10012_rosmon_shield: `${SKILL_ICON_BASE}skill_icon_sktok_rosmon.png`,
};

const SUMMON_SKILL_ICON_OVERRIDE = {
  token_10005_mgllan_drone1: "skill_icon_skchr_mgllan_1",
  token_10005_mgllan_drone2: "skill_icon_skchr_mgllan_2",
  token_10005_mgllan_drone3: "skill_icon_skchr_mgllan_3",
};

const tokenToSkillIconKey = (tokenId) => {
  const t = String(tokenId || "");
  if (!t.startsWith("token_")) return null;

  if (SUMMON_SKILL_ICON_OVERRIDE[t]) return SUMMON_SKILL_ICON_OVERRIDE[t];

  return `skill_icon_sktok_${t.replace(/^token_\d+_/, "")}`;
};

const getSummonAvatarUrl = (tokenId) => {
  const tid = String(tokenId || "");
  if (!tid) return "";
  if (SUMMON_AVATAR_OVERRIDE[tid]) return SUMMON_AVATAR_OVERRIDE[tid];
  return `${CHARAVATAR_BASE}${tid}.png`;
};

const getSummonSkillIconUrl = (tokenId) => {
  const key = tokenToSkillIconKey(tokenId);
  if (!key) return "";
  return `${SKILL_ICON_BASE}${key}.png`;
};

const POSITION_VN = {
  ALL: "Toàn bộ",
  RANGED: "Trên cao",
  MELEE: "Mặt đất",
};

const ATTR_TYPE_TO_STAT = {
  COST: "cost",
  ATK: "atk",
  RESPAWN_TIME: "respawnTime",
  MAX_HP: "maxHp",
  DEF: "def",
  MAGIC_RESISTANCE: "magicResistance",
};

const clamp = (v, min, max) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
};

const formatNumber = (n, { decimals = 0, suffix = "" } = {}) => {
  const x = Number(n);
  if (!Number.isFinite(x)) return "—";
  return `${x.toFixed(decimals)}${suffix}`;
};

const formatNumberTrim = (n, { maxDecimals = 2, suffix = "" } = {}) => {
  const x = Number(n);
  if (!Number.isFinite(x)) return "—";

  let s = x.toFixed(maxDecimals);
  if (maxDecimals > 0) {
    s = s.replace(/\.?0+$/, "");
  }
  return `${s}${suffix}`;
};

const formatSecondsTrim = (n, { maxDecimals = 2 } = {}) =>
  formatNumberTrim(n, { maxDecimals, suffix: "s" });

const fmtInt = (n) => formatNumber(n, { decimals: 0 });

const lerp = (a, b, t) => a + (b - a) * t;

function interpolateAttributes(frames, level) {
  if (!Array.isArray(frames) || frames.length === 0) return null;

  const sorted = [...frames].sort((a, b) => (a.level ?? 0) - (b.level ?? 0));
  const lv = Number(level);

  if (lv <= sorted[0].level) return sorted[0].data;
  if (lv >= sorted[sorted.length - 1].level)
    return sorted[sorted.length - 1].data;

  for (let i = 0; i < sorted.length - 1; i++) {
    const A = sorted[i];
    const B = sorted[i + 1];
    if (lv >= A.level && lv <= B.level) {
      const t = (lv - A.level) / (B.level - A.level);

      const out = { ...A.data };
      Object.keys(B.data || {}).forEach((k) => {
        const av = A.data?.[k];
        const bv = B.data?.[k];
        if (typeof av === "number" && typeof bv === "number")
          out[k] = lerp(av, bv, t);
        else out[k] = av ?? bv;
      });
      return out;
    }
  }

  return sorted[0].data;
}

function normalizePotMap(potJson) {
  if (Array.isArray(potJson)) return potJson;
  if (potJson && Array.isArray(potJson.potentialRanks))
    return potJson.potentialRanks;
  return [];
}

function translatePotentialDesc(desc, potMap) {
  if (!desc) return desc;

  const rows = [...(potMap || [])]
    .filter((r) => r?.pot)
    .sort((a, b) => String(b.pot).length - String(a.pot).length);

  let out = String(desc);
  for (const row of rows) {
    const from = String(row.pot);
    const to = String(row.pot_vn || row.pot);
    if (!from) continue;
    out = out.split(from).join(to);
  }
  return out;
}

function extractAttributeModifiers(potentialRank) {
  const mods = potentialRank?.buff?.attributes?.attributeModifiers;
  return Array.isArray(mods) ? mods : [];
}

function buildEmptyDeltas() {
  return {
    maxHp: [],
    atk: [],
    def: [],
    magicResistance: [],
    respawnTime: [],
    cost: [],
    blockCnt: [],
    baseAttackTime: [],
  };
}

function ValueWithDeltas({ value, deltas, formatter }) {
  const fmt = formatter || ((v) => String(v));
  const base = fmt(value);

  return (
    <span className="whitespace-nowrap ml-auto text-sm font-semibold text-white tabular-nums">
      {base}
      {Array.isArray(deltas) &&
        deltas
          .filter((d) => Number(d) !== 0 && Number.isFinite(Number(d)))
          .map((d, idx) => (
            <span key={idx} className="ml-1 text-sm font-semibold text-cyan-400 tabular-nums">
              ({d > 0 ? "+" : ""}
              {fmt(d)})
            </span>
          ))}
    </span>
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
                />
              ) : isAttack ? (
                <img
                  src={RANGE_ATTACK}
                  alt="atk"
                  className="w-[14px] h-[14px] object-contain"
                />
              ) : null}
            </div>
          );
        });
      })}
    </div>
  );
}

function getMaxLevelForPhase(phase) {
  if (!phase) return 1;
  const m = phase?.maxLevel;
  if (Number.isFinite(Number(m)) && Number(m) > 0) return Number(m);

  const frames = phase?.attributesKeyFrames;
  if (Array.isArray(frames) && frames.length > 0) {
    const last = frames.reduce(
      (acc, it) => (it.level > acc ? it.level : acc),
      1
    );
    return last;
  }
  return 1;
}

function hasAnyScalingInPhases(phases) {
  if (!Array.isArray(phases) || phases.length === 0) return false;

  const statKeys = [
    "maxHp",
    "atk",
    "def",
    "magicResistance",
    "respawnTime",
    "cost",
    "blockCnt",
    "baseAttackTime",
  ];

  for (const p of phases) {
    const maxLv = getMaxLevelForPhase(p);
    const a1 = interpolateAttributes(p?.attributesKeyFrames, 1);
    const a2 = interpolateAttributes(p?.attributesKeyFrames, maxLv);

    if (!a1 || !a2) continue;

    const changed = statKeys.some((k) => Number(a1[k]) !== Number(a2[k]));
    if (changed) return true;
  }

  const baseList = phases
    .map((p) => interpolateAttributes(p?.attributesKeyFrames, 1))
    .filter(Boolean);

  for (let i = 1; i < baseList.length; i++) {
    const prev = baseList[i - 1];
    const cur = baseList[i];
    const changed = statKeys.some((k) => Number(prev[k]) !== Number(cur[k]));
    if (changed) return true;
  }

  return false;
}

function MaterialIcon({ itemId, count }) {
  const meta = getItemMeta(itemId);

  const name = meta?.name || String(itemId || "Unknown");
  const bgUrl = getItemBgUrl(meta?.rarity);
  const iconUrl = getItemIconUrl(meta?.iconId);

  const INNER = 48;
  const BG_SCALE = 1.42;
  const ICON_SCALE = 1.22;
  const PAD = 4;

  const outer = Math.ceil(INNER * Math.max(BG_SCALE, ICON_SCALE)) + PAD * 2;

  return (
    <div
      className="relative shrink-0"
      style={{ width: outer, height: outer }}
      title={`${name} × ${count}`}
      aria-label={`${name} × ${count}`}
    >
      {/* Centered inner canvas */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative" style={{ width: INNER, height: INNER }}>
          {/* rarity background */}
          <img
            src={bgUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-contain origin-center"
            style={{ transform: `scale(${BG_SCALE})` }}
            draggable={false}
            loading="lazy"
          />

          {/* item icon (slightly larger) */}
          {iconUrl ? (
            <img
              src={iconUrl}
              alt={name}
              className="absolute inset-0 w-full h-full object-contain origin-center"
              style={{ transform: `scale(${ICON_SCALE})` }}
              draggable={false}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : null}
        </div>
      </div>

      {/* count */}
      <div className="absolute bottom-[2px] right-[2px] px-1.5 rounded bg-black/80 text-[13px] leading-[15px] font-bold text-white tabular-nums">
        {count}
      </div>
    </div>
  );
}



const StatsSection = ({ operator, charId: charIdProp }) => {
  const resolvedCharId = useMemo(() => {
    if (charIdProp) return String(charIdProp);
    const fromOp = getOperatorCharId?.(operator);
    return fromOp ? String(fromOp) : "";
  }, [charIdProp, operator]);

  const charData = useMemo(() => {
    if (!resolvedCharId) return null;
    return characterTable?.[resolvedCharId] || null;
  }, [resolvedCharId]);

  const phases = useMemo(() => {
    const arr = charData?.phases;
    if (!Array.isArray(arr)) return [];
    return arr.slice(0, 3);
  }, [charData]);

  // Promotion Requirements: only use phases[i].evolveCost (i>0)
  const promotionReqs = useMemo(() => {
    if (!Array.isArray(phases) || phases.length <= 1) return [];

    const out = [];
    for (let i = 1; i < phases.length; i++) {
      const from = i - 1;
      const to = i;

      const raw = phases[i]?.evolveCost;

      const materialCosts = Array.isArray(raw)
        ? raw.filter((c) => c?.type === "MATERIAL" && c?.id && Number(c?.count) > 0)
        : [];

      const goldCost = getGoldCostForPromotion(charData?.rarity, from, to);

      const merged = [...materialCosts];

      if (goldCost > 0) {
        const hasGold = merged.some((c) => String(c?.id) === GOLD_ITEM_ID);
        if (!hasGold) {
          merged.unshift({ id: GOLD_ITEM_ID, count: goldCost, type: "MATERIAL" });
        }
      }

      if (merged.length === 0) continue;

      out.push({ from, to, costs: merged });
    }

    return out;
  }, [phases, charData?.rarity]);


  const [phaseIndex, setPhaseIndex] = useState(0);
  const [level, setLevel] = useState(1);
  const [levelDraft, setLevelDraft] = useState("1");
  const [isEditingLevel, setIsEditingLevel] = useState(false);

  useEffect(() => {
    setPhaseIndex(0);
    setLevel(1);
    setIsEditingLevel(false);
    setLevelDraft("1");
  }, [resolvedCharId]);

  const currentPhase = phases[phaseIndex];
  const maxLevel = useMemo(
    () => getMaxLevelForPhase(currentPhase),
    [currentPhase]
  );

  useEffect(() => {
    setLevel((lv) => clamp(lv, 1, maxLevel));
  }, [maxLevel]);

  const safeLevel = clamp(level, 1, maxLevel);
  const levelPct = useMemo(() => {
    if (maxLevel <= 1) return 0;
    return ((safeLevel - 1) / (maxLevel - 1)) * 100;
  }, [safeLevel, maxLevel]);

  const commitLevelDraft = () => {
    const n = Number.parseInt(levelDraft, 10);

    if (!Number.isFinite(n)) {
      setLevelDraft(String(safeLevel));
      return;
    }

    const next = clamp(n, 1, maxLevel);
    setLevel(next);
    setLevelDraft(String(next));
  };

  useEffect(() => {
    if (!isEditingLevel) setLevelDraft(String(safeLevel));
  }, [safeLevel, isEditingLevel]);

  // Trust
  const trustFrame = useMemo(() => {
    const frames = charData?.favorKeyFrames;
    if (!Array.isArray(frames) || frames.length === 0) return null;
    return frames[frames.length - 1];
  }, [charData]);

  const trustRows = useMemo(() => {
    const t = trustFrame?.data || {};
    const rows = [
      { label: "HP", v: Number(t.maxHp || 0) },
      { label: "ATK", v: Number(t.atk || 0) },
      { label: "DEF", v: Number(t.def || 0) },
      { label: "RES", v: Number(t.magicResistance || 0) },
    ];
    return rows.filter((r) => Number.isFinite(r.v) && r.v !== 0);
  }, [trustFrame]);

  const [useTrust, setUseTrust] = useState(false);

  // Potentials
  const potMap = useMemo(() => normalizePotMap(potVN), []);
  const ranks = useMemo(
    () => (Array.isArray(charData?.potentialRanks) ? charData.potentialRanks : []),
    [charData]
  );

  const [usePotentials, setUsePotentials] = useState(false);

  useEffect(() => {
    setUsePotentials(false);
    setUseTrust(false);
  }, [resolvedCharId]);

  // Summon / Token 
  const summonOptions = useMemo(() => {
    if (!charData) return [];

    const out = [];
    const pushUniqueIfValid = (tokenId, meta = {}) => {
      const tid = String(tokenId || "");
      if (!tid.startsWith("token_")) return;
      if (!characterTable?.[tid]) return;
      if (out.some((x) => x.tokenId === tid)) return;

      const tokenChar = characterTable[tid];
      const tokenPhases = Array.isArray(tokenChar?.phases) ? tokenChar.phases : [];
      if (!hasAnyScalingInPhases(tokenPhases)) return;

      out.push({
        tokenId: tid,
        skillIndex: meta.skillIndex ?? null,
      });
    };

    const skillsArr = Array.isArray(charData?.skills) ? charData.skills : [];
    skillsArr.forEach((s, idx) => {
      if (s?.overrideTokenKey) pushUniqueIfValid(s.overrideTokenKey, { skillIndex: idx + 1 });
    });

    const tokenDict = charData?.displayTokenDict;
    if (tokenDict && typeof tokenDict === "object") {
      Object.keys(tokenDict).forEach((k) => pushUniqueIfValid(k));
    }

    return out;
  }, [charData]);

  const [summonIndex, setSummonIndex] = useState(0);

  useEffect(() => {
    setSummonIndex(0);
  }, [resolvedCharId]);

  useEffect(() => {
    if (summonIndex >= summonOptions.length) setSummonIndex(0);
  }, [summonIndex, summonOptions.length]);

  const selectedSummon = summonOptions[summonIndex] || null;

  const summonCharData = useMemo(() => {
    if (!selectedSummon?.tokenId) return null;
    return characterTable?.[selectedSummon.tokenId] || null;
  }, [selectedSummon]);

  const summonPhases = useMemo(() => {
    const arr = summonCharData?.phases;
    if (!Array.isArray(arr)) return [];
    return arr.slice(0, 3);
  }, [summonCharData]);

  const summonPhaseIndex = useMemo(() => {
    if (summonPhases.length === 0) return 0;
    return clamp(phaseIndex, 0, summonPhases.length - 1);
  }, [phaseIndex, summonPhases.length]);

  const summonPhase = summonPhases[summonPhaseIndex];
  const summonMaxLevel = useMemo(
    () => getMaxLevelForPhase(summonPhase),
    [summonPhase]
  );

  const summonLevel = useMemo(
    () => clamp(safeLevel, 1, summonMaxLevel),
    [safeLevel, summonMaxLevel]
  );

  const summonStats = useMemo(() => {
    if (!summonPhase) return null;

    const base = interpolateAttributes(summonPhase?.attributesKeyFrames, summonLevel);
    if (!base) return null;

    return {
      maxHp: base.maxHp,
      atk: base.atk,
      def: base.def,
      magicResistance: base.magicResistance,
      respawnTime: base.respawnTime,
      cost: base.cost,
      blockCnt: base.blockCnt,
      baseAttackTime: base.baseAttackTime,
    };
  }, [summonPhase, summonLevel]);

  const summonNameVNRow = useMemo(() => {
    const tid = selectedSummon?.tokenId;
    if (!tid) return null;
    return nameVN?.[tid] || null;
  }, [selectedSummon]);

  const summonDisplayName = useMemo(() => {
    const vnName = summonNameVNRow?.name_vn;
    if (vnName) return vnName;
    return summonCharData?.name || selectedSummon?.tokenId || "";
  }, [summonNameVNRow, summonCharData, selectedSummon]);

  const summonDisplayDesc = useMemo(() => {
    const vnDesc = summonNameVNRow?.Descripton;
    if (vnDesc) return vnDesc;
    return summonCharData?.description || "";
  }, [summonNameVNRow, summonCharData]);

  const summonPositionVN = useMemo(() => {
    const pos = summonCharData?.position;
    return POSITION_VN[pos] || pos || "—";
  }, [summonCharData]);

  const computed = useMemo(() => {
    if (!currentPhase) return null;

    const base = interpolateAttributes(currentPhase.attributesKeyFrames, safeLevel);
    if (!base) return null;

    const deltas = buildEmptyDeltas();

    if (useTrust && trustFrame?.data) {
      const t = trustFrame.data;
      const pushIfNonZero = (k, v) => {
        const n = Number(v);
        if (!Number.isFinite(n) || n === 0) return;
        deltas[k].push(n);
      };
      pushIfNonZero("maxHp", t.maxHp);
      pushIfNonZero("atk", t.atk);
      pushIfNonZero("def", t.def);
      pushIfNonZero("magicResistance", t.magicResistance);
    }

    if (usePotentials && ranks.length > 0) {
      const sumByStat = {};

      ranks.forEach((r) => {
        const mods = extractAttributeModifiers(r);
        mods.forEach((m) => {
          const statKey = ATTR_TYPE_TO_STAT[m?.attributeType];
          if (!statKey) return;

          const v = Number(m.value);
          if (!Number.isFinite(v) || v === 0) return;

          sumByStat[statKey] = (sumByStat[statKey] || 0) + v;
        });
      });

      Object.entries(sumByStat).forEach(([statKey, sum]) => {
        if (!Number.isFinite(sum) || sum === 0) return;
        deltas[statKey].push(sum);
      });
    }

    const applyDeltas = (key, baseVal) => {
      const sum = (deltas[key] || []).reduce((a, b) => a + Number(b || 0), 0);
      return (Number(baseVal) || 0) + sum;
    };

    const stats = {
      maxHp: applyDeltas("maxHp", base.maxHp),
      atk: applyDeltas("atk", base.atk),
      def: applyDeltas("def", base.def),
      magicResistance: applyDeltas("magicResistance", base.magicResistance),

      respawnTime: applyDeltas("respawnTime", base.respawnTime),
      cost: applyDeltas("cost", base.cost),
      blockCnt: applyDeltas("blockCnt", base.blockCnt),
      baseAttackTime: applyDeltas("baseAttackTime", base.baseAttackTime),
    };

    return { stats, deltas };
  }, [currentPhase, safeLevel, ranks, trustFrame, useTrust, usePotentials]);

  const eliteButtons = useMemo(() => phases.map((_, idx) => idx), [phases]);

  const handleEliteChange = (i) => {
    const nextPhase = phases[i];
    const nextMax = getMaxLevelForPhase(nextPhase);
    setPhaseIndex(i);
    setLevel(nextMax);
    setIsEditingLevel(false);
    setLevelDraft(String(nextMax));
  };

  if (!resolvedCharId) {
    return (
      <div className="bg-[#1b1b1b] rounded-xl p-4 text-gray-200">
        <div className="text-sm text-white/70">
          No operator selected. (Bạn cần truyền <code>operator</code> hoặc{" "}
          <code>charId</code> vào StatsSection)
        </div>
      </div>
    );
  }

  if (!charData) {
    return (
      <div className="bg-[#1b1b1b] rounded-xl p-4 text-gray-200">
        <div className="text-sm text-white/70">
          Operator not found in character_table.json: <code>{resolvedCharId}</code>
        </div>
      </div>
    );
  }

  if (!computed) {
    return (
      <div className="bg-[#1b1b1b] rounded-xl p-4 text-gray-200">
        <div className="text-sm text-white/70">No stats data.</div>
      </div>
    );
  }

  const { stats, deltas } = computed;

  return (
    <div className="space-y-4">
      {/* TOP: Stats + Level */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stats */}
        <div className="bg-[#1b1b1b] rounded-xl p-4 text-gray-200 md:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Chỉ số cơ bản</h3>

          <div className="grid grid-cols-[1fr_10px_1fr] gap-3 items-start">
            {/* left */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={STAT_ICON.maxHp}
                  alt="hp"
                  className="w-5 h-5 object-contain"
                  draggable={false}
                />
                <div className="flex-1">
                  <StatBar
                    label="HP"
                    value={stats.maxHp}
                    max={6000}
                    displayValue={
                      <ValueWithDeltas
                        value={stats.maxHp}
                        deltas={deltas.maxHp}
                        formatter={(v) => fmtInt(v)}
                      />
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={STAT_ICON.atk}
                  alt="atk"
                  className="w-5 h-5 object-contain"
                  draggable={false}
                />
                <div className="flex-1">
                  <StatBar
                    label="ATK"
                    value={stats.atk}
                    max={2000}
                    displayValue={
                      <ValueWithDeltas
                        value={stats.atk}
                        deltas={deltas.atk}
                        formatter={(v) => fmtInt(v)}
                      />
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={STAT_ICON.def}
                  alt="def"
                  className="w-5 h-5 object-contain"
                  draggable={false}
                />
                <div className="flex-1">
                  <StatBar
                    label="DEF"
                    value={stats.def}
                    max={1000}
                    displayValue={
                      <ValueWithDeltas
                        value={stats.def}
                        deltas={deltas.def}
                        formatter={(v) => fmtInt(v)}
                      />
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={STAT_ICON.magicResistance}
                  alt="res"
                  className="w-5 h-5 object-contain"
                  draggable={false}
                />
                <div className="flex-1">
                  <StatBar
                    label="RES"
                    value={stats.magicResistance}
                    max={200}
                    displayValue={
                      <ValueWithDeltas
                        value={stats.magicResistance}
                        deltas={deltas.magicResistance}
                        formatter={(v) => formatNumber(v, { decimals: 0 })}
                      />
                    }
                  />
                </div>
              </div>
            </div>

            {/* divider */}
            <div className="h-full flex justify-center">
              <div className="w-px bg-white/10" />
            </div>

            {/* right */}
            <div className="space-y-2">
              {[
                {
                  icon: STAT_ICON.respawnTime,
                  label: "Thời gian tái triển khai",
                  value: (
                    <ValueWithDeltas
                      value={stats.respawnTime}
                      deltas={deltas.respawnTime}
                      formatter={(v) => formatNumber(v, { decimals: 0, suffix: "s" })}
                    />
                  ),
                },
                {
                  icon: STAT_ICON.cost,
                  label: "Phí",
                  value: (
                    <ValueWithDeltas
                      value={stats.cost}
                      deltas={deltas.cost}
                      formatter={(v) => fmtInt(v)}
                    />
                  ),
                },
                {
                  icon: STAT_ICON.blockCnt,
                  label: "Chặn",
                  value: (
                    <ValueWithDeltas
                      value={stats.blockCnt}
                      deltas={deltas.blockCnt}
                      formatter={(v) => fmtInt(v)}
                    />
                  ),
                },
                {
                  icon: STAT_ICON.baseAttackTime,
                  label: "Thời gian tấn công",
                  value: (
                    <ValueWithDeltas
                      value={stats.baseAttackTime}
                      deltas={deltas.baseAttackTime}
                      formatter={(v) => formatSecondsTrim(v, { maxDecimals: 2 })}
                    />
                  ),
                },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-2 min-h-[32px]">
                  <img
                    src={row.icon}
                    alt={row.label}
                    className="w-5 h-5 object-contain shrink-0"
                    draggable={false}
                  />

                  <div className="flex-1 flex items-center justify-between gap-3">
                    <div className="text-xs text-white/70 truncate">{row.label}</div>
                    <div className="ml-auto text-sm font-semibold text-white tabular-nums">
                      {row.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Level */}
        <div className="bg-[#1b1b1b] rounded-xl p-4 text-gray-200">
          <h3 className="text-lg font-semibold text-white mb-4">Cấp</h3>

          <div className="flex items-center justify-center gap-2 mb-4">
            {eliteButtons.map((i) => {
              const active = i === phaseIndex;
              const src = `${ELITE_ICON_BASE}elite_${i}_large.png`;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleEliteChange(i)}
                  className={`rounded-lg p-1.5 transition ${
                    active ? "bg-emerald-600" : "bg-white/10 hover:bg-white/20"
                  }`}
                  title={`E${i}`}
                >
                  <img
                    src={src}
                    alt={`E${i}`}
                    className="w-10 h-10 object-contain"
                    draggable={false}
                  />
                </button>
              );
            })}
          </div>

          {/* Slider */}
          <div className="mt-2 -mx-3 px-3">
            <div className="flex items-center justify-between text-xs text-white/60 mb-2">
              <span>1</span>
              <span>Cấp tối đa {maxLevel}</span>
            </div>

            <input
              type="range"
              min={1}
              max={maxLevel}
              step={1}
              value={safeLevel}
              onChange={(e) => {
                const next = clamp(e.target.value, 1, maxLevel);
                setIsEditingLevel(false);
                setLevel(next);
                setLevelDraft(String(next));
              }}
              className="level-slider w-full"
              style={{ "--pct": `${levelPct}%` }}
            />

            <div className="mt-2 text-center text-xs text-white/70">
              Hiện tại:{" "}
              {isEditingLevel ? (
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoFocus
                  value={levelDraft}
                  onChange={(e) => {
                    const onlyDigits = e.target.value.replace(/[^\d]/g, "");
                    setLevelDraft(onlyDigits);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setIsEditingLevel(false);
                      commitLevelDraft();
                      e.currentTarget.blur();
                    } else if (e.key === "Escape") {
                      setIsEditingLevel(false);
                      setLevelDraft(String(safeLevel));
                      e.currentTarget.blur();
                    }
                  }}
                  onBlur={() => {
                    setIsEditingLevel(false);
                    if (!levelDraft) {
                      setLevelDraft(String(safeLevel));
                      return;
                    }
                    commitLevelDraft();
                  }}
                  placeholder={String(safeLevel)}
                  className="inline-block w-16 px-2 py-1 text-center
                            rounded-md bg-white/10 border border-white/20
                            text-white font-semibold outline-none
                            focus:bg-white/15 focus:border-white/40"
                />
              ) : (
                <button
                  type="button"
                  title="Bấm để nhập cấp"
                  onClick={() => {
                    setIsEditingLevel(true);
                    setLevelDraft("");
                  }}
                  className="inline-flex items-center justify-center w-16 px-2 py-1
                            rounded-md bg-white/10 border border-white/20
                            text-white font-semibold
                            hover:bg-white/15 hover:border-white/30 transition"
                >
                  {safeLevel}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      

      {/* ROW: Range / Trust / Potentials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Range */}
        <div className="bg-[#1b1b1b] rounded-xl p-4 text-gray-200 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-white">Phạm vi</h3>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <RangeGrid rangeId={currentPhase?.rangeId} />
          </div>
        </div>

        {/* Trust */}
        <div className="bg-[#1b1b1b] rounded-xl p-4 text-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-white">Tin tưởng</h3>

            <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useTrust}
                onChange={(e) => setUseTrust(e.target.checked)}
                className="accent-emerald-500"
              />
              Apply
            </label>
          </div>

          {trustFrame?.data ? (
            trustRows.length > 0 ? (
              <div className="space-y-1 text-sm">
                {trustRows.map((r) => (
                  <div key={r.label} className="flex items-center justify-between">
                    <span className="text-white/70">{r.label}</span>
                    <span className="ml-auto text-sm font-semibold text-emerald-400 tabular-nums">
                      {r.v > 0 ? "+" : ""}
                      {fmtInt(r.v)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-white/60">Không có data</div>
            )
          ) : (
            <div className="text-sm text-white/60">No trust data.</div>
          )}
        </div>

        {/* Potentials */}
        <div className="bg-[#1b1b1b] rounded-xl p-4 text-gray-200">
          <div className="flex items-start justify-between mb-3 gap-3">
            <h3 className="text-base font-semibold text-white">Tiềm năng</h3>

            <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={usePotentials}
                onChange={(e) => setUsePotentials(e.target.checked)}
                className="accent-emerald-500"
              />
              Apply
            </label>
          </div>

          {ranks.length > 0 ? (
            <div className="space-y-2">
              {ranks.map((r, idx) => {
                const desc = r?.description || "";
                const vn = translatePotentialDesc(desc, potMap) || desc;

                const mods = extractAttributeModifiers(r);
                const isApplicable = mods.some((m) => !!ATTR_TYPE_TO_STAT[m?.attributeType]);

                const active = usePotentials && isApplicable;

                return (
                  <div
                    key={idx}
                    className={`text-sm leading-snug flex items-start gap-2 ${
                      active ? "text-white/90" : "text-white/80"
                    }`}
                  >
                    {idx < 5 ? (
                      <img
                        src={getPotIcon(idx + 1)}
                        alt={`pot-${idx + 1}`}
                        className="w-5 h-5 mt-[1px] object-contain shrink-0"
                        draggable={false}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-5 h-5 shrink-0" />
                    )}

                    <div className="min-w-0">{vn}</div>

                    {active && (
                      <div className="ml-auto mt-[3px] w-2.5 h-2.5 rounded-full bg-emerald-400 shadow shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-white/60">Không có data</div>
          )}
        </div>
      </div>

      {/* Summon / Token */}
      {summonOptions.length > 0 && selectedSummon && summonCharData && summonStats ? (
        <div className="bg-[#1b1b1b] rounded-xl p-4 text-gray-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold text-white">Vật phẩm triệu hồi</h3>
              <p className="mt-1 text-xs text-white/60">
                Chỉ những vật phẩm thay đổi chỉ số mới có ở đây, còn lại sẽ nằm ở phần kỹ năng
              </p>
            </div>

            {summonOptions.length > 1 && (
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {summonOptions.map((opt, idx) => {
                  const active = idx === summonIndex;
                  const skillLabel = `Skill ${opt.skillIndex ?? idx + 1}`;
                  const icon = getSummonSkillIconUrl(opt.tokenId) || getSummonAvatarUrl(opt.tokenId);

                  return (
                    <button
                      key={opt.tokenId}
                      type="button"
                      onClick={() => setSummonIndex(idx)}
                      title={skillLabel}
                      className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition ${
                        active ? "bg-emerald-600" : "bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      <img
                        src={icon}
                        alt={skillLabel}
                        className="w-7 h-7 object-contain shrink-0"
                        draggable={false}
                        loading="lazy"
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (img?.dataset?.fallback === "1") return;
                          img.dataset.fallback = "1";
                          img.src = getSummonAvatarUrl(opt.tokenId);
                        }}
                      />
                      <span className="text-xs text-white/90 whitespace-nowrap">{skillLabel}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Header: avatar + basic info */}
          <div className="mt-3 flex items-start gap-3">
            <img
              src={getSummonAvatarUrl(selectedSummon.tokenId)}
              alt=""
              className="w-14 h-14 rounded-lg bg-white/5 object-contain shrink-0"
              draggable={false}
              loading="lazy"
            />

            <div className="min-w-0">
              <div className="text-base font-semibold text-white truncate">
                {summonDisplayName}
              </div>

              <div className="text-xs text-white/70 mt-0.5">
                Vị trí: <span className="text-white/90">{summonPositionVN}</span>
              </div>

              {!!summonDisplayDesc && (
                <div className="text-xs text-white/70 mt-1 whitespace-pre-wrap">
                  {summonDisplayDesc}
                </div>
              )}
            </div>
          </div>

          {/* divider */}
          <div className="h-px bg-white/10 my-4" />

          {/* Range + Stats */}
          <div className="mt-1 flex flex-col md:flex-row md:items-stretch gap-4 md:gap-0">
            {/* Range */}
            <div className="md:w-1/3 flex flex-col">
              <div className="text-base font-semibold text-white mb-2">Phạm vi</div>

              <div className="flex-1 flex items-center justify-center">
                <RangeGrid rangeId={summonPhase?.rangeId} />
              </div>
            </div>

            {/* divider */}
            <div className="hidden md:flex px-4">
              <div className="w-px bg-white/10 self-stretch" />
            </div>

            {/* mobile divider */}
            <div className="md:hidden">
              <div className="h-px bg-white/10 my-2" />
            </div>

            {/* Stats */}
            <div className="md:flex-1 flex flex-col">
              <div className="text-base font-semibold text-white mb-2">Chỉ số cơ bản</div>

              <div className="grid grid-cols-[1fr_10px_1fr] gap-3 items-start">
                {/* left */}
                <div className="space-y-2">
                  {[
                    {
                      icon: STAT_ICON.maxHp,
                      label: "HP",
                      value: fmtInt(summonStats.maxHp),
                    },
                    {
                      icon: STAT_ICON.atk,
                      label: "ATK",
                      value: fmtInt(summonStats.atk),
                    },
                    {
                      icon: STAT_ICON.def,
                      label: "DEF",
                      value: fmtInt(summonStats.def),
                    },
                    {
                      icon: STAT_ICON.magicResistance,
                      label: "RES",
                      value: fmtInt(summonStats.magicResistance),
                    },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-2 min-h-[32px]">
                      <img
                        src={row.icon}
                        alt={row.label}
                        className="w-5 h-5 object-contain shrink-0"
                        draggable={false}
                        loading="lazy"
                      />

                      <div className="flex-1 flex items-center justify-between gap-3">
                        <div className="text-xs text-white/70 truncate">{row.label}</div>
                        <div className="ml-auto text-sm font-semibold text-white tabular-nums">
                          {row.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* divider */}
                <div className="h-full flex justify-center">
                  <div className="w-px bg-white/10" />
                </div>

                {/* right */}
                <div className="space-y-2">
                  {[
                    {
                      icon: STAT_ICON.respawnTime,
                      label: "Thời gian hồi",
                      value: formatNumber(summonStats.respawnTime, { decimals: 0, suffix: "s" }),
                    },
                    {
                      icon: STAT_ICON.cost,
                      label: "Phí",
                      value: fmtInt(summonStats.cost),
                    },
                    {
                      icon: STAT_ICON.blockCnt,
                      label: "Chặn",
                      value: fmtInt(summonStats.blockCnt),
                    },
                    {
                      icon: STAT_ICON.baseAttackTime,
                      label: "Thời gian tấn công",
                      value: formatSecondsTrim(summonStats.baseAttackTime, { maxDecimals: 2 }),
                    },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-2 min-h-[32px]">
                      <img
                        src={row.icon}
                        alt={row.label}
                        className="w-5 h-5 object-contain shrink-0 opacity-90"
                        draggable={false}
                        loading="lazy"
                      />

                      <div className="flex-1 flex items-center justify-between gap-3">
                        <div className="text-xs text-white/70 truncate">{row.label}</div>
                        <div className="ml-auto text-sm font-semibold text-white tabular-nums">
                          {row.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Promotion Requirements */}
      {promotionReqs.length > 0 ? (
        <div className="bg-[#1b1b1b] rounded-xl p-4 text-gray-200">
          <h3 className="text-lg font-semibold text-white mb-2">Điều kiện thăng tiến</h3>

          <div className="space-y-3">
            {promotionReqs.map((req) => {
              const fromLabel = `E${req.from}`;
              const toLabel = `E${req.to}`;
              const fromIcon = `${ELITE_ICON_BASE}elite_${req.from}_large.png`;
              const toIcon = `${ELITE_ICON_BASE}elite_${req.to}_large.png`;

              return (
                <div
                  key={`${req.from}-${req.to}`}
                  className="rounded-lg bg-white/5 p-3 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex flex-col items-center">
                      <img
                        src={fromIcon}
                        alt={fromLabel}
                        className="w-12 h-12 object-contain"
                        draggable={false}
                        loading="lazy"
                      />
                      <div className="mt-1 text-[13px] leading-[15px] font-semibold text-white/70">
                        Elite {req.from}
                      </div>
                    </div>

                    <span className="text-white/40">→</span>

                    <div className="flex flex-col items-center">
                      <img
                        src={toIcon}
                        alt={toLabel}
                        className="w-12 h-12 object-contain"
                        draggable={false}
                        loading="lazy"
                      />
                      <div className="mt-1 text-[13px] leading-[15px] font-semibold text-white/70">
                        Elite {req.to}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    {req.costs?.map((c, idx) => (
                      <MaterialIcon key={`${c.id}-${idx}`} itemId={c.id} count={c.count} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default StatsSection;
