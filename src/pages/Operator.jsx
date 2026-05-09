import React, { useEffect, useRef, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";

import OperatorCard from "../components/Operator/OperatorCard";
import OperatorModal from "../components/Operator/OperatorModal";
import { useOperators } from "../hooks/useOperators";
import { useOperatorFilter } from "../hooks/useOperatorFilter";
import OperatorFilter from "../components/Operator/OperatorFilter";
import { resetScrollLock } from "../hooks/useScrollLock";
import { CLASSES } from "../config/operatorConfig";
import { professionIconUrl } from "../utils/operatorUtils";

const Operator = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [appliedFilter, setAppliedFilter] = useState({
    class: [],
    subclasses: [],
    tags: [],
    position: [],
    search: "",
  });
  const { operators, selectedOperator, setSelectedOperator } = useOperators();
  const directOperatorBootstrapRef = useRef(false);
  const { filteredOperators } = useOperatorFilter({
    operators,
    activeClass: appliedFilter.class,
    activeSubClass: appliedFilter.subclasses,
    tags: appliedFilter.tags,
    position: appliedFilter.position,
    search: appliedFilter.search,
  });

  const { id: operatorIdFromUrl } = useParams();
  const shouldBootstrapDirectOperator =
    !!operatorIdFromUrl &&
    !location.state?.background &&
    !location.state?.fromOperatorBootstrap;

  const updateAppliedFilter = (patch) => {
    setAppliedFilter((prev) => ({ ...prev, ...patch }));
  };

  const handleQuickProfessionClick = (profession) => {
    setAppliedFilter((prev) => {
      const current = Array.isArray(prev.class) ? prev.class : [];
      const nextClasses = current.includes(profession)
        ? current.filter((item) => item !== profession)
        : [...current, profession];

      return {
        ...prev,
        class: nextClasses,
        subclasses: [],
      };
    });
  };

  useEffect(() => {
    if (!shouldBootstrapDirectOperator) return;
    if (directOperatorBootstrapRef.current) return;

    directOperatorBootstrapRef.current = true;
    navigate("/operator", {
      replace: true,
      state: { pendingOperatorId: operatorIdFromUrl },
    });
  }, [shouldBootstrapDirectOperator, operatorIdFromUrl, navigate]);

  useEffect(() => {
    const pendingId = location.state?.pendingOperatorId;
    if (!pendingId || operatorIdFromUrl || !operators?.length) return;

    const found = operators.find(
      (op) => op.id === pendingId || String(op.idweb) === pendingId,
    );

    if (!found) return;

    setSelectedOperator(found);
    navigate(`/operator/${encodeURIComponent(found.id)}`, {
      replace: true,
      state: { fromOperatorBootstrap: true },
    });
  }, [
    location.state,
    operatorIdFromUrl,
    operators,
    navigate,
    setSelectedOperator,
  ]);

  useEffect(() => {
    if (!selectedOperator) resetScrollLock({ restorePosition: false });
  }, [selectedOperator]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return undefined;
    }

    const repairOperatorPage = () => {
      const path = window.location.pathname.toLowerCase();
      const isOperatorIndex = path === "/operator" || path === "/operator/";

      if (isOperatorIndex || !selectedOperator) {
        resetScrollLock({ restorePosition: false });
      }
    };

    window.addEventListener("pageshow", repairOperatorPage);
    window.addEventListener("focus", repairOperatorPage);
    window.addEventListener("popstate", repairOperatorPage);
    document.addEventListener("visibilitychange", repairOperatorPage);

    return () => {
      window.removeEventListener("pageshow", repairOperatorPage);
      window.removeEventListener("focus", repairOperatorPage);
      window.removeEventListener("popstate", repairOperatorPage);
      document.removeEventListener("visibilitychange", repairOperatorPage);
    };
  }, [selectedOperator]);

  useEffect(() => {
    if (!operators?.length) return;

    if (!operatorIdFromUrl) {
      setSelectedOperator(null);
      directOperatorBootstrapRef.current = false;
      return;
    }

    if (shouldBootstrapDirectOperator) return;

    const found = operators.find(
      (op) =>
        op.id === operatorIdFromUrl || String(op.idweb) === operatorIdFromUrl,
    );

    if (found) setSelectedOperator(found);
  }, [
    operatorIdFromUrl,
    operators,
    setSelectedOperator,
    shouldBootstrapDirectOperator,
  ]);

  const openOperator = (op) => {
    setSelectedOperator(op);

    navigate(`/operator/${encodeURIComponent(op.id)}`, {
      state: { background: location },
    });
  };

  const closeOperatorModal = () => {
    setSelectedOperator(null);

    if (location.state?.background) {
      navigate(-1);
      return;
    }

    navigate("/operator", { replace: true });
  };

  return (
    <div id="operator" className="flex min-h-[calc(100vh-104px)] flex-col">
      <div className="w-full">
        <div className="mx-auto flex w-full max-w-7xl flex-col px-4 md:px-8 lg:px-16">
          <div className="mb-3 grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-3 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
            <h1 className="font-bold text-3xl md:text-4xl lg:text-1xl bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              Operator
            </h1>

            <div className="hidden min-w-0 items-center justify-center gap-1.5 lg:flex">
              {CLASSES.map((cls) => {
                const isActive = appliedFilter.class.includes(cls.value);
                return (
                  <button
                    key={cls.value}
                    type="button"
                    onClick={() => handleQuickProfessionClick(cls.value)}
                    className={`flex w-[58px] flex-col items-center justify-center rounded-md border px-1 py-1.5 text-[10px] leading-tight transition ${
                      isActive
                        ? "border-blue-400 bg-blue-500/30 text-white"
                        : "border-white/10 bg-black/35 text-gray-300 hover:bg-white/10"
                    }`}
                    title={cls.label}
                  >
                    <img
                      src={professionIconUrl(cls.value)}
                      alt={cls.label}
                      className="h-7 w-7 object-contain"
                      loading="lazy"
                      draggable={false}
                    />
                    <span className="mt-0.5 max-w-full truncate">{cls.label}</span>
                  </button>
                );
              })}
            </div>

            <OperatorFilter
              className="min-w-0 justify-self-end"
              operators={operators}
              value={appliedFilter}
              onFilterChange={(filterData) => {
                updateAppliedFilter(filterData);
              }}
            />
          </div>

          <div className="w-full border-t border-gray-600 my-1" />

          <div className="fullpage-section">
            <div className="w-full flex-1 overflow-y-auto overflow-x-hidden p-2">
              {filteredOperators.length === 0 ? (
                <div className="w-full text-center text-gray-300 py-20">
                  No operator found
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-0">
                  {filteredOperators.map((op) => (
                    <OperatorCard
                      key={op.id}
                      operator={op}
                      onClick={() => openOperator(op)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
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
