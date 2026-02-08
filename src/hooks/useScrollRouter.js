import { useCallback, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";

function isDomEl(x) {
  return x && typeof x === "object" && x.nodeType === 1;
}

function normalizePath(pathname) {
  const p = String(pathname || "/");

  if (p === "/" || /^\/home\/?$/i.test(p)) return "/Home";
  if (/^\/operator=.+$/i.test(p) || /^\/operator\/?$/i.test(p)) return "/Operator";
  if (/^\/music\/?$/i.test(p)) return "/Music";

  return p;
}

export default function useScrollRouter(sections, scrollContainerRef, suppressRef) {
  const navigate = useNavigate();
  const location = useLocation();

  const lastPathRef = useRef(normalizePath(location.pathname));

  useEffect(() => {
    lastPathRef.current = normalizePath(location.pathname);
  }, [location.pathname]);

  const debounced = useMemo(
    () =>
      debounce((sections, pathname, navigate, scroller, suppressRef) => {
        if (suppressRef?.current) return;

        const current = normalizePath(pathname);

        const isContainer = isDomEl(scroller);
        const containerRect = isContainer
          ? scroller.getBoundingClientRect()
          : { top: 0, height: window.innerHeight };

        const viewTop = containerRect.top;
        const viewH = containerRect.height || window.innerHeight;
        const viewCenter = viewH / 2;

        let best = null;

        for (const s of sections) {
          const el = document.getElementById(s.id);
          if (!el) continue;

          const r = el.getBoundingClientRect();
          const top = r.top - viewTop;
          const bottom = r.bottom - viewTop;

          const intersects = bottom > viewH * 0.2 && top < viewH * 0.8;
          if (!intersects) continue;

          const center = (top + bottom) / 2;
          const dist = Math.abs(center - viewCenter);

          if (!best || dist < best.dist) best = { section: s, dist };
        }

        if (!best) return;
        const nextPath = normalizePath(best.section.path);

        if (nextPath !== current && lastPathRef.current !== nextPath) {
          lastPathRef.current = nextPath;
          navigate(nextPath, { replace: false });
        }
      }, 250),
    [],
  );

  const onScroll = useCallback(() => {
    const scroller = scrollContainerRef?.current || window;
    debounced(sections, location.pathname, navigate, scroller, suppressRef);
  }, [debounced, sections, location.pathname, navigate, scrollContainerRef, suppressRef]);

  useEffect(() => {
    const scroller = scrollContainerRef?.current;
    const target = scroller || window;

    target.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      target.removeEventListener("scroll", onScroll);
      debounced.cancel?.();
    };
  }, [onScroll, debounced, scrollContainerRef]);
}
