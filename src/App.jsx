import React, { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AnalyticsTracker from "./components/AnalyticsTracker";
import SeoManager from "./components/SEO/SeoManager";

import Layout from "./components/Layout";
import LoadingScreen from "./components/UI/LoadingScreen";
import RouteErrorBoundary from "./components/UI/RouteErrorBoundary";
import PRTSIntro from "./components/PRTSIntro";
import { MusicPlayerProvider } from "./contexts/MusicPlayerContext";
import {
  createLazyAppModule,
  preloadIntroAppModules,
} from "./utils/appModules";
import { installRawGithubAssetFallback } from "./utils/githubCdnFallback";

const Home = createLazyAppModule("pageHome");
const Music = createLazyAppModule("pageMusic");
const Operator = createLazyAppModule("pageOperator");

const GuideStory = createLazyAppModule("pageGuideStory");
const GuideDetail = createLazyAppModule("pageGuideDetail");
const StoryDetail = createLazyAppModule("pageStoryDetail");

const DatabasePage = createLazyAppModule("pageDatabase");

const MaterialsPage = createLazyAppModule("pageMaterials");
const MaterialDetail = createLazyAppModule("pageMaterialDetail");
const MaterialPlanner = createLazyAppModule("pageMaterialPlanner");

const BossesPage = createLazyAppModule("pageBosses");
const BossDetail = createLazyAppModule("pageBossDetail");

const NotFound = createLazyAppModule("pageNotFound");

const queryClient = new QueryClient();
const INTRO_KEY = "prts_intro_shown_v1";

const App = () => {
  const location = useLocation();
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(INTRO_KEY) !== "1";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    return installRawGithubAssetFallback();
  }, []);

  useEffect(() => {
    if (!showIntro) return;
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      /* ignore */
    }
  }, [showIntro]);

  const preloadIntro = useCallback((onProgress) => {
    return preloadIntroAppModules({ onProgress, concurrency: 3 });
  }, []);

  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    if (showIntro) return;

    const previousPath = previousPathRef.current;
    const currentPath = location.pathname;
    previousPathRef.current = currentPath;

    const isOperatorPath = (path) => /^\/operator(?:\/|$)/i.test(String(path || ""));

    if (isOperatorPath(previousPath) && isOperatorPath(currentPath)) {
      return;
    }

    window.scrollTo(0, 0);
  }, [location.pathname, showIntro]);

  return (
    <QueryClientProvider client={queryClient}>
      <MusicPlayerProvider>
        <AnalyticsTracker />
        <SeoManager />
        {showIntro ? (
          <PRTSIntro
            preload={preloadIntro}
            onComplete={() => setShowIntro(false)}
          />
        ) : (
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <RouteErrorBoundary resetKey={location.pathname}>
              <Suspense fallback={<LoadingScreen />}>
                <Routes location={location}>
                  <Route element={<Layout />}>
                    {/* Home */}
                    <Route path="/" element={<Home />} />

                    {/* Operators */}
                    <Route path="/operator" element={<Operator />} />
                    <Route path="/Operator" element={<Operator />} />
                    <Route path="/operator/:id" element={<Operator />} />
                    <Route path="/Operator/:id" element={<Operator />} />

                    {/* Music */}
                    <Route path="/music" element={<Music />} />
                    <Route path="/Music" element={<Music />} />
                    <Route path="/music/:songId" element={<Music />} />
                    <Route path="/Music/:songId" element={<Music />} />

                    {/* Guide */}
                    <Route path="/guide-story" element={<GuideStory />} />
                    <Route path="/guide/:id" element={<GuideDetail />} />

                    {/* Story */}
                    <Route path="/story/:id" element={<StoryDetail />} />

                    {/* Database */}
                    <Route path="/database" element={<DatabasePage />} />

                    {/* Materials */}
                    <Route
                      path="/database/materials"
                      element={<MaterialsPage />}
                    />
                    <Route
                      path="/database/materials/:id"
                      element={<MaterialDetail />}
                    />

                    {/* Planner */}
                    <Route
                      path="/database/planner"
                      element={<MaterialPlanner />}
                    />

                    {/* Boss */}
                    <Route path="/database/bosses" element={<BossesPage />} />
                    <Route path="/database/bosses/:id" element={<BossDetail />} />

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </Suspense>
            </RouteErrorBoundary>
          </main>
        )}
      </MusicPlayerProvider>
    </QueryClientProvider>
  );
};

export default App;
