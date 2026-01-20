import React, { useState } from "react";
import OperatorSidebar from "./Modal/OperatorSidebar";
import OperatorContent from "./Modal/OperatorContent";

const OperatorModal = ({ operator, onClose }) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [lang, setLang] = useState("EN");
  if (!operator) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative w-[95%] max-w-6xl h-[92vh]
        bg-[#121212] rounded-2xl shadow-2xl overflow-hidden flex
      "
      >
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
