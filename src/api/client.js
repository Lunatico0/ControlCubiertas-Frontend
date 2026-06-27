import axios from "axios"
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./tokenStore"

const BASE_URL = import.meta.env.VITE_API_URL

// Refresh compartido entre TODOS los clients (tires, vehicles, admin, auth): si varios
// requests dan 401 a la vez, se hace UN solo POST /refresh y todos esperan esa promesa.
let refreshing = null

async function refreshAccessToken() {
  const rt = getRefreshToken()
  if (!rt) throw new Error("Sin refresh token")
  // axios crudo (no createAPI) para no pasar por este interceptor ni crear import circular.
  const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken: rt })
  setTokens({ accessToken: data.accessToken })
  return data.accessToken
}

const forceLogout = () => {
  clearTokens()
  if (window.location.pathname !== "/login") window.location.assign("/login")
}

export const createAPI = (path) => {
  const client = axios.create({
    baseURL: `${BASE_URL}/api/${path}`,
    timeout: 10000,
    headers: { "Content-Type": "application/json" },
  })

  // Request: inyecta el access token en cada llamada si hay sesión.
  client.interceptors.request.use((config) => {
    const token = getAccessToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      const status = error.response?.status
      const original = error.config
      const url = original?.url || ""

      // Access expirado → refresh transparente (una sola vez por request). No se intenta
      // para /login ni /refresh (esos 401 son credenciales o refresh inválido, no expiración).
      if (status === 401 && original && !original._retry && !/\/(login|refresh)$/.test(url)) {
        original._retry = true
        try {
          refreshing = refreshing || refreshAccessToken().finally(() => { refreshing = null })
          const newToken = await refreshing
          original.headers.Authorization = `Bearer ${newToken}`
          return client(original) // reintenta el request original con el token nuevo
        } catch {
          forceLogout()
          return Promise.reject(new Error("Tu sesión expiró. Volvé a iniciar sesión."))
        }
      }

      // 401 sin posibilidad de refresh (o refresh ya falló) → logout, salvo el propio login.
      if (status === 401 && !/\/login$/.test(url)) forceLogout()

      console.error(`❌ Error en ${path} API:`, error)
      const message = error.response?.data?.message || error.message || "Error desconocido"
      return Promise.reject(new Error(message))
    },
  )

  return client
}
