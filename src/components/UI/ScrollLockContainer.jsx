import React from "react";

const ScrollLockContainer = ({ children, className = "" }) => {
  return (
    <div
      className={`${className} overscroll-contain`}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {children}
    </div>
  );
};

export default ScrollLockContainer;
