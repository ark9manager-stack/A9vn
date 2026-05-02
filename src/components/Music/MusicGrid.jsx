import React from "react";
import AnimatedList from "../UI/AnimatedList";
import MusicCard from "./MusicCard";

const MusicGrid = ({
  songs,
  startIndex,
  onSelectMusic,
  className = "",
  scrollable = false,
}) => {
  if (scrollable) {
    return (
      <div className={`music-grid-wrap ${className}`}>
        <AnimatedList
          items={songs}
          onItemSelect={onSelectMusic}
          className="music-mobile-list"
          itemClassName="transition-transform duration-200"
          getItemKey={(item) => item.id}
          renderItem={(item, index, selected) => (
            <MusicCard
              item={item}
              index={startIndex + index}
              selected={selected}
            />
          )}
          showGradients
          enableArrowNavigation
          displayScrollbar
        />
      </div>
    );
  }

  return (
    <div className={`music-grid-wrap ${className}`}>
      <div className="music-grid">
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
