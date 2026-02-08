import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between">

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/Home")}
          className="text-white text-[15px] px-4 py-2 rounded-2xl hidden md:block hover:bg-[#242424] transition-colors duration-200 font-semibold"
          type="button"
        >
          Home
        </button>

        <button
          onClick={() => navigate("/Operator")}
          className="text-white text-[15px] py-2 px-3 rounded-2xl hover:bg-[#242424] transition-colors duration-200 font-semibold"
          type="button"
        >
          Operator
        </button>

        <button
          onClick={() => navigate("/Music")}
          className="text-white text-[15px] px-4 py-2 rounded-2xl hover:bg-[#242424] transition-colors duration-200 font-semibold"
          type="button"
        >
          Music
        </button>
      </div>
    </div>
  );
};

export default Navbar;
