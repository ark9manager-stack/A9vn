import React, { useEffect, useMemo, useState } from "react";
import { FaFilter } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

import OperatorCard from "../components/Operator/OperatorCard";
import OperatorModal from "../components/Operator/OperatorModal";
import ScrollLockContainer from "../components/UI/ScrollLockContainer";
import { useOperators } from "../hooks/useOperators";
import { useOperatorFilter } from "../hooks/useOperatorFilter";
import { CLASSES } from "../config/operatorConfig";
import { professionIconUrl } from "../utils/operatorUtils";

const Operator = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { operators, selectedOperator, setSelectedOperator } = useOperators();
  const [activeClass, setActiveClass] = useState(null);
  const [activeSubClass, setActiveSubClass] = useState(null);
  const [showClassFilter, setShowClassFilter] = useState(false);

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

  const operatorIdFromUrl = useMemo(() => {
    const p = String(location.pathname || "");
    const m = p.match(/^\/operator=([^/]+)$/i);
    if (!m) return null;
    try {
      return decodeURIComponent(m[1]);
    } catch {
      return m[1];
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!operators || operators.length === 0) return;

    if (!operatorIdFromUrl) {
      if (selectedOperator) setSelectedOperator(null);
      return;
    }

    const found = operators.find(
      (op) =>
        op.id === operatorIdFromUrl || String(op.idweb) === operatorIdFromUrl,
    );
    if (found) setSelectedOperator(found);
  }, [operatorIdFromUrl, operators, selectedOperator, setSelectedOperator]);

  const openOperator = (op) => {
    setSelectedOperator(op);
    navigate(`/Operator=${encodeURIComponent(op.id)}`, {
      state: { background: location.state?.background ?? location },
    });
  };

  const closeOperatorModal = () => {
    setSelectedOperator(null);

    if (location.state?.background) {
      navigate(-1);
      return;
    }

    navigate("/Operator", { replace: true });
  };

  return (
    <div
      id="operator"
      className="fullpage-section bg-gradient-to-br from-green-900 via-black to-green-900"
    >
      <div className="w-full h-full">
        <div className="w-full max-w-6xl mx-auto px-6 h-full flex flex-col">
          <div className="w-full flex items-center mb-0 gap-4 pt-12">
            <h1 className="font-bold text-3xl md:text-4xl lg:text-1xl bg-gradient-to-r hidden md:block from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Operator
            </h1>

            <button
              className="md:hidden p-2 bg-green-600 rounded-full text-white shadow-lg hover:bg-green-700"
              onClick={() => setShowClassFilter(!showClassFilter)}
              type="button"
            >
              <FaFilter size={15} />
            </button>

            <div
              className={`flex flex-wrap gap-2 ml-auto pt-4 transition-all duration-300 overflow-hidden 
                ${showClassFilter ? "max-h-96" : "max-h-0"} md:max-h-full`}
            >
              {CLASSES.map((cls) => (
                <button
                  key={cls.value}
                  onClick={() => handleToggleClass(cls.value)}
                  className={`p-1 md:p-2 rounded-md w-16 md:w-20 flex flex-col items-center transition
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
                    className="w-6 h-6 md:w-8 md:h-8 object-contain"
                  />
                  <span className="text-[10px] md:text-xs text-gray-300 mt-1">
                    {cls.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {activeClass && (availableSubclasses?.length ?? 0) > 0 && (
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

          <ScrollLockContainer className="w-full flex-1 overflow-y-auto overflow-x-hidden p-2">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(96px,1fr))] gap-2 justify-center">
              {filteredOperators.map((op) => (
                <OperatorCard
                  key={op.id}
                  operator={op}
                  onClick={() => openOperator(op)}
                />
              ))}
            </div>
          </ScrollLockContainer>
        </div>
      </div>

      {selectedOperator && (
        <OperatorModal
          operator={selectedOperator}
          onClose={closeOperatorModal}
        />
      )}
    </div>
  );
};

export default Operator;
