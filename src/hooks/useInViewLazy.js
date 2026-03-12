import { useEffect, useRef, useState } from "react";

export default function useInViewLazy(rootMargin = "300px") {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current || visible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [visible, rootMargin]);

  return [ref, visible];
}
