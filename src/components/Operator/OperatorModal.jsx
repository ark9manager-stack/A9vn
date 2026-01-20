// components/Operator/OperatorModal.jsx
import React from "react";
import OperatorHeader from "./modal/OperatorHeader";
import OperatorProfile from "./modal/OperatorProfile";
import OperatorStats from "./modal/OperatorStats";
import OperatorTalents from "./modal/OperatorTalents";
import OperatorSkills from "./modal/OperatorSkills";

const OperatorModal = ({ operator, onClose }) => {
  if (!operator) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      {/* overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* modal */}
      <div
        className="relative w-[95%] max-w-6xl h-[92vh]
        bg-[#121212] rounded-2xl shadow-2xl overflow-hidden flex
      "
      >
        {/* LEFT */}
        <div className="w-[320px] bg-[#1a1a1a] border-r border-white/10">
          <OperatorHeader operator={operator} />
        </div>

        {/* RIGHT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <OperatorProfile operator={operator} />
          <OperatorStats />
          <OperatorTalents />
          <OperatorSkills />
        </div>
      </div>
    </div>
  );
};

export default OperatorModal;
