import React, { useEffect, useMemo, useState } from "react";
import { useAlbums } from "../hooks/useAlbums";
import { useMusic } from "../hooks/useMusic";

import MusicSearchBar from "../components/Music/MusicSearchBar";
import MusicGrid from "../components/Music/MusicGrid";
import Pagination from "../components/Music/Pagination";

import MusicDetailModal from "../components/Music/MusicDetailModal";
import Rightbar from "../components/Music/Rightbar";

const Music = () => {
  // Grid luôn hiển thị album
  const { albums, loading: loadingAlbums, error: errorAlbums } = useAlbums();

  // Album được chọn -> load songs để đưa vào playlist (Rightbar)
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const { songs: rawSongs, loading: loadingSongs, error: errorSongs } = useMusic(
    selectedAlbum?.id
  );

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [rightbarOpen, setRightbarOpen] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);

  // ✅ remote album ids (khi search theo song/alias)
  const [remoteAlbumIds, setRemoteAlbumIds] = useState(null);
  const [remoteSearching, setRemoteSearching] = useState(false);

  // Album cards cho grid
  const albumItems = useMemo(() => {
    const sorted = [...(albums ?? [])].sort((a, b) => {
      const ai = Number(a.id);
      const bi = Number(b.id);

      // ưu tiên sort số (id lớn lên trước)
      if (!Number.isNaN(ai) && !Number.isNaN(bi)) return bi - ai;

      // fallback nếu id không phải số
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

  // ✅ gọi API search chỉ khi: không match tên album (để giữ tốc độ nhanh)
  useEffect(() => {
    const q = (searchTerm || "").trim();
    const qLower = q.toLowerCase();

    if (!q || qLower.length < 2) {
      setRemoteAlbumIds(null);
      setRemoteSearching(false);
      return;
    }

    // nếu match trực tiếp tên album -> khỏi gọi API
    const localHas = albumItems.some((it) =>
      String(it.name || "").toLowerCase().includes(qLower)
    );
    if (localHas) {
      setRemoteAlbumIds(null);
      setRemoteSearching(false);
      return;
    }

    const controller = new AbortController();

    const t = setTimeout(async () => {
      try {
        setRemoteSearching(true);
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        const arr = Array.isArray(data?.results) ? data.results : [];

        const ids = new Set();
        for (const r of arr) {
          const id = r?.album_id ?? r?.id;
          if (id != null) ids.add(String(id));
        }

        setRemoteAlbumIds(Array.from(ids));
      } catch (e) {
        if (e?.name !== "AbortError") {
          setRemoteAlbumIds([]);
        }
      } finally {
        setRemoteSearching(false);
      }
    }, 200);

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [searchTerm, albumItems]);

  // ✅ Search: album name (local) OR song/alias (remote -> album ids)
  const filteredAlbums = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return albumItems;

    // local: match theo tên album (nhanh)
    const local = albumItems.filter((item) =>
      (item.name || "").toLowerCase().includes(q)
    );
    if (local.length > 0) return local;

    // remote: match theo song/alias -> trả về album cards
    if (!remoteAlbumIds) return []; // chưa có kết quả
    if (remoteAlbumIds.length === 0) return [];

    const set = new Set(remoteAlbumIds.map(String));
    return albumItems.filter((it) => set.has(String(it.id)));
  }, [searchTerm, albumItems, remoteAlbumIds]);

  // Pagination cho album
  const totalPages = Math.ceil(filteredAlbums.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAlbums = filteredAlbums.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const musicSection = document.getElementById("music");
    if (musicSection) musicSection.scrollIntoView({ behavior: "smooth" });
  };

  // Click album -> mở playlist và load songs
  const handleSelectAlbum = (item) => {
    const a = item._album ?? { id: item.id, name: item.name, url: item.image };
    setSelectedAlbum({ id: a.id, name: a.name, url: a.url ?? item.image });

    setRightbarOpen(true);
    setSelectedMusic(null);
    setCurrentSongIndex(-1);
  };

  const closePlaylist = () => {
    setRightbarOpen(false);
  };

  // Chuẩn hoá songs để đổ vào Rightbar
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
        {/* Loading/Error: album */}
        {loadingAlbums && (
          <p className="text-center text-gray-300 mt-10">Đang tải album...</p>
        )}
        {errorAlbums && (
          <p className="text-center text-red-400 mt-10">
            Lỗi khi tải album: {errorAlbums}
          </p>
        )}

        {/* Search */}
        {!loadingAlbums && (
          <MusicSearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setCurrentPage={setCurrentPage}
          />
        )}

        {/* ✅ status search remote (chỉ khi đang tìm song/alias) */}
        {!loadingAlbums && searchTerm.trim().length >= 2 && remoteSearching && (
          <div className="text-center text-gray-300 text-sm mb-3">
            Đang tìm theo tên bài hát...
          </div>
        )}

        {/* Grid: album cards (đã bao gồm kết quả search song/alias) */}
        {!loadingAlbums && (
          <MusicGrid
            songs={currentAlbums}
            startIndex={startIndex}
            onSelectMusic={handleSelectAlbum}
          />
        )}

        {/* Pagination album */}
        {!loadingAlbums && totalPages > 1 && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            handlePageChange={handlePageChange}
          />
        )}

        {/* Info text */}
        {!loadingAlbums && totalPages > 1 && (
          <div className="text-center text-gray-400 text-sm mb-4">
            Trang {currentPage} / {totalPages} • Hiển thị {startIndex + 1}–
            {Math.min(endIndex, filteredAlbums.length)} / {filteredAlbums.length}{" "}
            album
          </div>
        )}
      </div>

      {/* Modal */}
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

      {/* Rightbar */}
      <Rightbar
        open={rightbarOpen}
        albumName={selectedAlbum?.name || "PLAYLIST"}
        playlist={playlistItems}
        currentIndex={currentSongIndex}
        onSelectSong={(song, idx) => openSongModalFromPlaylist(song, idx)}
        onClose={closePlaylist}
      />

      {/* Status load songs */}
      {rightbarOpen && selectedAlbum && loadingSongs && (
        <div className="fixed right-6 top-[10%] z-50 text-gray-200 text-sm">
          Đang tải bài hát...
        </div>
      )}
      {rightbarOpen && selectedAlbum && errorSongs && (
        <div className="fixed right-6 top-[10%] z-50 text-red-300 text-sm">
          Lỗi tải bài hát: {errorSongs}
        </div>
      )}
    </div>
  );
};

export default Music;
