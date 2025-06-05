import axios from "axios"

const URL = import.meta.env.VITE_API_URL

// Configuración base de axios para orders
const ordersAPI = axios.create({
  baseURL: `${URL}/api/orders`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor para manejo de errores
ordersAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "Error desconocido"
    throw new Error(message)
  },
)

// ✅ Verificar si un número de orden existe
export const checkOrderNumber = async (orderNumber) => {
  const response = await ordersAPI.get(`/check/${orderNumber}`)
  return response.data
}
