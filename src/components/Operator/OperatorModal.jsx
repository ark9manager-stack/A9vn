import React, { useState } from "react";
import OperatorSidebar from "./Modal/OperatorSidebar";
import OperatorContent from "./Modal/OperatorContent";
import { useScrollLock } from "../../hooks/useScrollLock";

const OperatorModal = ({ operator, onClose }) => {
  const [activeTab, setActiveTab] = useState("skins");
  const [lang, setLang] = useState("VN");
  useScrollLock(!!operator);

  if (!operator) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative w-[95%] max-w-6xl h-[92vh]
        bg-[#121212] rounded-2xl shadow-2xl overflow-hidden flex
      "
      >
        {/* Close button for mobile */}
        <button
          className="absolute top-4 right-4 text-white md:hidden z-10"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* LEFT */}
        <OperatorSidebar
          operator={operator}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          lang={lang}
          onLangChange={setLang}
        />

        {/* RIGHT */}
        <OperatorContent
          activeTab={activeTab}
          operator={operator}
          lang={lang}
        />
      </div>
    </div>
  );
};

export default OperatorModal;
