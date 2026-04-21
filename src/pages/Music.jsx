import React from "react";
import { useMusicPage } from "../hooks/useMusicPages";

import MusicSearchBar from "../components/Music/MusicSearchBar";
import MusicGrid from "../components/Music/MusicGrid";
import Pagination from "../components/Music/Pagination";
import MusicDetailModal from "../components/Music/MusicDetailModal";
import Rightbar from "../components/Music/Rightbar";

// ── sub-components ────────────────────────────────────────────────

function LoadingState() {
  return <p className="text-center text-gray-300 mt-10">Đang tải album...</p>;
}

function ErrorState({ message }) {
  return (
    <p className="text-center text-red-400 mt-10">
      Lỗi khi tải album: {message}
    </p>
  );
}

function RemoteSearchIndicator() {
  return (
    <div className="text-center text-gray-300 text-sm mb-3">
      Đang tìm theo tên bài hát...
    </div>
  );
}

function PaginationInfo({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  total,
}) {
  return (
    <div className="text-center text-gray-400 text-sm mb-4">
      Trang {currentPage} / {totalPages} • Hiển thị {startIndex + 1}–
      {Math.min(endIndex, total)} / {total} album
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────

const Music = () => {
  const {
    loadingAlbums,
    errorAlbums,
    loadingSongs,
    errorSongs,

    searchTerm,
    setSearchTerm,
    qNorm,
    remoteSearching,

    currentAlbums,
    filteredAlbums,
    startIndex,

    currentPage,
    totalPages,
    handlePageChange,

    selectedAlbum,
    selectedMusic,
    playlistItems,
    currentSongIndex,

    rightbarOpen,

    handleSelectAlbum,
    openSongModal,
    closeModal,
    closePlaylist,
    togglePlaylist,
  } = useMusicPage();

  const endIndex = startIndex + 10;
  const showPaging = filteredAlbums.length > 0 && totalPages > 1;

  return (
    <div id="music" className="w-full flex flex-col">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-16 flex flex-col">
        <div className="w-full flex flex-col px-6">
          {/* ── loading / error ── */}
          {loadingAlbums && <LoadingState />}
          {errorAlbums && <ErrorState message={errorAlbums} />}

          {/* ── search ── */}
          {!loadingAlbums && (
            <MusicSearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              setCurrentPage={() => handlePageChange(1)}
            />
          )}

          {/* ── remote search indicator ── */}
          {!loadingAlbums && qNorm.length >= 2 && remoteSearching && (
            <RemoteSearchIndicator />
          )}

          {/* ── album grid ── */}
          {!loadingAlbums && (
            <MusicGrid
              songs={currentAlbums}
              startIndex={startIndex}
              onSelectMusic={handleSelectAlbum}
            />
          )}

          {/* ── pagination ── */}
          {showPaging && (
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              handlePageChange={handlePageChange}
            />
          )}

          {showPaging && (
            <PaginationInfo
              currentPage={currentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              endIndex={endIndex}
              total={filteredAlbums.length}
            />
          )}
        </div>

        {/* ── song detail modal ── */}
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
          onClose={closeModal}
          onOpenPlaylist={togglePlaylist}
          isPlaylistOpen={rightbarOpen}
        />

        {/* ── playlist rightbar ── */}
        <Rightbar
          open={rightbarOpen}
          albumName={selectedAlbum?.name || "PLAYLIST"}
          playlist={playlistItems}
          currentIndex={currentSongIndex}
          onSelectSong={openSongModal}
          onClose={closePlaylist}
          loading={loadingSongs}
          error={errorSongs}
        />
      </div>
    </div>
  );
};

export default Music;
