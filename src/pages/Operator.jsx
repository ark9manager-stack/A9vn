import React, { useState } from "react";
import OperatorCard from "../components/Operator/OperatorCard";
import OperatorModal from "../components/Operator/OperatorModal";
import ScrollLockContainer from "../components/UI/ScrollLockContainer";
import { useOperators } from "../hooks/useOperators";
import { useOperatorFilter } from "../hooks/useOperatorFilter";
import { CLASSES } from "../config/operatorConfig";
import { professionIconUrl } from "../utils/operatorUtils";

const Operator = () => {
  const { operators, selectedOperator, setSelectedOperator } = useOperators();
  const [activeClass, setActiveClass] = useState(null);
  const [activeSubClass, setActiveSubClass] = useState(null);

  const { availableSubclasses, filteredOperators } = useOperatorFilter({
    operators,
    activeClass,
    activeSubClass,
  });

  const handleToggleClass = (value) => {
    if (activeClass === value) {
      setActiveClass(null);
      setActiveSubClass(null);
    } else {
      setActiveClass(value);
      setActiveSubClass(null);
    }
  };
  return (
    <div
      id="operator"
      className="fullpage-section bg-gradient-to-br from-green-900 via-black to-green-900"
    >
      <div className="w-full h-full">
        <div className="w-full max-w-6xl mx-auto px-6 h-full flex flex-col">
          <div className="w-full flex items-center mb-4 gap-4 pt-12">
            <h1 className="font-bold text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Operator
            </h1>

            <div className="flex flex-wrap gap-2 ml-auto pt-4">
              {CLASSES.map((cls) => (
                <button
                  key={cls.value}
                  onClick={() => handleToggleClass(cls.value)}
                  className={`p-2 rounded-lg w-20 flex flex-col items-center transition
                    ${
                      activeClass === cls.value
                        ? "bg-green-600"
                        : "bg-[#242424] bg-opacity-50 hover:bg-opacity-70"
                    }
                  `}
                  type="button"
                >
                  <img
                    src={professionIconUrl(cls.value)}
                    alt={cls.label}
                    className="w-10 h-10 object-contain"
                  />
                  <span className="text-xs text-gray-300 mt-1">
                    {cls.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {activeClass && availableSubclasses.length > 0 && (
            <div className="w-full mb-2">
              <div className="flex flex-wrap gap-2 justify-end">
                {availableSubclasses.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() =>
                      setActiveSubClass(
                        activeSubClass === sub.id ? null : sub.id,
                      )
                    }
                    className={`p-2 rounded-lg w-24 flex flex-col items-center transition
                      ${
                        activeSubClass === sub.id
                          ? "bg-emerald-600"
                          : "bg-[#242424] bg-opacity-40 hover:bg-opacity-70"
                      }
                    `}
                    type="button"
                    title={sub.label}
                  >
                    <div className="h-[44px] w-full flex items-center justify-center">
                      <img
                        src={sub.icon}
                        alt={sub.label}
                        className="max-h-[44px] max-w-[56px] w-auto h-auto object-contain"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>

                    <span className="mt-1 text-[11px] leading-tight text-gray-200 truncate w-full text-center">
                      {sub.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="w-full border-t border-gray-600 my-4" />

          <ScrollLockContainer className="w-full flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {filteredOperators.map((op) => (
                <OperatorCard
                  key={op.id}
                  operator={op}
                  onClick={() => setSelectedOperator(op)}
                />
              ))}
            </div>
          </ScrollLockContainer>
        </div>
      </div>

      {selectedOperator && (
        <OperatorModal
          operator={selectedOperator}
          onClose={() => setSelectedOperator(null)}
        />
      )}
    </div>
  );
};

export default Operator;
