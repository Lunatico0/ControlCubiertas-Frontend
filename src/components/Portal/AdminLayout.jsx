import { useState, useEffect } from "react"
import { NavLink, useNavigate, Outlet } from "react-router-dom"
import { useAuth } from "@context/AuthContext"
import { useTheme } from "@context/ThemeContext"
import { getCompany } from "@api/admin"

import HomeRoundedIcon from "@mui/icons-material/HomeRounded"
import GroupRoundedIcon from "@mui/icons-material/GroupRounded"
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded"
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded"
import EditRoundedIcon from "@mui/icons-material/EditRounded"
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded"
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded"
import HeadsetMicRoundedIcon from "@mui/icons-material/HeadsetMicRounded"
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded"
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded"
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded"

// Portal del tenant-admin: shell dark propio (design system operativo), separado de la
// operación. Cada sección entra por <Outlet/>. "Comprobantes" (histórico) es un hito
// aparte → queda como "próximamente" hasta que exista su vista.
const NAV = [
  { to: "/admin", end: true, label: "Resumen", Icon: HomeRoundedIcon },
  { to: "/admin/usuarios", label: "Usuarios", Icon: GroupRoundedIcon },
  { to: "/admin/empresa", label: "Empresa", Icon: ApartmentRoundedIcon },
  { to: "/admin/comprobantes", label: "Comprobantes", Icon: ReceiptLongRoundedIcon },
  { to: "/admin/comprobante", label: "Editor de comprobante", Icon: EditRoundedIcon },
]

const Logo = () => (
  <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="18" stroke="var(--ink-lime)" strokeWidth="3.4" strokeDasharray="78 22" strokeLinecap="round" transform="rotate(-50 20 20)" />
    <circle cx="20" cy="20" r="6.4" stroke="var(--ink-lime)" strokeWidth="3.4" />
  </svg>
)

