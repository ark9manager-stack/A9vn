import React from "react";

const LangToggle = ({ value = "EN", onChange }) => {
  const isEN = value === "EN";

  const handleChange = () => {
    onChange(isEN ? "VN" : "EN");
  };

  return (
    <div className="flex items-center gap-2 select-none">
      {/* TOGGLE */}
      <div className="neo-toggle-container neo-toggle-small">
        <input
          className="neo-toggle-input"
          id="neo-toggle-lang"
          type="checkbox"
          checked={isEN}
          onChange={handleChange}
        />

        <label className="neo-toggle" htmlFor="neo-toggle-lang">
          <div className="neo-track">
            <div className="neo-background-layer" />
            <div className="neo-grid-layer" />

            <div className="neo-spectrum-analyzer">
              <div className="neo-spectrum-bar" />
              <div className="neo-spectrum-bar" />
              <div className="neo-spectrum-bar" />
              <div className="neo-spectrum-bar" />
              <div className="neo-spectrum-bar" />
            </div>

            <div className="neo-track-highlight" />
          </div>

          <div className="neo-thumb">
            <div className="neo-thumb-ring" />
            <div className="neo-thumb-core">
              <div className="neo-thumb-icon">
                <div className="neo-thumb-wave" />
                <div className="neo-thumb-pulse" />
              </div>
            </div>
          </div>

          <div className="neo-gesture-area" />
        </label>
      </div>

      {/* TEXT BÊN PHẢI */}
      <span
        className={`text-xs font-semibold tracking-widest transition-colors
          ${isEN ? "text-gray-100" : "text-white"}
        `}
      >
        {isEN ? "EN" : "VN"}
      </span>
    </div>
  );
};

export default LangToggle;
