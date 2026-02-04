import React, { useState, useRef } from "react";
import { songsData } from "../../assets/icon-assets/assets";
import { assets } from "../../assets/icon-assets/assets";

const Player = () => {
  return null;
  const [position, setPosition] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight - 100,
  }); // Initial position
  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [lyricsVisible, setLyricsVisible] = useState(false);
  const dragRef = useRef(null);

  const handleMouseDown = (e) => {
    if (!isOpen) {
      setIsDragging(true);
      dragRef.current = {
        startX: e.clientX - position.x,
        startY: e.clientY - position.y,
      };
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragRef.current.startX,
        y: e.clientY - dragRef.current.startY,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleMenu = () => {
    if (!isDragging) {
      setIsOpen(!isOpen);
    }
  };

  const toggleLyrics = () => {
    setLyricsVisible(!lyricsVisible);
  };

  const icons = [
    { src: assets.shuffle_icon, alt: "Shuffle" },
    { src: assets.prev_icon, alt: "Previous" },
    { src: assets.play_icon, alt: "Play" },
    { src: assets.next_icon, alt: "Next" },
    { src: assets.loop_icon, alt: "Loop" },
    { src: assets.mic_icon, alt: "Lyrics", onClick: toggleLyrics }, // Using mic as placeholder for lyrics
  ];

  return (
    <div
      className="fixed z-50 cursor-pointer"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -50%)",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={toggleMenu}
    >
      {/* Bubble */}
      <div className="w-16 h-16 bg-green-800 rounded-full flex items-center justify-center shadow-lg">
        <img className="w-8 h-8" src={assets.play_icon} alt="Player Bubble" />{" "}
        {/* Default icon in bubble */}
      </div>

      {/* Arc Menu when open */}
      {isOpen && (
        <div className="absolute top-0 left-0 w-16 h-16 flex items-center justify-center">
          {icons.map((icon, index) => {
            const angle = (index / icons.length) * 180 - 90; // Semi-circle arc
            const radius = 80; // Distance from center
            const x = radius * Math.cos((angle * Math.PI) / 180);
            const y = radius * Math.sin((angle * Math.PI) / 180);
            return (
              <div
                key={index}
                className="absolute w-10 h-10 bg-[#242424] rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                style={{ transform: `translate(${x}px, ${y}px)` }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (icon.onClick) icon.onClick();
                }}
              >
                <img className="w-6 h-6" src={icon.src} alt={icon.alt} />
              </div>
            );
          })}
        </div>
      )}

      {/* Lyrics Display */}
      {lyricsVisible && (
        <div className="absolute top-[-200px] left-0 bg-black p-4 rounded-lg text-white max-w-xs">
          <p>Lyrics for {songsData[0].name}...</p>
          {/* Add actual lyrics content here */}
          <button onClick={toggleLyrics} className="mt-2 text-gray-400">
            Close
          </button>
        </div>
      )}

      {/* Other controls like volume, etc., can be added similarly */}
    </div>
  );
};

export default Player;
