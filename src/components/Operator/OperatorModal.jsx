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

      <div
        className="relative w-[95%] max-w-6xl h-[92vh]
        bg-[#121212] rounded-2xl shadow-2xl overflow-hidden flex
      "
      >
        <button
          type="button"
          aria-label={
            mobileSidebarOpen ? "Đóng thanh thông tin" : "Mở thanh thông tin"
          }
          aria-expanded={mobileSidebarOpen}
          onClick={() => setMobileSidebarOpen((prev) => !prev)}
          className="absolute left-4 top-4 z-[100] flex items-center gap-2 rounded-full border border-white/10 bg-[#171717]/95 px-3 py-2 text-white shadow-lg backdrop-blur-sm transition-all duration-300 md:hidden"
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
          <span className="text-sm font-medium leading-none">
            {mobileSidebarOpen ? "Đóng" : "Menu"}
          </span>
        </button>

        {/* Close button for mobile */}
        <button
          type="button"
          className="absolute top-4 right-4 text-white md:hidden z-[100]"
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
