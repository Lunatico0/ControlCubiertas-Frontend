import { createAPI } from "./client"
const vehiclesAPI = createAPI("vehicles")

export const fetchAllVehicles = async () => (await vehiclesAPI.get("/")).data
export const fetchVehicleById = async (id) => (await vehiclesAPI.get(`/${id}`)).data
export const createVehicle = async (data) => (await vehiclesAPI.post("/", data)).data
export const updateVehicle = async (id, data) => (await vehiclesAPI.put(`/${id}`, data)).data
export const updateDetails = async (id, data) => (await vehiclesAPI.put(`/details/${id}`, data)).data

export default vehiclesAPI
