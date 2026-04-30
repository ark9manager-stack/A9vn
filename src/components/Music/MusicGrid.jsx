import React from "react";
import MusicCard from "./MusicCard";

const MusicGrid = ({
  songs,
  startIndex,
  onSelectMusic,
  className = "",
  scrollable = false,
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="music-grid mb-8">
        <div className={scrollable ? "music-mobile-scroll" : "contents"}>
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
    </div>
  );
};

export default MusicGrid;
