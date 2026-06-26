import { ThemeProvider } from '@context/ThemeContext'
import { SettingsProvider } from '@context/SettingsContext'
import { AuthProvider } from '@context/AuthContext'

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
    </ThemeProvider>
  )
}

export default ContextProvider
