import React, { useEffect, useMemo, useState } from "react";
import StatBar from "../../../UI/StatBar";

// Data
import characterTable from "../../../../data/operators/character_table.json";
import rangeTable from "../../../../data/range_table.json";
import potVN from "../../../../data/operators/pot_vn.json";

const UI_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/[uc]common/charattrdetail/";
const ELITE_ICON_BASE =
  "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/elite_hub/";

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

const RANGE_ICON = {
  stand: `${UI_ICON_BASE}attack_range_stand.png`,
  attack: `${UI_ICON_BASE}attack_range_attack.png`,
};

const ATTR_TYPE_TO_FIELD = {
  COST: "cost",
  ATK: "atk",
  RESPAWN_TIME: "respawnTime",
  MAX_HP: "maxHp",
  DEF: "def",
  MAGIC_RESISTANCE: "magicResistance",
};

function clamp(n, min, max) {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(x, max));
}

function formatNumber(n, { decimals = 0, suffix = "" } = {}) {
  const x = Number(n);
  if (!Number.isFinite(x)) return `0${suffix}`;
  const fixed = decimals > 0 ? x.toFixed(decimals) : String(Math.round(x));
  return `${fixed}${suffix}`;
}

function pickMaxFavorFrame(favorKeyFrames) {
  if (!Array.isArray(favorKeyFrames) || favorKeyFrames.length === 0) return null;
  return favorKeyFrames.reduce((best, cur) => {
    if (!best) return cur;
    return (cur?.level ?? 0) > (best?.level ?? 0) ? cur : best;
  }, null);
}

function interpolateAttrs(attributesKeyFrames, level) {
  if (!Array.isArray(attributesKeyFrames) || attributesKeyFrames.length === 0) return null;

  const frames = [...attributesKeyFrames].sort((a, b) => (a.level ?? 0) - (b.level ?? 0));
  const lv = Number(level);

  const first = frames[0];
  const last = frames[frames.length - 1];

  if (lv <= (first.level ?? 1)) return first.data || null;
  if (lv >= (last.level ?? lv)) return last.data || null;

  let left = first;
  let right = last;

  for (let i = 0; i < frames.length - 1; i++) {
    const a = frames[i];
    const b = frames[i + 1];
    if (lv >= (a.level ?? 0) && lv <= (b.level ?? 0)) {
      left = a;
      right = b;
      break;
    }
  }

  const l0 = Number(left.level ?? 1);
  const l1 = Number(right.level ?? l0);
  const t = l1 === l0 ? 0 : (lv - l0) / (l1 - l0);

  const d0 = left.data || {};
  const d1 = right.data || {};

  const out = {};
  const keys = new Set([...Object.keys(d0), ...Object.keys(d1)]);

  for (const k of keys) {
    const v0 = d0[k];
    const v1 = d1[k];

    if (typeof v0 === "number" && typeof v1 === "number") {
      out[k] = v0 + (v1 - v0) * t;
    } else if (typeof v0 === "number" && typeof v1 !== "number") {
      out[k] = v0;
    } else if (typeof v1 === "number" && typeof v0 !== "number") {
      out[k] = v1;
    }
    // booleans/others ignored for stats section
  }

  return out;
}

function buildPotMap(potData) {
  const arr = potData?.potentialRanks;
  if (!Array.isArray(arr)) return {};
  const map = {};
  for (const item of arr) {
    if (item?.pot && item?.pot_vn) map[String(item.pot)] = String(item.pot_vn);
  }
  return map;
}

function translatePotentialDesc(desc, potMap) {
  let out = String(desc || "");
  for (const [zh, vn] of Object.entries(potMap)) {
    if (!zh) continue;
    out = out.split(zh).join(vn);
  }
  return out;
}

function ValueWithDeltas({ value, deltas, formatter }) {
  const base = formatter ? formatter(value) : String(value);

  const valid = Array.isArray(deltas)
    ? deltas.map((x) => Number(x)).filter((x) => Number.isFinite(x) && x !== 0)
    : [];

  if (valid.length === 0) return <span>{base}</span>;

  return (
    <span className="whitespace-nowrap">
      {base}{" "}
      {valid.map((d, i) => (
        <span key={i} className="text-emerald-400">
          ({d > 0 ? `+${formatter ? formatter(d) : d}` : `${formatter ? formatter(d) : d}`})
        </span>
      ))}
    </span>
  );
}

