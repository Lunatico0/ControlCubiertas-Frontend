import { useState, useCallback } from "react"
import { checkOrderNumber } from "@api/orders"
import { formatOrderNumber } from "@utils/orderNumber"

export const useOrderValidation = ({ autoFormat = true } = {}) => {
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState(null)
  const [lastValidated, setLastValidated] = useState(null)

  const validateOrderNumber = useCallback(
    async (value) => {
      // Validaciones básicas
      if (!value || value.toString().trim() === "") {
        return "El número de orden es obligatorio"
      }

      // Limpiar el valor: remover espacios y convertir a string
      const cleanValue = value.toString().trim()

      // Verificar que sea un número válido (solo dígitos) - valor original
      if (!/^\d+$/.test(cleanValue)) {
        return "Debe ser un número válido"
      }

      // Verificar que no sea solo ceros
      if (Number.parseInt(cleanValue) === 0) {
        return "El número de orden debe ser mayor a 0"
      }

      // Evitar validaciones repetidas
      if (lastValidated === cleanValue) {
        return validationError || true
      }

      setIsValidating(true)
      setValidationError(null)

      try {
        // Formatear SOLO para la consulta al servidor
        const formatted = autoFormat ? formatOrderNumber(cleanValue) : cleanValue

        // Validar con el servidor usando el número formateado
        const response = await checkOrderNumber(formatted)
        setLastValidated(cleanValue)

        if (response.exists) {
          const errorMsg = "Este número de orden ya existe"
          setValidationError(errorMsg)
          return errorMsg
        }

        return true
      } catch (error) {
        console.error("Error validando número de orden:", error)
        const errorMsg = "Error al validar número de orden"
        setValidationError(errorMsg)
        return errorMsg
      } finally {
        setIsValidating(false)
      }
    },
    [lastValidated, validationError, autoFormat],
  )

  const resetValidation = useCallback(() => {
    setValidationError(null)
    setLastValidated(null)
  }, [])

  return {
    validateOrderNumber,
    isValidating,
    validationError,
    resetValidation,
  }
}

export default useOrderValidation
