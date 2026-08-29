import { useState, useEffect } from "react"
import { etiquetaDeRol } from "@utils/roles"
import Pill from "@components/common/Pill"
import { useNavigate, useLocation, Outlet } from "react-router-dom"
import { useAuth } from "@context/AuthContext"
import { useTheme } from "@context/ThemeContext"
import { getCompany } from "@api/admin"
import { useCacheTenantLogo } from "@hooks/useCacheTenantLogo"
import { useUpdater } from "@hooks/useUpdater"
import AppSidebar from "@components/Layout/AppSidebar"
import BrandDeco from "@components/common/BrandDeco"
import OpTour from "@components/Operativa/OpTour"

import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined"
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined"
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined"
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined"
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded"
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined"

// Portal del tenant-admin: shell dark propio (design system operativo), separado de la
// operación. Cada sección entra por <Outlet/>. "Comprobantes" (histórico) es un hito
// aparte → queda como "próximamente" hasta que exista su vista.
const NAV = [
  { to: "/admin", end: true, label: "Resumen", Icon: HomeOutlinedIcon },
  { to: "/admin/reportes", label: "Reportes", Icon: InsightsOutlinedIcon, tour: "a-reportes" },
  { to: "/admin/usuarios", label: "Usuarios", Icon: GroupOutlinedIcon, tour: "a-usuarios" },
  { to: "/admin/empresa", label: "Empresa", Icon: ApartmentOutlinedIcon, tour: "a-empresa" },
  { to: "/admin/comprobantes", label: "Comprobantes", Icon: ReceiptLongOutlinedIcon, tour: "a-comprobantes" },
  { to: "/admin/comprobante", label: "Editor de comprobante", Icon: EditOutlinedIcon, tour: "a-editor" },
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
    <div data-app-theme={isDarkMode ? "dark" : "light"} className="flex h-full overflow-hidden text-left" style={{ background: "var(--bg)", color: "var(--tx)", fontFamily: "var(--font-sans)" }}>
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
            <div className="flex items-center gap-[13px] rounded-[var(--r-md)] px-[13px] py-[11px] text-[14px]" style={{ color: "var(--tx-6)", cursor: "default" }}>
              <span className="inline-flex flex-none items-center justify-center" style={{ width: 20, height: 20 }}><CreditCardOutlinedIcon sx={{ fontSize: 18 }} /></span>
              <span>Cuenta</span>
              <Pill size="tag" className="ml-auto px-2 py-[2px] text-[10px] font-semibold tracking-[.06em]" style={{ fontFamily: "var(--font-mono)", color: "var(--tx-2)", background: "var(--bd-strong)" }}>PRÓXIMAMENTE</Pill>
            </div>
          </>
        }
        upd={upd}
        user={{ name: displayName, roleLabel: etiquetaDeRol(user?.role), initials, avatarBg: "var(--ink-lime)", avatarColor: "var(--bg)" }}
        help={{ dataTour: "a-help", onStartTour: () => { navigate("/admin"); setTourOpen(true) }, guideHref: "/admin/guia", guideLabel: "Guía del administrador", guideSubtitle: "Manual detallado · pestaña nueva" }}
        onLogout={logout}
      />

      {/* Columna principal */}
      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Deco de marca: solo el ÍCONO TireOps (sin wordmark), muy tenue arriba a la derecha, solo en el Resumen. */}
        {location.pathname === "/admin" && <BrandDeco variant="icon" />}
        {/* Top bar */}
        <div className="z-2 flex h-[74px] flex-none items-center gap-3.5 px-6" style={{ background: "var(--bg)", borderBottom: "1px solid var(--bd-faint)" }}>
          {/* ALTURA FIJA en los tres controles de la fila. Antes el pill y el avatar medían 44px
              y el botón 42.25, porque cada uno la componía distinto (padding + border +
              line-height contra caja fija): los centros coincidían pero los bordes quedaban
              0.88px adentro, y tres alturas distintas en la misma fila rompen la línea
              horizontal que el ojo espera. */}
          <div className="ml-auto flex items-center gap-3">
            <div className="inline-flex h-11 items-center gap-2.5 rounded-[var(--r-md)] px-3.5" style={{ background: "var(--elev)", border: "1px solid var(--bd)" }}>
              <ApartmentOutlinedIcon sx={{ fontSize: 17 }} style={{ color: "var(--tx-5)" }} />
              <span className="text-[13.5px] font-semibold" style={{ color: "var(--tx)" }}>{companyName || "Tu empresa"}</span>
            </div>
            <button onClick={() => navigate("/")} className="inline-flex h-11 items-center gap-2 rounded-[var(--r-md)] px-4 text-[13.5px] font-semibold" style={{ background: "color-mix(in srgb, var(--ink-lime) 6%, transparent)", border: "1px solid color-mix(in srgb, var(--ink-lime) 45%, transparent)", color: "var(--ink-lime)" }}>
              <OpenInNewRoundedIcon sx={{ fontSize: 16 }} /> Ir a la operación
            </button>
            {/* t115: acá vivía una SEGUNDA copia del bloque de identidad (avatar de 30px con
                fuente de 11.5, contra los 36px y 12px del pie del sidebar). El mismo nombre y
                el mismo rol dos veces en pantalla, con avatares de distinto tamaño a 20 cm uno
                del otro. Se queda la del pie del sidebar, que es donde además viven Ayuda y
                Cerrar sesión: ahí el bloque de identidad es el hogar de la cuenta, no un
                adorno. La barra superior queda con lo que sí es de la barra: la empresa y el
                salto a la operación. */}
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
