import React from "react";
const Pagination = ({
  totalPages,
  currentPage,
  handlePageChange,
  className = "",
}) => {
  return (
    <div className={`justify-center items-center space-x-6 mb-6 ${className}`}>
      {/* Prev */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-3 rounded-full transition-all duration-200 ${
          currentPage === 1
            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
            : "bg-[#242424] text-white hover:bg-[#2a2a2a] hover:scale-110"
        }`}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Pages */}
      <div className="flex space-x-3">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`w-4 h-4 rounded-full transition-all duration-200 ${
              currentPage === page
                ? "bg-blue-500 scale-125"
                : "bg-gray-400 hover:bg-gray-300"
            }`}
          ></button>
        ))}
      </div>

      {/* Next */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-3 rounded-full transition-all duration-200 ${
          currentPage === totalPages
            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
            : "bg-[#242424] text-white hover:bg-[#2a2a2a] hover:scale-110"
        }`}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
