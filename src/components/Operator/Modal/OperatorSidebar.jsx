import LangToggle from "../../UI/LangToggle";
import React, { useEffect, useMemo, useState } from "react";
import { buildCnAvatarUrl, getOperatorCharId } from "../../../utils/operatorAvatar";
import characterTable from "../../../data/operators/character_table.json";

import {
  professionIconUrl,
  professionLabel,
  subProfIconUrl,
  subProfLabel,
} from "../../../utils/operatorUtils";

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
  // normalize lang to EN/VN
  const langNorm = useMemo(() => {
    const s = String(lang || "EN").toUpperCase();
    return s === "VN" ? "VN" : "EN";
  }, [lang]);

  const charId = useMemo(() => getOperatorCharId(operator), [operator]);

  const charEntry = useMemo(() => {
    return characterTable?.[charId] || null;
  }, [charId]);

  const displayNumber = useMemo(() => {
    return charEntry?.displayNumber || "";
  }, [charEntry]);

  // ✅ profession / subProfessionId from character_table.json
  const profession = useMemo(() => {
    return charEntry?.profession || "";
  }, [charEntry]);

  const subProfessionId = useMemo(() => {
    return charEntry?.subProfessionId || "";
  }, [charEntry]);

  const profIcon = useMemo(() => professionIconUrl(profession), [profession]);
  const subIcon = useMemo(() => subProfIconUrl(subProfessionId), [subProfessionId]);

  const profText = useMemo(
    () => professionLabel(profession, langNorm),
    [profession, langNorm]
  );

  const subText = useMemo(
    () => subProfLabel(subProfessionId, langNorm),
    [subProfessionId, langNorm]
  );

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
        <div className="w-[128px] h-[128px] mx-auto flex items-center justify-center text-xs text-gray-400 bg-black/30 rounded-lg mb-3">
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

      <div className="mt-3 flex items-start justify-between gap-4 w-full">
        {/* Main class */}
        <div className="w-[124px] text-center rounded-lg border border-gray-500/30 bg-black/20 p-2">
          {profIcon ? (
            <img
              src={profIcon}
              alt={profession || "profession"}
              title={profession || ""}
              className="w-[66px] h-[66px] mx-auto object-contain"
              loading="lazy"
              draggable={false}
            />
          ) : (
            <div className="w-[66px] h-[66px] mx-auto rounded-lg bg-black/30 flex items-center justify-center text-[10px] text-white/60">
              —
            </div>
          )}
          <div
            className="mt-1 text-[11px] leading-snug text-white/80 break-words"
            title={profText || profession || ""}
          >
            {profText || profession || "—"}
          </div>
        </div>

        {/* Sub class */}
        <div className="w-[124px] text-center rounded-lg border border-gray-500/30 bg-black/20 p-2">
          {subIcon ? (
            <img
              src={subIcon}
              alt={subProfessionId || "subProfession"}
              title={subProfessionId || ""}
              className="w-[66px] h-[66px] mx-auto object-contain"
              loading="lazy"
              draggable={false}
            />
          ) : (
            <div className="w-[66px] h-[66px] mx-auto rounded-lg bg-black/30 flex items-center justify-center text-[10px] text-white/60">
              —
            </div>
          )}
          <div
            className="mt-1 text-[11px] leading-snug text-white/80 break-words"
            title={subText || subProfessionId || ""}
          >
            {subText || subProfessionId || "—"}
          </div>
        </div>
      </div>


      {/* Lang Toggle */}
      <div className="mt-2 flex justify-center">
        <LangToggle value={langNorm} onChange={onLangChange} />
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
