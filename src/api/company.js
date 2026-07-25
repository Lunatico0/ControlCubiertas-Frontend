import { createAPI } from "./client"

// Lectura de la empresa (datos + receiptDesign) para CUALQUIER rol — para imprimir el
// comprobante con el diseño del tenant. La escritura es admin-only (api/admin.js).
const companyAPI = createAPI("company")

export const fetchCompany = async () => (await companyAPI.get("/")).data

// Cache a nivel módulo (por sesión): el diseño del comprobante y los datos de empresa
// cambian rara vez. Compartido por usePrint (acciones) y useReprint (reimpresión).
// Si el fetch falla → null → generateReceiptHTML usa defaults, nunca rompe.
let companyPromise = null
export const getCompanyCached = () => {
  // Cachear SOLO éxitos. Si el fetch falla (token aún no listo, 401 transitorio, red),
  // se limpia la promesa para que el próximo llamador reintente, en vez de quedar pegado
  // en null toda la sesión — eso rompía el catálogo de estados en /op (todos los roles
  // caían al fallback y los conteos por rol, ej. "A recapar", quedaban en 0).
  if (!companyPromise) {
    companyPromise = fetchCompany().catch(() => { companyPromise = null; return null })
  }
  return companyPromise
}

// Invalida la cache para que la próxima lectura (ej. al entrar a /op) traiga datos frescos.
// La llama el panel admin al guardar (separador de patente, prefijo de código, diseño, etc.)
// para que los cambios se reflejen en la operativa SIN hard-reload.
export const invalidateCompanyCache = () => { companyPromise = null }

export default companyAPI
