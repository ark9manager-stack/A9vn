import React, { useEffect, useState } from "react";
import OperatorSidebar from "./Modal/OperatorSidebar";
import OperatorContent from "./Modal/OperatorContent";
import { useScrollLock } from "../../hooks/useScrollLock";

const OperatorModal = ({ operator, onClose }) => {
  const [activeTab, setActiveTab] = useState("skins");
  const [lang, setLang] = useState("VN");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  useScrollLock(!!operator);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [operator?.id]);

  if (!operator) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative flex h-[100dvh] w-screen overflow-hidden bg-[#121212] shadow-2xl md:h-[92vh] md:w-[95%] md:max-w-7xl md:rounded-2xl md:flex-row flex-col">
        <div className="operator-mobile-modal-bar md:hidden">
          <button
            type="button"
            aria-expanded={mobileSidebarOpen}
            onClick={() => setMobileSidebarOpen((prev) => !prev)}
            className="operator-mobile-menu-btn"
          >
            <span className="flex flex-col gap-[3px]">
              <span
                className={`block h-[2px] w-4 rounded-full bg-white transition-transform duration-300 ${
                  mobileSidebarOpen ? "translate-y-[5px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-[2px] w-4 rounded-full bg-white transition-opacity duration-300 ${
                  mobileSidebarOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`block h-[2px] w-4 rounded-full bg-white transition-transform duration-300 ${
                  mobileSidebarOpen ? "-translate-y-[5px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>

          <div className="min-w-0 flex-1 px-3 text-center">
            <div className="truncate text-[12px] font-bold uppercase tracking-[0.18em] text-white/90">
              {operator?.name || operator?.id || "Operator"}
            </div>
            <div className="mt-0.5 text-[9px] uppercase tracking-[0.24em] text-white/40">
              Rhodes Island Database
            </div>
          </div>

          <button
            type="button"
            className="operator-mobile-close-btn"
            onClick={onClose}
            aria-label="Close operator modal"
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
        </div>

        {/* LEFT */}
        <OperatorSidebar
          operator={operator}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          lang={lang}
          onLangChange={setLang}
          mobileOpen={mobileSidebarOpen}
          onMobileOpenChange={setMobileSidebarOpen}
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
