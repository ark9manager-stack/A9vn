import React from "react";

const Navbar = ({ isOpen, onToggle }) => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between ">
      {/* Left side - Hamburger, Logo, Name, and Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className="p-2 text-white rounded-lg shadow-lg hover:bg-[#242424] transition-colors duration-200"
          aria-label={isOpen ? "Ẩn sidebar" : "Hiện sidebar"}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isOpen ? (
              // Icon X để đóng
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              // Icon hamburger để mở
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Logo và tên trang web */}
        <div className="w-full flex justify-between items-center hidden md:block font-semibold">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-white font-bold text-lg">Monster Siren</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => scrollToSection("home")}
          className="text-white text-[15px] px-4 py-2 rounded-2xl hidden md:block cursor-pointer hover:bg-[#242424] transition-colors duration-200 font-semibold"
        >
          Home
        </button>
        <button
          onClick={() => scrollToSection("music")}
          className="text-white text-[15px] px-4 py-2 rounded-2xl cursor-pointer hover:bg-[#242424] transition-colors duration-200 font-semibold"
        >
          Music
        </button>
        <button
          onClick={() => scrollToSection("operator")}
          className="text-white text-[15px] py-2 px-3 rounded-2xl cursor-pointer hover:bg-[#242424] transition-colors duration-200 font-semibold"
        >
          Operator
        </button>
        {/* User profile - moved to left side */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl hidden md:block shadow-lg ">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs">U</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
