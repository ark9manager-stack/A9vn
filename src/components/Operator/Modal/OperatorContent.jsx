import React, { useCallback } from "react";
import SkinsSection from "./sections/SkinsSection";
import ProfileSection from "./sections/ProfileSection";
import SkillsSection from "./sections/SkillsSection";
import VoiceSection from "./sections/VoiceSection";
import StatsSection from "./sections/StatsSection";
import ModuleSection from "./sections/ModuleSection";

const OperatorContent = ({ activeTab, operator, charId, lang }) => {
  const tabIds = ["skins", "profile", "stats", "skills", "modules", "voice"];

  const renderSection = useCallback(
    (id) => {
      if (id === "skins") return <SkinsSection operator={operator} charId={charId} lang={lang} />;
      if (id === "profile") return <ProfileSection operator={operator} charId={charId} lang={lang} />;
      if (id === "stats") return <StatsSection operator={operator} charId={charId} lang={lang} />;
      if (id === "skills") {
        return (
          <SkillsSection operator={operator} charId={charId} lang={lang} isTabActive={activeTab === "skills"}
          />
        );
      }
      if (id === "modules") {
        return (
          <ModuleSection operator={operator} charId={charId} lang={lang} isTabActive={activeTab === "modules"}
          />
        );
      }
      if (id === "voice") return <VoiceSection operator={operator} charId={charId} lang={lang} />;
      return null;
    },
    [activeTab, operator, charId, lang]
  );

  return (
    <div className="flex-1 h-full min-h-0 overflow-y-auto p-6">
      {tabIds.map((id) => {
        const isActive = activeTab === id;
        return (
          <div key={id} className={isActive ? "block h-full" : "hidden h-full"}>
            {renderSection(id)}
          </div>
        );
      })}
    </div>
  );
};

export default OperatorContent;
