import React from "react";
import SkinsSection from "./sections/SkinsSection";
import ProfileSection from "./sections/ProfileSection";
import SkillsSection from "./sections/SkillsSection";
import VoiceSection from "./sections/VoiceSection";
import StatsSection from "./sections/StatsSection";
import ModuleSection from "./sections/ModuleSection";

const OperatorContent = ({ activeTab, operator, charId, lang }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      {activeTab === "skins" && <SkinsSection operator={operator} lang={lang} />}
      {activeTab === "profile" && <ProfileSection operator={operator} lang={lang} />}
      {activeTab === "stats" && (
        <StatsSection operator={operator} charId={charId} lang={lang} />
      )}
      {activeTab === "skills" && <SkillsSection operator={operator} lang={lang} />}
      {activeTab === "modules" && <ModuleSection operator={operator} lang={lang} />}
      {activeTab === "voice" && <VoiceSection operator={operator} lang={lang} />}
    </div>
  );
};

export default OperatorContent;

