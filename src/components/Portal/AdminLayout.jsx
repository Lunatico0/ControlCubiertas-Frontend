import { useState, useEffect } from "react"
import { useNavigate, useLocation, Outlet } from "react-router-dom"
import { useAuth } from "@context/AuthContext"
import { useTheme } from "@context/ThemeContext"
import { getCompany } from "@api/admin"
import { useCacheTenantLogo } from "@hooks/useCacheTenantLogo"
import { useUpdater } from "@hooks/useUpdater"
import AppSidebar from "@components/Layout/AppSidebar"
import BrandDeco from "@components/common/BrandDeco"
import OpTour from "@components/Operativa/OpTour"

import HomeRoundedIcon from "@mui/icons-material/HomeRounded"
import GroupRoundedIcon from "@mui/icons-material/GroupRounded"
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded"
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded"
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded"
import EditRoundedIcon from "@mui/icons-material/EditRounded"
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded"
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded"

// Portal del tenant-admin: shell dark propio (design system operativo), separado de la
// operación. Cada sección entra por <Outlet/>. "Comprobantes" (histórico) es un hito
// aparte → queda como "próximamente" hasta que exista su vista.
const NAV = [
  { to: "/admin", end: true, label: "Resumen", Icon: HomeRoundedIcon },
  { to: "/admin/reportes", label: "Reportes", Icon: InsightsRoundedIcon, tour: "a-reportes" },
  { to: "/admin/usuarios", label: "Usuarios", Icon: GroupRoundedIcon, tour: "a-usuarios" },
  { to: "/admin/empresa", label: "Empresa", Icon: ApartmentRoundedIcon, tour: "a-empresa" },
  { to: "/admin/comprobantes", label: "Comprobantes", Icon: ReceiptLongRoundedIcon, tour: "a-comprobantes" },
  { to: "/admin/comprobante", label: "Editor de comprobante", Icon: EditRoundedIcon, tour: "a-editor" },
]

// Pasos del tour del panel admin. screen = pantalla (ruta); sel = data-tour del elemento.
const ADMIN_STEPS = [
  { screen: "resumen", sel: null, place: "center", title: "Panel de administración", body: "Un recorrido corto por la administración de tu empresa. Podés salir cuando quieras y volver desde el botón de ayuda." },
  { screen: "resumen", sel: "a-usuarios", place: "right", title: "Usuarios", body: "Das de alta a tu equipo, definís su rol (admin u operativo) y activás o desactivás accesos. El único admin no puede desactivarse a sí mismo." },
  { screen: "reportes", sel: "a-reportes", place: "right", title: "Reportes", body: "Trazabilidad y rendimiento por kilometraje: ranking de marcas por vida útil, km por etapa del ciclo y tasa de descarte. La base para decidir qué comprar." },
  { screen: "empresa", sel: "a-empresa", place: "right", title: "Empresa", body: "Los datos de la organización y el ciclo de estados de las cubiertas: nombre y color de cada estado y cuántos recapados se permiten antes de descartar." },
  { screen: "comprobantes", sel: "a-comprobantes", place: "right", title: "Comprobantes", body: "El histórico de todos los comprobantes emitidos por cada movimiento. Podés buscar, filtrar por tipo, reimprimir y exportar a CSV." },
  { screen: "editor", sel: "a-editor", place: "right", title: "Editor de comprobante", body: "Diseñás cómo se ve el comprobante impreso (A4): logo, secciones, tipografía, color de acento y pie, con vista previa en vivo." },
  { screen: "resumen", sel: "a-help", place: "top", title: "Ayuda siempre a mano", body: "Desde acá reproducís este tour cuando quieras y abrís la guía del administrador completa." },
  { screen: "resumen", sel: null, place: "center", title: "¡Listo!", body: "Eso es la administración. Los cambios de configuración impactan en toda la operación de la empresa." },
]

