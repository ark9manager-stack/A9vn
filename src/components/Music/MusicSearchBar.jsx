import React from "react";
import { Search, X } from "lucide-react";

const MusicSearchBar = ({ searchTerm, setSearchTerm, setCurrentPage }) => {
  const handleClear = () => {
    setSearchTerm("");
    setCurrentPage?.(1);
  };

  return (
    <div className="music-search-shell">
      <div className="mx-auto w-full max-w-[min(44rem,calc(100vw-1.5rem))]">
        <div className="group relative overflow-hidden rounded-lg border border-white/15 bg-black/45 shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-md transition duration-300 focus-within:border-primary/70 focus-within:shadow-[0_0_0_1px_hsl(var(--primary)/0.35),0_18px_50px_rgba(0,0,0,0.34)]">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent,rgba(255,255,255,0.08),transparent_38%),linear-gradient(90deg,hsl(var(--primary)/0.12),transparent_34%,hsl(var(--accent)/0.12))] opacity-70" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-primary via-white to-accent transition-transform duration-500 group-focus-within:scale-x-100" />

          <div className="relative flex min-h-[clamp(48px,6vh,58px)] items-center gap-2.5 px-3 sm:gap-3 sm:px-5">
            <div className="grid size-[clamp(34px,4.5vh,40px)] shrink-0 place-items-center rounded-md border border-white/10 bg-white/[0.04] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <Search
                className="size-[clamp(17px,2.3vh,20px)]"
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-0.5 hidden font-mono-tech text-[10px] uppercase tracking-[0.22em] text-white/35 sm:block">
                Monster Siren signal search
              </div>
              <label htmlFor="music-search" className="sr-only">
                Tìm album hoặc bài hát
              </label>
              <input
                id="music-search"
                type="text"
                placeholder="Tìm album hoặc bài hát"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage?.(1);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") handleClear();
                }}
                className="w-full bg-transparent py-2 font-heading text-[clamp(1rem,2.35vh,1.25rem)] font-semibold text-white outline-none placeholder:text-white/38 sm:py-0"
              />
            </div>

            <div className="hidden h-[clamp(28px,4.5vh,36px)] items-end gap-1 border-l border-white/10 pl-3 sm:flex lg:pl-4">
              {[18, 28, 14, 34, 22].map((height, index) => (
                <span
                  key={height}
                  className="music-search-signal-bar block w-1 rounded-full bg-gradient-to-t from-primary/40 via-white/65 to-accent/80"
                  style={{
                    height,
                    animationDelay: `${index * 120}ms`,
                  }}
                />
              ))}
            </div>

            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                className="grid size-[clamp(32px,4.5vh,36px)] shrink-0 place-items-center rounded-md border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-white/25 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                aria-label="Xóa tìm kiếm"
                title="Xóa tìm kiếm"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="relative grid grid-cols-12 gap-px border-t border-white/10 bg-white/[0.03] px-3 py-1 sm:px-4 sm:py-1.5">
            {Array.from({ length: 12 }, (_, index) => (
              <span
                key={index}
                className={`h-1 rounded-full ${
                  searchTerm
                    ? "bg-primary/45 shadow-[0_0_10px_hsl(var(--primary)/0.18)]"
                    : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicSearchBar;
