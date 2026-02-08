import React, { useEffect, useRef } from "react";

const ScrollLockContainer = ({ children, className }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onWheel = (e) => {
      if (!el.contains(e.target)) return;

      const canScroll = el.scrollHeight > el.clientHeight + 1;
      if (!canScroll) return;

      e.preventDefault();
      el.scrollTop += e.deltaY;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default ScrollLockContainer;
