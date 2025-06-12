import { useCallback } from "react"
import { showToast } from "@utils/toast"
import usePrintEngine from "./usePrintEngine"
import { buildReprintData } from "@utils/print-data"
import { generateReceiptHTML } from "@utils/receipt-html"

export const useReprint = () => {
  const { printHtml, isPrinting } = usePrintEngine()

  const execute = useCallback(
    async ({ entry, tire }) => {
      try {
        const data = buildReprintData(entry, tire)
        const html = generateReceiptHTML(data) // ✅ Generar HTML como en usePrint
        const title = `Reimpresión-${data?.receiptNumber || "recibo"}`

        const result = await printHtml(html, title)

        if (result) {
          showToast("success", "Comprobante reimpreso correctamente")
        } else {
          showToast("warning", "La impresión fue cancelada")
        }
      } catch (error) {
        console.error("❌ Error al reimprimir:", error)
        showToast("error", "Error al reimprimir el comprobante")
      }
    },
    [printHtml],
  )

  return { execute, isPrinting }
}
