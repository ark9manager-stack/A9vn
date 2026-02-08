import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import Home from "./Home";
import Music from "./Music";
import Operator from "./Operator";
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
  if (/^\/music\/?$/i.test(p)) return "music";
  if (/^\/Home\/?$/i.test(p)) return "home";
  if (/^\/Operator(=.+)?\/?$/i.test(p)) return "operator";
  if (/^\/Music\/?$/i.test(p)) return "music";
  return "home";
}

const Display = () => {
  const containerRef = useRef(null);
  const suppressRef = useRef(false);

  const location = useLocation();
  const navigate = useNavigate();
  const navType = useNavigationType();

  useScrollRouter(sections, containerRef, suppressRef);

  useEffect(() => {
    const id = pathToSectionId(location.pathname);
    const el = document.getElementById(id);
    if (!el) return;

    suppressRef.current = true;
    const behavior = navType === "POP" ? "auto" : "smooth";
    el.scrollIntoView({ behavior, block: "start" });

    const t = setTimeout(() => {
      suppressRef.current = false;
    }, 700);

    return () => clearTimeout(t);
  }, [location.pathname, navType]);

  useEffect(() => {
    if (location.pathname === "/") {
      navigate("/Home", { replace: true });
    }
  }, [location.pathname, navigate]);

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
