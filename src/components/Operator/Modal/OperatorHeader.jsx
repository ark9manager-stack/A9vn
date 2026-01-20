// components/Operator/modal/OperatorHeader.jsx
import React from "react";
import RarityStars from "../../ui/RarityStars";
import { professionIconUrl } from "../../../utils/operatorUtils";

const OperatorHeader = ({ operator }) => {
  return (
    <div className="h-full flex flex-col items-center p-4 text-white">
      <img
        src={operator.avatar || operator.image}
        alt={operator.name}
        className="w-44 h-44 object-contain mb-4"
      />

      <h2 className="text-2xl font-bold">{operator.name}</h2>

      <RarityStars rarity={operator.rarity} />

      <img
        src={professionIconUrl(operator.profession)}
        className="w-10 h-10 mt-4"
        alt={operator.profession}
      />
    </div>
  );
};

export default OperatorHeader;
