import LangToggle from "../../UI/LangToggle";
import React, { useEffect, useMemo, useState } from "react";
import {
  buildCnAvatarUrl,
  getOperatorCharId,
} from "../../../utils/operatorAvatar";
import characterTable from "../../../data/operators/character_table.json";

import {
  professionIconUrl,
  professionLabel,
  subProfIconUrl,
  subProfLabel,
} from "../../../utils/operatorUtils";

const tabs = [
  { id: "skins", label: "Trang phục" },
  { id: "profile", label: "Hồ sơ" },
  { id: "stats", label: "Thông số" },
  { id: "skills", label: "Kỹ năng" },
  { id: "modules", label: "Module" },
  { id: "voice", label: "Lời thoại" },
];

const SidebarPanel = ({
  operator,
  activeTab,
  onTabChange,
  langNorm,
  onLangChange,
  charId,
  displayNumber,
  profession,
  subProfessionId,
  profIcon,
  subIcon,
  profText,
  subText,
  avatarSrc,
  handleAvatarError,
  isMobile = false,
  onTabClick,
}) => {
  return (
    <>
      {/* Avatar */}
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={operator?.name || String(charId || "")}
          className={`${isMobile ? "w-[96px] h-[96px]" : "w-[128px] h-[128px]"} mx-auto object-contain mb-3 select-none`}
          loading="lazy"
          draggable={false}
          onError={handleAvatarError}
        />
      ) : (
        <div
          className={`${isMobile ? "w-[96px] h-[96px]" : "w-[128px] h-[128px]"} mx-auto flex items-center justify-center text-xs text-gray-400 bg-black/30 rounded-lg mb-3`}
        >
          No Image
        </div>
      )}

      {/* Name */}
      <h2 className={`${isMobile ? "text-lg" : "text-xl"} font-bold text-center`}>
        {operator?.name}
      </h2>

      {/* charId | displayNumber */}
      <div className="mt-1 text-center text-[11px] text-white/70 font-mono break-all">
        {charId || "—"}
        {displayNumber ? ` | ${displayNumber}` : ""}
      </div>

      <div className={`mt-3 grid ${isMobile ? "grid-cols-2 gap-3" : "grid-cols-2 gap-4"} w-full`}>
        {/* Main class */}
        <div className="text-center rounded-lg border border-gray-500/30 bg-black/20 p-2">
          {profIcon ? (
            <img
              src={profIcon}
              alt={profession || "profession"}
              title={profession || ""}
              className={`${isMobile ? "w-[56px] h-[56px]" : "w-[66px] h-[66px]"} mx-auto object-contain`}
              loading="lazy"
              draggable={false}
            />
          ) : (
            <div
              className={`${isMobile ? "w-[56px] h-[56px]" : "w-[66px] h-[66px]"} mx-auto rounded-lg bg-black/30 flex items-center justify-center text-[10px] text-white/60`}
            >
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
        <div className="text-center rounded-lg border border-gray-500/30 bg-black/20 p-2">
          {subIcon ? (
            <img
              src={subIcon}
              alt={subProfessionId || "subProfession"}
              title={subProfessionId || ""}
              className={`${isMobile ? "w-[56px] h-[56px]" : "w-[66px] h-[66px]"} mx-auto object-contain`}
              loading="lazy"
              draggable={false}
            />
          ) : (
            <div
              className={`${isMobile ? "w-[56px] h-[56px]" : "w-[66px] h-[66px]"} mx-auto rounded-lg bg-black/30 flex items-center justify-center text-[10px] text-white/60`}
            >
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
      <div className="mt-3 flex justify-center">
        <LangToggle
          value={langNorm}
          onChange={(next) => {
            const s = String(next || "VN").toUpperCase();
            onLangChange(s === "EN" ? "EN" : "VN");
          }}
        />
      </div>

      {/* Tabs */}
      <div className={`mt-4 flex flex-col ${isMobile ? "gap-2" : "gap-2"}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              onTabChange(tab.id);
              onTabClick?.();
            }}
            className={`px-4 ${isMobile ? "py-2.5 text-[14px]" : "py-2"} rounded-lg text-left transition-colors duration-200
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
    </>
  );
};

const OperatorSidebar = ({
  operator,
  activeTab,
  onTabChange,
  lang,
  onLangChange,
}) => {
  // normalize lang to EN/VN
  const langNorm = useMemo(() => {
    const s = String(lang || "VN").toUpperCase();
    return s === "EN" ? "EN" : "VN";
  }, [lang]);

  const charId = useMemo(() => getOperatorCharId(operator), [operator]);

  const charEntry = useMemo(() => {
    return characterTable?.[charId] || null;
  }, [charId]);

  const displayNumber = useMemo(() => {
    return charEntry?.displayNumber || "";
  }, [charEntry]);

  // profession / subProfessionId from character_table.json
  const profession = useMemo(() => {
    return charEntry?.profession || "";
  }, [charEntry]);

  const subProfessionId = useMemo(() => {
    return charEntry?.subProfessionId || "";
  }, [charEntry]);

  const profIcon = useMemo(() => professionIconUrl(profession), [profession]);
  const subIcon = useMemo(
    () => subProfIconUrl(subProfessionId),
    [subProfessionId],
  );

  const profText = useMemo(
    () => professionLabel(profession, langNorm),
    [profession, langNorm],
  );

  const subText = useMemo(
    () => subProfLabel(subProfessionId, langNorm),
    [subProfessionId, langNorm],
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
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setAvatarIdx(0);
  }, [avatarCandidates.join("|")]);

  useEffect(() => {
    setMobileOpen(false);
  }, [charId]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const prevOverflow = document.body.style.overflow;
    if (mobileOpen) document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen || typeof window === "undefined") return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const avatarSrc = avatarCandidates[avatarIdx] || "";

  const handleAvatarError = () => {
    const next = avatarIdx + 1;
    if (next < avatarCandidates.length) setAvatarIdx(next);
    else setAvatarIdx(avatarCandidates.length);
  };

  return (
    <>
      {/* Desktop sidebar - keep original layout */}
      <div className="hidden md:flex w-[300px] bg-[#1a1a1a] border-r border-white/10 flex-col p-4 text-white shrink-0">
        <SidebarPanel
          operator={operator}
          activeTab={activeTab}
          onTabChange={onTabChange}
          langNorm={langNorm}
          onLangChange={onLangChange}
          charId={charId}
          displayNumber={displayNumber}
          profession={profession}
          subProfessionId={subProfessionId}
          profIcon={profIcon}
          subIcon={subIcon}
          profText={profText}
          subText={subText}
          avatarSrc={avatarSrc}
          handleAvatarError={handleAvatarError}
        />
      </div>

      {/* Mobile drawer trigger */}
      <div className="md:hidden">
        <button
          type="button"
          aria-label={mobileOpen ? "Đóng thanh thông tin" : "Mở thanh thông tin"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((prev) => !prev)}
          className={`fixed left-3 top-3 z-[60] flex items-center gap-2 rounded-full border border-white/10 bg-[#171717]/95 px-3 py-2 text-white shadow-lg backdrop-blur-sm transition-all duration-300 ${
            mobileOpen ? "translate-x-0 opacity-100" : "translate-x-0 opacity-100"
          }`}
        >
          <span className="flex flex-col gap-[3px]">
            <span
              className={`block h-[2px] w-4 rounded-full bg-white transition-transform duration-300 ${
                mobileOpen ? "translate-y-[5px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-[2px] w-4 rounded-full bg-white transition-opacity duration-300 ${
                mobileOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`block h-[2px] w-4 rounded-full bg-white transition-transform duration-300 ${
                mobileOpen ? "-translate-y-[5px] -rotate-45" : ""
              }`}
            />
          </span>
          <span className="text-sm font-medium leading-none">
            {mobileOpen ? "Đóng" : "Menu"}
          </span>
        </button>

        {/* Backdrop */}
        <button
          type="button"
          aria-label="Đóng menu"
          onClick={() => setMobileOpen(false)}
          className={`fixed inset-0 z-40 bg-black/45 transition-opacity duration-300 ${
            mobileOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        />

        {/* Drawer */}
        <aside
          className={`fixed left-0 top-0 z-50 h-dvh w-[min(82vw,320px)] max-w-[320px] border-r border-white/10 bg-[#1a1a1a]/98 px-4 pb-5 pt-16 text-white shadow-2xl backdrop-blur-md transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full overflow-y-auto pr-1">
            <SidebarPanel
              operator={operator}
              activeTab={activeTab}
              onTabChange={onTabChange}
              langNorm={langNorm}
              onLangChange={onLangChange}
              charId={charId}
              displayNumber={displayNumber}
              profession={profession}
              subProfessionId={subProfessionId}
              profIcon={profIcon}
              subIcon={subIcon}
              profText={profText}
              subText={subText}
              avatarSrc={avatarSrc}
              handleAvatarError={handleAvatarError}
              isMobile
              onTabClick={() => setMobileOpen(false)}
            />
          </div>
        </aside>
      </div>
    </>
  );
};

export default OperatorSidebar;
