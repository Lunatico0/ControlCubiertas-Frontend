import { useState, useEffect, useCallback, useContext } from "react"
import ApiContext from "@context/apiContext"

export const useTireDetails = (tireId = null) => {
  const { loadTireById, selectedTire, selectedLoading } = useContext(ApiContext)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadTireDetails = useCallback(
    async (id = tireId) => {
      if (!id) return null

      try {
        setError(null)
        setIsLoading(true)
        const result = await loadTireById(id)
        return result
      } catch (err) {
        const errorMsg = err.message || "Error al cargar los detalles de la cubierta"
        setError(errorMsg)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [tireId, loadTireById],
  )

  // Cargar detalles al inicializar si se proporciona un ID
  useEffect(() => {
    if (tireId) {
      loadTireDetails()
    }
  }, [tireId, loadTireDetails])

  return {
    tire: selectedTire,
    loading: isLoading || selectedLoading,
    error,
    refreshTire: loadTireDetails,
    clearError: () => setError(null),
  }
}

export default useTireDetails
