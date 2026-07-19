import { createAPI } from "./client"

// Panel del tenant-admin. baseURL → ${VITE_API_URL}/api/admin (admin-only en el back).
const adminClient = createAPI("admin")

// Usuarios del tenant
export const listUsers = () => adminClient.get("/users").then((r) => r.data)
export const createUser = (data) => adminClient.post("/users", data).then((r) => r.data) // → { user, tempPassword }
// Edita name y/o role de un usuario (el email no se edita). → user actualizado
export const updateUser = (id, data) => adminClient.patch(`/users/${id}`, data).then((r) => r.data)
export const setUserStatus = (id, status) =>
  adminClient.patch(`/users/${id}/status`, { status }).then((r) => r.data)
// Restablece la contraseña de un usuario a una temporal (admin). → { user, tempPassword }
export const resetPassword = (id) =>
  adminClient.post(`/users/${id}/reset-password`).then((r) => r.data)

// Configuración de la empresa
export const getCompany = () => adminClient.get("/company").then((r) => r.data)
export const updateCompany = (data) => adminClient.patch("/company", data).then((r) => r.data)

// Resumen operativo del tenant
export const getSummary = () => adminClient.get("/summary").then((r) => r.data)

// Histórico de comprobantes emitidos (con búsqueda, filtro por tipo y paginación)
export const getReceipts = (params = {}) =>
  adminClient.get("/receipts", { params }).then((r) => r.data) // → { items, total, page, limit }

// Reportes de trazabilidad/rendimiento por kilometraje. params: { range: '12m'|'6m'|'all' }
export const getReports = (params = {}) =>
  adminClient.get("/reports", { params }).then((r) => r.data) // → { total, fleetLife, discardRate, leader, brands, stages }

// Desgaste de cubiertas por vehículo (km recorrido, períodos, promedio por período, montadas).
export const getVehicleReports = () =>
  adminClient.get("/reports/vehicles").then((r) => r.data) // → { vehicles: [{ mobile, licensePlate, tires, stints, kmTotal, avgKmPerStint, mounted }] }

// Desgaste POR POSICIÓN de un camión: km acumulado en cada posición del eje + agregado por eje.
export const getVehicleWear = (id) =>
  adminClient.get(`/reports/vehicles/${id}/wear`).then((r) => r.data) // → { vehicle, positions:[{code,axle,side,km,current}], axles:[{axle,km,count}], maxPosKm }
