import React, {
  useCallback,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import LoadingOp from "../../UI/LoadingOp";
import {
  createLazyAppModule,
  preloadOperatorSectionModules,
} from "../../../utils/appModules";

const SECTION_IDS = ["skins", "profile", "stats", "skills", "modules", "voice"];

const SkinsSection = createLazyAppModule("sectionSkins");
const ProfileSection = createLazyAppModule("sectionProfile");
const SkillsSection = createLazyAppModule("sectionSkills");
const VoiceSection = createLazyAppModule("sectionVoice");
const StatsSection = createLazyAppModule("sectionStats");
const ModuleSection = createLazyAppModule("sectionModules");

function resolveOperatorKey(operator, charId) {
  return String(
    charId ||
      operator?.id ||
      operator?.charId ||
      operator?.char_id ||
      operator?.appellation ||
      operator?.name ||
      "",
  );
}

// Component fallback cho loading
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <LoadingOp />
  </div>
);

const OperatorContent = ({ activeTab, operator, charId, lang }) => {
  const activeTabId = SECTION_IDS.includes(activeTab) ? activeTab : "skins";
  const operatorKey = useMemo(
    () => resolveOperatorKey(operator, charId),
    [operator, charId],
  );
  const [mountedTabs, setMountedTabs] = useState(() => new Set([activeTabId]));
  const previousOperatorKeyRef = useRef(operatorKey);

  useEffect(() => {
    preloadOperatorSectionModules({ concurrency: 3 }).catch(() => null);
  }, []);

  useEffect(() => {
    if (previousOperatorKeyRef.current === operatorKey) return;
    previousOperatorKeyRef.current = operatorKey;
    setMountedTabs(new Set([activeTabId]));
  }, [operatorKey, activeTabId]);

  useEffect(() => {
    if (!activeTabId) return;
    setMountedTabs((prev) => {
      if (prev.has(activeTabId)) return prev;
      const next = new Set(prev);
      next.add(activeTabId);
      return next;
    });
  }, [activeTabId]);

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
              isTabActive={activeTabId === "skills"}
            />
          );
        }
        if (id === "modules") {
          return (
            <ModuleSection
              {...sectionProps}
              isTabActive={activeTabId === "modules"}
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
    [activeTabId, operator, charId, lang],
  );

  return (
    <div className="operator-content-shell section-scroll ak-steel-content-bg flex-1 h-full min-h-0 overflow-y-auto p-0 md:p-5">
      {SECTION_IDS.map((id) => {
        const isActive = activeTabId === id;
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
