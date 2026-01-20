import React from "react";
import LangToggle from "../../UI/LangToggle";

const tabs = [
  { id: "skins", label: "Skins" },
  { id: "profile", label: "Profile" },
  { id: "stats", label: "Stats" },
  { id: "skills", label: "Skills" },
  { id: "talents", label: "Talents" },
];

const OperatorSidebar = ({
  operator,
  activeTab,
  onTabChange,
  lang,
  onLangChange,
}) => {
  const mainClass =
    lang === "vn"
      ? operator.classNameVN || operator.className
      : operator.className;

  const subClass =
    lang === "vn"
      ? operator.subClassNameVN || operator.subClassName
      : operator.subClassName;

  return (
    <div
      className="w-[300px] bg-[#1a1a1a] border-r border-white/10
      flex flex-col p-4 text-white
    "
    >
      {/* Avatar */}
      <img
        src={operator.avatar || operator.image}
        alt={operator.name}
        className="w-44 h-44 mx-auto object-contain mb-3"
      />

      {/* Name */}
      <h2 className="text-xl font-bold text-center">{operator.name}</h2>

      {/* Class + Lang */}
      <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-300">
        <span>{mainClass}</span>
        {subClass && (
          <>
            <span>•</span>
            <span>{subClass}</span>
          </>
        )}
        <LangToggle value={lang} onChange={onLangChange} />
      </div>

      {/* Tabs */}
      <div className="mt-4 flex flex-col gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 rounded-lg text-left transition
              ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white"
                  : "bg-[#242424] text-gray-300 hover:bg-[#2e2e2e]"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default OperatorSidebar;
