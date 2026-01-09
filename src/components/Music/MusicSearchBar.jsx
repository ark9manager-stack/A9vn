import React from "react";
import AnimatedContent from "../UI/AnimatedContent";

const MusicSearchBar = ({ searchTerm, setSearchTerm, setCurrentPage }) => {
  return (
    <AnimatedContent className="mb-8">
      <div className="max-w-md mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder='Tìm album hoặc bài hát'
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage?.(1);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setSearchTerm("");
            }}
            className="w-full px-6 py-3 bg-[#242424] text-white rounded-2xl 
                     border-2 border-transparent focus:border-blue-400 
                     focus:outline-none text-lg placeholder-gray-400 
                     backdrop-blur-sm"
          />

          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>
    </AnimatedContent>
  );
};

export default MusicSearchBar;
