import React from "react";

const SidebarOverlay = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-500 ease-in-out"
      onClick={onClose}
      aria-label="close sidebar"
    />
  );
};

export default SidebarOverlay;
