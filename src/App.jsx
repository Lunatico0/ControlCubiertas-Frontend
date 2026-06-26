import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useUpdater } from "@hooks/useUpdater"
import Layout from '@components/Layout/Layout.jsx'
import ContextProvider from '@context/ContextProvider.jsx'
import { ApiProvider } from '@context/apiContext'
import Login from '@components/Auth/Login.jsx'
import ChangePassword from '@components/Auth/ChangePassword.jsx'
import RequireAuth from '@components/Auth/RequireAuth.jsx'

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
          {/* App operativa: protegida + ApiProvider (que carga datos en el mount). */}
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
