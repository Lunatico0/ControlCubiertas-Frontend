import { useState, useMemo, useEffect } from "react"

export const usePagination = (items = [], initialItemsPerPage = 24) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)

  const totalPages = Math.ceil(items.length / itemsPerPage)

  // Si la lista se achica (el usuario filtró o buscó) la página actual puede quedar fuera de
  // rango, y entonces la vista sale VACÍA aunque haya resultados: peor que no paginar.
  useEffect(() => {
    if (currentPage > 1 && currentPage > totalPages) setCurrentPage(1)
  }, [totalPages, currentPage])

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return items.slice(start, start + itemsPerPage)
  }, [items, currentPage, itemsPerPage])

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  const nextPage = () => goToPage(currentPage + 1)
  const prevPage = () => goToPage(currentPage - 1)

  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
    itemsPerPage,
    setItemsPerPage,
  }
}
