import LangToggle from "../../UI/LangToggle";
import React, { useEffect, useMemo, useState } from "react";
import { buildCnAvatarUrl, getOperatorCharId } from "../../../utils/operatorAvatar";
import characterTable from "../../../data/operators/character_table.json";

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

  const charId = useMemo(() => getOperatorCharId(operator), [operator]);
  const displayNumber = useMemo(() => {
    const entry = characterTable?.[charId];
    return entry?.displayNumber || "";
  }, [charId]);

  const avatarCandidates = useMemo(() => {
    const arr = [
      buildCnAvatarUrl(charId),
      operator?.avatar,
      operator?.image,
    ].filter(Boolean);
    return Array.from(new Set(arr));
  }, [charId, operator?.avatar, operator?.image]);

  const [avatarIdx, setAvatarIdx] = useState(0);

  useEffect(() => {
    setAvatarIdx(0);
  }, [avatarCandidates.join("|")]);

  const avatarSrc = avatarCandidates[avatarIdx] || "";

  const handleAvatarError = () => {
    const next = avatarIdx + 1;
    if (next < avatarCandidates.length) setAvatarIdx(next);
    else setAvatarIdx(avatarCandidates.length);
  };

  return (
    <div
      className="w-[300px] bg-[#1a1a1a] border-r border-white/10
      flex flex-col p-4 text-white
    "
    >
      {/* Avatar */}
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={operator?.name || String(charId || "")}
          className="w-[128px] h-[128px] mx-auto object-contain mb-3"
          loading="lazy"
          draggable={false}
          onError={handleAvatarError}
        />
      ) : (
        <div className="w-[128px] h-[128px] mx-auto object-contain mb-3">
          No Image
        </div>
      )}

      {/* Name */}
      <h2 className="text-xl font-bold text-center">{operator.name}</h2>

      {/* charId | displayNumber */}
      <div className="mt-1 text-center text-xs text-white/70 font-mono">
        {charId || "—"}
        {displayNumber ? ` | ${displayNumber}` : ""}
      </div>

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
