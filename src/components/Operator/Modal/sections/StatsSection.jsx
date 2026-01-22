import React, { useEffect, useMemo, useState } from "react";
import StatBar from "../../../UI/StatBar";

import characterTable from "../../../../data/operators/character_table.json";
import rangeTable from "../../../../data/range_table.json";
import potVN from "../../../../data/operators/pot_vn.json";

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

const fmtInt = (n) => formatNumber(n, { decimals: 0 });
const lerp = (a, b, t) => a + (b - a) * t;

/** interpolate by attributesKeyFrames */
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
        if (typeof av === "number" && typeof bv === "number") out[k] = lerp(av, bv, t);
        else out[k] = av ?? bv;
      });
      return out;
    }
  }

  return sorted[0].data;
}

function normalizePotMap(potJson) {
  if (Array.isArray(potJson)) return potJson;
  if (potJson && Array.isArray(potJson.potentialRanks)) return potJson.potentialRanks;
  return [];
}

function translatePotentialDesc(desc, potMap) {
  if (!desc) return desc;
  const sorted = [...potMap]
    .filter((r) => r?.pot && typeof r.pot_vn === "string")
    .sort((a, b) => b.pot.length - a.pot.length);

  let out = desc;

  for (const row of sorted) {
    if (out.includes(row.pot)) {
      out = out.split(row.pot).join(row.pot_vn);
    }
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
    <span className="whitespace-nowrap">
      {base}
      {Array.isArray(deltas) &&
        deltas
          .filter((d) => Number(d) !== 0 && Number.isFinite(Number(d)))
          .map((d, idx) => (
            <span key={idx} className="ml-1 text-cyan-400">
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
                <img src={RANGE_STAND} alt="stand" className="w-[14px] h-[14px] object-contain" />
              ) : isAttack ? (
                <img src={RANGE_ATTACK} alt="atk" className="w-[14px] h-[14px] object-contain" />
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
    const last = frames.reduce((acc, it) => (it.level > acc ? it.level : acc), 1);
    return last;
  }
  return 1;
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

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    setPhaseIndex(0);
    setLevel(1);
  }, [resolvedCharId]);

  const currentPhase = phases[phaseIndex];
  const maxLevel = useMemo(() => getMaxLevelForPhase(currentPhase), [currentPhase]);

  useEffect(() => {
    setLevel((lv) => clamp(lv, 1, maxLevel));
  }, [maxLevel]);

  const safeLevel = clamp(level, 1, maxLevel);

  // Trust
  const trustFrame = useMemo(() => {
    const frames = charData?.favorKeyFrames;
    if (!Array.isArray(frames) || frames.length === 0) return null;
    return frames[frames.length - 1];
  }, [charData]);

  const [useTrust, setUseTrust] = useState(false);

  const trustRows = useMemo(() => {
    const t = trustFrame?.data || {};
    const rows = [
      { label: "HP", v: Number(t.maxHp || 0) },
      { label: "ATK", v: Number(t.atk || 0) },
      { label: "DEF", v: Number(t.def || 0) },
    ];
    return rows.filter((r) => Number.isFinite(r.v) && r.v !== 0);
  }, [trustFrame]);

  // Potentials
  const potMap = useMemo(() => normalizePotMap(potVN), []);
  const ranks = useMemo(
    () => (Array.isArray(charData?.potentialRanks) ? charData.potentialRanks : []),
    [charData]
  );

  const maxPotentialSelectable = useMemo(() => {
    const mp = Number(charData?.maxPotentialLevel);
    const maxByData = Number.isFinite(mp) && mp > 0 ? mp : ranks.length;
    return Math.min(ranks.length, maxByData);
  }, [charData, ranks.length]);

  const [usePotentials, setUsePotentials] = useState(false);
  const [potentialLevel, setPotentialLevel] = useState(0);

  useEffect(() => {
    setUsePotentials(false);
    setPotentialLevel(0);
    setUseTrust(false);
  }, [resolvedCharId]);

  useEffect(() => {
    setPotentialLevel((lv) => clamp(lv, 0, maxPotentialSelectable));
  }, [maxPotentialSelectable]);

  const computed = useMemo(() => {
    if (!currentPhase) return null;

    const base = interpolateAttributes(currentPhase.attributesKeyFrames, safeLevel);
    if (!base) return null;

    const deltas = buildEmptyDeltas();

    // Trust deltas
    if (useTrust && trustFrame?.data) {
      const t = trustFrame.data;
      if (t.maxHp) deltas.maxHp.push(t.maxHp);
      if (t.atk) deltas.atk.push(t.atk);
      if (t.def) deltas.def.push(t.def);
      if (t.magicResistance) deltas.magicResistance.push(t.magicResistance);
    }

    // Potentials deltas
    if (usePotentials && potentialLevel > 0) {
      const limit = Math.min(potentialLevel, ranks.length);
      for (let idx = 0; idx < limit; idx++) {
        const r = ranks[idx];
        const mods = extractAttributeModifiers(r);
        mods.forEach((m) => {
          const statKey = ATTR_TYPE_TO_STAT[m?.attributeType];
          if (!statKey) return;
          const v = Number(m?.value);
          if (!Number.isFinite(v) || v === 0) return;
          deltas[statKey].push(v);
        });
      }
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
  }, [
    currentPhase,
    safeLevel,
    ranks,
    trustFrame,
    useTrust,
    usePotentials,
    potentialLevel,
  ]);

  const eliteButtons = useMemo(() => phases.map((_, idx) => idx), [phases]);

  const handleEliteChange = (i) => {
    const nextPhase = phases[i];
    const nextMax = getMaxLevelForPhase(nextPhase);
    setPhaseIndex(i);
    setLevel(nextMax);
  };

  const handlePickPotentialLevel = (idx1, isApplicable) => {
    if (!isApplicable) return;
    const next = potentialLevel === idx1 ? 0 : idx1;
    setPotentialLevel(next);
  };

  const handleTogglePotentialsApply = (checked) => {
    setUsePotentials(checked);
    if (checked) {
      setPotentialLevel((lv) => (lv > 0 ? lv : maxPotentialSelectable));
    }
  };

  if (!resolvedCharId) {
    return (
      <div className="bg-[#1b1b1b] rounded-xl p-4 text-gray-200">
        <div className="text-sm text-white/70">
          No operator selected. (Bạn cần truyền <code>operator</code> hoặc <code>charId</code> vào StatsSection)
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
      {/* TOP: Stats (2/3) + Level (1/3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stats */}
        <div className="bg-[#1b1b1b] rounded-xl p-4 text-gray-200 md:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Chỉ số cơ bản</h3>

          <div className="grid grid-cols-[1fr_10px_1fr] gap-3 items-start">
            {/* left */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img src={STAT_ICON.maxHp} alt="hp" className="w-5 h-5 object-contain" draggable={false} />
                <div className="flex-1">
                  <StatBar
                    label="HP"
                    value={stats.maxHp}
                    max={6000}
                    displayValue={<ValueWithDeltas value={stats.maxHp} deltas={deltas.maxHp} formatter={(v) => fmtInt(v)} />}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <img src={STAT_ICON.atk} alt="atk" className="w-5 h-5 object-contain" draggable={false} />
                <div className="flex-1">
                  <StatBar
                    label="ATK"
                    value={stats.atk}
                    max={2000}
                    displayValue={<ValueWithDeltas value={stats.atk} deltas={deltas.atk} formatter={(v) => fmtInt(v)} />}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <img src={STAT_ICON.def} alt="def" className="w-5 h-5 object-contain" draggable={false} />
                <div className="flex-1">
                  <StatBar
                    label="DEF"
                    value={stats.def}
                    max={1000}
                    displayValue={<ValueWithDeltas value={stats.def} deltas={deltas.def} formatter={(v) => fmtInt(v)} />}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <img src={STAT_ICON.magicResistance} alt="res" className="w-5 h-5 object-contain" draggable={false} />
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
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <img src={STAT_ICON.respawnTime} alt="time" className="w-5 h-5 object-contain" draggable={false} />
                  <div className="text-xs text-white/70 truncate">Redeploy</div>
                </div>
                <div className="text-sm text-white">
                  <ValueWithDeltas
                    value={stats.respawnTime}
                    deltas={deltas.respawnTime}
                    formatter={(v) => formatNumber(v, { decimals: 0, suffix: "s" })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <img src={STAT_ICON.cost} alt="cost" className="w-5 h-5 object-contain" draggable={false} />
                  <div className="text-xs text-white/70 truncate">Cost</div>
                </div>
                <div className="text-sm text-white">
                  <ValueWithDeltas value={stats.cost} deltas={deltas.cost} formatter={(v) => fmtInt(v)} />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <img src={STAT_ICON.blockCnt} alt="block" className="w-5 h-5 object-contain" draggable={false} />
                  <div className="text-xs text-white/70 truncate">Block</div>
                </div>
                <div className="text-sm text-white">
                  <ValueWithDeltas value={stats.blockCnt} deltas={deltas.blockCnt} formatter={(v) => fmtInt(v)} />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <img src={STAT_ICON.baseAttackTime} alt="atk time" className="w-5 h-5 object-contain" draggable={false} />
                  <div className="text-xs text-white/70 truncate">ATK Time</div>
                </div>
                <div className="text-sm text-white">
                  <ValueWithDeltas
                    value={stats.baseAttackTime}
                    deltas={deltas.baseAttackTime}
                    formatter={(v) => formatNumber(v, { decimals: 1, suffix: "s" })}
                  />
                </div>
              </div>
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
                  className={`rounded-lg p-1.5 transition ${active ? "bg-emerald-600" : "bg-white/10 hover:bg-white/20"}`}
                  title={`E${i}`}
                >
                  <img src={src} alt={`E${i}`} className="w-10 h-10 object-contain" draggable={false} />
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setLevel((lv) => clamp(lv - 1, 1, maxLevel))}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
              title="-"
            >
              −
            </button>

            <div className="w-16 h-16 rounded-full bg-black/40 border border-white/10 flex items-center justify-center">
              <input
                type="number"
                min={1}
                max={maxLevel}
                value={safeLevel}
                onChange={(e) => setLevel(clamp(e.target.value, 1, maxLevel))}
                className="no-spin w-14 text-center bg-transparent outline-none text-white text-lg font-extrabold"
              />
            </div>

            <button
              type="button"
              onClick={() => setLevel((lv) => clamp(lv + 1, 1, maxLevel))}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
              title="+"
            >
              +
            </button>
          </div>

          <div className="mt-3 text-center text-xs text-white/60">Max Lv {maxLevel}</div>
        </div>
      </div>

      {/* ROW: Range / Trust / Potentials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Range */}
        <div className="bg-[#1b1b1b] rounded-xl p-4 text-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-white">Phạm vi</h3>
          </div>
          <div className="flex justify-center">
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
                    <span className="text-emerald-400">
                      {r.v > 0 ? "+" : ""}
                      {fmtInt(r.v)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-white/60">No trust buffs.</div>
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
                onChange={(e) => handleTogglePotentialsApply(e.target.checked)}
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

                const selected = potentialLevel > 0 && idx < potentialLevel;
                const active = usePotentials && selected && isApplicable;

                return (
                  <div
                    key={idx}
                    className={`text-sm leading-snug flex items-start gap-2 ${
                      isApplicable ? "cursor-pointer hover:text-white" : "cursor-default"
                    } ${active ? "text-white/90" : "text-white/80"}`}
                    onClick={() => handlePickPotentialLevel(idx + 1, isApplicable)}
                    title={isApplicable ? "Click to set potential level" : ""}
                    role={isApplicable ? "button" : undefined}
                    tabIndex={isApplicable ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (!isApplicable) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handlePickPotentialLevel(idx + 1, isApplicable);
                      }
                    }}
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
                      <div className="ml-auto mt-[3px] w-2.5 h-2.5 rounded-full shadow shrink-0 bg-emerald-400" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-white/60">No potential data.</div>
          )}
        </div>
      </div>

      {/* Promotion Requirements (frame only for now) */}
      <div className="bg-[#1b1b1b] rounded-xl p-4 text-gray-200">
        <h3 className="text-lg font-semibold text-white mb-2">Điều kiện thăng tiến</h3>
        <div className="text-sm text-white/60">evolveCost no info</div>
      </div>
    </div>
  );
};

export default StatsSection;
