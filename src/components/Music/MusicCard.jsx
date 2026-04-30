import React from "react";

const MusicCard = ({ item, onClick }) => {
  return (
    <button
      type="button"
      className="music-card group cursor-pointer text-left transition-all duration-300"
      onClick={onClick}
    >
      <div className="music-card-cover relative w-full shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover rounded-lg shadow-lg"
        />
      </div>
      <div className="music-card-info">
        <h3 className="truncate text-sm font-medium text-white">{item.name}</h3>
        <p className="truncate text-xs text-gray-300">{item.desc}</p>
      </div>
    </button>
  );
};

export default MusicCard;
