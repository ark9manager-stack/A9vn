import React, { useMemo } from "react";

// Default caps requested by you
const DEFAULT_MAX_BY_LABEL = {
  HP: 6000,
  ATK: 2000,
  DEF: 1000,
  RES: 200,
};

const StatBar = ({ label, value, max, displayValue }) => {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;

  const resolvedMax = useMemo(() => {
    if (Number.isFinite(Number(max)) && Number(max) > 0) return Number(max);
    const key = String(label || "").toUpperCase().trim();
    return DEFAULT_MAX_BY_LABEL[key] ?? 100;
  }, [label, max]);

  const { percent, widthPct, isOverCap } = useMemo(() => {
    const pct = resolvedMax > 0 ? (safeValue / resolvedMax) * 100 : 0;
    const clamped = Math.max(0, Math.min(pct, 100));
    return { percent: pct, widthPct: clamped, isOverCap: pct > 100 };
  }, [safeValue, resolvedMax]);

  return (
    <div>
      <div className="flex justify-between text-xs text-gray-300 mb-1">
        <span>{label}</span>
        <span>{displayValue ?? safeValue}</span>
      </div>

      <div className="relative h-2 bg-black/40 rounded overflow-hidden">
        <div
          className="h-2 bg-emerald-500 rounded"
          style={{ width: `${widthPct}%` }}
        />

        {/* If value exceeds max, show a subtle indicator at the end */}
        {isOverCap && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-1">
            <div className="h-2 w-2 rounded-sm bg-white/60" />
          </div>
        )}
      </div>

      {/* Optional: show over-cap % */}
      {isOverCap && (
        <div className="mt-1 text-[10px] text-white/50 text-right">
          +{Math.round(percent - 100)}% over
        </div>
      )}
    </div>
  );
};

export default StatBar;
