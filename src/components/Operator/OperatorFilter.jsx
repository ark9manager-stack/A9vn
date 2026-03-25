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
    <div className="relative w-full">
      {/* Filter Button */}
      <button
        className="p-2 bg-emerald-500/20 rounded-full shadow-lg hover:bg-emerald-600 transition"
        onClick={() => setShowFilter(!showFilter)}
      >
        <FaFilter size={15} />
      </button>

      {showFilter && (
        <div className="absolute top-full inset-x-0 bg-black/80 backdrop-blur-md p-4 mt-2 rounded-lg shadow-xl z-50">
          {/* ===== MAIN CLASS ===== */}
          <div className="flex flex-nowrap gap-2 mb-4 overflow-x-auto">
            {CLASSES.map((cls) => (
              <button
                key={cls.value}
                onClick={() => handleClassClick(cls.value)}
                className={`p-2 rounded-md w-16 flex flex-col items-center transition
                  ${
                    activeClass === cls.value
                      ? "bg-green-600"
                      : "bg-[#242424] hover:bg-opacity-70"
                  }
                `}
              >
                <img
                  src={professionIconUrl(cls.value)}
                  alt={cls.label}
                  className="w-8 h-8 object-contain"
                />
                <span className="text-xs text-gray-300 mt-1">{cls.label}</span>
              </button>
            ))}
          </div>

          {/* ===== SUBCLASS ===== */}
          {activeClass && (availableSubclasses?.length ?? 0) > 0 && (
            <div className="flex flex-nowrap gap-2 mb-4 overflow-x-auto">
              {availableSubclasses.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => handleSubclassClick(sub.id)}
                  className={`p-2 rounded-md w-16 flex flex-col items-center transition
                    ${
                      activeSubClass === sub.id
                        ? "bg-emerald-600"
                        : "bg-[#242424] hover:bg-opacity-70"
                    }
                  `}
                >
                  <img
                    src={sub.icon}
                    alt={sub.label}
                    className="w-8 h-8 object-contain"
                  />
                  <span className="text-xs text-gray-300 mt-1">
                    {sub.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* ===== SEARCH ===== */}
          <div className="mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search operator name..."
              className="w-full p-2 rounded-md bg-[#242424] text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* ===== TAGS ===== */}
          <div className="flex flex-wrap gap-2 mb-4 max-h-48 overflow-y-auto">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-2 py-1 rounded border border-white/20 text-xs break-words max-w-[180px]
                  ${tags.includes(tag) ? "bg-yellow-500 text-black" : "bg-[#242424] text-gray-200"}
                `}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* ===== POSITION ===== */}
          <div className="flex gap-2 mb-4">
            {["MELEE", "RANGED"].map((pos) => (
              <button
                key={pos}
                onClick={() =>
                  setPosition((prev) => (prev === pos ? null : pos))
                }
                className={`px-3 py-1 rounded
                  ${position === pos ? "bg-blue-500" : "bg-[#242424]"}
                `}
              >
                {pos}
              </button>
            ))}
          </div>

          {/* ===== ACTIONS ===== */}
          <div className="flex justify-end gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1 bg-gray-600 rounded"
            >
              Reset
            </button>
            <button
              onClick={handleApply}
              className="px-3 py-1 bg-green-600 rounded"
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
