import React from "react";
import SkinsSection from "./sections/SkinsSection";
import ProfileSection from "./sections/ProfileSection";
import SkillsSection from "./sections/SkillsSection";
import VoiceSection from "./sections/VoiceSection";
import StatsSection from "./sections/StatsSection";

const OperatorContent = ({ activeTab, operator, charId }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      {activeTab === "skins" && <SkinsSection operator={operator} />}
      {activeTab === "profile" && <ProfileSection operator={operator} />}
      {activeTab === "stats" && (
        <StatsSection operator={operator} charId={charId} />
      )}
      {activeTab === "skills" && <SkillsSection operator={operator} />}
      {activeTab === "voice" && <VoiceSection operator={operator} />}
    </div>
  );
};

export default OperatorContent;
