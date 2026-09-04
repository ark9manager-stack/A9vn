import { lazy } from "react";
import { retryDynamicImport } from "./lazyWithRetry";

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

const OPERATOR_SECTION_PRELOAD_KEYS = [
  "sectionSkins",
  "sectionProfile",
  "sectionStats",
  "sectionSkills",
  "sectionModules",
  "sectionVoice",
];

const INTRO_PRELOAD_KEYS = [
  ...OPERATOR_SECTION_PRELOAD_KEYS,
  "pageOperator",
  "pageHome",
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
      retries: 3,
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
  return lazy(() => loadAppModule(key, options));
}

function preloadKeys(keys, { onProgress, concurrency = 3 } = {}) {
  const queue = keys.slice();
  const total = queue.length;
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
      const key = queue[nextIndex];
      nextIndex += 1;

      try {
        const value = await loadAppModule(key, {
          label: getModuleLabel(key),
          retries: 3,
          delayMs: 450,
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

export function preloadOperatorSectionModules(options = {}) {
  return preloadKeys(OPERATOR_SECTION_PRELOAD_KEYS, options);
}

export function preloadIntroAppModules(options = {}) {
  return preloadKeys(INTRO_PRELOAD_KEYS, options);
}