const AdminLayout = () => {
  const { user, logout } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [companyName, setCompanyName] = useState("")

  useEffect(() => {
    getCompany().then((c) => setCompanyName(c?.name || "")).catch(() => {})
  }, [])

  const displayName = user?.name || user?.email?.split("@")[0] || "admin"
  const initials = displayName.slice(0, 2).toUpperCase()

  const navStyle = ({ isActive }) => ({
    display: "flex", alignItems: "center", gap: 13, padding: "11px 13px", borderRadius: 9,
    fontSize: 14, fontWeight: isActive ? 600 : 500, cursor: "pointer",
    color: isActive ? "var(--ink-lime)" : "var(--tx-4)",
    background: isActive ? "color-mix(in srgb, var(--ink-lime) 12%, transparent)" : "transparent",
    boxShadow: isActive ? "inset 3px 0 0 var(--ink-lime)" : "none",
  })

  return (
    <div data-app-theme={isDarkMode ? "dark" : "light"} className="flex h-screen overflow-hidden text-left" style={{ background: "var(--bg)", color: "var(--tx)", fontFamily: "'IBM Plex Sans',system-ui,sans-serif" }}>
      {/* Sidebar */}
      <aside className="hidden w-64 flex-none flex-col md:flex" style={{ background: "var(--sidebar)", borderRight: "1px solid var(--bd-faint)" }}>
        <div className="flex items-center gap-3 px-5 py-5">
          <Logo />
          <div style={{ lineHeight: 0.98, fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 16, letterSpacing: ".02em" }}>
            <div style={{ color: "var(--tx)" }}>CONTROL</div>
            <div style={{ color: "var(--ink-lime)" }}>CUBIERTAS</div>
          </div>
        </div>

        <div className="px-5 pb-2 pt-3.5 text-[10px] font-semibold tracking-[.16em]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>PANEL</div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV.map(({ to, end, label, Icon }) => (
            <NavLink key={to} to={to} end={end} style={navStyle}>
              <span className="inline-flex flex-none items-center justify-center" style={{ width: 20, height: 20 }}><Icon sx={{ fontSize: 19 }} /></span>
              <span>{label}</span>
            </NavLink>
          ))}

          <div className="my-3.5 h-px" style={{ background: "var(--bd-faint)" }} />
          <div className="flex items-center gap-[13px] rounded-[9px] px-[13px] py-[11px] text-[14px]" style={{ color: "var(--tx-6)", cursor: "default" }}>
            <span className="inline-flex flex-none items-center justify-center" style={{ width: 20, height: 20 }}><CreditCardRoundedIcon sx={{ fontSize: 18 }} /></span>
            <span>Cuenta</span>
            <span className="ml-auto rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-[.05em]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--ink-purple)", background: "color-mix(in srgb, var(--ink-purple) 16%, transparent)" }}>PRÓXIMAMENTE</span>
          </div>
        </nav>

        {/* Tema claro/oscuro + Ayuda */}
        <div className="space-y-3 p-3.5">
          <button onClick={toggleTheme} className="flex w-full items-center gap-[11px] rounded-[11px] px-3.5 py-3" style={{ background: "var(--elev)", border: "1px solid var(--bd-soft)" }}>
            <span className="inline-flex h-5 w-5 flex-none items-center" style={{ color: "var(--ink-lime)" }}>
              {isDarkMode ? <DarkModeRoundedIcon sx={{ fontSize: 18 }} /> : <LightModeRoundedIcon sx={{ fontSize: 19 }} />}
            </span>
            <span className="text-[13px] font-medium" style={{ color: "var(--tx-2)" }}>{isDarkMode ? "Tema oscuro" : "Tema claro"}</span>
          </button>
          <div className="flex items-center gap-3 rounded-[11px] p-3.5" style={{ background: "var(--elev)", border: "1px solid var(--bd-soft)" }}>
            <span className="flex flex-none items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "color-mix(in srgb, var(--ink-lime) 12%, transparent)", color: "var(--ink-lime)" }}><HeadsetMicRoundedIcon sx={{ fontSize: 18 }} /></span>
            <div style={{ lineHeight: 1.3 }}>
              <div className="text-[12.5px] font-semibold" style={{ color: "var(--ink-lime)" }}>¿Necesitás ayuda?</div>
              <div className="text-[11.5px]" style={{ color: "var(--tx-5)" }}>Centro de ayuda</div>
            </div>
          </div>
        </div>

        {/* Usuario + logout */}
        <div className="flex items-center gap-[11px] p-3" style={{ borderTop: "1px solid var(--bd-faint)" }}>
          <span className="flex flex-none items-center justify-center rounded-full text-xs font-bold" style={{ width: 34, height: 34, background: "var(--ink-lime)", color: "var(--bg)", fontFamily: "'Space Grotesk'" }}>{initials}</span>
          <span className="min-w-0 flex-1" style={{ lineHeight: 1.3 }}>
            <span className="block truncate text-[12.5px] font-semibold" style={{ color: "var(--tx)" }}>{displayName}</span>
            <span className="block text-[11px]" style={{ color: "var(--tx-5)" }}>Tenant Admin</span>
          </span>
          <button onClick={logout} title="Cerrar sesión" className="inline-flex p-1" style={{ color: "var(--tx-6)" }}>
            <LogoutRoundedIcon sx={{ fontSize: 17 }} />
          </button>
        </div>
      </aside>

      {/* Columna principal */}
      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <div className="z-[2] flex h-[74px] flex-none items-center gap-3.5 px-6" style={{ background: "var(--bg)", borderBottom: "1px solid var(--bd-faint)" }}>
          <div className="ml-auto flex items-center gap-3">
            <div className="inline-flex items-center gap-2.5 rounded-[10px] px-3.5 py-2.5" style={{ background: "var(--elev)", border: "1px solid var(--bd)" }}>
              <ApartmentRoundedIcon sx={{ fontSize: 17 }} style={{ color: "var(--tx-5)" }} />
              <span className="text-[13.5px] font-semibold" style={{ color: "var(--tx)" }}>{companyName || "Tu empresa"}</span>
            </div>
            <button onClick={() => navigate("/")} className="inline-flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-[13.5px] font-semibold" style={{ background: "color-mix(in srgb, var(--ink-lime) 6%, transparent)", border: "1px solid color-mix(in srgb, var(--ink-lime) 45%, transparent)", color: "var(--ink-lime)" }}>
              <OpenInNewRoundedIcon sx={{ fontSize: 16 }} /> Ir a la operación
            </button>
            <div className="flex items-center gap-2.5 rounded-[10px] py-1.5 pl-2 pr-3" style={{ background: "var(--elev)", border: "1px solid var(--bd)" }}>
              <span className="flex flex-none items-center justify-center rounded-full text-[11.5px] font-bold" style={{ width: 30, height: 30, background: "var(--ink-lime)", color: "var(--bg)", fontFamily: "'Space Grotesk'" }}>{initials}</span>
              <span className="hidden sm:block" style={{ lineHeight: 1.25 }}>
                <span className="block text-[13px] font-semibold" style={{ color: "var(--tx)" }}>{displayName}</span>
                <span className="block text-[11px]" style={{ color: "var(--tx-5)" }}>Tenant Admin</span>
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-[1] flex-1 overflow-auto" style={{ padding: "28px 30px" }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
