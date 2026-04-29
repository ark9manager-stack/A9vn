import React from "react";
import { Disc3, Loader2, Music2, Play, X } from "lucide-react";

function DeckReel() {
  return (
    <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-black/70 bg-[#050607] shadow-[inset_0_0_0_5px_rgba(255,255,255,0.04),0_0_18px_rgba(0,0,0,0.5)]">
      <div className="absolute h-11 w-11 rounded-full border border-white/15 bg-[conic-gradient(from_0deg,#d6d0bd_0_12deg,transparent_12deg_44deg,#6f726c_44deg_56deg,transparent_56deg_92deg,#d6d0bd_92deg_106deg,transparent_106deg_150deg,#6f726c_150deg_164deg,transparent_164deg_360deg)] opacity-80" />
      <div className="relative h-4 w-4 rounded-full border border-white/20 bg-black shadow-[0_0_0_5px_rgba(255,255,255,0.06)]" />
    </div>
  );
}

function TrackState({ loading, error }) {
  if (error) {
    return (
      <div className="border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        Loi tai nhac: {String(error)}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/55">
        <Loader2 size={16} className="animate-spin text-primary" />
        Dang tai playlist...
      </div>
    );
  }

  return (
    <div className="border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/45">
      Khong co bai hat trong album nay.
    </div>
  );
}

const AlbumDeck = ({
  open,
  albumName = "PLAYLIST",
  albumCover = "",
  playlist = [],
  currentIndex = -1,
  onSelectSong,
  onClose,
  loading = false,
  error = null,
}) => {
  if (!open) return null;

  const cover = albumCover || playlist?.[0]?.cover;
  const hasTracks = playlist.length > 0;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-3 py-16 sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${albumName} playlist`}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/72 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close playlist"
      />

      <section
        className="relative z-10 grid w-full max-w-5xl max-h-[82vh] grid-rows-[minmax(220px,0.7fr)_minmax(0,1fr)] overflow-hidden border border-white/15 bg-[#080a0d]/96 shadow-[0_24px_80px_rgba(0,0,0,0.58),0_0_30px_hsl(var(--primary)/0.14)] md:grid-cols-[330px_minmax(0,1fr)] md:grid-rows-none"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center border border-white/15 bg-black/55 text-white/65 transition-colors hover:border-red-300/45 hover:bg-red-500/10 hover:text-red-100"
          aria-label="Close playlist"
          title="Close playlist"
        >
          <X size={17} />
        </button>

        <div className="relative min-h-[260px] overflow-hidden border-b border-white/10 bg-[#11100d] md:min-h-0 md:border-b-0 md:border-r md:border-white/10">
          {cover ? (
            <img
              src={cover}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-40"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--primary)/0.28),rgba(255,255,255,0.05))]" />
          )}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,rgba(255,255,255,0.2),transparent_26%),linear-gradient(180deg,rgba(0,0,0,0.22),#080a0d_78%)]" />
          <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.035)_0px,rgba(255,255,255,0.035)_1px,transparent_1px,transparent_9px)] opacity-60" />

          <div className="relative flex h-full min-h-[260px] flex-col justify-end p-5 pr-16 md:min-h-[520px] md:p-6 md:pr-6">
            <div className="mb-5 flex items-center gap-3">
              <DeckReel />
              <DeckReel />
            </div>

            <div className="mb-3 flex items-center gap-2 font-mono-tech text-[0.62rem] uppercase tracking-[2px] text-primary">
              <Disc3 size={14} />
              Album tape
            </div>
            <h2 className="font-heading text-2xl font-bold uppercase tracking-[1.4px] text-white">
              {albumName}
            </h2>
            <div className="mt-3 flex items-center gap-3 border-t border-white/12 pt-3 font-mono-tech text-[0.62rem] uppercase tracking-[2px] text-white/45">
              <span>{playlist.length} tracks</span>
              <span className="h-1 w-1 rounded-full bg-primary/70" />
              <span>Side A</span>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-col bg-[#060708]/92">
          <header className="border-b border-white/10 px-4 py-4 pr-16 sm:px-5">
            <div className="flex items-center gap-2 font-mono-tech text-[0.62rem] uppercase tracking-[2px] text-white/45">
              <Music2 size={15} className="text-primary" />
              Track index
            </div>
            <div className="mt-1 font-heading text-xl font-semibold uppercase tracking-[1px] text-white">
              Select track
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
            {error || loading || !hasTracks ? (
              <TrackState loading={loading} error={error} />
            ) : (
              <ul className="grid gap-2">
                {playlist.map((song, index) => {
                  const active = index === currentIndex;
                  const trackNumber = String(
                    song.id_list ?? index + 1,
                  ).padStart(2, "0");

                  return (
                    <li key={song.id ?? `${song.id_list ?? index}-${index}`}>
                      <button
                        type="button"
                        onClick={() => onSelectSong?.(song, index)}
                        className={`group grid w-full grid-cols-[46px_minmax(0,1fr)_32px] items-center gap-3 border px-3 py-3 text-left transition-colors ${
                          active
                            ? "border-primary/45 bg-primary/12 text-white"
                            : "border-white/10 bg-white/[0.025] text-white/62 hover:border-primary/30 hover:bg-white/[0.055] hover:text-white"
                        }`}
                      >
                        <span className="font-mono-tech text-[0.72rem] tabular-nums tracking-[1.5px] text-white/35">
                          {trackNumber}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">
                            {song.name}
                          </span>
                          <span className="mt-1 block truncate font-mono-tech text-[0.58rem] uppercase tracking-[1.5px] text-white/30">
                            {song.albumName || albumName}
                          </span>
                        </span>
                        <span
                          className={`flex h-8 w-8 items-center justify-center border transition-colors ${
                            active
                              ? "border-primary/45 bg-primary text-primary-foreground"
                              : "border-white/10 bg-black/30 text-white/35 group-hover:border-primary/35 group-hover:text-primary"
                          }`}
                        >
                          <Play size={14} fill="currentColor" />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AlbumDeck;
