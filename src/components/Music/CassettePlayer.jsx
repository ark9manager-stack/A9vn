import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  EyeOff,
  ListMusic,
  Pause,
  Play,
  Repeat2,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";

import { useLyrics } from "../../hooks/useLyrics";
import { useMusicPlayer } from "../../contexts/useMusicPlayer";

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${rest}`;
}

function CassetteReel({ active }) {
  return (
    <div
      className={`relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-black/60 bg-[#050607] shadow-[inset_0_0_0_5px_rgba(255,255,255,0.04),0_0_18px_rgba(0,0,0,0.45)] ${
        active ? "animate-[spin_4.8s_linear_infinite]" : ""
      }`}
    >
      <div className="absolute h-10 w-10 rounded-full border border-white/15 bg-[conic-gradient(from_0deg,#d6d0bd_0_12deg,transparent_12deg_42deg,#6f726c_42deg_54deg,transparent_54deg_84deg,#d6d0bd_84deg_96deg,transparent_96deg_138deg,#6f726c_138deg_150deg,transparent_150deg_360deg)] opacity-80" />
      <div className="relative h-4 w-4 rounded-full border border-white/20 bg-black shadow-[0_0_0_4px_rgba(255,255,255,0.06)]" />
    </div>
  );
}

function IconButton({ label, children, className = "", ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 items-center justify-center border border-white/10 bg-white/[0.04] text-white/70 transition-all duration-200 hover:border-primary/45 hover:bg-primary/10 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function ControlGroup({ children, className = "" }) {
  return (
    <div
      className={`grid items-center gap-2 rounded-md border border-white/10 bg-black/25 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

