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

  // ✅ để khi click search result (song) thì highlight đúng id_list sau khi playlist load xong
  const [pendingPick, setPendingPick] = useState(null); // { album_id, id_list }

  // Album cards cho grid
  const albumItems = useMemo(() => {
    const sorted = [...(albums ?? [])].sort((a, b) => {
      const ai = Number(a.id);
      const bi = Number(b.id);

      // ưu tiên sort số (1..xxx)
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

  // Search chỉ áp dụng cho album grid (để giữ behavior cũ)
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
    setPendingPick(null);
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

      // để modal dùng
      cover,
      albumName,
    }));
  }, [rawSongs, selectedAlbum]);

  // ✅ Khi vừa chọn song từ search -> sau khi playlist load, set đúng currentSongIndex
  useEffect(() => {
    if (!pendingPick) return;
    if (!selectedAlbum) return;
    if (Number(selectedAlbum.id) !== Number(pendingPick.album_id)) return;
    if (!playlistItems?.length) return;

    const idx = playlistItems.findIndex(
      (x) => Number(x.id_list) === Number(pendingPick.id_list)
    );
    if (idx >= 0) setCurrentSongIndex(idx);

    setPendingPick(null);
  }, [pendingPick, selectedAlbum, playlistItems]);

  const openSongModalFromPlaylist = (song, idx) => {
    setPendingPick(null);
    setCurrentSongIndex(idx);
    setSelectedMusic({
      name: song.name,
      image: song.cover ?? selectedAlbum?.url ?? "",
      audio: song.audio,
      lyrics: song.lyrics,
    });
  };

  // ✅ Click kết quả SEARCH: mở album
  const handlePickAlbumFromSearch = (a) => {
    setSelectedAlbum({ id: a.album_id, name: a.album_name, url: a.album_url });
    setRightbarOpen(true);

    // mở album thì reset modal
    setSelectedMusic(null);
    setCurrentSongIndex(-1);
    setPendingPick(null);
  };

  // ✅ Click kết quả SEARCH: mở & phát bài
  const handlePickSongFromSearch = (s) => {
    setSelectedAlbum({ id: s.album_id, name: s.album_name, url: s.album_url });
    setRightbarOpen(true);

    // phát luôn (không cần chờ playlist load)
    setSelectedMusic({
      name: s.song_name,
      image: s.album_url,
      audio: s.url_song,
      lyrics: s.url_lyric,
    });

    // highlight đúng bài trong playlist khi load xong
    setCurrentSongIndex(-1);
    setPendingPick({ album_id: s.album_id, id_list: s.id_list });
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

        {/* ✅ Search (album + song dropdown) */}
        {!loadingAlbums && (
          <MusicSearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setCurrentPage={setCurrentPage}
            onPickAlbum={handlePickAlbumFromSearch}
            onPickSong={handlePickSongFromSearch}
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

      {/* Modal: mở khi click bài trong playlist hoặc click search result */}
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
