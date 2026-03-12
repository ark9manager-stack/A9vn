import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAlbums } from "../hooks/useAlbums";
import { useMusic } from "../hooks/useMusic";

import MusicSearchBar from "../components/Music/MusicSearchBar";
import MusicGrid from "../components/Music/MusicGrid";
import Pagination from "../components/Music/Pagination";

import MusicDetailModal from "../components/Music/MusicDetailModal";
import Rightbar from "../components/Music/Rightbar";

// ---- helpers ----
function norm(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const Music = () => {
  // albums
  const { albums, loading: loadingAlbums, error: errorAlbums } = useAlbums();

  // selected album -> songs
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const {
    songs: rawSongs,
    loading: loadingSongs,
    error: errorSongs,
  } = useMusic(selectedAlbum?.id);

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const qNorm = useMemo(() => norm(searchTerm), [searchTerm]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [rightbarOpen, setRightbarOpen] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);

  // ---- load aliases from public/searchmusic.json (frontend) ----
  // cấu trúc file: { "albumAliases": { "181": ["all", "april fool", ...], ... } }
  const [aliasMap, setAliasMap] = useState(new Map()); // Map<number, string[] normalized>
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch("/searchmusic.json", { cache: "no-store" });
        const json = await res.json();

        const map = new Map();
        const albumAliases = json?.albumAliases || {};
        for (const [albumId, aliases] of Object.entries(albumAliases)) {
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

  // ---- build alias index (nhanh hơn khi search) ----
  const aliasIndex = useMemo(() => {
    // exact: dùng cho query 1 ký tự (vd "w")
    const exact = new Map(); // aliasNorm -> Set(albumId)
    const list = []; // [{ albumId, a }]

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

  // ---- album cards for grid (sort id DESC) ----
  const albumItems = useMemo(() => {
    const sorted = [...(albums ?? [])].sort((a, b) => {
      const ai = Number(a.id);
      const bi = Number(b.id);
      if (!Number.isNaN(ai) && !Number.isNaN(bi)) return bi - ai;
      return String(b.id).localeCompare(String(a.id));
    });

    return sorted.map((a) => {
      const idNum = Number(a.id);
      return {
        id: a.id,
        _idNum: Number.isFinite(idNum) ? idNum : null,
        name: a.name,
        _nameNorm: norm(a.name),
        desc: "Album",
        image: a.url,
        _album: a,
      };
    });
  }, [albums]);

  // ---- local match: album name (GIỐNG BẢN CŨ: includes substring) ----
  const nameMatchedIds = useMemo(() => {
    const set = new Set();
    if (!qNorm || qNorm.length < 2) return set;

    for (const a of albumItems) {
      if (a._nameNorm && a._nameNorm.includes(qNorm)) {
        set.add(Number(a.id));
      }
    }
    return set;
  }, [qNorm, albumItems]);

  // ---- local match: aliases từ searchmusic.json (LUÔN UNION) ----
  const aliasMatchedIds = useMemo(() => {
    const set = new Set();
    if (!qNorm) return set;

    // query 1 ký tự: chỉ exact match (vd "w")
    if (qNorm.length < 2) {
      const hits = aliasIndex.exact.get(qNorm);
      if (hits) for (const id of hits) set.add(id);
      return set;
    }

    // query >= 2: contains
    for (const { albumId, a } of aliasIndex.list) {
      if (!a) continue;

      // alias contains query
      if (a.includes(qNorm)) {
        set.add(albumId);
        continue;
      }

      // query contains alias (chỉ khi alias đủ dài để tránh "ep" / "w" dính bậy)
      if (a.length >= 3 && qNorm.length >= 4 && qNorm.includes(a)) {
        set.add(albumId);
      }
    }

    return set;
  }, [qNorm, aliasIndex]);

  // ---- remote match: song name (DB) -> album ids ----
  // mục tiêu:
  // - query < 4 và đã có local match => KHÔNG gọi API (tránh false positive kiểu "all")
  // - query >= 4 => gọi API để bắt theo tên bài hát và UNION thêm
  const [remoteAlbumIds, setRemoteAlbumIds] = useState(null); // Set<number> | null
  const [remoteSearching, setRemoteSearching] = useState(false);
  const remoteCacheRef = useRef(new Map()); // qNorm -> Set<number>
  const abortRef = useRef(null);

  useEffect(() => {
    if (!qNorm || qNorm.length < 2) {
      setRemoteAlbumIds(null);
      setRemoteSearching(false);
      return;
    }

    const hasLocal = nameMatchedIds.size > 0 || aliasMatchedIds.size > 0;

    // ✅ query ngắn + đã có local => không remote
    if (hasLocal && qNorm.length < 4) {
      setRemoteAlbumIds(null);
      setRemoteSearching(false);
      return;
    }

    // ✅ chỉ remote khi query đủ dài (>=4)
    if (qNorm.length < 4) {
      setRemoteAlbumIds(null);
      setRemoteSearching(false);
      return;
    }

    if (remoteCacheRef.current.has(qNorm)) {
      setRemoteAlbumIds(remoteCacheRef.current.get(qNorm));
      setRemoteSearching(false);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const t = setTimeout(async () => {
      try {
        setRemoteSearching(true);
        const q = searchTerm.trim(); // giữ nguyên để DB LIKE bắt được tiếng Việt/đúng dấu nếu cần
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        const arr = Array.isArray(data?.results) ? data.results : [];

        const set = new Set();
        for (const r of arr) {
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
      clearTimeout(t);
      controller.abort();
    };
  }, [qNorm, searchTerm, nameMatchedIds, aliasMatchedIds]);

  // ---- final filtered albums: UNION (DB album name + searchmusic.json + remote song) ----
  const filteredAlbums = useMemo(() => {
    if (!qNorm) return albumItems;

    const union = new Set();
    for (const id of nameMatchedIds) union.add(id);
    for (const id of aliasMatchedIds) union.add(id);
    for (const id of remoteAlbumIds ?? new Set()) union.add(id);

    if (union.size === 0) return [];

    // albumItems đã sort id DESC, filter sẽ giữ đúng thứ tự
    return albumItems.filter((a) => union.has(Number(a.id)));
  }, [qNorm, albumItems, nameMatchedIds, aliasMatchedIds, remoteAlbumIds]);

  // Pagination
  const totalPages = Math.ceil(filteredAlbums.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAlbums = filteredAlbums.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const musicSection = document.getElementById("music");
    if (musicSection) musicSection.scrollIntoView({ behavior: "smooth" });
  };

  // Click album -> open playlist
  const handleSelectAlbum = (item) => {
    const a = item._album ?? { id: item.id, name: item.name, url: item.image };
    setSelectedAlbum({ id: a.id, name: a.name, url: a.url ?? item.image });

    setRightbarOpen(true);
    setSelectedMusic(null);
    setCurrentSongIndex(-1);
  };

  const closePlaylist = () => setRightbarOpen(false);

  // Normalize songs for Rightbar
  const playlistItems = useMemo(() => {
    const cover = selectedAlbum?.url ?? "";
    const albumName = selectedAlbum?.name ?? "";

    return (rawSongs ?? []).map((s, idx) => ({
      id: `${selectedAlbum?.id ?? "x"}-${s.id_list ?? idx + 1}`,
      id_list: s.id_list ?? s.idList ?? idx + 1,
      name: s.name ?? s.song_name ?? "",
      audio: s.audio ?? s.url_song ?? s.urlSong ?? "",
      lyrics: s.lyrics ?? s.url_lyric ?? s.urlLyric ?? null,
      cover,
      albumName,
    }));
  }, [rawSongs, selectedAlbum]);

  const openSongModalFromPlaylist = (song, idx) => {
    setCurrentSongIndex(idx);
    setSelectedMusic({
      name: song.name,
      image: song.cover ?? selectedAlbum?.url ?? "",
      audio: song.audio,
      lyrics: song.lyrics,
    });
  };

  return (
    <div
      id="music"
      className="fullpage-section bg-gradient-to-br from-blue-900 via-black to-cyan-900"
    >
      <div className="w-full h-full flex flex-col justify-center px-6">
        {loadingAlbums && (
          <p className="text-center text-gray-300 mt-10">Đang tải album...</p>
        )}
        {errorAlbums && (
          <p className="text-center text-red-400 mt-10">
            Lỗi khi tải album: {errorAlbums}
          </p>
        )}

        {!loadingAlbums && (
          <MusicSearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setCurrentPage={setCurrentPage}
          />
        )}

        {/* chỉ báo remote search theo tên bài (khi cần) */}
        {!loadingAlbums && qNorm.length >= 2 && remoteSearching && (
          <div className="text-center text-gray-300 text-sm mb-3">
            Đang tìm theo tên bài hát...
          </div>
        )}

        {!loadingAlbums && (
          <MusicGrid
            songs={currentAlbums}
            startIndex={startIndex}
            onSelectMusic={handleSelectAlbum}
          />
        )}

        {!loadingAlbums && filteredAlbums.length > 0 && totalPages > 1 && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            handlePageChange={handlePageChange}
          />
        )}

        {!loadingAlbums && filteredAlbums.length > 0 && totalPages > 1 && (
          <div className="text-center text-gray-400 text-sm mb-4">
            Trang {currentPage} / {totalPages} • Hiển thị {startIndex + 1}–
            {Math.min(endIndex, filteredAlbums.length)} /{" "}
            {filteredAlbums.length} album
          </div>
        )}
      </div>

      <MusicDetailModal
        open={!!selectedMusic}
        music={
          selectedMusic
            ? {
                title: selectedMusic.name,
                cover: selectedMusic.image,
                audio: selectedMusic.audio,
                lyrics: selectedMusic.lyrics,
              }
            : null
        }
        onClose={() => setSelectedMusic(null)}
        onOpenPlaylist={() => setRightbarOpen((v) => !v)}
        isPlaylistOpen={rightbarOpen}
      />

      <Rightbar
        open={rightbarOpen}
        albumName={selectedAlbum?.name || "PLAYLIST"}
        playlist={playlistItems}
        currentIndex={currentSongIndex}
        onSelectSong={(song, idx) => openSongModalFromPlaylist(song, idx)}
        onClose={closePlaylist}
        loading={loadingSongs}
        error={errorSongs}
      />
    </div>
  );
};

export default Music;
