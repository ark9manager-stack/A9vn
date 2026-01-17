import React, { useMemo, useState } from "react";
import AnimatedContent from "../components/UI/AnimatedContent";
import OperatorCard from "../components/Operator/OperatorCard";
import OperatorModal from "../components/Operator/OperatorModal";
import { useOperators } from "../hooks/useOperators";
import ScrollLockContainer from "../components/UI/ScrollLockContainer";

const classes = [
  {
    value: "PIONEER",
    label: "Vanguard",
    icon: "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/[uc]charcommon/dynprofession/icon_profession_pioneer.png",
  },
  {
    value: "WARRIOR",
    label: "Guard",
    icon: "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/[uc]charcommon/dynprofession/icon_profession_warrior.png",
  },
  {
    value: "TANK",
    label: "Defender",
    icon: "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/%5Buc%5Dcharcommon/dynprofession/icon_profession_tank.png",
  },
  {
    value: "SNIPER",
    label: "Sniper",
    icon: "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/[uc]charcommon/dynprofession/icon_profession_sniper.png",
  },
  {
    value: "CASTER",
    label: "Caster",
    icon: "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/[uc]charcommon/dynprofession/icon_profession_caster.png",
  },
  {
    value: "MEDIC",
    label: "Medic",
    icon: "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/[uc]charcommon/dynprofession/icon_profession_medic.png",
  },
  {
    value: "SUPPORT",
    label: "Supporter",
    icon: "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/[uc]charcommon/dynprofession/icon_profession_support.png",
  },
  {
    value: "SPECIAL",
    label: "Specialist",
    icon: "https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/[uc]charcommon/dynprofession/icon_profession_special.png",
  },
];

const Operator = () => {
  const { operators, selectedOperator, setSelectedOperator } = useOperators();
  const [activeClass, setActiveClass] = useState(null);

  const filteredOperators = useMemo(() => {
    return operators
      .filter((op) => op.profession !== "TRAP")
      .filter((op) => op.profession !== "TOKEN")
      .filter((op) => (activeClass ? op.profession === activeClass : true))
      .sort((a, b) => {
        if (b.rarity !== a.rarity) {
          return b.rarity - a.rarity;
        }
        if (b.releaseTime && a.releaseTime) {
          return b.releaseTime - a.releaseTime;
        }
        return 0;
      });
  }, [operators, activeClass]);

  return (
    <div
      id="operator"
      className="fullpage-section bg-gradient-to-br from-green-900 via-black to-green-900"
    >
      <div className="w-full h-full">
        <div className="w-full max-w-6xl mx-auto px-6 h-full flex flex-col">
          {/* Header */}
          <div className="w-full flex items-center mb-4 gap-4 pt-12">
            <h1 className="font-bold text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Operator
            </h1>

            <div className="flex flex-wrap gap-2 ml-auto pt-4">
              {classes.map((cls) => (
                <button
                  key={cls.value}
                  onClick={() =>
                    setActiveClass(activeClass === cls.value ? null : cls.value)
                  }
                  className={`p-2 rounded-lg w-20 flex flex-col items-center transition
                    ${
                      activeClass === cls.value
                        ? "bg-green-600"
                        : "bg-[#242424] bg-opacity-50 hover:bg-opacity-70"
                    }
                  `}
                >
                  <img src={cls.icon} className="w-10 h-10" />
                  <span className="text-xs text-gray-300 mt-1">
                    {cls.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="w-full border-t border-gray-600 my-4" />

          {/* Operator Grid */}
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

      {/* Modal */}
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
