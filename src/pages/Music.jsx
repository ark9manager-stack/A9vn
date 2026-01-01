import React, { useState, useMemo } from "react";
import { useAlbums } from "../hooks/useAlbums";
import { useMusic } from "../hooks/useMusic";

import MusicSearchBar from "../components/Music/MusicSearchBar";
import MusicGrid from "../components/Music/MusicGrid";
import Pagination from "../components/Music/Pagination";

import MusicDetailModal from "../components/Music/MusicDetailModal";
import Rightbar from "../components/Music/Rightbar";
import { songsData } from "../assets/icon-assets/assets";

const Music = () => {
  const { albums, loading: loadingAlbums, error: errorAlbums } = useAlbums();
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const {
    songs: rawSongs,
    loading: loadingSongs,
    error: errorSongs,
  } = useMusic(selectedAlbum?.id);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedMusic, setSelectedMusic] = useState(null);
  const [rightbarOpen, setRightbarOpen] = useState(false);

  // View mode
  const viewingAlbums = !selectedAlbum;

  const albumItems = useMemo(() => {
    return (albums ?? []).map((a) => ({
      id: a.id,
      name: a.name,
      desc: "Album",
      image: a.url,
      _album: a,
    }));
  }, [albums]);

  const songItems = useMemo(() => {
    return (rawSongs ?? []).map((s) => ({
      name: s.name ?? s.song_name ?? "",
      desc: selectedAlbum?.name ?? "",
      image: selectedAlbum?.url ?? "",
      audio: s.audio ?? s.url_song ?? s.urlSong ?? "",
      lyrics: s.lyrics ?? s.url_lyric ?? s.urlLyric ?? null,
      id_list: s.id_list ?? s.idList,
    }));
  }, [rawSongs, selectedAlbum]);

  const listToShow = viewingAlbums ? albumItems : songItems;

  const loading = viewingAlbums ? loadingAlbums : loadingSongs;
  const error = viewingAlbums ? errorAlbums : errorSongs;

  const filteredList = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return listToShow;

    return listToShow.filter((item) => {
      const name = (item.name || "").toLowerCase();
      const desc = (item.desc || "").toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [searchTerm, listToShow]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredList.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const musicSection = document.getElementById("music");
    if (musicSection) musicSection.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectItem = (item) => {
    if (viewingAlbums) {
      setSelectedAlbum(item._album ?? { id: item.id, name: item.name, url: item.image });
      setSearchTerm("");
      setCurrentPage(1);
      setSelectedMusic(null);
      setRightbarOpen(false);
      return;
    }
    setSelectedMusic(item);
  };

  return (
    <div
      id="music"
      className="fullpage-section bg-gradient-to-br from-blue-900 via-black to-cyan-900"
    >
      <div className="w-full h-full flex flex-col justify-center px-6">
        {/* Header when in album songs view */}
        {!viewingAlbums && selectedAlbum && (
          <div className="flex items-center justify-between mt-6 mb-2">
            <div className="text-gray-200 font-semibold">
              Album: {selectedAlbum.name}
            </div>
            <button
              className="text-sm text-cyan-300 hover:text-cyan-200 underline"
              onClick={() => {
                setSelectedAlbum(null);
                setSearchTerm("");
                setCurrentPage(1);
                setSelectedMusic(null);
                setRightbarOpen(false);
              }}
            >
              ← Quay lại Album
            </button>
          </div>
        )}

        {/* Loading & Error */}
        {loading && (
          <p className="text-center text-gray-300 mt-10">
            {viewingAlbums ? "Đang tải album..." : "Đang tải bài hát..."}
          </p>
        )}
        {error && (
          <p className="text-center text-red-400 mt-10">
            Lỗi khi tải {viewingAlbums ? "album" : "bài hát"}: {error}
          </p>
        )}

        {/* Search Bar */}
        {!loading && (
          <MusicSearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setCurrentPage={setCurrentPage}
          />
        )}

        {/* Grid */}
        {!loading && (
          <MusicGrid
            songs={currentItems}
            startIndex={startIndex}
            onSelectMusic={handleSelectItem}
          />
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            handlePageChange={handlePageChange}
          />
        )}

        {/* Info text */}
        {!loading && totalPages > 1 && (
          <div className="text-center text-gray-400 text-sm mb-4">
            Trang {currentPage} / {totalPages} • Hiển thị {startIndex + 1}–
            {Math.min(endIndex, filteredList.length)} / {filteredList.length}{" "}
            {viewingAlbums ? "album" : "bài hát"}
          </div>
        )}
      </div>

      {/* Modal (chỉ mở khi chọn song) */}
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
        onClose={() => {
          setSelectedMusic(null);
          setRightbarOpen(false);
        }}
        onOpenPlaylist={() => setRightbarOpen((v) => !v)}
      />

      {/* Right Sidebar (tạm giữ như bạn đang dùng) */}
      <Rightbar open={rightbarOpen} playlist={songsData} />
    </div>
  );
};

export default Music;
