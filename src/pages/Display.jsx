import React, { useEffect, useRef, lazy, Suspense } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import LoadingScreen from "../components/UI/LoadingScreen";
import useScrollRouter from "../hooks/useScrollRouter";
import useInViewLazy from "../hooks/useInViewLazy";

const Home = lazy(() => import("./Home"));
const Operator = lazy(() => import("./Operator"));
const Music = lazy(() => import("./Music"));

const sections = [
  { id: "home", path: "/Home" },
  { id: "operator", path: "/Operator" },
  { id: "music", path: "/Music" },
];

function pathToSectionId(pathname) {
  const p = String(pathname || "/");

  if (p === "/" || /^\/home\/?$/i.test(p)) return "home";
  if (/^\/operator(=.+)?\/?$/i.test(p)) return "operator";
  if (/^\/music\/?$/i.test(p)) return "music";

  return "home";
}

const Display = () => {
  const containerRef = useRef(null);
  const suppressRef = useRef(false);

  const location = useLocation();
  const navType = useNavigationType();

  useScrollRouter(sections, containerRef, suppressRef);

  const [operatorRef, showOperator] = useInViewLazy();
  const [musicRef, showMusic] = useInViewLazy();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const id = pathToSectionId(location.pathname);
    const el = document.getElementById(id);
    if (!el) return;

    suppressRef.current = true;

    const behavior = "smooth";
    el.scrollIntoView({ behavior, block: "start" });

    const timer = setTimeout(() => {
      suppressRef.current = false;
    }, 400);

    return () => clearTimeout(timer);
  }, [location.pathname, navType]);

  return (
    <div className="w-full h-screen bg-[#121212] text-white overflow-hidden">
      <div
        ref={containerRef}
        className="fullpage-container scrollbar-hide h-full"
      >
        {/* HOME */}
        <section id="home" className="fullpage-section">
          <Suspense fallback={<LoadingScreen />}>
            <Home />
          </Suspense>
        </section>

        {/* OPERATOR */}
        <section id="operator" ref={operatorRef} className="fullpage-section">
          <Suspense fallback={<LoadingScreen />}>
            {showOperator && <Operator />}
          </Suspense>
        </section>

        {/* MUSIC */}
        <section id="music" ref={musicRef} className="fullpage-section">
          <Suspense fallback={<LoadingScreen />}>
            {showMusic && <Music />}
          </Suspense>
        </section>
      </div>
    </div>
  );
};

export default Display;
