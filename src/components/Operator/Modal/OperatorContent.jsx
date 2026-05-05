import React, { useCallback, Suspense, lazy, useEffect, useState } from "react";
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
  const [mountedTabs, setMountedTabs] = useState(() => new Set([activeTab || "skins"]));

  useEffect(() => {
    setMountedTabs(new Set([activeTab || "skins"]));
  }, [charId]);

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
    <div className="operator-content-shell ak-steel-content-bg flex-1 h-full min-h-0 overflow-y-auto p-0 md:p-5">
      {tabIds.map((id) => {
        const isActive = activeTab === id;
        if (!mountedTabs.has(id)) return null;
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
