import { useCallback } from "react"
import { showToast } from "@utils/toast"
import usePrintEngine from "./usePrintEngine"
import useSettings from "./useSettings"
import { buildReprintData } from "@utils/print-data"
import { generateReceiptHTML } from "@utils/receipt-html"
import { getCompanyCached } from "@api/company"

export const useReprint = () => {
  const { printHtml, isPrinting } = usePrintEngine()
  // Misma fuente que usePrint: el contexto de ajustes.
  const { receiptLayout: layoutMode } = useSettings()


  const execute = useCallback(
    async ({ entry, tire }) => {
      try {
        const company = await getCompanyCached()
        const data = buildReprintData(entry, tire)
        const html = generateReceiptHTML(data, layoutMode, company?.receiptDesign, company)
        const title = `Reimpresión-${data?.receiptNumber || "recibo"}`

        // Reimprimir es una acción EXPLÍCITA del usuario: ignora la preferencia autoPrint del
        // tenant (que sólo gobierna la impresión automática al ejecutar un movimiento).
        await printHtml(html, title)

        // "Enviado a impresión", no "reimpreso": el motor sabe que el diálogo se abrió, no que
        // el papel salió. El mensaje viejo afirmaba lo segundo, y su rama de "cancelada" no se
        // mostraba nunca porque el booleano que la gateaba era true siempre.
        showToast("success", `Comprobante ${data?.receiptNumber || ""} enviado a impresión`.replace(/\s+/g, " ").trim())
      } catch (error) {
        console.error("❌ Error al reimprimir:", error)
        showToast("error", "No se pudo abrir la impresión del comprobante")
      }
    },
    [printHtml],
  )

  return { execute, isPrinting, layoutMode }
}
