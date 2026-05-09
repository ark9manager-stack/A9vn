import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const getVisiblePages = (totalPages, currentPage) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage]);
  const from = Math.max(2, currentPage - 1);
  const to = Math.min(totalPages - 1, currentPage + 1);

  for (let page = from; page <= to; page += 1) {
    pages.add(page);
  }

  return Array.from(pages)
    .sort((a, b) => a - b)
    .reduce((items, page, index, sortedPages) => {
      if (index > 0 && page - sortedPages[index - 1] > 1) {
        items.push("gap");
      }
      items.push(page);
      return items;
    }, []);
};

const Pagination = ({
  totalPages,
  currentPage,
  handlePageChange,
  className = "",
}) => {
  const visiblePages = getVisiblePages(totalPages, currentPage);
  const progress =
    totalPages <= 1 ? 100 : ((currentPage - 1) / (totalPages - 1)) * 100;

  return (
    <nav
      aria-label="Music pagination"
      className={`justify-center items-center mb-5 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 rounded-lg bg-[linear-gradient(115deg,rgba(255,255,255,0.06),transparent_36%,rgba(255,255,255,0.035))]" />

      <button
        type="button"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="relative grid h-10 w-10 place-items-center rounded-md border border-white/10 bg-white/[0.04] text-white transition hover:border-primary/50 hover:bg-primary/15 hover:text-primary disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/[0.025] disabled:text-white/25"
        aria-label="Trang trước"
        title="Trang trước"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="relative flex min-w-[280px] flex-col gap-2">
        <div className="flex items-center justify-center gap-1.5">
          {visiblePages.map((page, index) =>
            page === "gap" ? (
              <span
                key={`gap-${index}`}
                className="grid h-8 w-8 place-items-center font-mono-tech text-sm text-white/35"
                aria-hidden="true"
              >
                ...
              </span>
            ) : (
              <button
                type="button"
                key={page}
                onClick={() => handlePageChange(page)}
                aria-current={currentPage === page ? "page" : undefined}
                className={`h-8 min-w-8 rounded-md px-2 font-mono-tech text-sm transition ${
                  currentPage === page
                    ? "border border-primary/70 bg-primary text-black shadow-[0_0_20px_hsl(var(--primary)/0.28)]"
                    : "border border-white/10 bg-white/[0.035] text-white/70 hover:border-white/25 hover:bg-white/10 hover:text-white"
                }`}
              >
                {page}
              </button>
            ),
          )}
        </div>

        <div className="relative h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary via-white to-accent shadow-[0_0_14px_hsl(var(--primary)/0.24)] transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="relative grid h-10 w-10 place-items-center rounded-md border border-white/10 bg-white/[0.04] text-white transition hover:border-primary/50 hover:bg-primary/15 hover:text-primary disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/[0.025] disabled:text-white/25"
        aria-label="Trang sau"
        title="Trang sau"
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>
    </nav>
  );
};

export default Pagination;
