import React from "react";
import MusicCard from "./MusicCard";

const MusicGrid = ({ songs, startIndex, onSelectMusic }) => {
  return (
    <div className="mb-8">
      <div className="music-grid mb-8">
        {songs.map((item, index) => (
          <div key={item.id} className="animate-in">
            <MusicCard
              item={item}
              index={startIndex + index}
              onClick={() => onSelectMusic(item)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MusicGrid;
