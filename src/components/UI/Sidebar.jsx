import React from "react";
import { assets } from "../../assets/icon-assets/assets";

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Backdrop (click để tắt) */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar với hiệu ứng mở rộng (expand width) */}
      <div
        className={`fixed top-0 left-0 h-full z-50 transition-width duration-300 ease-in-out overflow-hidden ${
          isOpen ? "w-[280px]" : "w-0"
        }`}
      >
        <div className="w-[280px] h-full p-2 flex flex-col gap-2 text-white bg-black shadow-2xl">
          {/* Header với hiệu ứng chéo (slant) giống ảnh */}
          <div className="relative h-32 overflow-hidden rounded-t-lg">
            {/* Background gradient với clip-path chéo */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% 70%, 0 100%)" }}
            ></div>
            {/* Nội dung header trên background */}
            <div className="absolute p-4 flex items-center gap-8">
              <button
                type="button"
                onClick={onClose}
                className="text-white/80 hover:text-white bg-transparent hover:bg-white/20 rounded-lg px-3 py-2 text-sm font-semibold"
                aria-label="Close sidebar"
              >
                ✕
              </button>
              <h2 className="text-xl font-bold">Monster Siren</h2>
            </div>
            {/* Breadcrumb và tiêu đề lớn (giống ảnh) - tùy chỉnh nếu cần */}
            <div className="absolute top-8 left-4 z-10 text-sm text-white/80"></div>
            <div className="absolute top-12 left-4 z-10 text-3xl font-bold text-white"></div>
          </div>

          <div className="w-full flex-1 p-2 flex flex-col gap-2">
            <div className="bg-[#121212] h-full rounded">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img className="w-8" src={assets.stack_icon} alt="" />
                  <p className="font-semibold">Your Collection</p>
                </div>
                <div className="flex items-center gap-3">
                  <img className="w-5" src={assets.arrow_icon} alt="" />
                  <img className="w-5" src={assets.plus_icon} alt="" />
                </div>
              </div>

              <div className="p-4 bg-[#242424] m-2 rounded font-semibold flex flex-col items-start gap-1 pl-4">
                <h1>Create your first playlist</h1>
                <p className="font-light">try now</p>
                <button className="px-4 py-1.5 bg-white text-[15px] text-black rounded-full mt-4 hover:bg-gray-200 transition-colors duration-200">
                  Create Playlist
                </button>
              </div>

              <div className="p-4 bg-[#242424] m-2 rounded font-semibold flex flex-col items-start gap-1 pl-4">
                <h1>Recently Played</h1>
                <p className="font-light">#</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