// screen del tour ↔ ruta del portal (para navegar/derivar la pantalla activa).
const SCREEN_ROUTE = { resumen: "/admin", empresa: "/admin/empresa", comprobantes: "/admin/comprobantes", editor: "/admin/comprobante", reportes: "/admin/reportes" }
const screenOf = (path) =>
  path.startsWith("/admin/empresa") ? "empresa"
    : path.startsWith("/admin/comprobantes") ? "comprobantes"
      : path.startsWith("/admin/comprobante") ? "editor"
        : path.startsWith("/admin/reportes") ? "reportes"
          : "resumen"

const AdminLayout = () => {
  const { user, logout } = useAuth()
  useCacheTenantLogo() // cachea el logo del tenant para el splash del desktop (no-op en web)
  const { isDarkMode } = useTheme()
  const upd = useUpdater() // auto-updater (solo desktop): botón sidebar + modal
  const navigate = useNavigate()
  const location = useLocation()
  const [companyName, setCompanyName] = useState("")
  const [tourOpen, setTourOpen] = useState(false) // guía interactiva del admin (tour)

  useEffect(() => {
    getCompany().then((c) => setCompanyName(c?.name || "")).catch(() => {})
  }, [])

  const displayName = user?.name || user?.email?.split("@")[0] || "admin"
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div data-app-theme={isDarkMode ? "dark" : "light"} className="flex h-screen overflow-hidden text-left" style={{ background: "var(--bg)", color: "var(--tx)", fontFamily: "'IBM Plex Sans',system-ui,sans-serif" }}>
      {/* Sidebar */}
      <AppSidebar
        nav={NAV.map(({ to, label, Icon, tour }) => ({
          key: to,
          label,
          icon: <Icon sx={{ fontSize: 19 }} />,
          active: location.pathname === to,
          onClick: () => navigate(to),
          dataTour: tour,
        }))}
        belowNav={
          <>
            <div className="my-3.5 h-px" style={{ background: "var(--bd-faint)" }} />
            <div className="flex items-center gap-[13px] rounded-[9px] px-[13px] py-[11px] text-[14px]" style={{ color: "var(--tx-6)", cursor: "default" }}>
              <span className="inline-flex flex-none items-center justify-center" style={{ width: 20, height: 20 }}><CreditCardRoundedIcon sx={{ fontSize: 18 }} /></span>
              <span>Cuenta</span>
              <span className="ml-auto rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-wider" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--ink-purple)", background: "color-mix(in srgb, var(--ink-purple) 16%, transparent)" }}>PRÓXIMAMENTE</span>
            </div>
          </>
        }
        upd={upd}
        user={{ name: displayName, roleLabel: "Tenant Admin", initials, avatarBg: "var(--ink-lime)", avatarColor: "var(--bg)" }}
        help={{ dataTour: "a-help", onStartTour: () => { navigate("/admin"); setTourOpen(true) }, guideHref: "/admin/guia", guideLabel: "Guía del administrador", guideSubtitle: "Manual detallado · pestaña nueva" }}
        onLogout={logout}
      />

      {/* Columna principal */}
      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Deco de marca: solo el ÍCONO TireOps (sin wordmark), muy tenue arriba a la derecha, solo en el Resumen. */}
        {location.pathname === "/admin" && <BrandDeco variant="icon" />}
        {/* Top bar */}
        <div className="z-2 flex h-[74px] flex-none items-center gap-3.5 px-6" style={{ background: "var(--bg)", borderBottom: "1px solid var(--bd-faint)" }}>
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

        <div className="relative z-1 flex-1 overflow-auto" style={{ padding: "28px 30px" }}>
          <Outlet />
        </div>
      </main>

      {tourOpen && <OpTour steps={ADMIN_STEPS} active={screenOf(location.pathname)} onNavigate={(s) => navigate(SCREEN_ROUTE[s] || "/admin")} onClose={() => setTourOpen(false)} />}
    </div>
  )
}

export default AdminLayout
