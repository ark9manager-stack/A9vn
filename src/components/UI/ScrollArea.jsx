import React from "react";

const ScrollArea = ({ children, className = "", orientation = "vertical" }) => {
  const scrollStyle =
    orientation === "horizontal"
      ? "overflow-x-auto overflow-y-hidden"
      : "overflow-y-auto overflow-x-hidden";

  return (
    <div
      className={`relative ${scrollStyle} overscroll-contain ${className}`}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {children}
    </div>
  );
};

export default ScrollArea;
