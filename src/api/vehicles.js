import { createAPI } from "./client"
const vehiclesAPI = createAPI("vehicles")

export const fetchAllVehicles = async () => (await vehiclesAPI.get("/")).data
export const fetchVehicleById = async (id) => (await vehiclesAPI.get(`/${id}`)).data
export const createVehicle = async (data) => (await vehiclesAPI.post("/", data)).data
export const updateVehicle = async (id, data) => (await vehiclesAPI.put(`/${id}`, data)).data
export const updateDetails = async (id, data) => (await vehiclesAPI.put(`/details/${id}`, data)).data
// Configurar el esquema de ejes de un vehículo existente (migración A4). data: { axles, kilometers? }
export const updateVehicleAxles = async (id, data) => (await vehiclesAPI.patch(`/${id}/axles`, data)).data
// Esquema de posiciones del vehículo + qué cubierta ocupa cada una. Para el selector al montar.
export const fetchVehiclePositions = async (id) => (await vehiclesAPI.get(`/${id}/positions`)).data

// Tipos de vehículo custom del tenant. El "tipo" se deriva del layout de ejes; los presets
// viven en el front (constante), estos son los que el usuario guardó. data: { name, axles: [String] }
export const getVehicleTypes = async () => (await vehiclesAPI.get("/types")).data
export const createVehicleType = async (data) => (await vehiclesAPI.post("/types", data)).data

export default vehiclesAPI
