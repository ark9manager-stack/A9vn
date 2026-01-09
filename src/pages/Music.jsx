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

function matchAlias(qNorm, aliasNorm) {
  if (!aliasNorm) return false;
  return aliasNorm.includes(qNorm) || (aliasNorm.length >= 3 && qNorm.includes(aliasNorm));
}

const Music = () => {
  const { albums, loading: loadingAlbums, error: errorAlbums } = useAlbums();

  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const { songs: rawSongs, loading: loadingSongs, error: errorSongs } = useMusic(
    selectedAlbum?.id
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [rightbarOpen, setRightbarOpen] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);

  // ✅ load alias JSON 1 lần (từ public/ — rất nhanh)
  const [albumAliasNormMap, setAlbumAliasNormMap] = useState(null); // Map<number, string[]>

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

        if (!ignore) setAlbumAliasNormMap(map);
      } catch {
        if (!ignore) setAlbumAliasNormMap(new Map());
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  // Album cards (sort id DESC)
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

  const qNorm = useMemo(() => norm(searchTerm), [searchTerm]);

  // ✅ local match theo tên album (nhanh)
  const nameMatchedIds = useMemo(() => {
    if (!qNorm || qNorm.length < 2) return null;
    const set = new Set();
    for (const a of albumItems) {
      if (matchAlias(qNorm, norm(a.name))) set.add(Number(a.id));
    }
    return set;
  }, [qNorm, albumItems]);

  // ✅ local match theo alias (nhanh như filter local, không DB)
  const aliasMatchedIds = useMemo(() => {
    if (!qNorm || qNorm.length < 2) return null;
    if (!albumAliasNormMap) return null;

    const set = new Set();
    for (const [albumId, aliasNorms] of albumAliasNormMap.entries()) {
      if (aliasNorms.some((a) => matchAlias(qNorm, a))) set.add(albumId);
    }
    return set;
  }, [qNorm, albumAliasNormMap]);

  // ✅ remote match theo tên bài gốc (chỉ khi local không match)
  const [remoteMatchedIds, setRemoteMatchedIds] = useState(null);
  const remoteCacheRef = useRef(new Map()); // qNorm -> Set
  const abortRef = useRef(null);

  useEffect(() => {
    if (!qNorm || qNorm.length < 2) {
      setRemoteMatchedIds(null);
      return;
    }

    // Nếu local đã match (tên album hoặc alias) -> KHÔNG gọi API
    const hasLocal =
      (nameMatchedIds && nameMatchedIds.size > 0) ||
      (aliasMatchedIds && aliasMatchedIds.size > 0);

    if (hasLocal) {
      setRemoteMatchedIds(null);
      return;
    }

    // cache
    if (remoteCacheRef.current.has(qNorm)) {
      setRemoteMatchedIds(remoteCacheRef.current.get(qNorm));
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm.trim())}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        const arr = Array.isArray(data?.results) ? data.results : [];

        const set = new Set();
        for (const r of arr) {
          if (r?.album_id != null) set.add(Number(r.album_id));
        }

        remoteCacheRef.current.set(qNorm, set);
        setRemoteMatchedIds(set);
      } catch (e) {
        if (e.name !== "AbortError") setRemoteMatchedIds(null);
      }
    }, 350); // debounce lớn hơn chút để giảm spam server

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [qNorm, searchTerm, nameMatchedIds, aliasMatchedIds]);

  // ✅ Kết quả cuối: ưu tiên local (tên album + alias), fallback remote (tên bài)
  const filteredAlbums = useMemo(() => {
    if (!qNorm) return albumItems;

    const union = new Set();
    if (nameMatchedIds) for (const id of nameMatchedIds) union.add(id);
    if (aliasMatchedIds) for (const id of aliasMatchedIds) union.add(id);

    // nếu local có match thì dùng local luôn (siêu nhanh)
    if (union.size > 0) {
      return albumItems.filter((a) => union.has(Number(a.id)));
    }

    // fallback remote (tên bài)
    if (remoteMatchedIds && remoteMatchedIds.size > 0) {
      return albumItems.filter((a) => remoteMatchedIds.has(Number(a.id)));
    }

    // không có gì -> trả rỗng
    return [];
  }, [qNorm, albumItems, nameMatchedIds, aliasMatchedIds, remoteMatchedIds]);

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

      {/* ✅ bỏ 2 dòng "fixed right-6..." vì Rightbar tự hiển thị loading/error */}
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
