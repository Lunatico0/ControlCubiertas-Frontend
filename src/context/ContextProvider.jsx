import { ThemeProvider } from '@context/ThemeContext'
import { SettingsProvider } from '@context/SettingsContext'
import { AuthProvider } from '@context/AuthContext'
import DialogHost from '@components/dialog/DialogHost'

// ApiProvider ya NO va acá: hace fetch de tires/vehicles en el mount y reventaría
// con 401 sin sesión. Se monta dentro de la zona protegida (ver App.jsx).
const ContextProvider = ({ children }) => {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </SettingsProvider>
      {/* Host del sistema de diálogos (reemplazo de SweetAlert2). Bajo ThemeProvider
          para que el overlay tome el tema activo (data-app-theme propio). */}
      <DialogHost />
    </ThemeProvider>
  )
}

export default ContextProvider
