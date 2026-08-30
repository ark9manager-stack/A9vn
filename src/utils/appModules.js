import { lazyWithRetry, retryDynamicImport } from "./lazyWithRetry";

const MODULE_IMPORTERS = {
  pageHome: () => import("../pages/Home"),
  pageMusic: () => import("../pages/Music"),
  pageOperator: () => import("../pages/Operator"),
  pageGuideStory: () => import("../pages/GuideStory"),
  pageGuideDetail: () => import("../pages/GuideDetail"),
  pageStoryDetail: () => import("../pages/StoryDetail"),
  pageDatabase: () => import("../pages/DatabasePage"),
  pageMaterials: () => import("../pages/MaterialsPage"),
  pageMaterialDetail: () => import("../pages/MaterialDetail"),
  pageMaterialPlanner: () => import("../pages/MaterialPlanner"),
  pageBosses: () => import("../pages/BossesPage"),
  pageNotFound: () => import("../pages/NotFound"),

  sectionSkins: () => import("../components/Operator/Modal/sections/SkinsSection"),
  sectionProfile: () => import("../components/Operator/Modal/sections/ProfileSection"),
  sectionStats: () => import("../components/Operator/Modal/sections/StatsSection"),
  sectionSkills: () => import("../components/Operator/Modal/sections/SkillsSection"),
  sectionModules: () => import("../components/Operator/Modal/sections/ModuleSection"),
  sectionVoice: () => import("../components/Operator/Modal/sections/VoiceSection"),
};

const MODULE_LABELS = {
  pageHome: "Home page",
  pageMusic: "Music page",
  pageOperator: "Operator page",
  pageGuideStory: "GuideStory page",
  pageGuideDetail: "GuideDetail page",
  pageStoryDetail: "StoryDetail page",
  pageDatabase: "Database page",
  pageMaterials: "Materials page",
  pageMaterialDetail: "MaterialDetail page",
  pageMaterialPlanner: "MaterialPlanner page",
  pageBosses: "Bosses page",
  pageNotFound: "NotFound page",
  sectionSkins: "operator skins section",
  sectionProfile: "operator profile section",
  sectionStats: "operator stats section",
  sectionSkills: "operator skills section",
  sectionModules: "operator modules section",
  sectionVoice: "operator voice section",
};

const INTRO_PRELOAD_KEYS = [
  "pageHome",
  "pageOperator",
  "pageMusic",
  "pageDatabase",
  "pageGuideStory",
  "pageGuideDetail",
  "pageStoryDetail",
  "pageMaterials",
  "pageMaterialDetail",
  "pageMaterialPlanner",
  "pageBosses",
  "pageNotFound",
  "sectionSkins",
  "sectionProfile",
  "sectionStats",
  "sectionSkills",
  "sectionModules",
  "sectionVoice",
];

const modulePromiseCache = new Map();

function getModuleLabel(key, fallback) {
  return fallback || MODULE_LABELS[key] || key || "dynamic module";
}

export function loadAppModule(key, options = {}) {
  const importer = MODULE_IMPORTERS[key];
  if (!importer) return Promise.reject(new Error(`unknown-app-module: ${key}`));

  if (!modulePromiseCache.has(key)) {
    const label = getModuleLabel(key, options.label);
    const promise = retryDynamicImport(importer, {
      retries: 8,
      delayMs: 450,
      label,
      ...options,
    }).catch((error) => {
      modulePromiseCache.delete(key);
      throw error;
    });

    modulePromiseCache.set(key, promise);
  }

  return modulePromiseCache.get(key);
}

export function createLazyAppModule(key, options = {}) {
  return lazyWithRetry(() => loadAppModule(key, options), {
    label: getModuleLabel(key, options.label),
    retries: 8,
    delayMs: 450,
    ...options,
  });
}

export function preloadIntroAppModules({ onProgress, concurrency = 3 } = {}) {
  const keys = INTRO_PRELOAD_KEYS.slice();
  const total = keys.length;
  let completed = 0;
  let nextIndex = 0;

  const report = () => {
    onProgress?.({ completed, total, percent: total ? completed / total : 1 });
  };

  report();

  if (total === 0) return Promise.resolve([]);

  const workerCount = Math.min(Math.max(1, Number(concurrency) || 1), total);
  const results = [];

  const runNext = async () => {
    while (nextIndex < total) {
      const key = keys[nextIndex];
      nextIndex += 1;

      try {
        const value = await loadAppModule(key, {
          label: getModuleLabel(key),
          retries: 6,
          delayMs: 500,
        });
        results.push({ key, status: "fulfilled", value });
      } catch (reason) {
        results.push({ key, status: "rejected", reason });
      } finally {
        completed += 1;
        report();
      }
    }
  };

  return Promise.all(Array.from({ length: workerCount }, runNext)).then(() => results);
}
