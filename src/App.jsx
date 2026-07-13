import './App.css'
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom"
import isElectron from "@utils/isElectron"
import { useUpdater } from "@hooks/useUpdater"
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

// En la app instalable (Electron) el index.html se carga por file:// → BrowserRouter
// (history API) rompe las rutas. HashRouter (#/ruta) funciona sobre file://. En web
// seguimos con BrowserRouter (URLs limpias). Se resuelve una sola vez al arrancar.
const Router = isElectron() ? HashRouter : BrowserRouter

function App() {
  useUpdater()

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

          {/* Operación (rediseño): ahora la interfaz PRINCIPAL, en / y el resto de rutas.
              React Router v6 rankea /legacy/* y /admin por encima de este catch-all. */}
          <Route
            path="/*"
            element={
              <RequireAuth>
                <ApiProvider>
                  <OperativaLayout />
                </ApiProvider>
              </RequireAuth>
            }
          />
        </Routes>
      </Router>
    </ContextProvider>
  )
}

export default App
