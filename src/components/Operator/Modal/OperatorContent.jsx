import React from "react";
import SkinsSection from "./sections/SkinsSection";
import ProfileSection from "./sections/ProfileSection";
import StatsSection from "./sections/StatsSection";
import SkillsSection from "./sections/SkillsSection";
import VoiceSection from "./sections/VoiceSection";

const OperatorContent = ({ activeTab, operator }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      {activeTab === "skins" && <SkinsSection operator={operator} />}
      {activeTab === "profile" && <ProfileSection operator={operator} />}
      {activeTab === "stats" && <StatsSection operator={operator} />}
      {activeTab === "skills" && <SkillsSection operator={operator} />}
      {activeTab === "voice" && <VoiceSection operator={operator} />}
    </div>
  );
};

export default OperatorContent;
