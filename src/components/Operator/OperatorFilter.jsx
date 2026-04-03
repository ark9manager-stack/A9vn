import React, { useState, useMemo } from "react";
import { FaFilter } from "react-icons/fa";
import { CLASSES } from "../../config/operatorConfig";
import { useOperatorFilter } from "../../hooks/useOperatorFilter";
import { professionIconUrl } from "../../utils/operatorUtils";

const OperatorFilter = ({ onFilterChange, operators }) => {
  const [activeClass, setActiveClass] = useState(null);
  const [activeSubClass, setActiveSubClass] = useState(null);
  const [tags, setTags] = useState([]);
  const [position, setPosition] = useState(null);
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const { availableSubclasses } = useOperatorFilter({
    operators,
    activeClass,
    activeSubClass,
    tags,
    position,
    search,
  });

  const availableTags = useMemo(() => {
    const set = new Set();
    operators?.forEach((op) => {
      if (!Array.isArray(op.tagList)) return;
      op.tagList.forEach((tag) => {
        if (tag) set.add(tag);
      });
    });
    return [...set].sort((a, b) => String(a).localeCompare(String(b)));
  }, [operators]);

  const handleClassClick = (cls) => {
    if (activeClass === cls) {
      setActiveClass(null);
      setActiveSubClass(null);
    } else {
      setActiveClass(cls);
      setActiveSubClass(null);
    }
  };

  const handleSubclassClick = (subclass) => {
    setActiveSubClass((prev) => (prev === subclass ? null : subclass));
  };

  const handleTagClick = (tag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const handleReset = () => {
    setActiveClass(null);
    setActiveSubClass(null);
    setTags([]);
    setPosition(null);
    setSearch("");

    onFilterChange({
      class: null,
      subclasses: [],
      tags: [],
      position: null,
      search: "",
    });
  };

  const handleApply = () => {
    onFilterChange({
      class: activeClass,
      subclasses: activeSubClass ? [activeSubClass] : [],
      tags,
      position,
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
        {(activeClass ||
          activeSubClass ||
          tags.length ||
          position ||
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
                    activeClass === cls.value
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
          {activeClass && (availableSubclasses?.length ?? 0) > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2">Subclass</p>
              <div className="flex flex-wrap gap-2">
                {availableSubclasses.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => handleSubclassClick(sub.id)}
                    className={`p-2 rounded-md w-19 flex items-center text-xs border transition
                    ${
                      activeSubClass === sub.id
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

          {/* ===== TAGS ===== */}
          <div>
            <p className="text-xs text-gray-400 mb-2">Tags</p>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`px-2 py-1 text-xs rounded-md border transition
                  ${
                    tags.includes(tag)
                      ? "bg-yellow-400 text-black border-yellow-300 gap-1"
                      : "bg-white/5 border-white/10 hover:bg-white/10 gap-1"
                  }
                `}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* ===== POSITION ===== */}
          <div>
            <p className="text-xs text-gray-400 mb-2">Position</p>
            <div className="flex gap-2">
              {["MELEE", "RANGED"].map((pos) => (
                <button
                  key={pos}
                  onClick={() =>
                    setPosition((prev) => (prev === pos ? null : pos))
                  }
                  className={`px-3 py-1 rounded-md text-xs border transition
                  ${
                    position === pos
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
