import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MusicPlayerContext } from "./MusicPlayerStore";

const VOLUME_KEY = "a9vn_music_volume";
const SHUFFLE_KEY = "a9vn_music_shuffle";
const PLAYBACK_SCOPE_KEY = "a9vn_music_playback_scope";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getInitialVolume() {
  if (typeof window === "undefined") return 80;

  const stored = Number(window.localStorage.getItem(VOLUME_KEY));
  return Number.isFinite(stored) ? clamp(stored, 0, 100) : 80;
}

function getInitialShuffle() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SHUFFLE_KEY) === "1";
}

function getInitialPlaybackScope() {
  if (typeof window === "undefined") return "album";
  return window.localStorage.getItem(PLAYBACK_SCOPE_KEY) === "all"
    ? "all"
    : "album";
}

function findTrackIndex(tracks, track) {
  if (!track || !Array.isArray(tracks)) return -1;

  return tracks.findIndex(
    (item) => item.id === track.id || item.audio === track.audio,
  );
}

function getAdjacentIndex(index, length, shuffle) {
  if (length <= 0) return -1;
  if (!shuffle || length === 1) return index < 0 ? 0 : (index + 1) % length;

  let nextIndex = index;
  while (nextIndex === index) {
    nextIndex = Math.floor(Math.random() * length);
  }

  return nextIndex;
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
    albumId: track?.albumId ?? track?.album_id ?? album?.id ?? null,
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
  const [shuffle, setShuffle] = useState(getInitialShuffle);
  const [playbackScope, setPlaybackScopeState] = useState(
    getInitialPlaybackScope,
  );
  const [allQueue, setAllQueue] = useState([]);
  const [allQueueLoading, setAllQueueLoading] = useState(false);
  const [allQueueError, setAllQueueError] = useState(null);

  const currentTrack = queue[currentIndex] ?? null;
  const currentTrackAudio = currentTrack?.audio;
  const allQueueRef = useRef([]);
  const queueRef = useRef([]);

  useEffect(() => {
    allQueueRef.current = allQueue;
  }, [allQueue]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

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

  const loadAllQueue = useCallback(async () => {
    if (allQueueRef.current.length > 0) return allQueueRef.current;

    try {
      setAllQueueLoading(true);
      setAllQueueError(null);

      const response = await fetch("/api/songs?scope=all");
      if (!response.ok) {
        throw new Error(`Fetch all songs failed: ${response.status}`);
      }

      const json = await response.json();
      const tracks = (json?.songs ?? [])
        .filter((track) => track?.audio)
        .map((track, index) => normalizeTrack(track, index, null));

      allQueueRef.current = tracks;
      setAllQueue(tracks);
      return tracks;
    } catch (error) {
      setAllQueueError(error?.message ?? "Fetch all songs failed");
      return [];
    } finally {
      setAllQueueLoading(false);
    }
  }, []);

  const activateScopeQueue = useCallback(
    async (nextScope) => {
      if (!currentTrack) return;

      if (nextScope === "all") {
        const tracks = await loadAllQueue();
        const nextIndex = findTrackIndex(tracks, currentTrack);
        if (tracks.length === 0 || nextIndex < 0) return;

        setQueue(tracks);
        setCurrentAlbum(null);
        setCurrentIndex(nextIndex);
        return;
      }

      const sourceQueue =
        allQueueRef.current.length > 0 ? allQueueRef.current : queueRef.current;
      const albumTracks = sourceQueue.filter(
        (track) => String(track.albumId) === String(currentTrack.albumId),
      );
      const nextIndex = findTrackIndex(albumTracks, currentTrack);

      if (albumTracks.length === 0 || nextIndex < 0) return;

      setQueue(albumTracks);
      setCurrentAlbum({
        id: currentTrack.albumId,
        name: currentTrack.albumName || currentTrack.artist || "PLAYLIST",
        cover: currentTrack.cover || "",
      });
      setCurrentIndex(nextIndex);
    },
    [currentTrack, loadAllQueue],
  );

  const togglePlaybackScope = useCallback(() => {
    const nextScope = playbackScope === "album" ? "all" : "album";
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PLAYBACK_SCOPE_KEY, nextScope);
    }

    setPlaybackScopeState(nextScope);
    if (nextScope === "album") {
      activateScopeQueue(nextScope);
    }
  }, [activateScopeQueue, playbackScope]);

  const toggleShuffle = useCallback(() => {
    setShuffle((value) => {
      const nextValue = !value;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SHUFFLE_KEY, nextValue ? "1" : "0");
      }
      return nextValue;
    });
  }, []);

  useEffect(() => {
    if (!currentTrackAudio || playbackScope !== "all") return;
    activateScopeQueue("all");
  }, [currentTrackAudio, playbackScope, activateScopeQueue]);

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
      return getAdjacentIndex(index, queue.length, shuffle);
    });
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(true);
  }, [queue.length, shuffle]);

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

  const closePlayer = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }

    setQueue([]);
    setCurrentIndex(-1);
    setCurrentAlbum(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
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
      shuffle,
      playbackScope,
      allQueueLoading,
      allQueueError,
      playQueue,
      selectTrack,
      nextTrack,
      prevTrack,
      togglePlay,
      toggleShuffle,
      togglePlaybackScope,
      setVolume,
      toggleMute,
      closePlayer,
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
      shuffle,
      playbackScope,
      allQueueLoading,
      allQueueError,
      playQueue,
      selectTrack,
      nextTrack,
      prevTrack,
      togglePlay,
      toggleShuffle,
      togglePlaybackScope,
      setVolume,
      toggleMute,
      closePlayer,
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
