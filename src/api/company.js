import { createAPI } from "./client"

// Lectura de la empresa (datos + receiptDesign) para CUALQUIER rol — para imprimir el
// comprobante con el diseño del tenant. La escritura es admin-only (api/admin.js).
const companyAPI = createAPI("company")

export const fetchCompany = async () => (await companyAPI.get("/")).data

// Cache a nivel módulo (por sesión): el diseño del comprobante y los datos de empresa
// cambian rara vez. Compartido por usePrint (acciones) y useReprint (reimpresión).
// Si el fetch falla → null → generateReceiptHTML usa defaults (TMBC), nunca rompe.
let companyPromise = null
export const getCompanyCached = () => {
  if (!companyPromise) companyPromise = fetchCompany().catch(() => null)
  return companyPromise
}

export default companyAPI
