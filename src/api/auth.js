import { createAPI } from "./client"

// Cliente del control plane (auth). baseURL → ${VITE_API_URL}/api/auth
const authClient = createAPI("auth")

export const loginRequest = (email, password) =>
  authClient.post("/login", { email, password }).then((r) => r.data)

export const refreshRequest = (refreshToken) =>
  authClient.post("/refresh", { refreshToken }).then((r) => r.data)

export const changePasswordRequest = (currentPassword, newPassword) =>
  authClient.post("/change-password", { currentPassword, newPassword }).then((r) => r.data)
