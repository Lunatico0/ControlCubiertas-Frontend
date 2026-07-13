import { createAPI } from "./client"

// Panel del tenant-admin. baseURL → ${VITE_API_URL}/api/admin (admin-only en el back).
const adminClient = createAPI("admin")

// Usuarios del tenant
export const listUsers = () => adminClient.get("/users").then((r) => r.data)
export const createUser = (data) => adminClient.post("/users", data).then((r) => r.data) // → { user, tempPassword }
export const setUserStatus = (id, status) =>
  adminClient.patch(`/users/${id}/status`, { status }).then((r) => r.data)

// Configuración de la empresa
export const getCompany = () => adminClient.get("/company").then((r) => r.data)
export const updateCompany = (data) => adminClient.patch("/company", data).then((r) => r.data)

// Resumen operativo del tenant
export const getSummary = () => adminClient.get("/summary").then((r) => r.data)

// Histórico de comprobantes emitidos (con búsqueda, filtro por tipo y paginación)
export const getReceipts = (params = {}) =>
  adminClient.get("/receipts", { params }).then((r) => r.data) // → { items, total, page, limit }
