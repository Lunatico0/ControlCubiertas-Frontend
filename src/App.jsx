import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"
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
import EditorComprobante from '@components/Portal/EditorComprobante.jsx'
import OperativaLayout from '@components/Operativa/OperativaLayout.jsx'

function App() {
  useUpdater()

  return (
    <ContextProvider>
      <BrowserRouter>
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
          </Route>

          {/* Editor de comprobante: pantalla full propia (design system operativo), gateada por rol. */}
          <Route
            path="/admin/comprobante"
            element={
              <RequireAuth requireAdmin>
                <EditorComprobante />
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
      </BrowserRouter>
    </ContextProvider>
  )
}

export default App
