import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// This hook ensures that the scroll position is saved in sessionStorage for each route.
// On route change or page reload, it restores the scroll position for the current route.
// This is critical for maintaining a seamless user experience in a single-page application.
const useScrollRestoration = () => {
  const location = useLocation();

  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem(location.pathname);
    if (savedScrollPosition) {
      window.scrollTo(0, parseInt(savedScrollPosition, 10));
    }

    const handleScroll = () => {
      sessionStorage.setItem(location.pathname, window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [location]);

  useEffect(() => {
    const sectionId = location.pathname.slice(1) || "home";
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location]);
};

export default useScrollRestoration;
