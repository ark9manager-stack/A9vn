import React, { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

import Home from "./Home";
import Operator from "./Operator";
import Music from "./Music";
import useScrollRouter from "../hooks/useScrollRouter";

const sections = [
  { id: "home", path: "/Home" },
  { id: "operator", path: "/Operator" },
  { id: "music", path: "/Music" },
];

function pathToSectionId(pathname) {
  const p = String(pathname || "/");
  if (p === "/" || /^\/home\/?$/i.test(p)) return "home";
  if (/^\/operator=.+$/i.test(p) || /^\/operator\/?$/i.test(p)) return "operator";
  if (/^\/music\/?$/i.test(p) || /^\/Music\/?$/i.test(p)) return "music";
  if (/^\/Home\/?$/i.test(p)) return "home";
  if (/^\/Operator(=.+)?\/?$/i.test(p)) return "operator";
  return "home";
}

const Display = () => {
  const containerRef = useRef(null);
  const suppressRef = useRef(false);

  const location = useLocation();
  const navType = useNavigationType();

  useScrollRouter(sections, containerRef, suppressRef);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const id = pathToSectionId(location.pathname);
    const el = document.getElementById(id);
    if (!el) return;

    suppressRef.current = true;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const behavior = reduceMotion ? "auto" : "smooth";

    el.scrollIntoView({ behavior, block: "start" });

    let idleTimer = null;
    const IDLE_MS = 180;
    const MAX_MS = 2000;

    const release = () => {
      if (idleTimer) clearTimeout(idleTimer);
      container.removeEventListener("scroll", onScroll);
      suppressRef.current = false;
    };

    const onScroll = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(release, IDLE_MS);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    const maxTimer = setTimeout(release, MAX_MS);

    return () => {
      clearTimeout(maxTimer);
      release();
    };
  }, [location.pathname, navType]);

  return (
    <div className="w-full h-full rounded bg-[#121212] text-white">
      <div ref={containerRef} className="fullpage-container scrollbar-hide">
        <Home />
        <Operator />
        <Music />
      </div>
    </div>
  );
};

export default Display;
