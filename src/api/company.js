import { createAPI } from "./client"

// Lectura de la empresa (datos + receiptDesign) para CUALQUIER rol — para imprimir el
// comprobante con el diseño del tenant. La escritura es admin-only (api/admin.js).
const companyAPI = createAPI("company")

export const fetchCompany = async () => (await companyAPI.get("/")).data

export default companyAPI
