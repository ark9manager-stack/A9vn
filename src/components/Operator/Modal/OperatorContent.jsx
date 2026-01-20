import React from "react";
// import SkinsSection from "./sections/SkinsSection";
import ProfileSection from "./sections/ProfileSection";
import StatsSection from "./sections/StatsSection";
import SkillsSection from "./sections/SkillsSection";
import TalentsSection from "./sections/TalentsSection";

const OperatorContent = ({ activeTab }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* {activeTab === "skins" && <SkinsSection />} */}
      {activeTab === "profile" && <ProfileSection />}
      {activeTab === "stats" && <StatsSection />}
      {activeTab === "skills" && <SkillsSection />}
      {activeTab === "talents" && <TalentsSection />}
    </div>
  );
};

export default OperatorContent;
