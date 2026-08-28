import axios from "axios"
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./tokenStore"
import isElectron from "@utils/isElectron"
import * as Sentry from '@sentry/react'

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

const forceLogout = (message) => {
  clearTokens()
  // Mensaje opcional para mostrar en el login tras un cierre forzado (sobrevive el reload de
  // window.location vía sessionStorage; el Login lo lee y lo limpia).
  if (message) { try { sessionStorage.setItem("cc_logout_msg", message) } catch { /* sin sessionStorage: se pierde el detalle, igual cierra sesión */ } }
  // El destino depende del router, que NO es el mismo en los dos targets: la web usa
  // BrowserRouter (rutas por path) y la app instalable HashRouter, porque carga por file://
  // y ahí "/login" es una ruta del FILESYSTEM, no del router. Mandar a "/login" en Electron
  // dejaba la app en pantalla blanca sin forma de volver ante cualquier 401 no recuperable.
  if (isElectron()) {
    if (window.location.hash === "#/login") return
    window.location.hash = "#/login"
    // Cambiar el hash no recarga el documento, y el reload es parte de lo que este cierre
    // forzado necesita: resetea el estado de React y las caches a nivel módulo.
    window.location.reload()
    return
  }
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

      // Tenant eliminado/suspendido (el backend valida el tenant en cada request). Refrescar el
      // token NO lo arregla → avisamos y cerramos sesión, sin dejar seguir navegando con datos vacíos.
      if (error.response?.data?.code === "TENANT_INACTIVE") {
        const msg = error.response.data.message || "Tu empresa ya no está disponible."
        forceLogout(msg)
        return Promise.reject(new Error(msg))
      }

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
      const data = error.response?.data
      const message = data?.message || error.message || "Error desconocido"
      // Re-lanzamos un Error plano (la UI consume .message), pero preservamos datos útiles:
      // `field` (qué campo marcar en rojo) y `status` (código HTTP) para el manejo en el componente.
      //
      // El `.message` que viaja acá es el CRUDO. La UI no lo muestra tal cual: pasa por
      // mensajeDeError (@utils/apiError), que sólo deja pasar los 4xx (mensajes de negocio) y
      // reemplaza el resto por un texto por status. Sin eso, un 5xx le mostraba al operario el
      // texto de axios ("Request failed with status code 500") o estructura interna de Mongo.
      const err = new Error(message)
      if (data?.field) err.field = data.field
      if (status) err.status = status

      // Los 5xx y los errores de red son fallas reales: van a Sentry con el detalle técnico
      // completo, que es justamente lo que NO se le muestra al operario. Los 4xx no: son
      // errores de negocio esperados y ensuciarían el proyecto.
      if (!status || status >= 500) {
        Sentry.captureException(error, {
          tags: { api: path, http_status: status || 'network' },
          extra: { url, method: original?.method, backendMessage: data?.message },
        })
      }

      return Promise.reject(err)
    },
  )

  return client
}
