import { useState, useCallback } from "react"
import { showToast } from "@utils/toast"
import { usePrint } from "./usePrint"

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

        // El número de comprobante NO se pide por adelantado. Antes se pedía acá, y una acción
        // que el backend rechazaba (un km de baja menor al de alta, por ejemplo) igual dejaba el
        // número consumido: en el QA de operario quedaron quemados el 281 y el 282, y el papel
        // siguiente salió con el 283 sin que nadie pudiera explicar el salto. Ahora lo reserva el
        // backend DENTRO de la mutación y lo devuelve en la respuesta.
        let updated
        const { getReceiptNumber, ...cleanFormData } = formData // getReceiptNumber ya no se usa
        if (entry) {
          updated = await apiCall(tire._id, cleanFormData, entry)
        } else {
          updated = await apiCall(tire._id, cleanFormData)
        }

        if (!updated?.tire) {
          throw new Error("Respuesta inválida del servidor")
        }

        const receipt = updated.receiptNumber || "0000-00000000"

        // La acción YA está persistida acá arriba. Lo que sigue es un efecto posterior: la
        // impresión NUNCA condiciona ni revierte la mutación, porque la web no puede informar
        // si el operario imprimió o canceló el diálogo (ver usePrintEngine). Cualquier regla
        // que dependa de "se imprimió o no" sería ficción, así que el mensaje dice lo único
        // que sabemos de verdad: que el comprobante se mandó a imprimir, o que quedó en el
        // historial listo para reimprimir.
        let aviso = `${successMessage} · Comprobante ${receipt} enviado a impresión`

        if (printBuilder) {
          try {
            const printData = printBuilder(tire, updated, formData, receipt)
            const resultado = printData ? await print(printData) : null

            if (!printData || resultado?.status === "disabled") {
              aviso = `${successMessage} · Comprobante ${receipt} disponible en el historial`
            }
          } catch (printError) {
            console.error("❌ Error al imprimir:", printError)
            showToast(
              "warning",
              `${successMessage}, pero no se pudo abrir la impresión. Reimprimí el comprobante ${receipt} desde el historial.`,
            )
            aviso = null
          }
        } else {
          aviso = `${successMessage} · Comprobante ${receipt} disponible en el historial`
        }

        if (aviso) showToast("success", aviso)

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
