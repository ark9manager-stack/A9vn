import { useCallback, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";

function normalizePath(pathname) {
  const p = String(pathname || "/");

  // Canonicalize
  if (p === "/" || /^\/home\/?$/i.test(p)) return "/Home";

  // Operator (including modal style: /Operator=char_xxx)
  if (/^\/operator=.+$/i.test(p) || /^\/operator\/?$/i.test(p)) return "/Operator";

  // Music
  if (/^\/music\/?$/i.test(p)) return "/Music";

  // Already canonical
  if (/^\/Home\/?$/i.test(p)) return "/Home";
  if (/^\/Operator(=.+)?\/?$/i.test(p)) return "/Operator";
  if (/^\/Music\/?$/i.test(p)) return "/Music";

  return p;
}

function pickActiveSection(sections, container) {
  if (!container) return null;

  const cRect = container.getBoundingClientRect();
  const viewTop = cRect.top;
  const viewH = cRect.height || window.innerHeight;
  const centerY = viewTop + viewH / 2;

  let best = null;

  for (const s of sections) {
    const el = document.getElementById(s.id);
    if (!el) continue;

    const r = el.getBoundingClientRect();

    // Chỉ xét section đang hiện trong vùng nhìn (tránh nhảy loạn khi scroll nhanh)
    const inView = r.bottom > viewTop + viewH * 0.2 && r.top < viewTop + viewH * 0.8;
    if (!inView) continue;

    const cy = (r.top + r.bottom) / 2;
    const dist = Math.abs(cy - centerY);

    if (!best || dist < best.dist) best = { section: s, dist };
  }

  return best?.section ?? null;
}

/**
 * useScrollRouter
 * - Khi user scroll fullpage-container để chuyển section, tự động cập nhật URL (/Home, /Operator, /Music)
 * - Mục tiêu: Back/Forward của browser / nút back Android hoạt động đúng giữa các section
 * - Không động vào history.replace (trừ redirect ở router).
 */
export default function useScrollRouter(sections, scrollContainerRef, suppressRef) {
  const navigate = useNavigate();
  const location = useLocation();

  const locationRef = useRef(location.pathname);
  useEffect(() => {
    locationRef.current = location.pathname;
  }, [location.pathname]);

  const sectionsRef = useRef(sections);
  useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

  const lastPathRef = useRef(normalizePath(location.pathname));
  useEffect(() => {
    // Đồng bộ lần cuối cùng router đang ở đâu (canonical)
    lastPathRef.current = normalizePath(location.pathname);
  }, [location.pathname]);

  const commit = useMemo(
    () =>
      debounce(() => {
        const container = scrollContainerRef?.current;
        if (!container) return;
        if (suppressRef?.current) return;

        const active = pickActiveSection(sectionsRef.current, container);
        if (!active) return;

        const current = normalizePath(locationRef.current);
        const next = normalizePath(active.path);

        // Nếu đang ở modal (/Operator=char...) thì current canonical vẫn là /Operator,
        // nên sẽ không bị navigate về /Operator làm mất "=char".
        if (next && next !== current && lastPathRef.current !== next) {
          lastPathRef.current = next;
          navigate(next, { replace: false });
        }
      }, 140),
    [navigate, scrollContainerRef, suppressRef],
  );

  const onScroll = useCallback(() => {
    commit();
  }, [commit]);

  useEffect(() => {
    const container = scrollContainerRef?.current;
    if (!container) return;

    container.addEventListener("scroll", onScroll, { passive: true });

    // iOS/Android: có khi scroll-snap kết thúc sau touchend -> gọi thêm để chắc chắn
    container.addEventListener("touchend", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    // initial sync (ví dụ mở thẳng /Operator)
    onScroll();

    return () => {
      container.removeEventListener("scroll", onScroll);
      container.removeEventListener("touchend", onScroll);
      window.removeEventListener("resize", onScroll);
      commit.cancel?.();
    };
  }, [onScroll, commit, scrollContainerRef]);
}