export default function CassettePlayer() {
  const {
    queue,
    currentIndex,
    currentTrack,
    currentAlbum,
    isPlaying,
    currentTime,
    duration,
    progress,
    volume,
    isMuted,
    shuffle,
    playbackScope,
    playbackMode,
    allQueueLoading,
    togglePlay,
    nextTrack,
    prevTrack,
    selectTrack,
    setVolume,
    toggleMute,
    toggleShuffle,
    togglePlaybackScope,
    cyclePlaybackMode,
    seekTo,
  } = useMusicPlayer();

  const [expanded, setExpanded] = useState(false);
  const [hidden, setHidden] = useState(true);
  const lyricListRef = useRef(null);
  const { entries, loading, error } = useLyrics(currentTrack?.lyrics);

  const activeLyricIndex = useMemo(() => {
    if (!entries.length) return -1;

    let answer = -1;
    for (let index = 0; index < entries.length; index += 1) {
      if (entries[index].time <= currentTime + 0.05) {
        answer = index;
      } else {
        break;
      }
    }

    return answer;
  }, [entries, currentTime]);

  useEffect(() => {
    if (!expanded || activeLyricIndex < 0) return;

    const container = lyricListRef.current;
    const row = container?.querySelector(
      `[data-lyric-idx="${activeLyricIndex}"]`,
    );
    row?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [expanded, activeLyricIndex]);

  if (!currentTrack) return null;

  const cover = currentTrack.cover || currentAlbum?.cover;
  const visibleVolume = isMuted ? 0 : volume;
  const ModeIcon =
    playbackMode === "shuffle"
      ? Shuffle
      : playbackMode === "all"
        ? ArrowRight
        : Repeat2;
  const modeLabel =
    playbackMode === "shuffle"
      ? "Shuffle all tracks"
      : playbackMode === "all"
        ? "Next across all albums"
        : "Repeat current album";
  const modeButtonClass =
    playbackMode === "shuffle"
      ? "border-accent/50 bg-accent/15 text-accent"
      : playbackMode === "all"
        ? "border-primary/50 bg-primary/15 text-primary"
        : "border-white/15 bg-white/[0.05] text-[#d7d0b8]";

  const handleSeek = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const percent = ((event.clientX - rect.left) / rect.width) * 100;
    seekTo(percent);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[45] px-3 pb-3 pointer-events-none md:inset-x-auto md:left-1/2 md:bottom-4 md:w-[min(980px,calc(100vw-48px))] md:-translate-x-1/2 md:px-0 md:pb-0">
      <button
        type="button"
        onClick={() => setHidden(false)}
        className={`pointer-events-auto absolute bottom-3 right-3 border border-primary/30 bg-[#080a0d]/95 px-3 py-2 font-mono-tech text-[0.62rem] uppercase tracking-[2px] text-primary shadow-[0_0_22px_hsl(var(--primary)/0.16)] backdrop-blur-xl transition-all duration-300 ease-out md:bottom-0 md:right-0 ${
          hidden
            ? "translate-y-0 opacity-100"
            : "translate-y-3 opacity-0 pointer-events-none"
        }`}
      >
        SHOW TAPE
      </button>

      <section
        className={`pointer-events-auto relative overflow-hidden rounded-t-lg border border-white/15 bg-[#080a0d]/95 shadow-[0_-18px_60px_rgba(0,0,0,0.5),0_0_24px_hsl(var(--primary)/0.16)] backdrop-blur-xl transition-all duration-300 ease-out md:rounded-lg ${
          hidden
            ? "translate-y-[calc(100%+24px)] opacity-0 pointer-events-none"
            : "translate-y-0 opacity-100"
        }`}
      >
        <IconButton
          label="Hide player"
          onClick={() => setHidden(true)}
          className="absolute right-2 top-2 z-20 h-8 w-8 border-white/15 bg-black/45 text-white/65 hover:border-primary/45 hover:bg-primary/10 hover:text-white"
        >
          <EyeOff size={15} />
        </IconButton>

        <div className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.14),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_42%),repeating-linear-gradient(90deg,rgba(255,255,255,0.035)_0px,rgba(255,255,255,0.035)_1px,transparent_1px,transparent_9px)] opacity-70" />
          <div className="relative p-3 pr-12 md:p-4 md:pr-14">
            <div className="grid grid-cols-[56px,minmax(0,1fr)] gap-3 md:grid-cols-[76px,minmax(0,1fr)] md:items-center md:gap-4">
              <div className="relative h-14 w-14 overflow-hidden border border-white/15 bg-black md:h-[76px] md:w-[76px]">
                {cover ? (
                  <img
                    src={cover}
                    alt=""
                    className="h-full w-full object-cover opacity-90"
                    draggable={false}
                  />
                ) : (
                  <div className="h-full w-full bg-[linear-gradient(135deg,hsl(var(--primary)/0.35),rgba(255,255,255,0.08))]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono-tech text-[0.58rem] uppercase tracking-[2px] text-primary">
                    SIDE A
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
                  <span className="hidden font-mono-tech text-[0.58rem] uppercase tracking-[2px] text-white/35 sm:inline">
                    A9VN TAPE DECK
                  </span>
                </div>

                <div className="mt-1 truncate font-heading text-lg font-bold uppercase tracking-[1.2px] text-white md:text-xl">
                  {currentTrack.title}
                </div>
                <div className="truncate font-mono-tech text-[0.68rem] uppercase tracking-[1.5px] text-white/45">
                  {currentTrack.artist}
                </div>

                <div className="mt-3 hidden rounded-md border border-black/50 bg-[#191713] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-10px_24px_rgba(0,0,0,0.26)] md:block">
                  <div className="grid grid-cols-[58px,1fr,58px] items-center gap-3">
                    <CassetteReel active={isPlaying} />
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-3 font-mono-tech text-[0.58rem] tracking-[2px] text-[#e2d7bc]/65">
                        <span>
                          {allQueueLoading
                            ? "LOADING ALL TAPES"
                            : "TAPE POSITION"}
                        </span>
                        <span>
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>
                      <button
                        type="button"
                        aria-label="Seek track"
                        onClick={handleSeek}
                        className="mt-2 h-2 w-full border border-black/50 bg-black/60 text-left"
                      >
                        <span
                          className="block h-full bg-gradient-to-r from-primary via-[#d7d0b8] to-accent"
                          style={{ width: `${progress}%` }}
                        />
                      </button>
                    </div>
                    <CassetteReel active={isPlaying} />
                  </div>
                </div>
              </div>

              <div className="hidden">
                <ControlGroup className="grid-cols-5 md:grid-cols-[36px_36px_36px_minmax(72px,1fr)_36px_36px]">
                  <IconButton
                    label={shuffle ? "Shuffle on" : "Shuffle off"}
                    onClick={toggleShuffle}
                    className={
                      shuffle
                        ? "border-accent/50 bg-accent/15 text-accent"
                        : "border-white/15 bg-white/[0.05] text-[#d7d0b8]"
                    }
                  >
                    <Shuffle size={16} />
                  </IconButton>
                  <IconButton
                    label={
                      playbackScope === "album"
                        ? "Next trong album"
                        : "Next toàn bộ album"
                    }
                    onClick={togglePlaybackScope}
                    className={
                      playbackScope === "all"
                        ? "border-primary/50 bg-primary/15 text-primary"
                        : "border-white/15 bg-white/[0.05] text-[#d7d0b8]"
                    }
                  >
                    {playbackScope === "album" ? (
                      <Repeat2 size={16} />
                    ) : (
                      <ArrowRight size={16} />
                    )}
                  </IconButton>
                  <IconButton
                    label={isMuted ? "Unmute" : "Mute"}
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </IconButton>
                  <input
                    aria-label="Volume"
                    type="range"
                    min="0"
                    max="100"
                    value={visibleVolume}
                    onChange={(event) => setVolume(Number(event.target.value))}
                    className="hidden min-w-0 accent-primary md:block"
                  />
                  <IconButton
                    label={expanded ? "Collapse player" : "Expand player"}
                    onClick={() => setExpanded((value) => !value)}
                  >
                    {expanded ? (
                      <ChevronDown size={17} />
                    ) : (
                      <ChevronUp size={17} />
                    )}
                  </IconButton>
                </ControlGroup>
              </div>
            </div>

            <div className="mt-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <ControlGroup className="mx-auto w-max grid-flow-col auto-cols-max justify-center">
                <IconButton label="Previous track" onClick={prevTrack}>
                  <SkipBack size={17} />
                </IconButton>
                <IconButton
                  label={isPlaying ? "Pause" : "Play"}
                  onClick={togglePlay}
                  className="h-11 w-11 border-primary/35 bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                >
                  {isPlaying ? <Pause size={19} /> : <Play size={19} />}
                </IconButton>
                <IconButton label="Next track" onClick={nextTrack}>
                  <SkipForward size={17} />
                </IconButton>

                <span className="mx-1 h-7 w-px bg-white/10" />

                <IconButton
                  label={isMuted ? "Unmute" : "Mute"}
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </IconButton>
                <input
                  aria-label="Volume"
                  type="range"
                  min="0"
                  max="100"
                  value={visibleVolume}
                  onChange={(event) => setVolume(Number(event.target.value))}
                  className="w-20 accent-primary sm:w-24 md:w-28"
                />

                <span className="mx-1 h-7 w-px bg-white/10" />

                <IconButton
                  label={modeLabel}
                  onClick={cyclePlaybackMode}
                  className={modeButtonClass}
                >
                  <ModeIcon size={16} />
                </IconButton>

                <span className="mx-1 h-7 w-px bg-white/10" />

                <IconButton
                  label={expanded ? "Collapse player" : "Expand player"}
                  onClick={() => setExpanded((value) => !value)}
                >
                  {expanded ? (
                    <ChevronDown size={17} />
                  ) : (
                    <ChevronUp size={17} />
                  )}
                </IconButton>
              </ControlGroup>
            </div>

            <button
              type="button"
              aria-label="Seek track"
              onClick={handleSeek}
              className="mt-3 h-2 w-full border border-black/50 bg-black/70 text-left md:hidden"
            >
              <span
                className="block h-full bg-gradient-to-r from-primary via-[#d7d0b8] to-accent"
                style={{ width: `${progress}%` }}
              />
            </button>

            <div className="mt-1 flex justify-between font-mono-tech text-[0.58rem] tracking-[1.5px] text-white/40 md:hidden">
              <span>{formatTime(currentTime)}</span>
              <span>
                {allQueueLoading ? "LOADING ALL" : formatTime(duration)}
              </span>
            </div>
          </div>
        </div>

        {expanded && (
          <div className="grid max-h-[56vh] grid-cols-1 gap-3 overflow-y-auto border-t border-white/10 bg-black/35 p-3 md:max-h-[360px] md:grid-cols-[1.15fr_0.85fr] md:overflow-hidden md:p-4">
            <div className="min-h-0">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="font-mono-tech text-[0.65rem] uppercase tracking-[2px] text-white/55">
                  LYRICS
                </span>
                <span className="font-mono-tech text-[0.6rem] uppercase tracking-[2px] text-primary/80">
                  {currentAlbum?.name ?? currentTrack.albumName}
                </span>
              </div>

              <div
                ref={lyricListRef}
                className="h-44 overflow-y-auto border border-white/10 bg-[#050607]/75 p-3 md:h-[276px]"
              >
                {loading && (
                  <div className="font-mono-tech text-sm text-white/45">
                    Dang tai loi...
                  </div>
                )}
                {error && (
                  <div className="font-mono-tech text-sm text-red-300">
                    Khong tai duoc lyric.
                  </div>
                )}
                {!loading && !error && entries.length === 0 && (
                  <div className="font-mono-tech text-sm text-white/35">
                    NO LYRIC DATA
                  </div>
                )}
                {!loading &&
                  !error &&
                  entries.map((entry, index) => (
                    <div
                      key={`${entry.time}-${index}`}
                      data-lyric-idx={index}
                      className={`py-1.5 text-sm leading-relaxed transition-colors ${
                        index === activeLyricIndex
                          ? "font-semibold text-white"
                          : "text-white/38"
                      }`}
                    >
                      {entry.text}
                    </div>
                  ))}
              </div>
            </div>

            <div className="min-h-0">
              <div className="mb-2 flex items-center gap-2">
                <ListMusic size={15} className="text-primary" />
                <span className="font-mono-tech text-[0.65rem] uppercase tracking-[2px] text-white/55">
                  QUEUE
                </span>
                <span className="ml-auto font-mono-tech text-[0.6rem] uppercase tracking-[2px] text-white/35">
                  {queue.length} TRACKS
                </span>
              </div>

              <div className="h-44 overflow-y-auto border border-white/10 bg-[#050607]/75 p-2 md:h-[276px]">
                {queue.map((track, index) => {
                  const active = index === currentIndex;

                  return (
                    <button
                      key={`${track.id}-${index}`}
                      type="button"
                      onClick={() => selectTrack(index, true)}
                      className={`mb-1 grid w-full grid-cols-[34px,1fr] gap-3 px-2 py-2 text-left transition-colors ${
                        active
                          ? "bg-primary/12 text-white"
                          : "text-white/50 hover:bg-white/[0.06] hover:text-white/80"
                      }`}
                    >
                      <span className="font-mono-tech text-[0.65rem] tabular-nums text-white/35">
                        {String(track.id_list ?? index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {track.title}
                        </span>
                        <span className="block truncate font-mono-tech text-[0.58rem] uppercase tracking-[1.5px] text-white/32">
                          {track.artist}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
