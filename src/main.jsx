import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.jsx'

// Sentry (monitoreo de errores). Se inicializa SOLO si hay DSN en VITE_SENTRY_DSN: asi en
// dev, sin esa env var, no manda nada (no gasta la cuota); en prod (web + desktop) va con DSN.
const dsn = import.meta.env.VITE_SENTRY_DSN
if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE, // "development" | "production"
    // Foco en errores. El tracing de performance (tracesSampleRate) queda para habilitar
    // mas adelante si hace falta; por ahora no lo prendemos para no gastar cuota.
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