function RangeGrid({ rangeId }) {
  const range = rangeId ? rangeTable?.[rangeId] : null;
  const grids = Array.isArray(range?.grids) ? range.grids : [];

  const coords = useMemo(() => {
    const set = new Set();
    for (const g of grids) {
      if (g && Number.isFinite(g.row) && Number.isFinite(g.col)) {
        set.add(`${g.row},${g.col}`);
      }
    }
    // ensure origin exists
    set.add("0,0");
    return set;
  }, [grids]);

  const bounds = useMemo(() => {
    const rows = [];
    const cols = [];
    for (const key of coords) {
      const [r, c] = key.split(",").map(Number);
      rows.push(r);
      cols.push(c);
    }
    const minR = Math.min(...rows);
    const maxR = Math.max(...rows);
    const minC = Math.min(...cols);
    const maxC = Math.max(...cols);
    return { minR, maxR, minC, maxC };
  }, [coords]);

  const rowCount = bounds.maxR - bounds.minR + 1;
  const colCount = bounds.maxC - bounds.minC + 1;

  const cells = [];
  for (let r = bounds.maxR; r >= bounds.minR; r--) {
    for (let c = bounds.minC; c <= bounds.maxC; c++) {
      const key = `${r},${c}`;
      const isOrigin = r === 0 && c === 0;
      const isAttack = coords.has(key) && !isOrigin;

      cells.push(
        <div
          key={key}
          className="w-6 h-6 border border-white/10 flex items-center justify-center bg-black/20"
          title={`(${r}, ${c})`}
        >
          {isOrigin ? (
            <img
              src={RANGE_ICON.stand}
              alt="stand"
              className="w-5 h-5 object-contain"
              draggable={false}
            />
          ) : isAttack ? (
            <img
              src={RANGE_ICON.attack}
              alt="attack"
              className="w-5 h-5 object-contain"
              draggable={false}
            />
          ) : null}
        </div>
      );
    }
  }

  return (
    <div>
      <div className="text-xs text-white/60 mb-2">
        rangeId: <span className="text-white/80">{rangeId || "—"}</span>
      </div>
      <div
        className="inline-grid"
        style={{
          gridTemplateColumns: `repeat(${colCount}, 24px)`,
          gridTemplateRows: `repeat(${rowCount}, 24px)`,
          gap: 2,
        }}
      >
        {cells}
      </div>
    </div>
  );
}

