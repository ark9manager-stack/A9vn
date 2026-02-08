import { useCallback, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";

function normalizePath(pathname) {
  const p = String(pathname || "/");
  if (p === "/" || /^\/home\/?$/i.test(p)) return "/Home";
  if (/^\/operator=.+$/i.test(p) || /^\/operator\/?$/i.test(p)) return "/Operator";
  if (/^\/music\/?$/i.test(p) || /^\/Music\/?$/i.test(p)) return "/Music";
  if (/^\/Home\/?$/i.test(p)) return "/Home";
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

  const debounced = useMemo(
    () =>
      debounce((sections, pathname, navigate, container, suppressRef) => {
        if (suppressRef?.current) return;
        if (!container) return;

        const current = normalizePath(pathname);

        const h = container.clientHeight || window.innerHeight;
        if (!h) return;

        const idx = Math.max(
          0,
          Math.min(sections.length - 1, Math.round(container.scrollTop / h)),
        );

        const nextPath = normalizePath(sections[idx]?.path);

        if (nextPath && nextPath !== current && lastPathRef.current !== nextPath) {
          lastPathRef.current = nextPath;
          navigate(nextPath, { replace: false });
        }
      }, 120),
    [],
  );

  const onScroll = useCallback(() => {
    const container = scrollContainerRef?.current;
    debounced(sections, location.pathname, navigate, container, suppressRef);
  }, [debounced, sections, location.pathname, navigate, scrollContainerRef, suppressRef]);

  useEffect(() => {
    const container = scrollContainerRef?.current;
    if (!container) return;

    container.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      container.removeEventListener("scroll", onScroll);
      debounced.cancel?.();
    };
  }, [onScroll, debounced, scrollContainerRef]);
}
