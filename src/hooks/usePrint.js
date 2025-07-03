import usePrintEngine from "./usePrintEngine"
import { generateReceiptHTML } from "@utils/receipt-html"

export const usePrint = () => {
  const { printHtml, isPrinting } = usePrintEngine()
  const layoutMode = localStorage.getItem("receiptLayout") || "dynamic";

  const print = async (data) => {
    const html = generateReceiptHTML(data, layoutMode)
    const title = `Comprobante-${data?.receiptNumber || "0000-00000000"}`
    return await printHtml(html, title)
  }

  return { print, isPrinting }
}

export default usePrint
