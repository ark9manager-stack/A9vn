import React, { useState } from "react";
import { FaFilter } from "react-icons/fa";
import { CLASSES } from "../../config/operatorConfig";
import { useOperatorFilter } from "../../hooks/useOperatorFilter";
import { professionIconUrl } from "../../utils/operatorUtils";

const OperatorFilter = ({ onFilterChange, operators }) => {
  const [activeClasses, setActiveClasses] = useState([]);
  const [activeSubclasses, setActiveSubclasses] = useState([]);
  const [tags, setTags] = useState([]);
  const [positions, setPositions] = useState([]);
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const { availableSubclasses } = useOperatorFilter({
    operators,
    activeClass: activeClasses,
    activeSubClass: activeSubclasses,
    tags,
    position: positions,
    search,
  });

  const handleClassClick = (cls) => {
    setActiveClasses((prev) => {
      const found = prev.includes(cls);
      const next = found ? prev.filter((c) => c !== cls) : [...prev, cls];

      setActiveSubclasses((prevSub) =>
        prevSub.filter((sub) =>
          operators.some(
            (op) =>
              next.includes(op.profession) && (op.subProfession || "") === sub,
          ),
        ),
      );

      return next;
    });
  };

  const handleSubclassClick = (subclass) => {
    setActiveSubclasses((prev) =>
      prev.includes(subclass)
        ? prev.filter((sub) => sub !== subclass)
        : [...prev, subclass],
    );
  };

  const handleReset = () => {
    setActiveClasses([]);
    setActiveSubclasses([]);
    setTags([]);
    setPositions([]);
    setSearch("");

    onFilterChange({
      class: [],
      subclasses: [],
      tags: [],
      position: [],
      search: "",
    });
  };

  const handleApply = () => {
    onFilterChange({
      class: activeClasses,
      subclasses: activeSubclasses,
      tags,
      position: positions,
      search,
    });

    setShowFilter(false);
  };

  return (
    <div className="w-full">
      {/* ===== TOP BAR ===== */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1 max-w-sm">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleApply();
              }
            }}
            placeholder="Search operators..."
            className="w-full pl-3 pr-3 py-2 rounded-md bg-white/5 border border-white/10 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400"
          />
        </div>

        {/* Toggle Filter */}
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`p-2 rounded-md border transition
          ${
            showFilter
              ? "bg-emerald-500/30 border-emerald-400"
              : "bg-white/5 border-white/10 hover:bg-white/10"
          }
        `}
        >
          <FaFilter size={14} />
        </button>

        {/* Reset */}
        {(activeClasses.length ||
          activeSubclasses.length ||
          tags.length ||
          positions.length ||
          search) && (
          <button
            onClick={handleReset}
            className="text-xs px-2 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10"
          >
            Clear
          </button>
        )}
      </div>

      {/* ===== FILTER PANEL ===== */}
      {showFilter && (
        <div className="p-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur-md space-y-4 animate-fade-in">
          {/* ===== CLASS ===== */}
          <div>
            <p className="text-xs text-gray-400 mb-2">Class</p>
            <div className="flex flex-wrap gap-2">
              {CLASSES.map((cls) => (
                <button
                  key={cls.value}
                  onClick={() => handleClassClick(cls.value)}
                  className={`p-2 rounded-md w-19 flex items-center text-xs border transition
                  ${
                    activeClasses.includes(cls.value)
                      ? "bg-emerald-500/30 border-emerald-400 text-white gap-1"
                      : "bg-white/5 border-white/10 hover:bg-white/10 gap-1"
                  }
                `}
                >
                  <img
                    src={professionIconUrl(cls.value)}
                    alt={cls.label}
                    className="w-6 h-6 object-contain"
                  />
                  <span className="text-xs text-gray-300 mt-1">
                    {cls.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ===== SUBCLASS ===== */}
          {activeClasses.length > 0 &&
            (availableSubclasses?.length ?? 0) > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Subclass</p>
                <div className="flex flex-wrap gap-2">
                  {availableSubclasses.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => handleSubclassClick(sub.id)}
                      className={`p-2 rounded-md w-19 flex items-center text-xs border transition
                    ${
                      activeSubclasses.includes(sub.id)
                        ? "bg-emerald-500/30 border-emerald-400 gap-1"
                        : "bg-white/5 border-white/10 hover:bg-white/10 gap-1"
                    }
                  `}
                    >
                      <img
                        src={sub.icon}
                        alt={sub.label}
                        className="w-6 h-6 object-contain"
                      />
                      <span className="text-xs text-gray-300 mt-1">
                        {sub.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          {/* ===== POSITION ===== */}
          <div>
            <p className="text-xs text-gray-400 mb-2">Position</p>
            <div className="flex gap-2">
              {["MELEE", "RANGED"].map((pos) => (
                <button
                  key={pos}
                  onClick={() =>
                    setPositions((prev) =>
                      prev.includes(pos)
                        ? prev.filter((p) => p !== pos)
                        : [...prev, pos],
                    )
                  }
                  className={`px-3 py-1 rounded-md text-xs border transition
                  ${
                    positions.includes(pos)
                      ? "bg-blue-500/30 border-blue-400"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }
                `}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* ===== ACTION ===== */}
          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <button
              onClick={handleApply}
              className="px-3 py-1 text-sm rounded bg-emerald-500/80 hover:bg-emerald-500"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorFilter;
