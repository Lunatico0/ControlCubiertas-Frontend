// Persistencia de los tokens de sesión en localStorage. El interceptor de request
// (api/client.js) los lee SIN depender de React, así axios inyecta el Authorization
// aunque viva fuera del árbol de componentes. El AuthContext es el único que escribe.
const ACCESS_KEY = "cc_access_token"
const REFRESH_KEY = "cc_refresh_token"

export const getAccessToken = () => localStorage.getItem(ACCESS_KEY)
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY)

export const setTokens = ({ accessToken, refreshToken } = {}) => {
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken)
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
}

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}
