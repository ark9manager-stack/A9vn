import React from "react";

const LangToggle = ({ value, onChange }) => {
  return (
    <button
      className="ml-2 text-xs px-2 py-1 rounded bg-[#242424] hover:bg-[#333]"
      onClick={() => onChange(value === "EN" ? "VN" : "EN")}
      title="Switch Language"
    >
      🌐 {value}
    </button>
  );
};

export default LangToggle;
