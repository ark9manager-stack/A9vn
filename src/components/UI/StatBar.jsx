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

  const widthPct = useMemo(() => {
    const pct = resolvedMax > 0 ? (safeValue / resolvedMax) * 100 : 0;
    return Math.max(0, Math.min(pct, 100));
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
      </div>
    </div>
  );
};

export default StatBar;
