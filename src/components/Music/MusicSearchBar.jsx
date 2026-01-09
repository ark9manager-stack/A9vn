import React, { useEffect, useRef, useState } from "react";
import AnimatedContent from "../UI/AnimatedContent";

const MusicSearchBar = ({
  searchTerm,
  setSearchTerm,
  setCurrentPage,

  // ✅ mới: chọn result
  onPickSong,  // (songResult) => void
  onPickAlbum, // (albumResult) => void
}) => {
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const abortRef = useRef(null);

  useEffect(() => {
    const q = (searchTerm || "").trim();
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    // abort request cũ
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const t = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        const arr = Array.isArray(data?.results) ? data.results : [];
        setResults(arr);
        setOpen(true);
      } catch (e) {
        if (e.name !== "AbortError") {
          setResults([]);
          setOpen(false);
        }
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [searchTerm]);

  return (
    <AnimatedContent className="mb-8">
      <div className="max-w-md mx-auto">
        <div className="relative z-50">
          <input
            type="text"
            placeholder='Tìm kiếm bài hát'
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage?.(1);
            }}
            onFocus={() => {
              if (results.length > 0) setOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
            className="w-full px-6 py-3 bg-[#242424] text-white rounded-2xl 
                     border-2 border-transparent focus:border-blue-400 
                     focus:outline-none text-lg placeholder-gray-400 
                     backdrop-blur-sm"
          />

          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
            ) : (
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
            )}
          </div>

          {open && (loading || results.length > 0) && (
            <div className="absolute mt-2 w-full bg-[#111] border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
              <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-700">
                Kết quả
              </div>

              <ul className="max-h-[320px] overflow-y-auto">
                {results.slice(0, 12).map((r, idx) => (
                  <li key={`${r.type}-${r.album_id}-${r.id_list ?? "x"}-${idx}`}>
                    <button
                      type="button"
                      onClick={() => {
                        if (r.type === "song") onPickSong?.(r);
                        else onPickAlbum?.(r);
                        setOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-white/10 transition"
                    >
                      {r.type === "song" ? (
                        <>
                          <div className="text-white font-semibold truncate">
                            {r.song_name}
                          </div>
                          <div className="text-gray-400 text-sm truncate">
                            {r.album_name}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-white font-semibold truncate">
                            {r.album_name}
                          </div>
                          <div className="text-gray-400 text-sm truncate">
                            Album
                          </div>
                        </>
                      )}
                    </button>
                  </li>
                ))}

                {!loading && results.length === 0 && (
                  <li className="px-4 py-3 text-gray-400">Không có kết quả.</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {open && (
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
        )}
      </div>
    </AnimatedContent>
  );
};

export default MusicSearchBar;
