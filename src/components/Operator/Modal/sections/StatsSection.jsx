import React from "react";
import StatBar from "../../../ui/StatBar";

const StatsSection = () => {
  return (
    <div className="bg-[#1b1b1b] rounded-xl p-4">
      <h3 className="text-lg font-semibold text-white mb-4">Stats</h3>

      <div className="space-y-2">
        <StatBar label="HP" value={3500} />
        <StatBar label="ATK" value={800} />
        <StatBar label="DEF" value={600} />
        <StatBar label="RES" value={20} />
      </div>
    </div>
  );
};

export default StatsSection;
