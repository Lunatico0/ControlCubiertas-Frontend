import './App.css'
import { lazy, Suspense } from "react"
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from "react-router-dom"
import isElectron from "@utils/isElectron"
import ContextProvider from '@context/ContextProvider.jsx'
import { ApiProvider } from '@context/apiContext'
import Login from '@components/Auth/Login.jsx'
import ChangePassword from '@components/Auth/ChangePassword.jsx'
import RequireAuth from '@components/Auth/RequireAuth.jsx'
import OperativaLayout from '@components/Operativa/OperativaLayout.jsx'
import Inicio from '@components/Operativa/Inicio.jsx'
import Cubiertas from '@components/Operativa/Cubiertas.jsx'
import Vehiculos from '@components/Operativa/Vehiculos.jsx'
import NotFound from '@components/NotFound.jsx'
import TitleBar from '@components/Layout/TitleBar.jsx'

// CARGA DIFERIDA POR RAMA DE RUTA
//
// Todo entraba en un solo chunk: un operario que sólo usa la operativa se bajaba el panel admin
// entero y los gráficos de recharts antes de ver la primera pantalla. (La UI legacy también
// estaba acá; se eliminó por completo el 2026-08-28, ruta /legacy/* incluida.)
//
// Se quedan en el bundle de entrada las pantallas del arranque (login, cambio de contraseña) y
// la operativa, que es la ruta principal y la que abre el 90% de los usuarios: diferirla sólo
// agregaría un salto en blanco donde hoy no hay ninguno. Se difiere lo que es de una minoría o
// de uso ocasional: el panel admin (con recharts adentro, en Reportes) y las guías.
const AdminLayout = lazy(() => import('@components/Portal/AdminLayout.jsx'))
const Dashboard = lazy(() => import('@components/Portal/Dashboard.jsx'))
const Users = lazy(() => import('@components/Portal/Users.jsx'))
const CompanySettings = lazy(() => import('@components/Portal/CompanySettings.jsx'))
const Comprobantes = lazy(() => import('@components/Portal/Comprobantes.jsx'))
const Reportes = lazy(() => import('@components/Portal/Reportes.jsx'))
const EditorComprobante = lazy(() => import('@components/Portal/EditorComprobante.jsx'))
const GuiaAdmin = lazy(() => import('@components/Portal/GuiaAdmin.jsx'))
const GuiaDeUso = lazy(() => import('@components/Operativa/GuiaDeUso.jsx'))

// En la app instalable (Electron) el index.html se carga por file:// → BrowserRouter
// (history API) rompe las rutas. HashRouter (#/ruta) funciona sobre file://. En web
// seguimos con BrowserRouter (URLs limpias). Se resuelve una sola vez al arrancar.
const Router = isElectron() ? HashRouter : BrowserRouter

// Lo que se ve mientras baja el chunk de una rama diferida. En Electron los chunks salen del
// disco y esto ni parpadea; en web es cuestión de milisegundos sobre una conexión normal.
const Cargando = () => (
  <div className="flex h-full items-center justify-center p-8 text-sm text-(--tx-5)" role="status" aria-live="polite">
    Cargando…
  </div>
)

function App() {
  return (
    <ContextProvider>
      <Router>
        {/* Columna: titlebar custom (solo Electron) + contenido. En web TitleBar=null → el
            contenido ocupa todo. Los shells van a h-full para calzar bajo la barra de 38px. */}
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
          <TitleBar />
          <div style={{ flex: 1, minHeight: 0 }}>
            {/* Un solo Suspense envuelve todas las rutas: las ramas diferidas comparten el mismo
                fallback y las que no lo son nunca lo activan. */}
            <Suspense fallback={<Cargando />}>
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

          {/* Operación (rediseño): la interfaz PRINCIPAL.
              Cada sección y cada detalle tienen su URL. Antes todo vivía en "/" con la sección
              en un useState, así que el botón Atrás salía de la app en vez de cerrar el drawer,
              no se podía compartir el link de una cubierta y un F5 devolvía al Inicio.
              Los detalles son rutas ANIDADAS: el drawer se monta sobre la lista, que sigue
              detrás, y cerrarlo es simplemente volver a la ruta padre. */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <ApiProvider>
                  <OperativaLayout />
                </ApiProvider>
              </RequireAuth>
            }
          >
            <Route index element={<Navigate to="/inicio" replace />} />
            <Route path="inicio" element={<Inicio />} />
            <Route path="cubiertas" element={<Cubiertas />} />
            <Route path="cubiertas/:code" element={<Cubiertas />} />
            <Route path="vehiculos" element={<Vehiculos />} />
            <Route path="vehiculos/:id" element={<Vehiculos />} />
          </Route>

          {/* Catch-all: cualquier ruta inexistente cae en el 404 (no en la operativa). */}
          <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </Router>
    </ContextProvider>
  )
}

export default App
