import React from 'react';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import NavigateBeforeRoundedIcon from '@mui/icons-material/NavigateBeforeRounded';
import KeyboardDoubleArrowRightRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded';
import KeyboardDoubleArrowLeftRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowLeftRounded';

const PaginationControls = ({
  currentPage,
  totalPages,
  goToPage,
  nextPage,
  prevPage,
}) => {
  if (totalPages <= 1) return null

  const renderPageNumbers = () => {
    const pages = []
    const delta = 2 // Cuántas páginas visibles antes/después del actual
    const range = []

    const start = Math.max(2, currentPage - delta)
    const end = Math.min(totalPages - 1, currentPage + delta)

    for (let i = start; i <= end; i++) {
      range.push(i)
    }

    if (start > 2) range.unshift("…")
    if (end < totalPages - 1) range.push("…")

    // Insertar siempre primera y última
    return [1, ...range, totalPages]
  }

  return (
    <div className="flex justify-center items-center gap-1 mt-8 flex-wrap">
      <button
        onClick={() => goToPage(1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-700 text-sm disabled:opacity-40"
      >
        <KeyboardDoubleArrowLeftRoundedIcon fontSize='small'/>
      </button>

      <button
        onClick={prevPage}
        disabled={currentPage === 1}
        className="px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-700 text-sm disabled:opacity-40"
      >
        <NavigateBeforeRoundedIcon fontSize='small'/>
      </button>

      {renderPageNumbers().map((page, idx) =>
        page === "…" ? (
          <span key={idx} className="px-2 text-gray-400">
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={`
              px-4 py-2 rounded text-sm
              ${page === currentPage
                ? "bg-white dark:bg-black text-black dark:text-white border"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"}
            `}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={nextPage}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-700 text-sm disabled:opacity-40"
      >
        <NavigateNextRoundedIcon fontSize='small'/>
      </button>

      <button
        onClick={() => goToPage(totalPages)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-700 text-sm disabled:opacity-40"
      >
        <KeyboardDoubleArrowRightRoundedIcon fontSize='small'/>
      </button>
    </div>
  )
}

export default PaginationControls
