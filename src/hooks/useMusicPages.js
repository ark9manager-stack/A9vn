import { useEffect, useMemo, useRef, useState } from "react";
import { useAlbums } from "./useAlbums";
import { useMusic } from "./useMusic";
import { useMusicPlayer } from "../contexts/useMusicPlayer";
import { makeMusicTrackId, sameMusicTrack } from "../utils/musicTrackIds";

// ── helpers ────────────────────────────────────────────────────────
export function norm(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const MUSIC_PAGE_STATE_KEY = "a9vn_music_page_state_v1";

function readStoredMusicPageState() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(MUSIC_PAGE_STATE_KEY);
    return raw ? JSON.parse(raw) || {} : {};
  } catch {
    return {};
  }
}

function getWindowScrollY() {
  if (typeof window === "undefined") return 0;
  return window.scrollY || window.pageYOffset || 0;
}

function writeStoredMusicPageState(state) {
  if (typeof window === "undefined") return;
  try {
    const prevRaw = window.sessionStorage.getItem(MUSIC_PAGE_STATE_KEY);
    const prev = prevRaw ? JSON.parse(prevRaw) || {} : {};
    window.sessionStorage.setItem(
      MUSIC_PAGE_STATE_KEY,
      JSON.stringify({ ...prev, ...state }),
    );
  } catch {
    // no-op
  }
}

