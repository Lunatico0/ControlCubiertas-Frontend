import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@context/AuthContext"
import NotFound from "@components/NotFound.jsx"

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
    // t151: antes era un <Navigate to="/"> mudo. Si alguien le pasa la URL del panel a un
    // operario, un redirect sin explicación se lee como que la app se colgó. La ruta
    // inexistente ya mostraba un 404 prolijo con botón de volver: el 403 merece lo mismo.
    return (
      <NotFound
        codigo="403"
        titulo="No tenés permiso"
        mensaje="El panel de administración es solo para administradores. Tu usuario opera desde la app del día a día."
      />
    )
  }
  return children
}

export default RequireAuth
