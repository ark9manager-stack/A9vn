import React, { useEffect, useMemo, useState } from "react";
import { FaFilter } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

import OperatorCard from "../components/Operator/OperatorCard";
import OperatorModal from "../components/Operator/OperatorModal";
import ScrollLockContainer from "../components/UI/ScrollLockContainer";
import { useOperators } from "../hooks/useOperators";
import { useOperatorFilter } from "../hooks/useOperatorFilter";
import OperatorFilter from "../components/Operator/OperatorFilter";

const Operator = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [appliedFilter, setAppliedFilter] = useState({
    class: null,
    subclasses: [],
  });
  const { operators, selectedOperator, setSelectedOperator } = useOperators();
  const { filteredOperators } = useOperatorFilter({
    operators,
    activeClass: appliedFilter.class,
    activeSubClass: appliedFilter.subclasses?.[0] ?? null,
  });
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
        <div className="w-full max-w-6xl mx-auto px-4 md:px-8 lg:px-16 h-full flex flex-col">
          <div className="w-full flex items-center mb-0 gap-4 pt-12">
            <h1 className="font-bold text-3xl md:text-4xl lg:text-1xl bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Operator
            </h1>

            <OperatorFilter
              operators={operators}
              onFilterChange={(filterData) => {
                setAppliedFilter(filterData);
              }}
            />
          </div>

          <div className="w-full border-t border-gray-600 my-4" />

          <ScrollLockContainer className="w-full flex-1 overflow-y-auto overflow-x-hidden p-2">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-0">
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
