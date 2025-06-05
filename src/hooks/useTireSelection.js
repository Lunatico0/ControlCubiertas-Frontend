import { useState, useCallback, useMemo } from "react"

/**
 * Hook para manejar la selección de cubiertas
 * @param {Array} initialTires - Lista inicial de cubiertas seleccionadas
 * @param {Object} options - Opciones adicionales
 * @param {boolean} options.allowDuplicates - Si permite duplicados (default: false)
 * @returns {Object} Funciones y estados para la selección de cubiertas
 */
export const useTireSelection = (initialTires = [], { allowDuplicates = false } = {}) => {
  const [selectedTires, setSelectedTires] = useState(initialTires)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // IDs de las cubiertas seleccionadas para verificación rápida
  const selectedTireIds = useMemo(() => {
    return new Set(selectedTires.map((tire) => tire._id))
  }, [selectedTires])

  const handleAddTire = useCallback(
    (tire) => {
      if (!tire || !tire._id) return

      // Verificar si la cubierta ya está seleccionada
      if (!allowDuplicates && selectedTireIds.has(tire._id)) {
        return
      }

      setSelectedTires((prev) => [...prev, tire])
      setSearchQuery("")
      setIsSearchOpen(false)
    },
    [selectedTireIds, allowDuplicates],
  )

  const handleRemoveTire = useCallback((indexOrId) => {
    setSelectedTires((prev) => {
      // Si es un índice numérico
      if (typeof indexOrId === "number") {
        return prev.filter((_, i) => i !== indexOrId)
      }

      // Si es un ID
      return prev.filter((tire) => tire._id !== indexOrId)
    })
  }, [])

  const resetTireSelection = useCallback(() => {
    setSelectedTires([])
    setSearchQuery("")
    setIsSearchOpen(false)
  }, [])

  return {
    selectedTires,
    setSelectedTires,
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    setIsSearchOpen,
    handleAddTire,
    handleRemoveTire,
    resetTireSelection,
    selectedTireIds,
  }
}

export default useTireSelection
