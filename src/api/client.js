import axios from "axios"
import { getAccessToken, clearTokens } from "./tokenStore"

const BASE_URL = import.meta.env.VITE_API_URL

export const createAPI = (path) => {
  const client = axios.create({
    baseURL: `${BASE_URL}/api/${path}`,
    timeout: 10000,
    headers: { "Content-Type": "application/json" },
  })

  // Request: inyecta el access token en cada llamada si hay sesión. El backend
  // exige Bearer en /tires, /vehicles, /orders y /admin.
  client.interceptors.request.use((config) => {
    const token = getAccessToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  // Response: normaliza el error y, ante 401 (sesión inválida/expirada), limpia
  // la sesión y manda al login. No redirige si el 401 vino del propio /login
  // (credenciales inválidas) — eso lo muestra el formulario.
  client.interceptors.response.use(
    (res) => res,
    (error) => {
      const status = error.response?.status
      const url = error.config?.url || ""
      if (status === 401 && !/\/login$/.test(url)) {
        clearTokens()
        if (window.location.pathname !== "/login") window.location.assign("/login")
      }
      console.error(`❌ Error en ${path} API:`, error)
      const message = error.response?.data?.message || error.message || "Error desconocido"
      return Promise.reject(new Error(message))
    },
  )

  return client
}
