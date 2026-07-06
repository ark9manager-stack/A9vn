import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MusicPlayerContext } from "./MusicPlayerStore";
import { makeMusicTrackId, sameMusicTrack } from "../utils/musicTrackIds";
import { fetchWithRawGithub429Fallback } from "../utils/githubCdnFallback";

const VOLUME_KEY = "a9vn_music_volume";
const SHUFFLE_KEY = "a9vn_music_shuffle";
const PLAYBACK_SCOPE_KEY = "a9vn_music_playback_scope";
const DEFAULT_VOLUME = 80;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getInitialVolume() {
  if (typeof window === "undefined") return DEFAULT_VOLUME;

  const stored = Number(window.localStorage.getItem(VOLUME_KEY));
  return Number.isFinite(stored) && stored > 0
    ? clamp(stored, 1, 100)
    : DEFAULT_VOLUME;
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
  return tracks.findIndex((item) => sameMusicTrack(item, track));
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
  const idList = track?.id_list ?? track?.idList ?? index + 1;
  const albumId = track?.albumId ?? track?.album_id ?? album?.id ?? null;
  const id = makeMusicTrackId(albumId, idList, track?.id);

  return {
    id,
    id_list: idList,
    title: track?.title ?? track?.name ?? track?.song_name ?? "UNKNOWN TRACK",
    artist: track?.artist ?? track?.albumName ?? album?.name ?? "Monster Siren",
    albumName: track?.albumName ?? album?.name ?? "",
    audio: track?.audio ?? track?.url_song ?? track?.urlSong ?? "",
    lyrics: track?.lyrics ?? track?.url_lyric ?? track?.urlLyric ?? null,
    cover: track?.cover ?? track?.image ?? album?.cover ?? album?.url ?? "",
    albumId,
  };
}

