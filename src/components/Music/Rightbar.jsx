import React from "react";

const Rightbar = ({
  open,
  albumName = "PLAYLIST",
  playlist = [],
  currentIndex = -1,
  onSelectSong,
  onClose,
}) => {
  return (
    <aside
      className={`fixed right-6 top-1/2 z-50 w-[360px] max-w-[85vw] h-[80vh]
      bg-black border border-gray-700 rounded-xl shadow-2xl
      transition-transform duration-300 ease-in-out
      ${open ? "translate-x-0 -translate-y-1/2" : "translate-x-full -translate-y-1/2"}`}
      style={{ boxShadow: open ? "-8px 0 32px 0 #000a" : "none" }}
    >
      {/* Header + back */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between gap-3 rounded-t-xl">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 flex items-center justify-center bg-[#23232b] rounded-full">
            <span role="img" aria-label="playlist" className="text-2xl">
              🎵
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-white text-xs opacity-70 tracking-widest">
              PLAYLIST
            </div>
            <div className="text-white text-lg font-bold truncate">
              {albumName}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 text-sm font-semibold"
          aria-label="Close playlist"
        >
          ← Back
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3">
        {(!playlist || playlist.length === 0) ? (
          <div className="text-gray-400 px-2 py-3">
            Chưa có bài hát trong album này.
          </div>
        ) : (
          <ul className="flex flex-col gap-1">
            {playlist.map((song, idx) => {
              const active = idx === currentIndex;

              return (
                <li key={song.id ?? `${song.id_list ?? idx}-${idx}`}>
                  <button
                    type="button"
                    onClick={() => onSelectSong?.(song, idx)}
                    className={`w-full text-left rounded-lg px-3 py-2 transition
                      ${active ? "bg-white/10 text-white" : "text-gray-300 hover:bg-[#23232b]"}`}
                  >
                    {/* Grid để chữ xuống dòng mà vẫn thẳng hàng */}
                    <div className="grid grid-cols-[44px,1fr] gap-3 items-start">
                      <span className="text-gray-500 text-right tabular-nums">
                        {song.id_list ?? idx + 1}
                      </span>
                      <span className="min-w-0 whitespace-normal break-words leading-snug">
                        {song.name}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default Rightbar;
