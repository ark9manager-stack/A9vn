import { useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";

// This hook synchronizes the scroll position with the router state.
// It uses IntersectionObserver to detect when a section is visible (60% in view).
// The URL is updated using navigate(path, { replace: true }) to avoid creating new history entries during scroll.
// Debouncing is applied to prevent excessive updates and improve performance.

const useScrollRouter = (sections) => {
  const navigate = useNavigate();
  const location = useLocation();

  const debouncedHandleScroll = useMemo(
    () =>
      debounce((sections, location, navigate) => {
        sections.forEach((section) => {
          const element = document.getElementById(section.id);
          if (element) {
            const rect = element.getBoundingClientRect();
            const isVisible =
              rect.top < window.innerHeight * 0.6 &&
              rect.bottom > window.innerHeight * 0.4;
            if (isVisible && location.pathname !== section.path) {
              navigate(section.path, { replace: true });
            }
          }
        });
      }, 100),
    [],
  );

  const handleScroll = useCallback(() => {
    debouncedHandleScroll(sections, location, navigate);
  }, [debouncedHandleScroll, sections, location, navigate]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);
};

export default useScrollRouter;
