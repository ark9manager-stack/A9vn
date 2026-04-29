import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MusicPlayerContext } from "./MusicPlayerStore";

const VOLUME_KEY = "a9vn_music_volume";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getInitialVolume() {
  if (typeof window === "undefined") return 80;

  const stored = Number(window.localStorage.getItem(VOLUME_KEY));
  return Number.isFinite(stored) ? clamp(stored, 0, 100) : 80;
}

function normalizeTrack(track, index, album) {
  const id = track?.id ?? `${album?.id ?? "album"}-${track?.id_list ?? index}`;

  return {
    id,
    id_list: track?.id_list ?? track?.idList ?? index + 1,
    title: track?.title ?? track?.name ?? track?.song_name ?? "UNKNOWN TRACK",
    artist: track?.artist ?? track?.albumName ?? album?.name ?? "Monster Siren",
    albumName: track?.albumName ?? album?.name ?? "",
    audio: track?.audio ?? track?.url_song ?? track?.urlSong ?? "",
    lyrics: track?.lyrics ?? track?.url_lyric ?? track?.urlLyric ?? null,
    cover: track?.cover ?? track?.image ?? album?.cover ?? album?.url ?? "",
  };
}

export function MusicPlayerProvider({ children }) {
  const audioRef = useRef(null);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentAlbum, setCurrentAlbum] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(getInitialVolume);
  const [isMuted, setIsMuted] = useState(false);

  const currentTrack = queue[currentIndex] ?? null;

  const setVolume = useCallback((nextVolume) => {
    const safeVolume = clamp(Number(nextVolume) || 0, 0, 100);
    setVolumeState(safeVolume);
    setIsMuted(safeVolume === 0);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(VOLUME_KEY, String(safeVolume));
    }
  }, []);

  const playQueue = useCallback((tracks, startIndex = 0, album = null) => {
    const safeTracks = Array.isArray(tracks)
      ? tracks.filter((track) => track?.audio)
      : [];

    if (safeTracks.length === 0) return;

    const safeIndex = clamp(startIndex, 0, safeTracks.length - 1);
    const normalizedAlbum = album
      ? {
          id: album.id,
          name: album.name ?? "PLAYLIST",
          cover: album.cover ?? album.url ?? "",
        }
      : null;

    setQueue(
      safeTracks.map((track, index) =>
        normalizeTrack(track, index, normalizedAlbum),
      ),
    );
    setCurrentAlbum(normalizedAlbum);
    setCurrentIndex(safeIndex);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(true);
  }, []);

  const selectTrack = useCallback(
    (index, play = true) => {
      if (queue.length === 0) return;
      setCurrentIndex(clamp(index, 0, queue.length - 1));
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(play);
    },
    [queue.length],
  );

  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;

    setCurrentIndex((index) => {
      if (index < 0) return 0;
      return (index + 1) % queue.length;
    });
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(true);
  }, [queue.length]);

  const prevTrack = useCallback(() => {
    const audio = audioRef.current;

    if (audio && audio.currentTime > 4) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    if (queue.length === 0) return;

    setCurrentIndex((index) => {
      if (index <= 0) return queue.length - 1;
      return index - 1;
    });
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(true);
  }, [queue.length]);

  const togglePlay = useCallback(() => {
    if (!currentTrack?.audio) return;
    setIsPlaying((value) => !value);
  }, [currentTrack?.audio]);

  const seekTo = useCallback((percent) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;

    const nextTime = (clamp(percent, 0, 100) / 100) * audio.duration;
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  }, []);

  const seekToTime = useCallback((time) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;

    const nextTime = clamp(Number(time) || 0, 0, audio.duration);
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((value) => !value);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume / 100;
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      setCurrentTime(audio.currentTime || 0);
    };
    const onEnded = () => {
      if (queue.length > 1) {
        nextTrack();
      } else {
        setIsPlaying(false);
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [nextTrack, queue.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.audio) return;

    if (audio.src !== currentTrack.audio) {
      audio.src = currentTrack.audio;
      audio.load();
    }

    if (!isPlaying) {
      audio.pause();
      return;
    }

    const playPromise = audio.play();
    if (playPromise?.catch) {
      playPromise.catch(() => setIsPlaying(false));
    }
  }, [currentTrack?.audio, isPlaying]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const value = useMemo(
    () => ({
      audioRef,
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
      playQueue,
      selectTrack,
      nextTrack,
      prevTrack,
      togglePlay,
      setVolume,
      toggleMute,
      seekTo,
      seekToTime,
    }),
    [
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
      playQueue,
      selectTrack,
      nextTrack,
      prevTrack,
      togglePlay,
      setVolume,
      toggleMute,
      seekTo,
      seekToTime,
    ],
  );

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="metadata" />
    </MusicPlayerContext.Provider>
  );
}
