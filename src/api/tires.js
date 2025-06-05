import axios from "axios"

const URL = import.meta.env.VITE_API_URL

// Configuración base de axios para tires
const tiresAPI = axios.create({
  baseURL: `${URL}/api/tires`,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor para manejo de errores
tiresAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Error en API de tires:", error)
    const message = error.response?.data?.message || error.message || "Error desconocido"
    throw new Error(message)
  },
)

// ✅ 1. Obtener todas las cubiertas
export const fetchAllTires = async () => {
  const response = await tiresAPI.get("/")
  return response.data
}

// ✅ 2. Obtener cubierta por ID
export const fetchTireById = async (id) => {
  const response = await tiresAPI.get(`/${id}`)
  return response.data
}

// ✅ 3. Crear una nueva cubierta
export const createTire = async (data) => {
  console.log("📤 Enviando datos para crear cubierta:", data)
  const response = await tiresAPI.post("/", data)
  console.log("✅ Respuesta del servidor:", response.data)
  return response.data
}

// ✅ 4. Actualizar estado de una cubierta
export const updateTireStatus = async (tireId, data) => {
  console.log("📤 Actualizando estado - ID:", tireId, "Data:", data)
  const response = await tiresAPI.patch(`/${tireId}/status`, data)
  console.log("✅ Respuesta del servidor:", response.data)
  return response.data
}

// ✅ 5. Asignar cubierta a vehículo
export const assignTireToVehicle = async (tireId, data) => {
  console.log("📤 Asignando cubierta - ID:", tireId, "Data:", data)
  const response = await tiresAPI.patch(`/${tireId}/assign`, data)
  console.log("✅ Respuesta del servidor:", response.data)
  return response.data
}

// ✅ 6. Desasignar cubierta de vehículo
export const unassignTireFromVehicle = async (tireId, data) => {
  console.log("📤 Desasignando cubierta - ID:", tireId, "Data:", data)
  const response = await tiresAPI.patch(`/${tireId}/unassign`, data)
  console.log("✅ Respuesta del servidor:", response.data)
  return response.data
}

// ✅ 7. Corregir información de una cubierta
export const updateTireDataCorrection = async (tireId, data) => {
  console.log("📤 Corrigiendo cubierta - ID:", tireId, "Data:", data)
  const response = await tiresAPI.patch(`/${tireId}/correct`, data)
  console.log("✅ Respuesta del servidor:", response.data)
  return response.data
}

// ✅ 8. Obtener el próximo número de recibo
export const getReceiptNumber = async () => {
  const response = await tiresAPI.get("/next-number")
  return response.data.receiptNumber
}

// ✅ 9. Actualizar una entrada del historial de una cubierta
export const updateTireHistoryEntry = async (tireId, data, entry) => {
  console.log("📤 Actualizando historial - ID:", tireId, "Entry:", entry._id, "Data:", data)
  const response = await tiresAPI.patch(`/${tireId}/history/${entry._id}`, data)
  console.log("✅ Respuesta del servidor:", response.data)
  return response.data
}

// ✅ 10. Deshacer una entrada del historial
export const undoHistoryEntry = async (tireId, historyId, data) => {
  console.log("📤 Deshaciendo entrada - Tire ID:", tireId, "History ID:", historyId, "Data:", data)
  const response = await tiresAPI.post(`/${tireId}/history/${historyId}/undo`, data)
  console.log("✅ Respuesta del servidor:", response.data)
  return response.data
}

export default tiresAPI
