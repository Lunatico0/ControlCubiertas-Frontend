import usePrintEngine from "./usePrintEngine"
import { generateReceiptHTML } from "@utils/receipt-html"
import { fetchCompany } from "@api/company"

// El diseño del comprobante (receiptDesign) y los datos de empresa cambian rara vez;
// los traemos UNA vez por sesión y los cacheamos. Si el fetch falla (ej: backend viejo
// sin /api/company), queda null → generateReceiptHTML usa sus defaults (TMBC histórico),
// así la impresión nunca se rompe por esto.
let companyPromise = null
const getCompanyCached = () => {
  if (!companyPromise) companyPromise = fetchCompany().catch(() => null)
  return companyPromise
}

export const usePrint = () => {
  const { printHtml, isPrinting } = usePrintEngine()
  const layoutMode = localStorage.getItem("receiptLayout") || "dynamic"

  const print = async (data) => {
    const company = await getCompanyCached()
    const html = generateReceiptHTML(data, layoutMode, company?.receiptDesign, company)
    const title = `Comprobante-${data?.receiptNumber || "0000-00000000"}`
    return await printHtml(html, title)
  }

  return { print, isPrinting }
}

export default usePrint
