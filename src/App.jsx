import React, { Suspense, useEffect, useRef, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AnalyticsTracker from "./components/AnalyticsTracker";
import SeoManager from "./components/SEO/SeoManager";

import Layout from "./components/Layout";
import LoadingScreen from "./components/UI/LoadingScreen";
import RouteErrorBoundary from "./components/UI/RouteErrorBoundary";
import PRTSIntro from "./components/PRTSIntro";
import { MusicPlayerProvider } from "./contexts/MusicPlayerContext";
import { lazyWithRetry } from "./utils/lazyWithRetry";

// lazy load pages
const Home = lazyWithRetry(() => import("./pages/Home"), { label: "Home page" });
const Music = lazyWithRetry(() => import("./pages/Music"), { label: "Music page" });
const Operator = lazyWithRetry(() => import("./pages/Operator"), { label: "Operator page" });

const GuideStory = lazyWithRetry(() => import("./pages/GuideStory"), { label: "GuideStory page" });
const GuideDetail = lazyWithRetry(() => import("./pages/GuideDetail"), { label: "GuideDetail page" });
const StoryDetail = lazyWithRetry(() => import("./pages/StoryDetail"), { label: "StoryDetail page" });

const DatabasePage = lazyWithRetry(() => import("./pages/DatabasePage"), { label: "Database page" });

const MaterialsPage = lazyWithRetry(() => import("./pages/MaterialsPage"), { label: "Materials page" });
const MaterialDetail = lazyWithRetry(() => import("./pages/MaterialDetail"), { label: "MaterialDetail page" });
const MaterialPlanner = lazyWithRetry(() => import("./pages/MaterialPlanner"), { label: "MaterialPlanner page" });

const BossesPage = lazyWithRetry(() => import("./pages/BossesPage"), { label: "Bosses page" });
const BossDetail = lazyWithRetry(() => import("./pages/BossDetail"), { label: "BossDetail page" });

const NotFound = lazyWithRetry(() => import("./pages/NotFound"), { label: "NotFound page" });

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
    if (!showIntro) return;
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      /* ignore */
    }
  }, [showIntro]);

  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    const previousPath = previousPathRef.current;
    const currentPath = location.pathname;
    previousPathRef.current = currentPath;

    const isOperatorPath = (path) => /^\/operator(?:\/|$)/i.test(String(path || ""));

    if (isOperatorPath(previousPath) && isOperatorPath(currentPath)) {
      return;
    }

    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <MusicPlayerProvider>
        <AnalyticsTracker />
        <SeoManager />
        {showIntro && <PRTSIntro onComplete={() => setShowIntro(false)} />}
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
      </MusicPlayerProvider>
    </QueryClientProvider>
  );
};

export default App;
