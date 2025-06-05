import { useState, useCallback } from "react"
import { showToast } from "@utils/toast"

/**
 * Hook para manejar la creación de entidades
 * @param {Function} createFunction - Función para crear la entidad
 * @param {string} successMessage - Mensaje de éxito
 * @param {string} errorMessage - Mensaje de error por defecto
 * @param {Object} options - Opciones adicionales
 * @param {boolean} options.showToasts - Si debe mostrar toasts (default: true)
 * @returns {Object} Funciones y estados para la creación
 */
export const useCreateEntity = (
  createFunction,
  successMessage = "Creado con éxito",
  errorMessage = "Error al crear",
  { showToasts = true } = {},
) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const create = useCallback(
    async (data, onSuccess, onError) => {
      if (isSubmitting) return null

      try {
        setIsSubmitting(true)
        setError(null)
        setResult(null)

        const createdResult = await createFunction(data)

        if (showToasts) {
          showToast("success", successMessage)
        }

        setResult(createdResult)

        if (onSuccess && typeof onSuccess === "function") {
          onSuccess(createdResult)
        }

        return createdResult
      } catch (err) {
        console.error("Error en creación:", err)
        setError(err)

        const message = err.message || errorMessage

        if (showToasts) {
          showToast("error", message)
        }

        if (onError && typeof onError === "function") {
          onError(err)
        }

        throw err
      } finally {
        setIsSubmitting(false)
      }
    },
    [createFunction, successMessage, errorMessage, showToasts, isSubmitting],
  )

  const reset = useCallback(() => {
    setError(null)
    setResult(null)
  }, [])

  return {
    create,
    isSubmitting,
    error,
    result,
    clearError: () => setError(null),
    reset,
  }
}

export default useCreateEntity