function isProbablyWavUrl(url) {
  return /\.wav(?:[?#]|$)/i.test(String(url || ""));
}

function isFiniteDuration(value) {
  return Number.isFinite(value) && value > 0;
}

function getMediaDuration(audio, fallback = 0) {
  if (audio && isFiniteDuration(audio.duration)) return audio.duration;
  return isFiniteDuration(fallback) ? fallback : 0;
}

function rangeContainsTime(ranges, time) {
  if (!ranges || !Number.isFinite(time) || time < 0) return false;
  try {
    for (let i = 0; i < ranges.length; i += 1) {
      if (time >= ranges.start(i) && time <= ranges.end(i)) return true;
    }
  } catch {
    return false;
  }
  return false;
}

function waitForAudioReady(audio) {
  if (!audio) return Promise.reject(new Error("No audio element"));
  if (audio.readyState >= 1 && isFiniteDuration(audio.duration)) {
    return Promise.resolve(audio);
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    const cleanup = () => {
      audio.removeEventListener("loadedmetadata", onReady);
      audio.removeEventListener("canplay", onReady);
      audio.removeEventListener("error", onError);
    };
    const finish = (ok, value) => {
      if (settled) return;
      settled = true;
      cleanup();
      ok ? resolve(audio) : reject(value);
    };
    const onReady = () => finish(true, audio);
    const onError = () => finish(false, new Error("audio-ready-failed"));

    audio.addEventListener("loadedmetadata", onReady, { once: true });
    audio.addEventListener("canplay", onReady, { once: true });
    audio.addEventListener("error", onError, { once: true });
  });
}

export function MusicPlayerProvider({ children }) {
  const audioRef = useRef(null);
  const playRequestIdRef = useRef(0);
  const allQueueRef = useRef([]);
  const queueRef = useRef([]);
  const currentTrackAudioRef = useRef("");
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);
  const isPlayingRef = useRef(false);
  const volumeRef = useRef(getInitialVolume());
  const pendingSeekRef = useRef(null);
  const recoveringRef = useRef(false);
  const blobUrlCacheRef = useRef(new Map());
  const blobUrlPromiseCacheRef = useRef(new Map());
  const wavBlobFailedRef = useRef(new Set());
  const audioLoadRequestIdRef = useRef(0);

  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentAlbum, setCurrentAlbum] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(() => volumeRef.current);
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
  const playbackMode = shuffle ? "shuffle" : playbackScope;

  useEffect(() => {
    allQueueRef.current = allQueue;
  }, [allQueue]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    currentTrackAudioRef.current = currentTrackAudio || "";
  }, [currentTrackAudio]);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(VOLUME_KEY, String(volumeRef.current));
    }
  }, []);

  useEffect(
    () => () => {
      for (const blobUrl of blobUrlCacheRef.current.values()) {
        try {
          URL.revokeObjectURL(blobUrl);
        } catch {
          // no-op
        }
      }
      blobUrlCacheRef.current.clear();
      blobUrlPromiseCacheRef.current.clear();
    },
    [],
  );

  const syncAudioSource = useCallback((audioUrl, options = {}) => {
    const audio = audioRef.current;
    if (!audio) return null;

    const normalizedUrl = String(audioUrl || "").trim();
    if (!normalizedUrl) {
      playRequestIdRef.current += 1;
      audioLoadRequestIdRef.current += 1;
      audio.pause();
      audio.removeAttribute("src");
      audio.dataset.originalSrc = "";
      audio.load();
      return audio;
    }

    const nextSrc = options.objectUrl || normalizedUrl;
    const originalSame = audio.dataset.originalSrc === normalizedUrl;
    const hasCurrentSrc = !!audio.getAttribute("src");

    if (!options.force && originalSame && hasCurrentSrc) {
      return audio;
    }

    if (
      options.force ||
      !originalSame ||
      audio.getAttribute("src") !== nextSrc
    ) {
      playRequestIdRef.current += 1;
      audio.dataset.originalSrc = normalizedUrl;
      audio.src = nextSrc;
      audio.load();
    }

    return audio;
  }, []);

  const ensureAudible = useCallback((audio) => {
    const nextVolume = volumeRef.current > 0 ? volumeRef.current : DEFAULT_VOLUME;
    if (volumeRef.current <= 0) {
      volumeRef.current = nextVolume;
      setVolumeState(nextVolume);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(VOLUME_KEY, String(nextVolume));
      }
    }

    setIsMuted(false);
    if (audio) {
      audio.muted = false;
      audio.volume = clamp(nextVolume, 1, 100) / 100;
    }
  }, []);

  const requestAudioPlay = useCallback(
    (audio) => {
      if (!audio) return;

      ensureAudible(audio);
      const requestId = playRequestIdRef.current + 1;
      playRequestIdRef.current = requestId;
      const playPromise = audio.play();

      if (playPromise?.then) {
        playPromise.then(() => {
          if (playRequestIdRef.current === requestId) {
            setIsPlaying(true);
          }
        });
      }

      if (playPromise?.catch) {
        playPromise.catch(() => {
          if (playRequestIdRef.current === requestId) {
            setIsPlaying(false);
          }
        });
      }
    },
    [ensureAudible],
  );

  const getBlobAudioUrl = useCallback(async (audioUrl) => {
    const key = String(audioUrl || "").trim();
    if (!key) throw new Error("no-audio-url");

    const cached = blobUrlCacheRef.current.get(key);
    if (cached) return cached;

    const pending = blobUrlPromiseCacheRef.current.get(key);
    if (pending) return pending;

    const promise = fetchWithRawGithub429Fallback(key, {
      cache: "force-cache",
      mode: "cors",
      credentials: "omit",
      headers: { Accept: "audio/wav,audio/x-wav,audio/*,*/*" },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`audio-blob-fetch-failed: ${response.status}`);
        }
        return response.blob();
      })
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        blobUrlCacheRef.current.set(key, blobUrl);
        blobUrlPromiseCacheRef.current.delete(key);
        return blobUrl;
      })
      .catch((error) => {
        blobUrlPromiseCacheRef.current.delete(key);
        throw error;
      });

    blobUrlPromiseCacheRef.current.set(key, promise);
    return promise;
  }, []);

  const recoverAudioForSeek = useCallback(
    async (targetTime, { playAfter } = {}) => {
      const sourceUrl = currentTrackAudioRef.current;
      const audio = audioRef.current;
      if (!sourceUrl || !audio) return false;

      pendingSeekRef.current = Number.isFinite(Number(targetTime))
        ? Number(targetTime)
        : pendingSeekRef.current;

      if (recoveringRef.current) return true;

      recoveringRef.current = true;
      try {
        let objectUrl = null;
        if (isProbablyWavUrl(sourceUrl)) {
          if (wavBlobFailedRef.current.has(sourceUrl)) return false;
          objectUrl = await getBlobAudioUrl(sourceUrl);
        }

        if (currentTrackAudioRef.current !== sourceUrl) return false;

        const nextAudio = syncAudioSource(sourceUrl, {
          objectUrl,
          force: true,
        });
        if (!nextAudio) return false;

        await waitForAudioReady(nextAudio);
        const mediaDuration = getMediaDuration(nextAudio, durationRef.current);
        const target = pendingSeekRef.current ?? targetTime;
        const safeTime = mediaDuration
          ? clamp(Number(target) || 0, 0, Math.max(0, mediaDuration - 0.05))
          : Math.max(0, Number(target) || 0);

        try {
          nextAudio.currentTime = safeTime;
        } catch {
          nextAudio.currentTime = 0;
        }

        setCurrentTime(nextAudio.currentTime || safeTime);
        setDuration(mediaDuration);
        pendingSeekRef.current = null;

        if (playAfter ?? isPlayingRef.current) {
          requestAudioPlay(nextAudio);
        }

        return true;
      } catch {
        if (isProbablyWavUrl(sourceUrl)) wavBlobFailedRef.current.add(sourceUrl);
        return false;
      } finally {
        recoveringRef.current = false;
      }
    },
    [getBlobAudioUrl, requestAudioPlay, syncAudioSource],
  );

  const loadAudioSource = useCallback(
    async (audioUrl, { force = false, play = false, seekTime = null } = {}) => {
      const key = String(audioUrl || "").trim();
      const requestId = audioLoadRequestIdRef.current + 1;
      audioLoadRequestIdRef.current = requestId;

      if (!key) {
        syncAudioSource("", { force: true });
        return null;
      }

      let objectUrl = null;

      if (isProbablyWavUrl(key) && !wavBlobFailedRef.current.has(key)) {
        try {
          objectUrl = await getBlobAudioUrl(key);
        } catch {
          wavBlobFailedRef.current.add(key);
          objectUrl = null;
        }
      }

      if (audioLoadRequestIdRef.current !== requestId) return null;

      const audio = syncAudioSource(key, {
        objectUrl,
        force: force || !!objectUrl,
      });
      if (!audio) return null;

      if (seekTime != null) {
        try {
          await waitForAudioReady(audio);
          const mediaDuration = getMediaDuration(audio, durationRef.current);
          const safeTime = mediaDuration
            ? clamp(Number(seekTime) || 0, 0, Math.max(0, mediaDuration - 0.05))
            : Math.max(0, Number(seekTime) || 0);
          audio.currentTime = safeTime;
          setCurrentTime(safeTime);
        } catch {
          // Keep the source; normal media error/recovery will handle failures.
        }
      }

      if (play && isPlayingRef.current) {
        requestAudioPlay(audio);
      }

      return audio;
    },
    [getBlobAudioUrl, requestAudioPlay, syncAudioSource],
  );

  const setVolume = useCallback((nextVolume) => {
    const safeVolume = clamp(Number(nextVolume) || 0, 0, 100);
    const storedVolume = safeVolume > 0 ? safeVolume : DEFAULT_VOLUME;

    setVolumeState(safeVolume);
    setIsMuted(safeVolume === 0);
    volumeRef.current = safeVolume;

    if (typeof window !== "undefined") {
      window.localStorage.setItem(VOLUME_KEY, String(storedVolume));
    }
  }, []);

  const playQueue = useCallback(
    (tracks, startIndex = 0, album = null) => {
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
      const normalizedTracks = safeTracks.map((track, index) =>
        normalizeTrack(track, index, normalizedAlbum),
      );
      const selectedTrack = normalizedTracks[safeIndex];

      setQueue(normalizedTracks);
      setCurrentAlbum(normalizedAlbum);
      setCurrentIndex(safeIndex);
      setCurrentTime(0);
      setDuration(0);
      pendingSeekRef.current = null;
      isPlayingRef.current = true;
      setIsPlaying(true);

      if (selectedTrack?.audio) {
        loadAudioSource(selectedTrack.audio, { force: true, play: true });
      }
    },
    [loadAudioSource],
  );

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

  const cyclePlaybackMode = useCallback(() => {
    const nextMode =
      playbackMode === "album"
        ? "all"
        : playbackMode === "all"
          ? "shuffle"
          : "album";
    const nextScope = nextMode === "album" ? "album" : "all";
    const nextShuffle = nextMode === "shuffle";

    if (typeof window !== "undefined") {
      window.localStorage.setItem(PLAYBACK_SCOPE_KEY, nextScope);
      window.localStorage.setItem(SHUFFLE_KEY, nextShuffle ? "1" : "0");
    }

    setShuffle(nextShuffle);
    setPlaybackScopeState(nextScope);

    if (nextScope === "album") {
      activateScopeQueue("album");
    }
  }, [activateScopeQueue, playbackMode]);

  useEffect(() => {
    if (!currentTrackAudio || playbackScope !== "all") return;
    activateScopeQueue("all");
  }, [currentTrackAudio, playbackScope, activateScopeQueue]);

  const selectTrack = useCallback(
    (index, play = true) => {
      if (queue.length === 0) return;

      const safeIndex = clamp(index, 0, queue.length - 1);
      const track = queue[safeIndex];

      setCurrentIndex(safeIndex);
      setCurrentTime(0);
      setDuration(0);
      pendingSeekRef.current = null;
      isPlayingRef.current = !!play;
      setIsPlaying(play);

      if (play && track?.audio) {
        loadAudioSource(track.audio, { force: true, play: true });
      } else if (!play) {
        audioLoadRequestIdRef.current += 1;
        audioRef.current?.pause();
      }
    },
    [loadAudioSource, queue],
  );

  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;

    setCurrentIndex((index) => {
      if (index < 0) return 0;
      return getAdjacentIndex(index, queue.length, shuffle);
    });
    setCurrentTime(0);
    setDuration(0);
    pendingSeekRef.current = null;
    isPlayingRef.current = true;
    setIsPlaying(true);
  }, [queue.length, shuffle]);

  const prevTrack = useCallback(() => {
    const audio = audioRef.current;

    if (audio && audio.currentTime > 4) {
      audio.currentTime = 0;
      setCurrentTime(0);
      pendingSeekRef.current = null;
      return;
    }

    if (queue.length === 0) return;

    setCurrentIndex((index) => {
      if (index <= 0) return queue.length - 1;
      return index - 1;
    });
    setCurrentTime(0);
    setDuration(0);
    pendingSeekRef.current = null;
    isPlayingRef.current = true;
    setIsPlaying(true);
  }, [queue.length]);

  const togglePlay = useCallback(() => {
    if (!currentTrack?.audio) return;

    if (isPlaying) {
      playRequestIdRef.current += 1;
      audioLoadRequestIdRef.current += 1;
      isPlayingRef.current = false;
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    isPlayingRef.current = true;
    setIsPlaying(true);
    loadAudioSource(currentTrack.audio, { play: true });
  }, [currentTrack, isPlaying, loadAudioSource]);

  const seekToTime = useCallback(
    (time) => {
      const audio = audioRef.current;
      if (!audio) return;

      const mediaDuration = getMediaDuration(audio, durationRef.current);
      if (!mediaDuration) return;

      const nextTime = clamp(
        Number(time) || 0,
        0,
        Math.max(0, mediaDuration - 0.05),
      );
      pendingSeekRef.current = nextTime;

      const shouldRecoverBeforeSeek =
        isProbablyWavUrl(currentTrackAudioRef.current) &&
        nextTime > 0 &&
        !rangeContainsTime(audio.seekable, nextTime);

      if (shouldRecoverBeforeSeek) {
        setCurrentTime(nextTime);
        recoverAudioForSeek(nextTime, { playAfter: isPlayingRef.current }).then(
          (recovered) => {
            if (!recovered && pendingSeekRef.current === nextTime) {
              pendingSeekRef.current = null;
            }
          },
        );
        return;
      }

      try {
        audio.currentTime = nextTime;
        setCurrentTime(nextTime);
        pendingSeekRef.current = null;
        if (isPlayingRef.current && audio.paused) requestAudioPlay(audio);
      } catch {
        recoverAudioForSeek(nextTime, { playAfter: isPlayingRef.current }).then(
          (recovered) => {
            if (!recovered && pendingSeekRef.current === nextTime) {
              pendingSeekRef.current = null;
            }
          },
        );
      }
    },
    [recoverAudioForSeek, requestAudioPlay],
  );

  const seekTo = useCallback(
    (percent) => {
      const audio = audioRef.current;
      const mediaDuration = getMediaDuration(audio, durationRef.current);
      if (!mediaDuration) return;

      const nextTime = (clamp(percent, 0, 100) / 100) * mediaDuration;
      seekToTime(nextTime);
    },
    [seekToTime],
  );

  const toggleMute = useCallback(() => {
    if (isMuted || volume === 0) {
      const restoredVolume = volume === 0 ? DEFAULT_VOLUME : volume;
      setVolumeState(restoredVolume);
      volumeRef.current = restoredVolume;
      setIsMuted(false);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(VOLUME_KEY, String(restoredVolume));
      }
      return;
    }

    setIsMuted(true);
  }, [isMuted, volume]);

  const closePlayer = useCallback(() => {
    audioLoadRequestIdRef.current += 1;
    isPlayingRef.current = false;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.dataset.originalSrc = "";
      audio.load();
    }

    setQueue([]);
    setCurrentIndex(-1);
    setCurrentAlbum(null);
    isPlayingRef.current = false;
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    pendingSeekRef.current = null;
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = isMuted || volume === 0;
    audio.volume = isMuted ? 0 : clamp(volume, 0, 100) / 100;
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const applyPendingSeek = () => {
      const pending = pendingSeekRef.current;
      if (pending == null || !isFiniteDuration(audio.duration)) return;

      const safeTime = clamp(pending, 0, Math.max(0, audio.duration - 0.05));
      try {
        audio.currentTime = safeTime;
        setCurrentTime(safeTime);
        pendingSeekRef.current = null;
      } catch {
        // handled by error/recovery path
      }
    };

    const onTimeUpdate = () => setCurrentTime(audio.currentTime || 0);
    const onLoadedMetadata = () => {
      setDuration(isFiniteDuration(audio.duration) ? audio.duration : 0);
      setCurrentTime(audio.currentTime || 0);
      applyPendingSeek();
    };
    const onCanPlay = () => {
      applyPendingSeek();
      if (isPlayingRef.current && audio.paused) requestAudioPlay(audio);
    };
    const onEnded = () => {
      if (queue.length > 1) {
        nextTrack();
      } else {
        isPlayingRef.current = false;
        setIsPlaying(false);
      }
    };
    const onError = () => {
      if (recoveringRef.current) return;

      const target = pendingSeekRef.current ?? currentTimeRef.current ?? 0;
      const canTryRecover =
        pendingSeekRef.current != null || isProbablyWavUrl(currentTrackAudioRef.current);

      if (!canTryRecover) {
        isPlayingRef.current = false;
        setIsPlaying(false);
        return;
      }

      recoverAudioForSeek(target, { playAfter: isPlayingRef.current }).then(
        (recovered) => {
          if (!recovered) {
            pendingSeekRef.current = null;
            isPlayingRef.current = false;
            setIsPlaying(false);
          }
        },
      );
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [nextTrack, queue.length, recoverAudioForSeek, requestAudioPlay]);

  useEffect(() => {
    if (!currentTrackAudio) {
      syncAudioSource("");
      return;
    }

    if (!isPlaying) {
      playRequestIdRef.current += 1;
      audioLoadRequestIdRef.current += 1;
      isPlayingRef.current = false;
      audioRef.current?.pause();
      return;
    }

    isPlayingRef.current = true;
    loadAudioSource(currentTrackAudio, { play: true });
  }, [currentTrackAudio, isPlaying, loadAudioSource, syncAudioSource]);

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
      playbackMode,
      allQueueLoading,
      allQueueError,
      playQueue,
      selectTrack,
      nextTrack,
      prevTrack,
      togglePlay,
      toggleShuffle,
      togglePlaybackScope,
      cyclePlaybackMode,
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
      playbackMode,
      allQueueLoading,
      allQueueError,
      playQueue,
      selectTrack,
      nextTrack,
      prevTrack,
      togglePlay,
      toggleShuffle,
      togglePlaybackScope,
      cyclePlaybackMode,
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
      <audio ref={audioRef} preload="auto" playsInline />
    </MusicPlayerContext.Provider>
  );
}
