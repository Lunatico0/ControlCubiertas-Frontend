import axios from "axios"

const URL = import.meta.env.VITE_API_URL

// Configuración base de axios para vehicles
const vehiclesAPI = axios.create({
  baseURL: `${URL}/api/vehicles`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor para manejo de errores
vehiclesAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "Error desconocido"
    throw new Error(message)
  },
)

// ✅ 1. Obtener todos los vehiculos
export const fetchAllVehicles = async () => {
  const response = await vehiclesAPI.get("/")
  return response.data
}

// ✅ 2. Obtener vehículo por ID
export const fetchVehicleById = async (id) => {
  const response = await vehiclesAPI.get(`/${id}`)
  return response.data
}

// ✅ 3. Crear un nuevo vehículo
export const createVehicle = async (vehicleData) => {
  const response = await vehiclesAPI.post("/", vehicleData)
  return response.data
}

// ✅ 4. Actualizar un vehículo existente
export const updateVehicle = async (id, vehicleData) => {
  const response = await vehiclesAPI.put(`/${id}`, vehicleData)
  return response.data
}

export default vehiclesAPI
