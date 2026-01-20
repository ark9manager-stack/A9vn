import React from "react";
import ProfileSection from "./sections/ProfileSection";
import StatsSection from "./sections/StatsSection";
import SkillsSection from "./sections/SkillsSection";
import TalentsSection from "./sections/TalentsSection";
// import SkinsSection from "./sections/SkinsSection";

const OperatorContent = ({ activeTab }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      {activeTab === "profile" && <ProfileSection />}
      {activeTab === "stats" && <StatsSection />}
      {activeTab === "skills" && <SkillsSection />}
      {activeTab === "talents" && <TalentsSection />}
      {/* {activeTab === "skins" && <SkinsSection />} */}
    </div>
  );
};

export default OperatorContent;
