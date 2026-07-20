import './App.css'
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom"
import isElectron from "@utils/isElectron"
import Layout from '@components/Layout/Layout.jsx'
import ContextProvider from '@context/ContextProvider.jsx'
import { ApiProvider } from '@context/apiContext'
import Login from '@components/Auth/Login.jsx'
import ChangePassword from '@components/Auth/ChangePassword.jsx'
import RequireAuth from '@components/Auth/RequireAuth.jsx'
import AdminLayout from '@components/Portal/AdminLayout.jsx'
import Dashboard from '@components/Portal/Dashboard.jsx'
import Users from '@components/Portal/Users.jsx'
import CompanySettings from '@components/Portal/CompanySettings.jsx'
import Comprobantes from '@components/Portal/Comprobantes.jsx'
import Reportes from '@components/Portal/Reportes.jsx'
import EditorComprobante from '@components/Portal/EditorComprobante.jsx'
import GuiaAdmin from '@components/Portal/GuiaAdmin.jsx'
import OperativaLayout from '@components/Operativa/OperativaLayout.jsx'
import GuiaDeUso from '@components/Operativa/GuiaDeUso.jsx'
import NotFound from '@components/NotFound.jsx'

// En la app instalable (Electron) el index.html se carga por file:// → BrowserRouter
// (history API) rompe las rutas. HashRouter (#/ruta) funciona sobre file://. En web
// seguimos con BrowserRouter (URLs limpias). Se resuelve una sola vez al arrancar.
const Router = isElectron() ? HashRouter : BrowserRouter

function App() {
  return (
    <ContextProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/cambiar-password"
            element={
              <RequireAuth>
                <ChangePassword />
              </RequireAuth>
            }
          />
          {/* Guía del administrador (manual): pantalla propia, se abre desde Ayuda (pestaña nueva). */}
          <Route
            path="/admin/guia"
            element={
              <RequireAuth requireAdmin>
                <GuiaAdmin />
              </RequireAuth>
            }
          />

          {/* Portal del tenant-admin: shell propio (dark), gateado por rol. */}
          <Route
            path="/admin"
            element={
              <RequireAuth requireAdmin>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="usuarios" element={<Users />} />
            <Route path="empresa" element={<CompanySettings />} />
            <Route path="comprobantes" element={<Comprobantes />} />
            <Route path="reportes" element={<Reportes />} />
            {/* Editor de comprobante: vista del portal (dentro del shell, con sidebar visible). */}
            <Route path="comprobante" element={<EditorComprobante />} />
          </Route>

          {/* Guía de uso completa (manual): pantalla propia, se abre desde Ayuda (pestaña nueva). */}
          <Route
            path="/guia"
            element={
              <RequireAuth>
                <GuiaDeUso />
              </RequireAuth>
            }
          />

          {/* UI vieja preservada en /legacy un tiempo, por adaptación (se retira más adelante). */}
          <Route
            path="/legacy/*"
            element={
              <RequireAuth>
                <ApiProvider>
                  <Layout />
                </ApiProvider>
              </RequireAuth>
            }
          />

          {/* Operación (rediseño): la interfaz PRINCIPAL, en /. La navegación interna es por
              sección (estado), no por URL, así que vive solo en la raíz. */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <ApiProvider>
                  <OperativaLayout />
                </ApiProvider>
              </RequireAuth>
            }
          />

          {/* Catch-all: cualquier ruta inexistente cae en el 404 (no en la operativa). */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ContextProvider>
  )
}

export default App
