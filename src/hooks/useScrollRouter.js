import { useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";

// Sync scroll position -> URL (replace để không spam history)
// - Ưu tiên nghe scroll trên container (.fullpage-container)
// - Normalize modal URL như /Operator=char_002_amiya => /Operator để không bị “đá” về /Operator

function isDomEl(x) {
  return x && typeof x === "object" && x.nodeType === 1;
}

function normalizePathname(pathname) {
  const p = String(pathname || "/");

  // Home aliases
  if (p === "/" || /^\/home\/?$/i.test(p)) return "/Home";

  // Operator aliases (including modal-style)
  if (/^\/operator=.+$/i.test(p)) return "/Operator";
  if (/^\/operator\/?$/i.test(p)) return "/Operator";

  // Music aliases
  if (/^\/music\/?$/i.test(p)) return "/Music";

  return p;
}

const useScrollRouter = (sections, scrollContainerRef) => {
  const navigate = useNavigate();
  const location = useLocation();

  const debouncedHandleScroll = useMemo(
    () =>
      debounce((sections, pathname, navigate, scroller) => {
        const current = normalizePathname(pathname);

        const isContainer = isDomEl(scroller);
        const containerRect = isContainer
          ? scroller.getBoundingClientRect()
          : { top: 0, height: window.innerHeight };
        const viewTop = containerRect.top;
        const viewH = containerRect.height || window.innerHeight;

        sections.forEach((section) => {
          const element = document.getElementById(section.id);
          if (!element) return;

          const rect = element.getBoundingClientRect();
          const top = rect.top - viewTop;
          const bottom = rect.bottom - viewTop;

          const isVisible = top < viewH * 0.6 && bottom > viewH * 0.4;

          if (isVisible && current !== section.path) {
            navigate(section.path, { replace: true });
          }
        });
      }, 80),
    [],
  );

  const handleScroll = useCallback(() => {
    const scroller = scrollContainerRef?.current || window;
    debouncedHandleScroll(sections, location.pathname, navigate, scroller);
  }, [debouncedHandleScroll, sections, location.pathname, navigate, scrollContainerRef]);

  useEffect(() => {
    const scroller = scrollContainerRef?.current;
    const target = scroller || window;

    target.addEventListener("scroll", handleScroll, { passive: true });

    // chạy 1 lần để URL đúng ngay khi load
    handleScroll();

    return () => {
      target.removeEventListener("scroll", handleScroll);
      debouncedHandleScroll.cancel?.();
    };
  }, [handleScroll, debouncedHandleScroll, scrollContainerRef]);
};

export default useScrollRouter;
