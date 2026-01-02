import React from "react";

const Rightbar = ({
  open,
  albumName = "PLAYLIST",
  playlist = [],
  currentIndex = -1,
  onSelectSong,
  onClose,
}) => {
  // ✅ đóng là ẩn hoàn toàn
  if (!open) return null;

  return (
    <>
      {/* ✅ Backdrop chỉ MOBILE */}
      <div
        className="fixed inset-0 z-40 bg-black/60 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        onClick={(e) => e.stopPropagation()}
        className={`
          fixed z-50 bg-black border border-gray-700 shadow-2xl flex flex-col

          /* ✅ MOBILE: bottom-sheet nhỏ để ưu tiên lyric */
          left-0 right-0 bottom-0 h-[40vh] rounded-t-2xl

          /* ✅ PC: giữ panel bên phải như trước */
          md:left-auto md:right-6 md:bottom-auto md:top-1/2 md:-translate-y-1/2
          md:w-[360px] md:max-w-[85vw] md:h-[80vh] md:rounded-xl
        `}
        style={{ boxShadow: "-8px 0 32px 0 #000a" }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between gap-3">
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose?.();
            }}
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
    </>
  );
};

export default Rightbar;
