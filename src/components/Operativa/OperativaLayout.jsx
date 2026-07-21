import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useTheme } from "@context/ThemeContext"
import { useAuth } from "@context/AuthContext"
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded"
import HomeRoundedIcon from "@mui/icons-material/HomeRounded"
import TripOriginRoundedIcon from "@mui/icons-material/TripOriginRounded"
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined"
import { useCacheTenantLogo } from "@hooks/useCacheTenantLogo"
import { useUpdater } from "@hooks/useUpdater"
import AppSidebar from "@components/Layout/AppSidebar"
import BrandDeco from "@components/common/BrandDeco"
import Cubiertas from "./Cubiertas"
import Inicio from "./Inicio"
import Vehiculos from "./Vehiculos"
import OpTour from "./OpTour"

// Shell de la app operativa (rediseño Claude Design). Usa el design system de
// tokens (var(--x)) + data-app-theme para tema claro/oscuro. Las pantallas internas
// (inventario, drawer, etc.) llegan en los próximos hitos; por ahora placeholder.
const NAV = [
  { key: "inicio", label: "Inicio", icon: <HomeRoundedIcon sx={{ fontSize: 20 }} /> },
  { key: "cubiertas", label: "Cubiertas", icon: <TripOriginRoundedIcon sx={{ fontSize: 20 }} /> },
  { key: "vehiculos", label: "Vehículos", icon: <LocalShippingOutlinedIcon sx={{ fontSize: 20 }} /> },
]

// Pasos del tour de la operativa (screen = key de sección; sel = data-tour del elemento).
const OP_STEPS = [
  { screen: "inicio", sel: null, place: "center", title: "Bienvenido a TireOps", body: "Un recorrido de 30 segundos por lo esencial. Podés salir cuando quieras y volver a verlo desde el botón de ayuda." },
  { screen: "inicio", sel: "nav-cubiertas", place: "right", title: "Menú principal", body: "Todo se mueve desde acá: Inicio, Cubiertas (el inventario) y Vehículos." },
  { screen: "inicio", sel: "inicio-search", place: "bottom", title: "Buscá al instante", body: "Desde el Inicio buscás cualquier cubierta por código, marca o serie. Tip: apretá Ctrl + K para saltar a la búsqueda." },
  { screen: "cubiertas", sel: "cub-filters", place: "bottom", title: "Filtros rápidos", body: "Acotá el inventario por estado: en stock, en circulación o a recapar. El número te dice cuántas hay en cada grupo." },
  { screen: "cubiertas", sel: "cub-viewtoggle", place: "left", title: "Tarjetas o lista", body: "Cambiá entre vista de tarjetas (más visual) y lista (más densa) según lo que necesites." },
  { screen: "cubiertas", sel: "cub-alta", place: "bottom", title: "Dar de alta", body: "Registrás una cubierta nueva en el inventario. Cada movimiento genera su comprobante automáticamente." },
  { screen: "vehiculos", sel: "nav-vehiculos", place: "right", title: "Vehículos y ejes", body: "Cada vehículo muestra su esquema de ejes y las cubiertas montadas. Desde el detalle podés reconfigurar los ejes si hubo un error." },
  { screen: "vehiculos", sel: "help-btn", place: "top", title: "¿Perdido? Volvé acá", body: "Este botón de ayuda reproduce el tour cuando quieras y abre la guía de uso completa." },
]

