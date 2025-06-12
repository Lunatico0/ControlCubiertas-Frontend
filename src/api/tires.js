import { createAPI } from "./client"
const tiresAPI = createAPI("tires")

export const fetchAllTires = async () => (await tiresAPI.get("/")).data
export const fetchTireById = async (id) => (await tiresAPI.get(`/${id}`)).data
export const createTire = async (data) => (await tiresAPI.post("/", data)).data
export const updateTireStatus = async (id, data) => (await tiresAPI.patch(`/${id}/status`, data)).data
export const assignTireToVehicle = async (id, data) => (await tiresAPI.patch(`/${id}/assign`, data)).data
export const unassignTireFromVehicle = async (id, data) => (await tiresAPI.patch(`/${id}/unassign`, data)).data
export const updateTireDataCorrection = async (id, data) => (await tiresAPI.patch(`/${id}/correct`, data)).data
export const updateTireHistoryEntry = async (id, data, entry) =>
  (await tiresAPI.patch(`/${id}/history/${entry._id}`, data)).data
export const undoHistoryEntry = async (id, historyId, data) =>
  (await tiresAPI.post(`/${id}/history/${historyId}/undo`, data)).data
export const getReceiptNumber = async () => (await tiresAPI.get("/next-number")).data.receiptNumber

export default tiresAPI
