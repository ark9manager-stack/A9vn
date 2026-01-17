import React from "react";
import AnimatedContent from "../UI/AnimatedContent";
import MusicCard from "./MusicCard";

const MusicGrid = ({ songs, startIndex, onSelectMusic }) => {
  return (
    <AnimatedContent className="mb-8">
      <div className="music-grid mb-8">
        {songs.map((item, index) => (
          <AnimatedContent key={item.id} className="animate-in">
            <MusicCard
              item={item}
              index={startIndex + index}
              onClick={() => onSelectMusic(item)}
            />
          </AnimatedContent>
        ))}
      </div>
    </AnimatedContent>
  );
};

export default MusicGrid;
