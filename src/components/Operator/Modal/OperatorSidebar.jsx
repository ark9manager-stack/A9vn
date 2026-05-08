import LangToggle from "../../UI/LangToggle";
import React, { useEffect, useMemo, useState } from "react";
import {
  buildCnAvatarUrl,
  getOperatorCharId,
} from "../../../utils/operatorAvatar";
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
      <h2
        className={`${isMobile ? "text-lg" : "text-xl"} font-bold text-center`}
      >
        {operator?.name}
      </h2>

      {/* charId | displayNumber */}
      <div className="mt-1 text-center text-[11px] text-white/70 font-mono break-all">
        {charId || "—"}
        {displayNumber ? ` | ${displayNumber}` : ""}
      </div>

      <div
        className={`mt-3 grid ${isMobile ? "grid-cols-2 gap-3" : "grid-cols-2 gap-4"} w-full`}
      >
        {/* Main class */}
        <div className="steel-box text-center rounded-[12px] p-2">
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
        <div className="steel-box text-center rounded-[12px] p-2">
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
            className={`tab-steel ${isMobile ? "py-2.5 text-[14px]" : "py-2"} px-4 rounded-[12px] text-left transition-all duration-300 ${
              activeTab === tab.id ? "tab-steel-active" : "tab-steel-idle"
            }`}
          >
            <span className="relative z-[2]">{tab.label}</span>
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
  mobileOpen = false,
  onMobileOpenChange,
}) => {
  // normalize lang to EN/VN
  const langNorm = useMemo(() => {
    const s = String(lang || "VN").toUpperCase();
    return s === "EN" ? "EN" : "VN";
  }, [lang]);

  const charId = useMemo(() => getOperatorCharId(operator), [operator]);

  const displayNumber = useMemo(() => {
    return operator?.displayNumber || operator?.display_number || "";
  }, [operator]);

  const profession = useMemo(() => {
    return operator?.profession || "";
  }, [operator]);

  const subProfessionId = useMemo(() => {
    return operator?.subProfessionId || operator?.subProfession || "";
  }, [operator]);

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
  const avatarKey = useMemo(
    () => avatarCandidates.join("|"),
    [avatarCandidates],
  );

  const [avatarIdx, setAvatarIdx] = useState(0);

  useEffect(() => {
    setAvatarIdx(0);
  }, [avatarKey]);

  useEffect(() => {
    if (!mobileOpen || typeof window === "undefined") return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onMobileOpenChange?.(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, onMobileOpenChange]);

  const avatarSrc = avatarCandidates[avatarIdx] || "";

  const handleAvatarError = () => {
    const next = avatarIdx + 1;
    if (next < avatarCandidates.length) setAvatarIdx(next);
    else setAvatarIdx(avatarCandidates.length);
  };

  return (
    <>
      {/* Desktop sidebar - keep original layout */}
      <div className="hidden md:flex w-[330px] sidebar-steel-dark flex-col p-5 text-white shrink-0">
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

      {/* Mobile drawer */}
      <div className="md:hidden">
        {/* Backdrop */}
        <button
          type="button"
          aria-label="Đóng menu"
          onClick={() => onMobileOpenChange?.(false)}
          className={`fixed inset-0 z-40 bg-black/45 transition-opacity duration-300 ${
            mobileOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        />

        {/* Drawer */}
        <aside
          className={`fixed left-0 top-[52px] z-50 h-[calc(100dvh-52px)] w-[min(82vw,320px)] max-w-[320px] border-r border-white/10 bg-[#1a1a1a]/98 px-4 pb-5 pt-4 text-white shadow-2xl backdrop-blur-md transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="operator-sidebar-scroll h-full overflow-y-auto pr-2">
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
              onTabClick={() => onMobileOpenChange?.(false)}
            />
          </div>
        </aside>
      </div>
    </>
  );
};

export default OperatorSidebar;
