import React, { useEffect, useMemo, useState, useCallback } from "react";
import SkinsSection from "./sections/SkinsSection";
import ProfileSection from "./sections/ProfileSection";
import SkillsSection from "./sections/SkillsSection";
import VoiceSection from "./sections/VoiceSection";
import StatsSection from "./sections/StatsSection";
import ModuleSection from "./sections/ModuleSection";

/**
 * Keep already-opened sections mounted to avoid re-fetching heavy assets (images/audio)
 * when switching tabs back and forth.
 *
 * IMPORTANT:
 * - This only works if OperatorContent itself is NOT being remounted by a parent (e.g. key={activeTab}).
 * - We always mount the CURRENT active tab immediately (no 1-render blank).
 */
const OperatorContent = ({ activeTab, operator, charId, lang }) => {
  const tabIds = useMemo(
    () => ["skins", "profile", "stats", "skills", "modules", "voice"],
    []
  );

  const [mountedTabs, setMountedTabs] = useState(() => {
    const s = new Set();
    if (activeTab) s.add(activeTab);
    return s;
  });

  useEffect(() => {
    if (!activeTab) return;
    setMountedTabs((prev) => {
      if (prev.has(activeTab)) return prev;
      const next = new Set(prev);
      next.add(activeTab);
      return next;
    });
  }, [activeTab]);

  const renderSection = useCallback(
    (id) => {
      if (id === "skins") return <SkinsSection operator={operator} lang={lang} />;
      if (id === "profile") return <ProfileSection operator={operator} lang={lang} />;
      if (id === "stats") return <StatsSection operator={operator} charId={charId} lang={lang} />;
      if (id === "skills") return <SkillsSection operator={operator} lang={lang} />;
      if (id === "modules") return <ModuleSection operator={operator} lang={lang} />;
      if (id === "voice") return <VoiceSection operator={operator} lang={lang} />;
      return null;
    },
    [operator, charId, lang]
  );

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {tabIds.map((id) => {
        const isActive = activeTab === id;
        // Always mount the active tab; keep previously opened tabs mounted too.
        const shouldMount = isActive || mountedTabs.has(id);

        return (
          <div key={id} style={{ display: isActive ? "block" : "none" }}>
            {shouldMount ? renderSection(id) : null}
          </div>
        );
      })}
    </div>
  );
};

export default OperatorContent;
