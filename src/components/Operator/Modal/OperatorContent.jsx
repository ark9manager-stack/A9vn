import React, { useCallback, Suspense, lazy } from "react";
import LoadingOp from "../../UI/LoadingOp";
// Lazy load các sections
const SkinsSection = lazy(() => import("./sections/SkinsSection"));
const ProfileSection = lazy(() => import("./sections/ProfileSection"));
const SkillsSection = lazy(() => import("./sections/SkillsSection"));
const VoiceSection = lazy(() => import("./sections/VoiceSection"));
const StatsSection = lazy(() => import("./sections/StatsSection"));
const ModuleSection = lazy(() => import("./sections/ModuleSection"));

// Component fallback cho loading
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <LoadingOp />
  </div>
);

const OperatorContent = ({ activeTab, operator, charId, lang }) => {
  const tabIds = ["skins", "profile", "stats", "skills", "modules", "voice"];

  const renderSection = useCallback(
    (id) => {
      const sectionProps = { operator, charId, lang };
      const section = (() => {
        if (id === "skins") return <SkinsSection {...sectionProps} />;
        if (id === "profile") return <ProfileSection {...sectionProps} />;
        if (id === "stats") return <StatsSection {...sectionProps} />;
        if (id === "skills") {
          return (
            <SkillsSection
              {...sectionProps}
              isTabActive={activeTab === "skills"}
            />
          );
        }
        if (id === "modules") {
          return (
            <ModuleSection
              {...sectionProps}
              isTabActive={activeTab === "modules"}
            />
          );
        }
        if (id === "voice") return <VoiceSection {...sectionProps} />;
        return null;
      })();

      return section ? (
        <Suspense fallback={<LoadingFallback />}>{section}</Suspense>
      ) : null;
    },
    [activeTab, operator, charId, lang],
  );

  return (
    <div className="flex-1 h-full min-h-0 overflow-y-auto px-4 pb-4 pt-16 md:p-6">
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
