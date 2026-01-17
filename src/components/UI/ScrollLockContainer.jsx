import React, { useEffect, useRef } from "react";

const WHEEL_COOLDOWN = 5000; // 5 giây

const ScrollLockContainer = ({ children, className }) => {
  const ref = useRef(null);
  const lockTimer = useRef(null);
  const isLocked = useRef(false);

  useEffect(() => {
    const handleWheel = (e) => {
      // Nếu wheel xuất phát từ trong container
      if (ref.current && ref.current.contains(e.target)) {
        // 🔒 Khóa scroll page
        lockPageScroll();

        // Cho phép scroll nội bộ
        ref.current.scrollTop += e.deltaY;

        // ❌ chặn page nhận wheel
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      unlockPageScroll();
    };
  });

  const lockPageScroll = () => {
    document.body.style.overflow = "hidden";
    isLocked.current = true;

    // Reset cooldown mỗi lần wheel
    if (lockTimer.current) {
      clearTimeout(lockTimer.current);
    }

    lockTimer.current = setTimeout(() => {
      unlockPageScroll();
    }, WHEEL_COOLDOWN);
  };

  const unlockPageScroll = () => {
    document.body.style.overflow = "";
    isLocked.current = false;

    if (lockTimer.current) {
      clearTimeout(lockTimer.current);
      lockTimer.current = null;
    }
  };

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default ScrollLockContainer;
