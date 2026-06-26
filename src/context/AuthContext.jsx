import { createContext, useContext, useState, useCallback, useMemo } from "react"
import { loginRequest, changePasswordRequest } from "../api/auth"
import { setTokens, clearTokens, getAccessToken } from "../api/tokenStore"

const USER_KEY = "cc_user"
const AuthContext = createContext(null)

// No hay endpoint /me todavía: persistimos el user junto al token para reconstruir
// la sesión tras un refresh del navegador. La sesión vale solo si hay AMBOS.
const readStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => (getAccessToken() ? readStoredUser() : null))

  const login = useCallback(async (email, password) => {
    const data = await loginRequest(email, password)
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken })
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    clearTokens()
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    await changePasswordRequest(currentPassword, newPassword)
    setUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, mustChangePassword: false }
      localStorage.setItem(USER_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === "tenant-admin",
      mustChangePassword: !!user?.mustChangePassword,
      login,
      logout,
      changePassword,
    }),
    [user, login, logout, changePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>")
  return ctx
}

export default AuthContext
