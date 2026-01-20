import React from "react";

const RarityStars = ({ rarity = 6 }) => {
  return (
    <div className="flex gap-1 mt-2">
      {Array.from({ length: rarity }).map((_, i) => (
        <span key={i} className="text-yellow-400 text-lg">
          ★
        </span>
      ))}
    </div>
  );
};

export default RarityStars;
