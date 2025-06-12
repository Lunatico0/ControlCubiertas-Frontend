import axios from "axios"

const BASE_URL = import.meta.env.VITE_API_URL

export const createAPI = (path) => {
  const client = axios.create({
    baseURL: `${BASE_URL}/api/${path}`,
    timeout: 10000,
    headers: { "Content-Type": "application/json" },
  })

  client.interceptors.response.use(
    (res) => res,
    (error) => {
      console.error(`❌ Error en ${path} API:`, error)
      const message = error.response?.data?.message || error.message || "Error desconocido"
      return Promise.reject(new Error(message))
    },
  )

  return client
}
