import { useState, useCallback } from "react"
import { showToast } from "@utils/toast"
import { usePrint } from "./usePrint"

/**
 * Hook para manejar acciones sobre cubiertas
 * @param {Object} options - Opciones de configuración
 * @param {Function} options.printBuilder - Función para construir datos de impresión
 * @param {Function} options.apiCall - Función de API a llamar
 * @param {string} options.successMessage - Mensaje de éxito
 * @returns {Object} Funciones y estados para la acción
 */
export const useTireAction = ({ printBuilder, apiCall, successMessage }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { print } = usePrint()

  const execute = useCallback(
    async ({ tire, entry, formData, refresh, close }) => {
      if (isSubmitting) {
        console.log("⚠️ Ya hay una operación en curso")
        return
      }

      try {
        setIsSubmitting(true)

        // Validar que apiCall existe
        if (!apiCall || typeof apiCall !== "function") {
          throw new Error("apiCall no está definido o no es una función")
        }

        // Llamar a la API
        let updated
        if (entry) {
          updated = await apiCall(tire._id, formData, entry)
        } else {
          updated = await apiCall(tire._id, formData)
        }

        if (!updated?.tire) {
          throw new Error("Respuesta inválida del servidor")
        }

        // Obtener número de recibo si es necesario
        let receipt = "0000-00000000"
        if (formData.getReceiptNumber && typeof formData.getReceiptNumber === "function") {
          try {
            receipt = await formData.getReceiptNumber()
          } catch (receiptError) {
            console.warn("⚠️ No se pudo obtener número de recibo:", receiptError)
          }
        }

        // Imprimir comprobante si es necesario
        if (printBuilder) {
          try {
            const printData = printBuilder(tire, updated, formData, receipt)

            if (printData) {
              const printResult = await print(printData)
            }
          } catch (printError) {
            console.error("❌ Error al imprimir:", printError)
            showToast("warning", "La acción se completó pero hubo un problema al imprimir")
          }
        }

        // Mostrar mensaje de éxito DESPUÉS de la impresión
        showToast("success", successMessage)

        // Refrescar datos
        if (refresh && typeof refresh === "function") {
          try {
            await refresh(updated.tire._id)
          } catch (refreshError) {
            console.error("❌ Error al refrescar:", refreshError)
          }
        }

        // Cerrar modal
        if (close && typeof close === "function") {
          close()
        }

        return updated
      } catch (error) {
        console.error("❌ Error en la acción:", error)
        showToast("error", error.message || "Error desconocido")
        throw error
      } finally {
        setIsSubmitting(false)
      }
    },
    [apiCall, printBuilder, print, isSubmitting, successMessage],
  )

  return { execute, isSubmitting }
}

export default useTireAction
