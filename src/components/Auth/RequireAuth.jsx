import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@context/AuthContext"

// Protege rutas. Sin sesión → /login (recordando a dónde iba). Si la sesión exige
// cambio de contraseña, fuerza /cambiar-password. `requireAdmin` gatea el panel.
const RequireAuth = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, mustChangePassword } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  if (mustChangePassword && location.pathname !== "/cambiar-password") {
    return <Navigate to="/cambiar-password" replace />
  }
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }
  return children
}

export default RequireAuth
