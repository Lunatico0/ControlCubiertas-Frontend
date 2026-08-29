import { createAPI } from "./client"
import { normalizeOrderNumber } from "@utils/orderNumber"

const tiresAPI = createAPI("tires")

// El número de orden viaja al backend SIEMPRE en su forma canónica AAAA-NNNNNN.
//
// El formateo vive acá y no en los formularios a propósito: TireForm lo hacía por su cuenta y
// la operativa /op no, así que en la misma base de un tenant terminaron conviviendo "123" y
// "2026-000123" para el mismo dato. Este es el único punto por el que salen los dos caminos.
//
// Un valor que no se puede normalizar (letras, cero) se manda tal cual: el backend lo rechaza
// con 400 y `field: "orderNumber"`, que es lo que el formulario sabe mostrar en el campo.
const conOrden = (data) => {
  if (!data || typeof data !== "object") return data
  const out = { ...data }
  if (out.orderNumber != null) out.orderNumber = normalizeOrderNumber(out.orderNumber)
  // Las correcciones mandan el número dentro de `form`.
  if (out.form && typeof out.form === "object" && out.form.orderNumber != null) {
    out.form = { ...out.form, orderNumber: normalizeOrderNumber(out.form.orderNumber) }
  }
  return out
}

export const fetchAllTires = async () => (await tiresAPI.get("/")).data
export const fetchTireById = async (id) => (await tiresAPI.get(`/${id}`)).data
export const createTire = async (data) => (await tiresAPI.post("/", conOrden(data))).data
export const updateTireStatus = async (id, data) => (await tiresAPI.patch(`/${id}/status`, conOrden(data))).data
export const assignTireToVehicle = async (id, data) => (await tiresAPI.patch(`/${id}/assign`, conOrden(data))).data
export const unassignTireFromVehicle = async (id, data) => (await tiresAPI.patch(`/${id}/unassign`, conOrden(data))).data
export const updateTireDataCorrection = async (id, data) => (await tiresAPI.patch(`/${id}/correct`, conOrden(data))).data
export const updateTireHistoryEntry = async (id, data, entry) =>
  (await tiresAPI.patch(`/${id}/history/${entry._id}`, conOrden(data))).data
export const undoHistoryEntry = async (id, historyId, data) =>
  (await tiresAPI.post(`/${id}/history/${historyId}/undo`, conOrden(data))).data
export const getReceiptNumber = async () => (await tiresAPI.get("/next-number")).data.receiptNumber

export default tiresAPI