const OperativaLayout = () => {
  const { isDarkMode } = useTheme()
  const { user, logout, isAdmin } = useAuth()
  const upd = useUpdater() // auto-updater (solo desktop): botón sidebar + modal
  useCacheTenantLogo() // cachea el logo del tenant para el splash del desktop (no-op en web)
  const goToRoute = useNavigate() // navegación de ruta (react-router), distinta del navigate interno por sección
  // Deep-link desde el panel admin: navigate("/", { state:{ op:{ section, tab } } }) abre la
  // sección + filtro pedidos (ej. "Requiere acción" → Cubiertas filtradas por A recapar).
  const initialOp = useLocation().state?.op
  const [active, setActive] = useState(initialOp?.section || "inicio")
  const [intent, setIntent] = useState(initialOp?.tab ? { tab: initialOp.tab } : null) // intención de navegación para Cubiertas (query/tab/assignTo)
  const [tourOpen, setTourOpen] = useState(false) // guía interactiva (tour con spotlight)

  const navigate = (section, intentData = null) => {
    setIntent(intentData)
    setActive(section)
  }

  const displayName = user?.name || user?.email?.split("@")[0] || "Operario"
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div
      data-app-theme={isDarkMode ? "dark" : "light"}
      className="flex h-full w-full overflow-hidden text-left"
      style={{ background: "var(--bg)", color: "var(--tx)", fontFamily: "'IBM Plex Sans',system-ui,sans-serif" }}
    >
      {/* ============ SIDEBAR ============ */}
      <AppSidebar
        nav={NAV.map((item) => ({
          key: item.key,
          label: item.label,
          icon: item.icon,
          active: active === item.key,
          onClick: () => navigate(item.key),
          dataTour: item.key === "cubiertas" ? "nav-cubiertas" : item.key === "vehiculos" ? "nav-vehiculos" : undefined,
        }))}
        belowNav={
          isAdmin ? (
            <>
              <div className="mx-1 my-2 h-px" style={{ background: "var(--bd-faint)" }} />
              <div
                onClick={() => goToRoute("/admin")}
                title="Ir al panel administrativo"
                className="flex cursor-pointer items-center gap-[13px] rounded-[9px] px-[13px] py-3 text-[14.5px] font-semibold transition-colors"
                style={{ border: "1px solid color-mix(in srgb, var(--ink-lime) 45%, transparent)", background: "color-mix(in srgb, var(--ink-lime) 8%, transparent)", color: "var(--ink-lime)" }}
              >
                <span className="inline-flex h-[21px] w-[21px] flex-none items-center"><AdminPanelSettingsRoundedIcon sx={{ fontSize: 20 }} /></span>
                <span>Panel administrativo</span>
              </div>
            </>
          ) : null
        }
        upd={upd}
        user={{ name: displayName, roleLabel: "Operativo", initials, avatarBg: "#18B89E", avatarColor: "#04201B" }}
        help={{ dataTour: "help-btn", onStartTour: () => { setActive("inicio"); setTourOpen(true) }, guideHref: "/guia", guideLabel: "Guía de uso completa", guideSubtitle: "Manual detallado · pestaña nueva" }}
        onLogout={logout}
      />

      {/* ============ MAIN ============ */}
      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Deco de marca: dos logos TireOps muy tenues, solo en Inicio (detrás del contenido). */}
        {active === "inicio" && (
          <>
            <BrandDeco variant="icon" />
            <BrandDeco variant="full" />
          </>
        )}
        <div className="relative z-[1] flex-1 overflow-auto">
          {active === "inicio" ? (
            <Inicio onNavigate={navigate} />
          ) : active === "cubiertas" ? (
            <Cubiertas intent={intent} onNavigate={navigate} />
          ) : active === "vehiculos" ? (
            <Vehiculos onNavigate={navigate} intent={intent} />
          ) : (
            <div className="mx-auto flex h-full max-w-[900px] flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="text-[22px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>
                {NAV.find((n) => n.key === active)?.label}
              </div>
              <p style={{ color: "var(--tx-4)" }}>Pantalla en construcción — próximo hito del rediseño.</p>
            </div>
          )}
        </div>
      </main>

      {tourOpen && <OpTour steps={OP_STEPS} active={active} onNavigate={(s) => navigate(s)} onClose={() => setTourOpen(false)} />}
    </div>
  )
}

export default OperativaLayout
