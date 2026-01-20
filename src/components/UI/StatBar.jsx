import React from "react";

const StatBar = ({ label, value }) => {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-300 mb-1">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 bg-black/40 rounded">
        <div
          className="h-2 bg-emerald-500 rounded"
          style={{ width: `${Math.min(value / 50, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default StatBar;
