import React, { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Layout from "./components/Layout";
import LoadingScreen from "./components/UI/LoadingScreen";

// lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Music = lazy(() => import("./pages/Music"));
const Operator = lazy(() => import("./pages/Operator"));

const GuideStory = lazy(() => import("./pages/GuideStory"));
const GuideDetail = lazy(() => import("./pages/GuideDetail"));
const StoryDetail = lazy(() => import("./pages/StoryDetail"));

const DatabasePage = lazy(() => import("./pages/DatabasePage"));

const MaterialsPage = lazy(() => import("./pages/MaterialsPage"));
const MaterialDetail = lazy(() => import("./pages/MaterialDetail"));
const MaterialPlanner = lazy(() => import("./pages/MaterialPlanner"));

const BossesPage = lazy(() => import("./pages/BossesPage"));
const BossDetail = lazy(() => import("./pages/BossDetail"));

const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => {
  const location = useLocation();

  useEffect(() => {
    // reset scroll when page changes
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-full h-screen bg-[#121212] text-white overflow-hidden">
        <div className="h-full">
          <div className="flex bg-black h-screen">
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
              <Suspense fallback={<LoadingScreen />}>
                <Routes location={location}>
                  <Route element={<Layout />}>
                    {/* Home */}
                    <Route path="/" element={<Home />} />

                    {/* Operators */}
                    <Route path="/operator" element={<Operator />} />
                    <Route path="/operator/:id" element={<Operator />} />
                    {/* Music */}
                    <Route path="/music" element={<Music />} />

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
                    <Route
                      path="/database/bosses/:id"
                      element={<BossDetail />}
                    />

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </Suspense>
            </main>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default App;
