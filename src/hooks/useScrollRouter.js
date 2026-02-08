import { useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function normalizePath(pathname) {
  const p = String(pathname || "/");

  if (p === "/" || /^\/home\/?$/i.test(p)) return "/Home";
  if (/^\/music\/?$/i.test(p) || /^\/Music\/?$/i.test(p)) return "/Music";

  if (/^\/operator=.+$/i.test(p) || /^\/Operator=.+$/i.test(p)) return "/Operator";
  if (/^\/operator\/?$/i.test(p) || /^\/Operator\/?$/i.test(p)) return "/Operator";

  if (/^\/Home\/?$/i.test(p)) return "/Home";
  if (/^\/Music\/?$/i.test(p)) return "/Music";
  if (/^\/Operator(=.+)?\/?$/i.test(p)) return "/Operator";

  return p;
}

export default function useScrollRouter(sections, scrollContainerRef, suppressRef) {
  const navigate = useNavigate();
  const location = useLocation();

  const lastPathRef = useRef(normalizePath(location.pathname));
  useEffect(() => {
    lastPathRef.current = normalizePath(location.pathname);
  }, [location.pathname]);

  const sectionById = useMemo(() => {
    const m = new Map();
    for (const s of sections) m.set(s.id, s);
    return m;
  }, [sections]);

  useEffect(() => {
    const root = scrollContainerRef?.current;
    if (!root) return;

    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean);

    if (els.length === 0) return;

    const thresholds = Array.from({ length: 21 }, (_, i) => i / 20);

    let raf = 0;
    let bestId = null;
    let bestRatio = 0;

    const commit = () => {
      raf = 0;
      if (suppressRef?.current) return;
      if (!bestId) return;

      const s = sectionById.get(bestId);
      if (!s) return;

      const current = normalizePath(location.pathname);
      const next = normalizePath(s.path);

      if (next !== current && lastPathRef.current !== next) {
        lastPathRef.current = next;
        navigate(next, { replace: false });
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const ratio = e.intersectionRatio;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = e.target.id;
          }
        }

        if (!raf) {
          raf = requestAnimationFrame(() => {
            const tmpId = bestId;
            bestId = tmpId;
            bestRatio = 0;
            commit();
          });
        }
      },
      {
        root,
        threshold: thresholds,
        rootMargin: "-25% 0px -25% 0px",
      },
    );

    for (const el of els) io.observe(el);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [navigate, location.pathname, sections, sectionById, scrollContainerRef, suppressRef]);
}
