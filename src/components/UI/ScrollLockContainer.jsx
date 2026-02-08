import React from "react";

/**
 * ScrollLockContainer
 * - Mục tiêu: cho phép scroll bên trong container (Operator grid / list)
 * - Đồng thời ngăn "scroll chain" làm kéo luôn parent (fullpage-container)
 *
 * Không can thiệp document.body.style (tránh làm hỏng fullpage scroll + history).
 */
const ScrollLockContainer = ({ children, className = "" }) => {
  return (
    <div className={`overscroll-contain ${className}`}>
      {children}
    </div>
  );
};

export default ScrollLockContainer;
