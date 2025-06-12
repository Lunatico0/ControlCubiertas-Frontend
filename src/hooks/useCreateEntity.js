import { useState, useCallback } from "react"
import { showToast } from "@utils/toast"

const useCreateEntity = (
  createFunction,
  successMessage = "Creado con éxito",
  errorMessage = "Error al crear",
  options = {}
) => {
  const { showToasts = true } = options
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const create = useCallback(
    async (data, onSuccess, onError) => {
      if (isSubmitting) return null

      try {
        setIsSubmitting(true)
        setError(null)

        const response = await createFunction(data)
        setResult(response)

        if (showToasts) showToast("success", successMessage)
        onSuccess?.(response)

        return response
      } catch (err) {
        setError(err)
        if (showToasts) showToast("error", err.message || errorMessage)
        onError?.(err)
        throw err
      } finally {
        setIsSubmitting(false)
      }
    },
    [createFunction, successMessage, errorMessage, showToasts, isSubmitting],
  )

  return {
    create,
    isSubmitting,
    error,
    result,
    clearError: () => setError(null),
    reset: () => {
      setError(null)
      setResult(null)
    },
  }
}

export default useCreateEntity
