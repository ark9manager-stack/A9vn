import React from "react";

const rarityBorderMap = {
  5: "border-orange-500 shadow-orange-500/40", // 6★
  4: "border-yellow-400 shadow-yellow-400/40", // 5★
  3: "border-purple-400",
  2: "border-blue-400",
  1: "border-green-400",
  0: "border-gray-400",
};

const OperatorCard = ({ operator, onClick }) => {
  const rarityClass = rarityBorderMap[operator.rarity] || "border-gray-400";

  return (
    <div
      onClick={() => onClick(operator)}
      className="
        cursor-pointer rounded-xl bg-[#1b1b1b]
        hover:scale-105 transition p-3
      "
    >
      {/* Avatar */}
      <div
        className={`
          relative rounded-lg overflow-hidden
          border-2 ${rarityClass}
        `}
      >
        <img
          src={operator.avatar}
          alt={operator.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="mt-2 text-center">
        <div className="text-white font-semibold truncate">{operator.name}</div>

        <div className="text-xs text-gray-400">★{operator.rarity}</div>
      </div>
    </div>
  );
};

export default OperatorCard;
