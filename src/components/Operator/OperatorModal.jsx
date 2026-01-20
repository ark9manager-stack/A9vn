import React from "react";
import OperatorHeader from "./modal/OperatorHeader";
import OperatorProfile from "./modal/OperatorProfile";
import OperatorStats from "./modal/OperatorStats";
import OperatorSkills from "./modal/OperatorSkills";
import OperatorTalents from "./modal/OperatorTalents";

const OperatorModal = ({ operator, onClose }) => {
  if (!operator) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-[92%] max-w-6xl h-[90vh]
        bg-[#121212] rounded-2xl shadow-2xl overflow-hidden flex
      "
      >
        {/* Left */}
        <div className="w-[320px] bg-[#1a1a1a] border-r border-white/10">
          <OperatorHeader operator={operator} />
        </div>

        {/* Right */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <OperatorProfile operator={operator} />
          <OperatorStats operator={operator} />
          <OperatorTalents operator={operator} />
          <OperatorSkills operator={operator} />
        </div>
      </div>
    </div>
  );
};

export default OperatorModal;
