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

          {/* Rediseño de la operación (work-in-progress) — preview sin romper la actual. */}
          <Route
            path="/op"
            element={
              <RequireAuth>
                <ApiProvider>
                  <OperativaLayout />
                </ApiProvider>
              </RequireAuth>
            }
          />

          {/* App operativa actual: protegida + ApiProvider (que carga datos en el mount). */}
          <Route
            path="/*"
            element={
              <RequireAuth>
                <ApiProvider>
                  <Layout />
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
