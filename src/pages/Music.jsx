import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAlbums } from "../hooks/useAlbums";
import { useMusic } from "../hooks/useMusic";

import MusicSearchBar from "../components/Music/MusicSearchBar";
import MusicGrid from "../components/Music/MusicGrid";
import Pagination from "../components/Music/Pagination";

import MusicDetailModal from "../components/Music/MusicDetailModal";
import Rightbar from "../components/Music/Rightbar";

function norm(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu VN
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function includesMatch(qNorm, targetNorm) {
  if (!qNorm || !targetNorm) return false;
  return targetNorm.includes(qNorm);
}

const Music = () => {
  const { albums, loading: loadingAlbums, error: errorAlbums } = useAlbums();

  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const { songs: rawSongs, loading: loadingSongs, error: errorSongs } = useMusic(
    selectedAlbum?.id
  );

  const [searchTerm, setSearchTerm] = useState("");
  const qNorm = useMemo(() => norm(searchTerm), [searchTerm]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [rightbarOpen, setRightbarOpen] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);

  // ===== 1) Load alias local (frontend) =====
  const [albumAliasMap, setAlbumAliasMap] = useState(new Map()); // Map<number, string[] (normalized)>
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch("/searchmusic.json", { cache: "force-cache" });
        const json = await res.json();
        const map = new Map();

        const albumAliases = json?.albumAliases || {};
        for (const [albumId, aliases] of Object.entries(albumAliases)) {
          const arr = Array.isArray(aliases) ? aliases : [];
          map.set(
            Number(albumId),
            arr.map((x) => norm(x)).filter(Boolean)
          );
        }

        if (!ignore) setAlbumAliasMap(map);
      } catch {
        if (!ignore) setAlbumAliasMap(new Map());
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  // ===== 2) Album cards (sort id DESC) =====
  const albumItems = useMemo(() => {
    const sorted = [...(albums ?? [])].sort((a, b) => {
      const ai = Number(a.id);
      const bi = Number(b.id);
      if (!Number.isNaN(ai) && !Number.isNaN(bi)) return bi - ai;
      return String(b.id).localeCompare(String(a.id));
    });

    return sorted.map((a) => ({
      id: a.id,
      name: a.name,
      desc: "Album",
      image: a.url,
      _album: a,
    }));
  }, [albums]);

  // ===== 3) Local match: album-name + alias =====
  const nameMatchedIds = useMemo(() => {
    const set = new Set();
    if (!qNorm) return set;

    // nếu chỉ 1 ký tự -> KHÔNG match tên album để tránh quá nhiều kết quả
    if (qNorm.length < 2) return set;

    for (const a of albumItems) {
      if (includesMatch(qNorm, norm(a.name))) set.add(Number(a.id));
    }
    return set;
  }, [qNorm, albumItems]);

  const aliasMatchedIds = useMemo(() => {
    const set = new Set();
    if (!qNorm) return set;

    for (const [albumId, aliasNorms] of albumAliasMap.entries()) {
      // Nếu query chỉ 1 ký tự (vd "w") -> chỉ match EXACT alias (tránh trùng lung tung)
      if (qNorm.length < 2) {
        if (aliasNorms.some((a) => a === qNorm)) set.add(albumId);
        continue;
      }

      // bình thường: contains
      if (aliasNorms.some((a) => includesMatch(qNorm, a))) set.add(albumId);
    }
    return set;
  }, [qNorm, albumAliasMap]);

  // ===== 4) Remote match: khi không match local gì -> tìm theo tên BÀI (DB) =====
  const [remoteAlbumIds, setRemoteAlbumIds] = useState(null); // Set<number> | null
  const [remoteSearching, setRemoteSearching] = useState(false);
  const remoteCacheRef = useRef(new Map()); // qNorm -> Set<number>
  const abortRef = useRef(null);

  useEffect(() => {
    // không search khi rỗng
    if (!qNorm) {
      setRemoteAlbumIds(null);
      setRemoteSearching(false);
      return;
    }

    // chỉ gọi remote khi query >= 2 (tránh spam) và local không match gì
    const hasLocal = nameMatchedIds.size > 0 || aliasMatchedIds.size > 0;
    if (qNorm.length < 2 || hasLocal) {
      setRemoteAlbumIds(null);
      setRemoteSearching(false);
      return;
    }

    // cache
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
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm.trim())}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        const arr = Array.isArray(data?.results) ? data.results : [];

        const set = new Set();
        for (const r of arr) {
          const id = r?.album_id ?? r?.id;
          if (id != null) set.add(Number(id));
        }

        remoteCacheRef.current.set(qNorm, set);
        setRemoteAlbumIds(set);
      } catch (e) {
        if (e?.name !== "AbortError") setRemoteAlbumIds(new Set());
      } finally {
        setRemoteSearching(false);
      }
    }, 250);

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [qNorm, searchTerm, nameMatchedIds, aliasMatchedIds]);

  // ===== 5) Final filter + PRIORITY sorting (alias first) =====
  const filteredAlbums = useMemo(() => {
    if (!qNorm) return albumItems;

    const remoteSet = remoteAlbumIds ?? new Set();

    // union
    const union = new Set();
    for (const id of nameMatchedIds) union.add(id);
    for (const id of aliasMatchedIds) union.add(id);
    for (const id of remoteSet) union.add(id);

    // Nếu query đang có mà union rỗng -> show rỗng (đỡ hiện all albums)
    if (union.size === 0) return [];

    const scored = albumItems
      .filter((a) => union.has(Number(a.id)))
      .map((a) => {
        const id = Number(a.id);
        const score = aliasMatchedIds.has(id)
          ? 0
          : nameMatchedIds.has(id)
          ? 1
          : remoteSet.has(id)
          ? 2
          : 9;
        return { a, score, id };
      })
      .sort((x, y) => {
        if (x.score !== y.score) return x.score - y.score; // alias lên đầu
        return y.id - x.id; // cùng nhóm -> id desc
      })
      .map((x) => x.a);

    return scored;
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

  const handleSelectAlbum = (item) => {
    const a = item._album ?? { id: item.id, name: item.name, url: item.image };
    setSelectedAlbum({ id: a.id, name: a.name, url: a.url ?? item.image });

    setRightbarOpen(true);
    setSelectedMusic(null);
    setCurrentSongIndex(-1);
  };

  const closePlaylist = () => setRightbarOpen(false);

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

        {/* Remote searching (chỉ khi đang tìm theo tên bài trong DB) */}
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
            {Math.min(endIndex, filteredAlbums.length)} / {filteredAlbums.length} album
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

      {/* ✅ FIX: bỏ block fixed "Đang tải bài hát..." ở ngoài, dùng Rightbar loading/error */}
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
