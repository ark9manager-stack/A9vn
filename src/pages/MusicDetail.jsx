import React, { useEffect, useMemo, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Disc3,
  ListMusic,
  Loader2,
  Pause,
  Play,
  Radio,
} from "lucide-react";

import { useLyrics } from "../hooks/useLyrics";
import { useSongDetail } from "../hooks/useSongDetail";
import { useMusicPlayer } from "../contexts/useMusicPlayer";
import { getMusicTrackRouteId, sameMusicTrack } from "../utils/musicTrackIds";

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${rest}`;
}

function DetailState({ loading, error }) {
  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center gap-3 text-white/55">
        <Loader2 size={18} className="animate-spin text-primary" />
        Loading track...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl border border-red-300/20 bg-red-500/10 px-5 py-4 text-red-200">
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl border border-white/10 bg-white/[0.03] px-5 py-4 text-white/55">
      Track not found.
    </div>
  );
}

export default function MusicDetail() {
  const { songId } = useParams();
  const { song, albumTracks, loading, error } = useSongDetail(songId);
  const lyricListRef = useRef(null);
  const detailSeekDragRef = useRef(false);
  const detailSeekPointerHandledRef = useRef(false);
  const detailPendingSeekPercentRef = useRef(null);
  const { entries, loading: lyricLoading, error: lyricError } = useLyrics(
    song?.lyrics,
  );
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    progress,
    playQueue,
    togglePlay,
    seekTo,
  } = useMusicPlayer();

  const isCurrentTrack = !!song && !!currentTrack && sameMusicTrack(currentTrack, song);

  const activeLyricIndex = useMemo(() => {
    if (!isCurrentTrack || entries.length === 0) return -1;

    let answer = -1;
    for (let index = 0; index < entries.length; index += 1) {
      if (entries[index].time <= currentTime + 0.05) answer = index;
      else break;
    }

    return answer;
  }, [currentTime, entries, isCurrentTrack]);

  useEffect(() => {
    if (activeLyricIndex < 0) return;

    const container = lyricListRef.current;
    const row = container?.querySelector(
      `[data-lyric-index="${activeLyricIndex}"]`,
    );
    if (!container || !row) return;

    const containerRect = container.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    const nextTop =
      container.scrollTop +
      rowRect.top -
      containerRect.top -
      container.clientHeight / 2 +
      row.clientHeight / 2;

    container.scrollTo({
      top: Math.max(0, nextTop),
      behavior: "smooth",
    });
  }, [activeLyricIndex]);

  const handlePlay = () => {
    if (!song?.audio) return;

    if (isCurrentTrack) {
      togglePlay();
      return;
    }

    const queue = albumTracks.length > 0 ? albumTracks : [song];
    const startIndex = Math.max(
      0,
      queue.findIndex((track) => sameMusicTrack(track, song)),
    );

    playQueue(queue, startIndex, {
      id: song.albumId,
      name: song.albumName || "PLAYLIST",
      cover: song.cover,
    });
  };

  const getDetailSeekPercentFromClientX = (target, clientX) => {
    if (!isCurrentTrack) return null;

    const rect = target?.getBoundingClientRect?.();
    if (!rect?.width) return null;

    const percent = ((clientX - rect.left) / rect.width) * 100;
    return Math.min(100, Math.max(0, percent));
  };

  const commitDetailSeekFromClientX = (target, clientX) => {
    const percent = getDetailSeekPercentFromClientX(target, clientX);
    if (percent == null) return;
    detailPendingSeekPercentRef.current = percent;
    seekTo(percent);
  };

  const handleDetailSeek = (event) => {
    event.preventDefault?.();
    if (detailSeekPointerHandledRef.current) {
      detailSeekPointerHandledRef.current = false;
      return;
    }
    commitDetailSeekFromClientX(event.currentTarget, event.clientX);
  };

  const handleDetailSeekPointerDown = (event) => {
    event.preventDefault?.();
    detailSeekDragRef.current = true;
    detailSeekPointerHandledRef.current = false;
    detailPendingSeekPercentRef.current = getDetailSeekPercentFromClientX(
      event.currentTarget,
      event.clientX,
    );
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleDetailSeekPointerMove = (event) => {
    if (!detailSeekDragRef.current) return;
    event.preventDefault?.();
    detailPendingSeekPercentRef.current = getDetailSeekPercentFromClientX(
      event.currentTarget,
      event.clientX,
    );
  };

  const handleDetailSeekPointerEnd = (event) => {
    event.preventDefault?.();
    if (detailSeekDragRef.current) {
      const percent =
        getDetailSeekPercentFromClientX(event.currentTarget, event.clientX) ??
        detailPendingSeekPercentRef.current;
      if (percent != null) seekTo(percent);
    }
    detailSeekDragRef.current = false;
    detailSeekPointerHandledRef.current = true;
    detailPendingSeekPercentRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  if (loading || error || !song) {
    return (
      <section className="min-h-[calc(100vh-48px)] bg-[#050607] px-4 py-8 md:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/music"
            className="inline-flex items-center gap-2 font-mono-tech text-[0.68rem] uppercase tracking-[2px] text-white/45 transition-colors hover:text-primary"
          >
            <ArrowLeft size={15} />
            Music archive
          </Link>
          <div className="mt-10">
            <DetailState loading={loading} error={error} />
          </div>
        </div>
      </section>
    );
  }

  const buttonLabel = isCurrentTrack && isPlaying ? "PAUSE" : "PLAY";

  return (
    <section className="min-h-[calc(100vh-48px)] bg-[#050607] px-4 py-7 text-white md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/music"
          className="inline-flex items-center gap-2 font-mono-tech text-[0.68rem] uppercase tracking-[2px] text-white/45 transition-colors hover:text-primary"
        >
          <ArrowLeft size={15} />
          Music archive
        </Link>

        <div className="mt-6 grid gap-4 sm:gap-6 lg:grid-cols-[minmax(300px,400px)_minmax(0,1fr)] xl:grid-cols-[minmax(320px,440px)_minmax(0,1fr)]">
          <aside className="min-w-0 border border-white/12 bg-[#0a0d10] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.4)] md:p-5">
            <div className="aspect-square overflow-hidden border border-white/15 bg-black">
              {song.cover ? (
                <img
                  src={song.cover}
                  alt=""
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="h-full w-full bg-[linear-gradient(135deg,hsl(var(--primary)/0.32),rgba(255,255,255,0.05))]" />
              )}
            </div>

            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="flex items-center gap-2 font-mono-tech text-[0.62rem] uppercase tracking-[2px] text-primary">
                <Disc3 size={14} />
                Track file
              </div>
              <div className="mt-3 grid grid-cols-[84px_minmax(0,1fr)] gap-y-2 font-mono-tech text-[0.68rem] uppercase tracking-[1.5px]">
                <span className="text-white/32">Song ID</span>
                <span className="truncate text-white/70">{song.id_list}</span>
                <span className="text-white/32">Album</span>
                <span className="truncate text-white/70">
                  {song.albumName || "PLAYLIST"}
                </span>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="border border-white/12 bg-[#080a0d] p-5 md:p-6">
              <div className="flex items-center gap-2 font-mono-tech text-[0.65rem] uppercase tracking-[2px] text-primary">
                <Radio size={15} />
                Monster Siren record
              </div>
              <h1 className="mt-4 break-words font-heading text-3xl font-bold uppercase leading-none tracking-[1.4px] text-white sm:text-4xl md:text-6xl">
                {song.title}
              </h1>
              <div className="mt-3 truncate font-mono-tech text-[0.72rem] uppercase tracking-[2px] text-white/42">
                {song.albumName || "PLAYLIST"}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handlePlay}
                  disabled={!song.audio}
                  className="inline-flex h-12 items-center gap-3 border border-primary/40 bg-primary px-5 font-heading text-sm font-bold uppercase tracking-[2px] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {isCurrentTrack && isPlaying ? (
                    <Pause size={18} />
                  ) : (
                    <Play size={18} fill="currentColor" />
                  )}
                  {buttonLabel}
                </button>

                <div className="min-w-full flex-1 sm:min-w-[220px]">
                  <button
                    type="button"
                    aria-label="Seek track"
                    onClick={handleDetailSeek}
                    onPointerDown={handleDetailSeekPointerDown}
                    onPointerMove={handleDetailSeekPointerMove}
                    onPointerUp={handleDetailSeekPointerEnd}
                    onPointerCancel={handleDetailSeekPointerEnd}
                    disabled={!isCurrentTrack}
                    className="h-2 w-full touch-none border border-black/60 bg-black/70 text-left disabled:cursor-default"
                  >
                    <span
                      className="block h-full bg-gradient-to-r from-primary via-[#d7d0b8] to-accent"
                      style={{ width: `${isCurrentTrack ? progress : 0}%` }}
                    />
                  </button>
                  <div className="mt-2 flex justify-between font-mono-tech text-[0.58rem] uppercase tracking-[1.5px] text-white/35">
                    <span>{isCurrentTrack ? formatTime(currentTime) : "0:00"}</span>
                    <span>{isCurrentTrack ? formatTime(duration) : "--:--"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <section className="min-w-0 border border-white/12 bg-[#080a0d]">
                <header className="border-b border-white/10 px-4 py-3 font-mono-tech text-[0.65rem] uppercase tracking-[2px] text-white/55">
                  Lyrics
                </header>
                <div
                  ref={lyricListRef}
                  className="h-[360px] overflow-y-auto p-4 [scrollbar-color:hsl(var(--primary))_rgba(255,255,255,0.08)] md:h-[420px]"
                >
                  {lyricLoading && (
                    <div className="flex items-center gap-3 text-sm text-white/45">
                      <Loader2 size={16} className="animate-spin text-primary" />
                      Loading lyrics...
                    </div>
                  )}
                  {lyricError && (
                    <div className="text-sm text-red-300">
                      Lyric error: {lyricError}
                    </div>
                  )}
                  {!lyricLoading && !lyricError && entries.length === 0 && (
                    <div className="text-sm text-white/35">NO LYRIC DATA</div>
                  )}
                  {!lyricLoading &&
                    !lyricError &&
                    entries.map((entry, index) => (
                      <div
                        key={`${entry.time}-${index}`}
                        data-lyric-index={index}
                        className={`py-2 text-base leading-relaxed transition-colors ${
                          index === activeLyricIndex
                            ? "font-semibold text-white"
                            : "text-white/42"
                        }`}
                      >
                        {entry.text}
                      </div>
                    ))}
                </div>
              </section>

              <section className="min-w-0 border border-white/12 bg-[#080a0d]">
                <header className="flex items-center gap-2 border-b border-white/10 px-4 py-3 font-mono-tech text-[0.65rem] uppercase tracking-[2px] text-white/55">
                  <ListMusic size={15} className="text-primary" />
                  Album tracks
                </header>
                <div className="h-[360px] overflow-y-auto p-2 [scrollbar-color:hsl(var(--primary))_rgba(255,255,255,0.08)] md:h-[420px]">
                  {albumTracks.map((track, index) => {
                    const active = sameMusicTrack(track, song);

                    return (
                      <Link
                        key={`${track.id}-${index}`}
                        to={`/music/${encodeURIComponent(String(getMusicTrackRouteId(track)))}`}
                        className={`mb-1 grid grid-cols-[42px_minmax(0,1fr)] gap-3 border px-3 py-2.5 transition-colors ${
                          active
                            ? "border-primary/45 bg-primary/12 text-white"
                            : "border-white/10 bg-white/[0.025] text-white/55 hover:border-primary/30 hover:text-white"
                        }`}
                      >
                        <span className="font-mono-tech text-[0.65rem] tabular-nums text-white/35">
                          {String(track.id_list ?? index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 truncate text-sm">
                          {track.title}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
