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

    const behavior = navType === "POP" ? "auto" : "smooth";
    container.scrollTo({ top: el.offsetTop, behavior });

    const t = setTimeout(() => {
      suppressRef.current = false;
    }, 600);

    return () => clearTimeout(t);
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
