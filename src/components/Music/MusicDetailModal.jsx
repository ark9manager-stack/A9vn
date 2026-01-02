import React, { useEffect, useRef } from "react";
import { useLyrics } from "../../hooks/useLyrics";

const MusicDetailModal = ({ open, onClose, music, onOpenPlaylist }) => {
  const { lyrics, loading, error } = useLyrics(music?.lyrics);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!open || !music?.audio) return;
    const el = audioRef.current;
    if (!el) return;

    // Load & try play (user đã click nên thường sẽ play được)
    el.load();
    el.play().catch(() => {
      // Nếu browser chặn autoplay thì người dùng bấm Play trên controls
    });
  }, [open, music?.audio]);

  if (!open || !music) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <button
        className="absolute top-8 left-8 text-white text-2xl bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-80 transition"
        onClick={onClose}
        aria-label="Back"
      >
        ←
      </button>

      <div className="w-[92vw] max-w-4xl bg-[#0b0b0f] border border-gray-700 rounded-2xl overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row gap-6">
          {/* Left */}
          <div className="md:w-[320px] flex-shrink-0">
            <img
              src={music.cover}
              alt={music.title}
              className="w-full h-[260px] object-cover rounded-xl border border-gray-700"
            />

            <h2 className="text-white text-2xl font-bold mt-4">{music.title}</h2>

            <div className="mt-4">
              {music.audio ? (
                <audio
                  ref={audioRef}
                  key={music.audio}  // đổi bài là reload ngay
                  controls
                  autoPlay
                  className="w-full"
                  src={music.audio}
                />
              ) : (
                <div className="text-red-300 text-sm">
                  Thiếu URL audio (music.audio).
                </div>
              )}
            </div>

            <button
              className="mt-4 self-start flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition font-semibold"
              onClick={onOpenPlaylist}
            >
              🎵 PLAYLIST
            </button>
          </div>

          {/* Right: Lyrics */}
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold mb-2">Lyrics</div>

            <div className="bg-black/40 border border-gray-700 rounded-xl p-4 h-[340px] overflow-y-auto">
              {loading && <div className="text-gray-300">Đang tải lời...</div>}
              {error && <div className="text-red-300">Lỗi lyric: {error}</div>}

              {!loading && !error && (
                <pre className="text-gray-200 whitespace-pre-wrap break-words leading-relaxed">
                  {lyrics || "Không có lời (URL_LYRIC = null)."}
                </pre>
              )}
            </div>

            {/* Gợi ý nhanh nếu không nghe được */}
            {!music.audio?.startsWith("https://") && (
              <div className="text-yellow-300 text-xs mt-2">
                Lưu ý: Web Vercel chạy HTTPS, nếu audio là HTTP sẽ bị chặn (mixed content).
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicDetailModal;
