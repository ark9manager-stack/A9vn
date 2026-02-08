import React from "react";
import { Route, Routes } from "react-router-dom";
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

  // aliases
  if (p === "/" || /^\/home\/?$/i.test(p)) return "home";
  if (/^\/operator=.+$/i.test(p) || /^\/operator\/?$/i.test(p)) return "operator";
  if (/^\/music\/?$/i.test(p)) return "music";

  // canonical (capitalized)
  if (/^\/Home\/?$/i.test(p)) return "home";
  if (/^\/Operator(=.+)?\/?$/i.test(p)) return "operator";
  if (/^\/Music\/?$/i.test(p)) return "music";

  return "home";
}

const Display = () => {
  const containerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const navType = useNavigationType();

  // 1) Scroll -> URL
  useScrollRouter(sections, containerRef);

  // 2) URL (kể cả Back/Forward) -> scroll
  useEffect(() => {
    const id = pathToSectionId(location.pathname);
    const container = containerRef.current;
    const el = document.getElementById(id);
    if (!container || !el) return;

    const behavior = navType === "POP" ? "auto" : "smooth";
    container.scrollTo({ top: el.offsetTop, behavior });
  }, [location.pathname, navType]);

  // (tuỳ chọn) Redirect / -> /Home cho URL rõ ràng trên mobile
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
