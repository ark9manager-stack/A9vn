import React, { useEffect, useMemo, useState } from "react";
import SkinsSection from "./sections/SkinsSection";
import ProfileSection from "./sections/ProfileSection";
import SkillsSection from "./sections/SkillsSection";
import VoiceSection from "./sections/VoiceSection";
import StatsSection from "./sections/StatsSection";
import ModuleSection from "./sections/ModuleSection";

/**
 * Keep already-opened sections mounted to avoid re-fetching heavy assets (images/audio)
 * when switching tabs back and forth.
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

  const show = (id) => (activeTab === id ? "block" : "none");

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {tabIds.map((id) => (
        <div key={id} style={{ display: show(id) }}>
          {mountedTabs.has(id) ? (
            id === "skins" ? (
              <SkinsSection operator={operator} lang={lang} />
            ) : id === "profile" ? (
              <ProfileSection operator={operator} lang={lang} />
            ) : id === "stats" ? (
              <StatsSection operator={operator} charId={charId} lang={lang} />
            ) : id === "skills" ? (
              <SkillsSection operator={operator} lang={lang} />
            ) : id === "modules" ? (
              <ModuleSection operator={operator} lang={lang} />
            ) : id === "voice" ? (
              <VoiceSection operator={operator} lang={lang} />
            ) : null
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default OperatorContent;
