import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
// Fuentes bundleadas: sin esto la app depende del CDN de Google y en un taller offline cae
// al default del sistema. Sólo los subsets latin y los pesos que realmente se usan.
import '@fontsource/ibm-plex-sans/latin-400.css'
import '@fontsource/ibm-plex-sans/latin-500.css'
import '@fontsource/ibm-plex-sans/latin-600.css'
import '@fontsource/ibm-plex-sans/latin-700.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-500.css'
import '@fontsource/space-grotesk/latin-500.css'
import '@fontsource/space-grotesk/latin-600.css'
import '@fontsource/space-grotesk/latin-700.css'
import './index.css'
import App from './App.jsx'

// Sentry (monitoreo de errores).
//
// En DEV no se inicializa aunque haya DSN. El .env local suele tener el DSN de produccion, y
// entonces cada sesion de desarrollo ensucia el Sentry real: el HMR de Vite genera errores que
// NO existen en produccion ("Rendered more hooks than during the previous render", contextos
// undefined tras un refresh en caliente) y quedan mezclados con los de los clientes.
// Para depurar el propio Sentry en local, poner VITE_SENTRY_DEV=true.
const dsn = import.meta.env.VITE_SENTRY_DSN
const habilitado = !!dsn && (!import.meta.env.DEV || import.meta.env.VITE_SENTRY_DEV === "true")

if (habilitado) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE, // "development" | "production"
    // Foco en errores. El tracing de performance (tracesSampleRate) queda para habilitar
    // mas adelante si hace falta; por ahora no lo prendemos para no gastar cuota.

    beforeSend(event, hint) {
      // Los 4xx no son fallas: son el contrato funcionando. "Kilometraje de baja no puede ser
      // menor que el de alta" es un operario equivocandose, y la UI ya se lo dice. Reportarlos
      // quema cuota y ahoga los errores de verdad. Los 5xx y los de red SI se reportan.
      const status = hint?.originalException?.status
      if (typeof status === "number" && status >= 400 && status < 500) return null
      return event
    },
  })
}

// Pantalla de ultimo recurso si algo revienta en el render de React. Colores fijos (no tokens):
// si el arbol crashea, el shell temeado puede no estar montado.
const AppCrash = () => (
  <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, fontFamily: "system-ui, sans-serif", background: "#0A0C0D", color: "#e5e7eb", padding: 24, textAlign: "center" }}>
    <div style={{ fontSize: 20, fontWeight: 700 }}>Algo salió mal</div>
    <div style={{ fontSize: 14, opacity: 0.7, maxWidth: 420 }}>Registramos el error y ya lo estamos viendo. Probá recargar la app.</div>
    <button onClick={() => window.location.reload()} style={{ marginTop: 8, padding: "10px 18px", borderRadius: 9, border: "none", background: "#C4ED2B", color: "#0A0C0D", fontWeight: 700, cursor: "pointer" }}>
      Recargar
    </button>
  </div>
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<AppCrash />} showDialog={false}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
