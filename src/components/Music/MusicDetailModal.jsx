import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLyrics } from "../../hooks/useLyrics";

const MusicDetailModal = ({ open, onClose, music, onOpenPlaylist, isPlaylistOpen }) => {
  const audioRef = useRef(null);
  const listRef = useRef(null);

  const { entries, loading, error } = useLyrics(music?.lyrics);
  const [currentTime, setCurrentTime] = useState(0);

  // Tìm dòng lyric hiện tại (binary search)
  const activeIndex = useMemo(() => {
    if (!entries || entries.length === 0) return -1;
    let lo = 0, hi = entries.length - 1, ans = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (entries[mid].time <= currentTime + 0.05) {
        ans = mid;
        lo = mid + 1;
      } else hi = mid - 1;
    }
    return ans;
  }, [entries, currentTime]);

  useEffect(() => {
    const el = audioRef.current;
    if (!open || !el) return;

    const onTime = () => setCurrentTime(el.currentTime || 0);
    el.addEventListener("timeupdate", onTime);
    return () => el.removeEventListener("timeupdate", onTime);
  }, [open]);

  // Auto scroll đến dòng active
  useEffect(() => {
    if (activeIndex < 0) return;
    const container = listRef.current;
    if (!container) return;

    const row = container.querySelector(`[data-idx="${activeIndex}"]`);
    if (row) row.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeIndex]);

  if (!open || !music) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80">
      {/* chừa chỗ cho playlist bên phải nếu đang mở */}
      <div
        className={`bg-[#0b0b0f] border border-gray-700 rounded-2xl overflow-hidden
          ${isPlaylistOpen ? "md:mr-[420px]" : ""}`}
        style={{ width: "min(920px, 92vw)" }}
      >

        <div className="p-6 flex flex-col gap-4">
          {/* Top: cover + title + audio */}
          <div className="flex gap-4 items-start">
            <img
              src={music.cover}
              alt={music.title}
              className="w-32 h-32 object-cover rounded-xl border border-gray-700"
            />
            <div className="flex-1 min-w-0">
              <div className="text-white text-2xl font-bold truncate">{music.title}</div>

              <div className="mt-3">
                <audio
                  ref={audioRef}
                  key={music.audio}
                  src={music.audio}
                  controls
                  autoPlay
                  className="w-full"
                />
              </div>

              <button
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition font-semibold"
                onClick={onOpenPlaylist}
              >
                🎵 PLAYLIST
              </button>
            </div>
          </div>

          {/* Middle: Lyric */}
          <div className="text-white font-semibold">Lyrics</div>
          <div
            ref={listRef}
            className="bg-black/40 border border-gray-700 rounded-xl p-4 h-[360px] overflow-y-auto"
          >
            {loading && <div className="text-gray-300">Đang tải lời...</div>}
            {error && <div className="text-red-300">Lỗi lyric: {error}</div>}

            {!loading && !error && (
              <div className="flex flex-col gap-2">
                {entries.length === 0 && (
                  <div className="text-gray-400">no lyric</div>
                )}

                {entries.map((e, idx) => (
                  <div
                    key={`${e.time}-${idx}`}
                    data-idx={idx}
                    className={`text-base leading-relaxed break-words
                      ${idx === activeIndex ? "text-white font-bold" : "text-gray-400"}`}
                  >
                    {e.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicDetailModal;