const StatsSection = ({ operator, charId: charIdProp }) => {
  const charId = useMemo(() => {
    if (charIdProp) return String(charIdProp);

    if (!operator) return null;
    if (typeof operator === "string") return operator;

    return (
      operator?.charId ||
      operator?.id ||
      operator?.charKey ||
      operator?.key ||
      operator?.code ||
      null
    );
  }, [operator, charIdProp]);

  const record = useMemo(() => {
    if (!charId) return null;
    return characterTable?.[charId] || null;
  }, [charId]);

  const phases = useMemo(() => (Array.isArray(record?.phases) ? record.phases : []), [record]);

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [level, setLevel] = useState(1);

  const [useTrust, setUseTrust] = useState(false);
  const [selectedPotentials, setSelectedPotentials] = useState(() => new Set());

  // Reset when changing operator
  useEffect(() => {
    setPhaseIndex(0);
    setLevel(1);
    setUseTrust(false);
    setSelectedPotentials(new Set());
  }, [charId]);

  const currentPhase = useMemo(() => phases?.[phaseIndex] || phases?.[0] || null, [phases, phaseIndex]);
  const maxLevel = useMemo(() => Number(currentPhase?.maxLevel || 1), [currentPhase]);

  // Clamp level when phase changes / max changes
  useEffect(() => {
    setLevel((prev) => clamp(prev, 1, maxLevel));
  }, [maxLevel]);

  const safeLevel = useMemo(() => clamp(level, 1, maxLevel), [level, maxLevel]);

  const baseAttrs = useMemo(() => {
    const data = interpolateAttrs(currentPhase?.attributesKeyFrames, safeLevel);
    return data || null;
  }, [currentPhase, safeLevel]);

  const trustFrame = useMemo(() => pickMaxFavorFrame(record?.favorKeyFrames), [record]);
  const trustBonus = useMemo(() => {
    if (!useTrust || !trustFrame?.data) return null;
    return trustFrame.data;
  }, [useTrust, trustFrame]);

  const potMap = useMemo(() => buildPotMap(potVN), []);

  const potentialBonuses = useMemo(() => {
    const out = {
      maxHp: [],
      atk: [],
      def: [],
      magicResistance: [],
      cost: [],
      respawnTime: [],
      blockCnt: [],
      baseAttackTime: [],
    };

    const ranks = Array.isArray(record?.potentialRanks) ? record.potentialRanks : [];
    for (const idx of selectedPotentials) {
      const rank = ranks[idx];
      const mods = rank?.buff?.attributes?.attributeModifiers;
      if (!Array.isArray(mods)) continue;
      for (const m of mods) {
        const field = ATTR_TYPE_TO_FIELD[m?.attributeType];
        if (!field) continue;
        const v = Number(m?.value);
        if (!Number.isFinite(v) || v === 0) continue;
        out[field].push(v);
      }
    }

    return out;
  }, [record, selectedPotentials]);

  const computed = useMemo(() => {
    const base = baseAttrs || {};

    const deltas = {
      maxHp: [],
      atk: [],
      def: [],
      magicResistance: [],
      cost: [],
      respawnTime: [],
      blockCnt: [],
      baseAttackTime: [],
    };

    // Trust
    if (trustBonus) {
      for (const k of Object.keys(deltas)) {
        const v = Number(trustBonus[k]);
        if (Number.isFinite(v) && v !== 0) deltas[k].push(v);
      }
    }

    // Potentials
    for (const k of Object.keys(deltas)) {
      const list = potentialBonuses?.[k] || [];
      if (Array.isArray(list) && list.length) deltas[k].push(...list);
    }

    const sum = (arr) => (Array.isArray(arr) ? arr.reduce((a, b) => a + Number(b || 0), 0) : 0);

    const stats = {
      maxHp: Number(base.maxHp || 0) + sum(deltas.maxHp),
      atk: Number(base.atk || 0) + sum(deltas.atk),
      def: Number(base.def || 0) + sum(deltas.def),
      magicResistance: Number(base.magicResistance || 0) + sum(deltas.magicResistance),
      cost: Number(base.cost || 0) + sum(deltas.cost),
      respawnTime: Number(base.respawnTime || 0) + sum(deltas.respawnTime),
      blockCnt: Number(base.blockCnt || 0) + sum(deltas.blockCnt),
      baseAttackTime: Number(base.baseAttackTime || 0) + sum(deltas.baseAttackTime),
    };

    return { stats, deltas };
  }, [baseAttrs, trustBonus, potentialBonuses]);

  const eliteButtons = useMemo(() => {
    const count = Array.isArray(phases) ? phases.length : 0;
    return [0, 1, 2].filter((i) => i < count);
  }, [phases]);

  const togglePotential = (idx) => {
    setSelectedPotentials((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const ranks = Array.isArray(record?.potentialRanks) ? record.potentialRanks : [];

  if (!charId) {
    return (
      <div className="bg-[#1b1b1b] rounded-xl p-4 text-gray-200">
        <h3 className="text-lg font-semibold text-white mb-2">Stats</h3>
        <div className="text-sm text-white/60">No operator selected.</div>
      </div>
    );
  }

  if (!record || !currentPhase || !baseAttrs) {
    return (
      <div className="bg-[#1b1b1b] rounded-xl p-4 text-gray-200">
        <h3 className="text-lg font-semibold text-white mb-2">Stats</h3>
        <div className="text-sm text-white/60">No data for: {charId}</div>
      </div>
    );
  }

  const { stats, deltas } = computed;

  const fmtInt = (n) => String(Math.round(Number(n) || 0));
  const fmtRes = (n) => String(Math.round(Number(n) || 0));

  return (
    <div className="space-y-4">
      {/* TOP: Stats + Level */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        {/* Stats */}
        <div className="bg-[#1b1b1b] rounded-xl p-4 text-gray-200">
          <h3 className="text-lg font-semibold text-white mb-4">Stats</h3>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4">
            {/* LEFT stats with bars */}
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <img
                  src={STAT_ICON.maxHp}
                  alt="hp"
                  className="w-5 h-5 mt-0.5 object-contain"
                  draggable={false}
                />
                <div className="flex-1">
                  <StatBar
                    label="HP"
                    value={Math.round(stats.maxHp)}
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

              <div className="flex items-start gap-2">
                <img
                  src={STAT_ICON.atk}
                  alt="atk"
                  className="w-5 h-5 mt-0.5 object-contain"
                  draggable={false}
                />
                <div className="flex-1">
                  <StatBar
                    label="ATK"
                    value={Math.round(stats.atk)}
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

              <div className="flex items-start gap-2">
                <img
                  src={STAT_ICON.def}
                  alt="def"
                  className="w-5 h-5 mt-0.5 object-contain"
                  draggable={false}
                />
                <div className="flex-1">
                  <StatBar
                    label="DEF"
                    value={Math.round(stats.def)}
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

              <div className="flex items-start gap-2">
                <img
                  src={STAT_ICON.magicResistance}
                  alt="res"
                  className="w-5 h-5 mt-0.5 object-contain"
                  draggable={false}
                />
                <div className="flex-1">
                  <StatBar
                    label="RES"
                    value={Math.round(stats.magicResistance)}
                    max={200}
                    displayValue={
                      <ValueWithDeltas
                        value={stats.magicResistance}
                        deltas={deltas.magicResistance}
                        formatter={(v) => fmtRes(v)}
                      />
                    }
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:flex items-stretch justify-center">
              <div className="w-px bg-white/10" />
            </div>

            {/* RIGHT stats (no bars) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={STAT_ICON.respawnTime}
                    alt="respawn"
                    className="w-5 h-5 object-contain"
                    draggable={false}
                  />
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
                  <img
                    src={STAT_ICON.cost}
                    alt="cost"
                    className="w-5 h-5 object-contain"
                    draggable={false}
                  />
                  <div className="text-xs text-white/70 truncate">Cost</div>
                </div>
                <div className="text-sm text-white">
                  <ValueWithDeltas
                    value={stats.cost}
                    deltas={deltas.cost}
                    formatter={(v) => fmtInt(v)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={STAT_ICON.blockCnt}
                    alt="block"
                    className="w-5 h-5 object-contain"
                    draggable={false}
                  />
                  <div className="text-xs text-white/70 truncate">Block</div>
                </div>
                <div className="text-sm text-white">
                  <ValueWithDeltas
                    value={stats.blockCnt}
                    deltas={deltas.blockCnt}
                    formatter={(v) => fmtInt(v)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={STAT_ICON.baseAttackTime}
                    alt="atk time"
                    className="w-5 h-5 object-contain"
                    draggable={false}
                  />
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
          <h3 className="text-lg font-semibold text-white mb-4">Level</h3>

          <div className="flex items-center justify-center gap-2 mb-4">
            {eliteButtons.map((i) => {
              const active = i === phaseIndex;
              const src = `${ELITE_ICON_BASE}elite_${i}_large.png`;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPhaseIndex(i)}
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
                className="w-14 text-center bg-transparent outline-none text-white text-lg font-extrabold"
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
            <h3 className="text-base font-semibold text-white">Range</h3>
            <div className="text-xs text-white/50">(Phạm vi)</div>
          </div>
          <RangeGrid rangeId={currentPhase?.rangeId} />
        </div>

        {/* Trust */}
        <div className="bg-[#1b1b1b] rounded-xl p-4 text-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-white">Trust</h3>
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
            <div className="space-y-1 text-sm">
              <div className="text-xs text-white/60 mb-2">
                Use max favor frame (lv {trustFrame.level})
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">HP</span>
                <span className="text-emerald-400">+{fmtInt(trustFrame.data.maxHp || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">ATK</span>
                <span className="text-emerald-400">+{fmtInt(trustFrame.data.atk || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">DEF</span>
                <span className="text-emerald-400">+{fmtInt(trustFrame.data.def || 0)}</span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-white/60">No trust data.</div>
          )}
        </div>

        {/* Potentials */}
        <div className="bg-[#1b1b1b] rounded-xl p-4 text-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-white">Potentials</h3>
            <div className="text-xs text-white/50">(Tiềm năng)</div>
          </div>

          {ranks.length > 0 ? (
            <div className="space-y-2">
              {ranks.map((r, idx) => {
                const desc = r?.description || "";
                const vn = translatePotentialDesc(desc, potMap) || desc;
                const hasBuff = Array.isArray(r?.buff?.attributes?.attributeModifiers);
                const checked = selectedPotentials.has(idx);
                return (
                  <label
                    key={idx}
                    className={`flex items-start gap-2 text-sm cursor-pointer select-none ${
                      !hasBuff ? "opacity-60" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePotential(idx)}
                      disabled={!hasBuff}
                      className="mt-1 accent-emerald-500"
                    />
                    <div className="leading-snug">
                      <div className="text-white/90">{vn}</div>
                      {vn !== desc && desc ? (
                        <div className="text-xs text-white/50">{desc}</div>
                      ) : null}
                    </div>
                  </label>
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
        <h3 className="text-lg font-semibold text-white mb-2">Promotion Requirements</h3>
        <div className="text-sm text-white/60">(Điều kiện thăng tiến) — placeholder for evolveCost.</div>
      </div>
    </div>
  );
};

export default StatsSection;