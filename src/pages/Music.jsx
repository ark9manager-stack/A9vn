import React, { useMemo, useState } from "react";
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

  // Album cards cho grid
  const albumItems = useMemo(() => {
    return (albums ?? []).map((a) => ({
      id: a.id,
      name: a.name,
      desc: "Album",
      image: a.url,
      _album: a,
    }));
  }, [albums]);

  // Search chỉ áp dụng cho album
  const filteredAlbums = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return albumItems;
    return albumItems.filter((item) =>
      (item.name || "").toLowerCase().includes(q)
    );
  }, [searchTerm, albumItems]);

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

      // để modal dùng
      cover,
      albumName,
    }));
  }, [rawSongs, selectedAlbum]);

  const openSongModalFromPlaylist = (song, idx) => {
    setCurrentSongIndex(idx);
    setSelectedMusic({
      name: song.name,
      image: song.cover,
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

        {/* Search album */}
        {!loadingAlbums && (
          <MusicSearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setCurrentPage={setCurrentPage}
          />
        )}

        {/* Grid: chỉ album */}
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

      {/* Modal: mở khi click bài trong playlist */}
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
          // Đóng modal KHÔNG đóng playlist nữa
          setSelectedMusic(null);
        }}
        onOpenPlaylist={() => setRightbarOpen((v) => !v)}
      />

      {/* Rightbar: hiển thị songs của album đã chọn */}
      <Rightbar
        open={rightbarOpen}
        albumName={selectedAlbum?.name || "PLAYLIST"}
        playlist={playlistItems}
        currentIndex={currentSongIndex}
        onSelectSong={(song, idx) => openSongModalFromPlaylist(song, idx)}
      />

      {/* (Tuỳ chọn) Nếu muốn show trạng thái load songs trong playlist:
          Bạn có thể thêm UI trong Rightbar để dùng loadingSongs/errorSongs.
          Hiện tại Music.jsx đã có sẵn 2 biến này: loadingSongs / errorSongs
      */}
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
