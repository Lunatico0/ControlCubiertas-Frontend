import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useTheme } from "@context/ThemeContext"
import { useAuth } from "@context/AuthContext"
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded"
import HomeRoundedIcon from "@mui/icons-material/HomeRounded"
import TripOriginRoundedIcon from "@mui/icons-material/TripOriginRounded"
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined"
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded"
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded"
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded"
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded"
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded"
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded"
import { externalPageProps } from "@utils/isElectron"
import { useCacheTenantLogo } from "@hooks/useCacheTenantLogo"
import BrandLogo from "@components/BrandLogo"
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
  const { isDarkMode, toggleTheme } = useTheme()
  const { user, logout, isAdmin } = useAuth()
  useCacheTenantLogo() // cachea el logo del tenant para el splash del desktop (no-op en web)
  const goToRoute = useNavigate() // navegación de ruta (react-router), distinta del navigate interno por sección
  // Deep-link desde el panel admin: navigate("/", { state:{ op:{ section, tab } } }) abre la
  // sección + filtro pedidos (ej. "Requiere acción" → Cubiertas filtradas por A recapar).
  const initialOp = useLocation().state?.op
  const [active, setActive] = useState(initialOp?.section || "cubiertas")
  const [intent, setIntent] = useState(initialOp?.tab ? { tab: initialOp.tab } : null) // intención de navegación para Cubiertas (query/tab/assignTo)
  const [tourOpen, setTourOpen] = useState(false) // guía interactiva (tour con spotlight)
  const [helpMenu, setHelpMenu] = useState(false) // popover de ayuda en el perfil

  const navigate = (section, intentData = null) => {
    setIntent(intentData)
    setActive(section)
  }

  const displayName = user?.name || user?.email?.split("@")[0] || "Operario"
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div
      data-app-theme={isDarkMode ? "dark" : "light"}
      className="flex h-screen w-full overflow-hidden text-left"
      style={{ background: "var(--bg)", color: "var(--tx)", fontFamily: "'IBM Plex Sans',system-ui,sans-serif" }}
    >
      {/* ============ SIDEBAR ============ */}
      <aside
        className="flex w-[248px] flex-none flex-col border-r"
        style={{ background: "var(--sidebar)", borderColor: "var(--bd-faint)" }}
      >
        {/* Logo */}
        <div className="flex items-center px-5 pb-5 pt-[22px]">
          <BrandLogo height={65} />
        </div>

        {/* Navegación */}
        <nav className="flex flex-col gap-1 px-3 py-2">
          {NAV.map((item) => {
            const on = active === item.key
            return (
              <div
                key={item.key}
                data-tour={item.key === "cubiertas" ? "nav-cubiertas" : item.key === "vehiculos" ? "nav-vehiculos" : undefined}
                onClick={() => navigate(item.key)}
                className="flex cursor-pointer items-center gap-[13px] rounded-[9px] px-[13px] py-3 text-[14.5px] transition-colors"
                style={{
                  fontWeight: on ? 600 : 500,
                  color: on ? "var(--tx)" : "var(--tx-4)",
                  background: on ? "var(--hover)" : "transparent",
                  boxShadow: on ? "inset 3px 0 0 var(--ink-lime)" : "none",
                }}
              >
                <span className="inline-flex h-[21px] w-[21px] flex-none items-center" style={{ color: on ? "var(--ink-lime)" : "var(--tx-5)" }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
            )
          })}

          {/* Acceso al panel admin: separado del resto por un divider (solo tenant-admin). */}
          {isAdmin && (
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
          )}
        </nav>

        {/* Toggle de tema */}
        <div className="mt-auto px-3 pt-[10px]">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-[11px] rounded-[9px] border px-3 py-[10px]"
            style={{ borderColor: "var(--bd)", background: "var(--elev)" }}
          >
            <span className="inline-flex h-5 w-5 flex-none items-center" style={{ color: "var(--ink-lime)" }}>
              {isDarkMode ? <DarkModeRoundedIcon sx={{ fontSize: 18 }} /> : <LightModeRoundedIcon sx={{ fontSize: 19 }} />}
            </span>
            <span className="text-[13px] font-medium" style={{ color: "var(--tx-2)" }}>
              {isDarkMode ? "Tema oscuro" : "Tema claro"}
            </span>
          </button>
        </div>

        {/* Perfil + ayuda */}
        <div className="relative flex items-center gap-[11px] p-3">
          <div
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-[12px] font-bold"
            style={{ background: "#18B89E", color: "#04201B", fontFamily: "'Space Grotesk'" }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1" style={{ lineHeight: 1.3 }}>
            <div className="truncate text-[13px] font-semibold" style={{ color: "var(--tx)" }}>{displayName}</div>
            <div className="text-[11px]" style={{ color: "var(--tx-5)" }}>Operativo</div>
          </div>
          <div
            data-tour="help-btn"
            title="Ayuda"
            onClick={() => setHelpMenu((v) => !v)}
            className="inline-flex cursor-pointer rounded-[7px] p-[7px]"
            style={{ color: helpMenu ? "var(--ink-lime)" : "var(--tx-6)", background: helpMenu ? "color-mix(in srgb, var(--ink-lime) 12%, transparent)" : "transparent" }}
          >
            <HelpOutlineRoundedIcon sx={{ fontSize: 17 }} />
          </div>
          <div
            title="Cerrar sesión"
            onClick={logout}
            className="inline-flex cursor-pointer rounded-[7px] p-[7px]"
            style={{ color: "var(--tx-6)" }}
          >
            <LogoutRoundedIcon sx={{ fontSize: 17 }} />
          </div>

          {helpMenu && (
            <>
              <div className="fixed inset-0 z-35" onClick={() => setHelpMenu(false)} />
              <div className="absolute z-40 overflow-hidden rounded-xl" style={{ bottom: 58, right: 12, left: 12, background: "var(--card)", border: "1px solid var(--bd-strong)", boxShadow: "0 18px 44px rgba(0,0,0,.5)" }}>
                <div className="px-3.5 py-[11px] text-[10px] tracking-[.08em]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)", borderBottom: "1px solid var(--bd-soft)" }}>AYUDA</div>
                <button onClick={() => { setHelpMenu(false); setActive("inicio"); setTourOpen(true) }} className="flex w-full items-center gap-[11px] px-3.5 py-3 text-left">
                  <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--ink-lime) 13%, transparent)", color: "var(--ink-lime)" }}><PlayArrowRoundedIcon sx={{ fontSize: 16 }} /></span>
                  <span style={{ lineHeight: 1.25 }}>
                    <span className="block text-[13px] font-semibold" style={{ color: "var(--tx)" }}>Ver guía interactiva</span>
                    <span className="block text-[11px]" style={{ color: "var(--tx-5)" }}>Tour rápido por la app</span>
                  </span>
                </button>
                <a {...externalPageProps("/guia")} onClick={() => setHelpMenu(false)} className="flex items-center gap-[11px] px-3.5 py-3" style={{ textDecoration: "none", borderTop: "1px solid var(--bd-soft)" }}>
                  <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--ink-blue) 16%, transparent)", color: "var(--ink-blue)" }}><MenuBookRoundedIcon sx={{ fontSize: 16 }} /></span>
                  <span style={{ lineHeight: 1.25 }}>
                    <span className="block text-[13px] font-semibold" style={{ color: "var(--tx)" }}>Guía de uso completa</span>
                    <span className="block text-[11px]" style={{ color: "var(--tx-5)" }}>Manual detallado · pestaña nueva</span>
                  </span>
                </a>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* ============ MAIN ============ */}
      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          {active === "inicio" ? (
            <Inicio onNavigate={navigate} />
          ) : active === "cubiertas" ? (
            <Cubiertas intent={intent} />
          ) : active === "vehiculos" ? (
            <Vehiculos onNavigate={navigate} />
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
