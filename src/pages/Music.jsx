import React, { useEffect, useMemo, useRef, useState } from "react";
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

  // ✅ album ids match từ /api/search (tên bài, nickname, keyword)
  const [searchAlbumIds, setSearchAlbumIds] = useState(null); // Set<number> | null
  const abortRef = useRef(null);

  // Album cards cho grid (id lớn -> nhỏ)
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

  // ✅ Khi user gõ searchTerm, gọi /api/search để lấy album_id phù hợp
  useEffect(() => {
    const q = searchTerm.trim();
    if (q.length < 2) {
      setSearchAlbumIds(null);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        const arr = Array.isArray(data?.results) ? data.results : [];

        const ids = new Set();
        for (const r of arr) {
          if (r?.album_id != null) ids.add(Number(r.album_id));
        }
        setSearchAlbumIds(ids);
      } catch (e) {
        if (e.name !== "AbortError") {
          // fallback: nếu api lỗi thì chỉ search theo tên album local
          setSearchAlbumIds(null);
        }
      }
    }, 250);

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [searchTerm]);

  // ✅ Filter albums grid: nếu có searchAlbumIds -> lọc theo album_id match
  const filteredAlbums = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return albumItems;

    // luôn cho match theo tên album local (để không phụ thuộc api)
    const nameMatch = (item) =>
      (item.name || "").toLowerCase().includes(q);

    if (!searchAlbumIds) {
      return albumItems.filter(nameMatch);
    }

    return albumItems.filter(
      (item) => searchAlbumIds.has(Number(item.id)) || nameMatch(item)
    );
  }, [searchTerm, albumItems, searchAlbumIds]);

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
    // ✅ không tắt lyric
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

        {!loadingAlbums && totalPages > 1 && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            handlePageChange={handlePageChange}
          />
        )}

        {!loadingAlbums && totalPages > 1 && (
          <div className="text-center text-gray-400 text-sm mb-4">
            Trang {currentPage} / {totalPages} • Hiển thị {startIndex + 1}–
            {Math.min(endIndex, filteredAlbums.length)} / {filteredAlbums.length}{" "}
            album
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
