import { useState } from "react"
import { useTheme } from "@context/ThemeContext"
import { useAuth } from "@context/AuthContext"
import HomeRoundedIcon from "@mui/icons-material/HomeRounded"
import TripOriginRoundedIcon from "@mui/icons-material/TripOriginRounded"
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined"
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded"
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded"
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded"
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded"
import Cubiertas from "./Cubiertas"
import Inicio from "./Inicio"
import Vehiculos from "./Vehiculos"

// Shell de la app operativa (rediseño Claude Design). Usa el design system de
// tokens (var(--x)) + data-app-theme para tema claro/oscuro. Las pantallas internas
// (inventario, drawer, etc.) llegan en los próximos hitos; por ahora placeholder.
const NAV = [
  { key: "inicio", label: "Inicio", icon: <HomeRoundedIcon sx={{ fontSize: 20 }} /> },
  { key: "cubiertas", label: "Cubiertas", icon: <TripOriginRoundedIcon sx={{ fontSize: 20 }} /> },
  { key: "vehiculos", label: "Vehículos", icon: <LocalShippingOutlinedIcon sx={{ fontSize: 20 }} /> },
  { key: "comprobantes", label: "Comprobantes", icon: <ReceiptLongRoundedIcon sx={{ fontSize: 20 }} /> },
]

const OperativaLayout = () => {
  const { isDarkMode, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const [active, setActive] = useState("cubiertas")
  const [intent, setIntent] = useState(null) // intención de navegación para Cubiertas (query/tab)

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
        <div className="flex items-center gap-3 px-5 pb-5 pt-[22px]">
          <span className="flex h-9 w-9 flex-none items-center justify-center">
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="#C4ED2B" strokeWidth="3.4" strokeDasharray="78 22" strokeLinecap="round" transform="rotate(-50 20 20)" />
              <circle cx="20" cy="20" r="6.4" stroke="#C4ED2B" strokeWidth="3.4" />
            </svg>
          </span>
          <div style={{ fontFamily: "'Space Grotesk'", lineHeight: ".98" }}>
            <div className="text-[15px] font-bold tracking-[.02em]" style={{ color: "var(--tx)" }}>CONTROL</div>
            <div className="text-[15px] font-bold tracking-[.02em]" style={{ color: "var(--ink-lime)" }}>CUBIERTAS</div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex flex-col gap-1 px-3 py-2">
          {NAV.map((item) => {
            const on = active === item.key
            return (
              <div
                key={item.key}
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

        {/* Perfil */}
        <div className="flex items-center gap-[11px] p-3">
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
            title="Cerrar sesión"
            onClick={logout}
            className="inline-flex cursor-pointer rounded-[7px] p-[7px]"
            style={{ color: "var(--tx-6)" }}
          >
            <LogoutRoundedIcon sx={{ fontSize: 17 }} />
          </div>
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
    </div>
  )
}

export default OperativaLayout
