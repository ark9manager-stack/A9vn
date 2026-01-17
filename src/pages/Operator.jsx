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

const SUBPROF_LABELS = {
  agent: "Agent",
  bearer: "Standard Bearer",
  charger: "Charger",
  counsellor: "Strategist",
  pioneer: "Pioneer",
  tactician: "Tactician",
  artsfghter: "Arts Fighter",
  centurion: "Centurion",
  fearless: "Dreadnought",
  lord: "Lord",
  instructor: "Instructor",
  fighter: "Fighter",
  sword: "Swordmaster",
  musha: "Soloblade",
  librator: "Liberator",
  reaper: "Reaper",
  crusher: "Crusher",
  hammer: "Earthshaker",
  primguard: "Primal Guard",
  mercenary: "Mercenary",
  artsprotector: "Arts Protector",
  duelist: "Duelist",
  fortress: "Fortress",
  guardian: "Guardian",
  primprotector: "Primal Protector",
  protector: "Protector",
  shotprotector: "Sentry Protector",
  unyield: "Juggernaut",
  aoesniper: "Artilleryman",
  bombarder: "Flinger",
  fastshot: "Marksman",
  closerange: "Heavyshooter",
  hunter: "Hunter",
  longrange: "Deadeye",
  loopshooter: "Loopshooter",
  reaperrange: "Spreadshooter",
  siegesniper: "Besieger",
  skybreaker: "Skybreaker",
  blastcaster: "Blast Caster",
  chain: "Chain Caster",
  corecaster: "Core Caster",
  funnel: "Mech-Accord Caster",
  mystic: "Mystic Caster",
  phalanx: "Phalanx Caster",
  primcaster: "Primal Caster",
  soulcaster: "Shaper Caster",
  splashcaster: "Splash Caster",
  chainhealer: "Chain Medic",
  healer: "Therapist Medic",
  incantationmedic: "Incantation Medic",
  physician: "Medic",
  ringhealer: "Multi-target Medic",
  wandermedic: "Wandering Medic",
  bard: "Bard",
  blessing: "Abjurer",
  craftsman: "Artificer",
  ritualist: "Ritualist",
  slower: "Decel Binder",
  summoner: "Summoner",
  underminer: "Hexer",

  alchemist: "Alchemist",
  dollkeeper: "Dollkeeper",
  executor: "Executor",
  geek: "Geek",
  hookmaster: "Hookmaster",
  merchant: "Merchant",
  pusher: "Push Stroker",
  skywalker: "Skyranger",
  stalker: "Ambusher",
  traper: "Trapmaster",
};

function subProfIconUrl(subProfessionId) {
  if (!subProfessionId) return "";
  return `https://raw.githubusercontent.com/ArknightsAssets/ArknightsAssets2/refs/heads/cn/assets/dyn/arts/ui/subprofessionicon/sub_${subProfessionId}_icon.png`;
}

function subProfLabel(subProfessionId) {
  if (!subProfessionId) return "";
  return SUBPROF_LABELS[subProfessionId] || subProfessionId;
}

const Operator = () => {
  const { operators, selectedOperator, setSelectedOperator } = useOperators();

  const [activeClass, setActiveClass] = useState(null);
  const [activeSubClass, setActiveSubClass] = useState(null);

  // ✅ danh sách subclass theo main class đang chọn
  const availableSubclasses = useMemo(() => {
    if (!activeClass) return [];

    const set = new Set();
    for (const op of operators) {
      if (op.profession === "TRAP" || op.profession === "TOKEN") continue;
      if (op.profession !== activeClass) continue;
      if (op.subProfession) set.add(op.subProfession);
    }

    return Array.from(set)
      .map((id) => ({
        id,
        icon: subProfIconUrl(id),
        label: subProfLabel(id),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [operators, activeClass]);

  const filteredOperators = useMemo(() => {
    return operators
      .filter((op) => op.profession !== "TRAP")
      .filter((op) => op.profession !== "TOKEN")
      .filter((op) => (activeClass ? op.profession === activeClass : true))
      .filter((op) => (activeSubClass ? op.subProfession === activeSubClass : true))
      .sort((a, b) => {
        if (b.rarity !== a.rarity) return b.rarity - a.rarity;
        if (b.releaseTime && a.releaseTime) return b.releaseTime - a.releaseTime;
        return 0;
      });
  }, [operators, activeClass, activeSubClass]);

  const handleToggleClass = (clsValue) => {
    // click lại cùng class => bỏ chọn + ẩn subclass
    if (activeClass === clsValue) {
      setActiveClass(null);
      setActiveSubClass(null);
      return;
    }
    // đổi class => reset subclass
    setActiveClass(clsValue);
    setActiveSubClass(null);
  };

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
                  <img src={cls.icon} className="w-10 h-10" alt={cls.label} />
                  <span className="text-xs text-gray-300 mt-1">{cls.label}</span>
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
                      setActiveSubClass(activeSubClass === sub.id ? null : sub.id)
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