// ── hook ──────────────────────────────────────────────────────────
export function useMusicPage() {
  // ── data ──────────────────────────────────────────────────────
  const { albums, loading: loadingAlbums, error: errorAlbums } = useAlbums();

  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const {
    songs: rawSongs,
    loading: loadingSongs,
    error: errorSongs,
  } = useMusic(selectedAlbum?.id);
  const { currentTrack, playQueue } = useMusicPlayer();

  const storedPageStateRef = useRef(readStoredMusicPageState());

  // ── search ────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState(
    () => storedPageStateRef.current.searchTerm || "",
  );
  const qNorm = useMemo(() => norm(searchTerm), [searchTerm]);

  // ── pagination ────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(() => {
    const n = Number(storedPageStateRef.current.currentPage);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
  });
  const ITEMS_PER_PAGE = 10;

  // ── ui state ──────────────────────────────────────────────────
  const [playlistOpen, setPlaylistOpen] = useState(false);

  // ── alias map (public/searchmusic.json) ───────────────────────
  const [aliasMap, setAliasMap] = useState(new Map());

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch("/searchmusic.json", { cache: "no-store" });
        const json = await res.json();
        const map = new Map();

        for (const [albumId, aliases] of Object.entries(
          json?.albumAliases ?? {},
        )) {
          const arr = Array.isArray(aliases) ? aliases : [];
          map.set(Number(albumId), arr.map((x) => norm(x)).filter(Boolean));
        }
        if (!ignore) setAliasMap(map);
      } catch {
        if (!ignore) setAliasMap(new Map());
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  // ── alias index ───────────────────────────────────────────────
  const aliasIndex = useMemo(() => {
    const exact = new Map();
    const list = [];

    for (const [albumId, aliasNorms] of aliasMap.entries()) {
      for (const a of aliasNorms) {
        if (!a) continue;
        list.push({ albumId, a });
        if (!exact.has(a)) exact.set(a, new Set());
        exact.get(a).add(albumId);
      }
    }
    return { exact, list };
  }, [aliasMap]);

  // ── album items (sorted desc) ─────────────────────────────────
  const albumItems = useMemo(() => {
    const sorted = [...(albums ?? [])].sort((a, b) => {
      const ai = Number(a.id),
        bi = Number(b.id);
      if (!Number.isNaN(ai) && !Number.isNaN(bi)) return bi - ai;
      return String(b.id).localeCompare(String(a.id));
    });

    return sorted.map((a) => ({
      id: a.id,
      _idNum: Number.isFinite(Number(a.id)) ? Number(a.id) : null,
      name: a.name,
      _nameNorm: norm(a.name),
      desc: "Album",
      image: a.url,
      _album: a,
    }));
  }, [albums]);

  // ── local name match ──────────────────────────────────────────
  const nameMatchedIds = useMemo(() => {
    const set = new Set();
    if (!qNorm || qNorm.length < 2) return set;
    for (const a of albumItems) {
      if (a._nameNorm?.includes(qNorm)) set.add(Number(a.id));
    }
    return set;
  }, [qNorm, albumItems]);

  // ── local alias match ─────────────────────────────────────────
  const aliasMatchedIds = useMemo(() => {
    const set = new Set();
    if (!qNorm) return set;

    if (qNorm.length < 2) {
      aliasIndex.exact.get(qNorm)?.forEach((id) => set.add(id));
      return set;
    }

    for (const { albumId, a } of aliasIndex.list) {
      if (!a) continue;
      if (a.includes(qNorm)) {
        set.add(albumId);
        continue;
      }
      if (a.length >= 3 && qNorm.length >= 4 && qNorm.includes(a))
        set.add(albumId);
    }
    return set;
  }, [qNorm, aliasIndex]);

  // ── remote match (song name via API) ─────────────────────────
  const [remoteAlbumIds, setRemoteAlbumIds] = useState(null);
  const [remoteSearching, setRemoteSearching] = useState(false);
  const remoteCacheRef = useRef(new Map());
  const abortRef = useRef(null);

  useEffect(() => {
    if (!qNorm || qNorm.length < 2) {
      setRemoteAlbumIds(null);
      setRemoteSearching(false);
      return;
    }

    const hasLocal = nameMatchedIds.size > 0 || aliasMatchedIds.size > 0;
    if ((hasLocal && qNorm.length < 4) || qNorm.length < 4) {
      setRemoteAlbumIds(null);
      setRemoteSearching(false);
      return;
    }

    if (remoteCacheRef.current.has(qNorm)) {
      setRemoteAlbumIds(remoteCacheRef.current.get(qNorm));
      setRemoteSearching(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        setRemoteSearching(true);
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(searchTerm.trim())}`,
          {
            signal: controller.signal,
          },
        );
        if (!res.ok) throw new Error("Search failed");

        const data = await res.json();
        const set = new Set();
        for (const r of Array.isArray(data?.results) ? data.results : []) {
          const id = r?.album_id ?? r?.id ?? r?.albumId;
          if (id != null) set.add(Number(id));
        }

        remoteCacheRef.current.set(qNorm, set);
        setRemoteAlbumIds(set);
      } catch (e) {
        if (e?.name !== "AbortError") setRemoteAlbumIds(new Set());
      } finally {
        setRemoteSearching(false);
      }
    }, 220);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [qNorm, searchTerm, nameMatchedIds, aliasMatchedIds]);

  // ── filtered albums (union of all match sources) ──────────────
  const filteredAlbums = useMemo(() => {
    if (!qNorm) return albumItems;

    const union = new Set([
      ...nameMatchedIds,
      ...aliasMatchedIds,
      ...(remoteAlbumIds ?? []),
    ]);

    if (union.size === 0) return [];
    return albumItems.filter((a) => union.has(Number(a.id)));
  }, [qNorm, albumItems, nameMatchedIds, aliasMatchedIds, remoteAlbumIds]);

  // ── pagination slice ──────────────────────────────────────────
  const totalPages = Math.ceil(filteredAlbums.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentAlbums = filteredAlbums.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // ── playlist items ────────────────────────────────────────────
  const playlistItems = useMemo(() => {
    const cover = selectedAlbum?.url ?? "";
    const albumName = selectedAlbum?.name ?? "";

    return (rawSongs ?? []).map((s, idx) => ({
      id: makeMusicTrackId(
        selectedAlbum?.id ?? s.albumId ?? s.album_id,
        s.id_list ?? s.idList ?? idx + 1,
        s.id,
      ),
      id_list: s.id_list ?? s.idList ?? idx + 1,
      name: s.name ?? s.song_name ?? "",
      audio: s.audio ?? s.url_song ?? s.urlSong ?? "",
      lyrics: s.lyrics ?? s.url_lyric ?? s.urlLyric ?? null,
      cover,
      albumName,
      albumId: selectedAlbum?.id ?? s.albumId ?? s.album_id ?? null,
    }));
  }, [rawSongs, selectedAlbum]);

  const currentSongIndex = useMemo(() => {
    if (!currentTrack || playlistItems.length === 0) return -1;

    return playlistItems.findIndex((song) => sameMusicTrack(song, currentTrack));
  }, [currentTrack, playlistItems]);

  // ── handlers ──────────────────────────────────────────────────
  const handleSelectAlbum = (item) => {
    const a = item._album ?? { id: item.id, name: item.name, url: item.image };
    setSelectedAlbum({ id: a.id, name: a.name, url: a.url ?? item.image });
    setPlaylistOpen(true);
  };

  useEffect(() => {
    writeStoredMusicPageState({
      currentPage,
      searchTerm,
      scrollY: getWindowScrollY(),
    });
  }, [currentPage, searchTerm]);

  useEffect(() => {
    if (loadingAlbums) return undefined;

    const y = Number(storedPageStateRef.current.scrollY);
    if (!Number.isFinite(y) || y <= 0) return undefined;

    const timer = window.setTimeout(() => {
      window.scrollTo({ top: y, behavior: "auto" });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadingAlbums]);

  useEffect(() => {
    return () => {
      writeStoredMusicPageState({
        currentPage,
        searchTerm,
        scrollY: getWindowScrollY(),
      });
    };
  }, [currentPage, searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    else if (currentPage < 1) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const handlePageChange = (page) => {
    const safePage = Math.min(Math.max(Number(page) || 1, 1), totalPages);
    setCurrentPage(safePage);
    document.getElementById("music")?.scrollIntoView({ behavior: "smooth" });
  };

  const openSongModal = (song, idx) => {
    writeStoredMusicPageState({
      currentPage,
      searchTerm,
      scrollY: getWindowScrollY(),
    });

    playQueue(playlistItems, idx, {
      id: selectedAlbum?.id,
      name: selectedAlbum?.name ?? song.albumName ?? "PLAYLIST",
      cover: selectedAlbum?.url ?? song.cover ?? "",
    });
  };

  const closePlaylist = () => setPlaylistOpen(false);

  // ── exposed API ───────────────────────────────────────────────
  return {
    // loading / error
    loadingAlbums,
    errorAlbums,
    loadingSongs,
    errorSongs,

    // search
    searchTerm,
    setSearchTerm,
    qNorm,
    remoteSearching,

    // albums
    currentAlbums,
    filteredAlbums,
    startIndex,

    // pagination
    currentPage,
    totalPages,
    handlePageChange,

    // selection / playback
    selectedAlbum,
    playlistItems,
    currentSongIndex,

    // playlist panel
    playlistOpen,

    // handlers
    handleSelectAlbum,
    openSongModal,
    closePlaylist,
  };
}
