import React from "react";

const Playlist = ({ name, desc, image, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-[#242424] p-4 rounded-xl hover:bg-[#2a2a2a] transition-colors duration-200 cursor-pointer"
    >
      <img
        src={image}
        alt={name}
        className="w-full h-32 object-cover rounded-lg mb-3"
      />
      <h3 className="font-semibold text-white text-lg mb-1">{name}</h3>
      <p className="text-gray-400">{desc}</p>
    </div>
  );
};

export default Playlist;
