import { useState, useEffect } from "react"
import { NavLink, useNavigate, Outlet } from "react-router-dom"
import { useAuth } from "@context/AuthContext"
import { getCompany } from "@api/admin"

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded"
import GroupRoundedIcon from "@mui/icons-material/GroupRounded"
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded"
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded"
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded"
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded"
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded"
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded"
import HeadsetMicRoundedIcon from "@mui/icons-material/HeadsetMicRounded"

// Portal del tenant-admin: shell dark propio, separado de la operación. La operación
// se alcanza con "Ir a la operación"; el contenido de cada sección entra por <Outlet/>.
const navItems = [
  { to: "/admin", end: true, label: "Resumen", icon: <DashboardRoundedIcon fontSize="small" /> },
  { to: "/admin/usuarios", label: "Usuarios", icon: <GroupRoundedIcon fontSize="small" /> },
  { to: "/admin/empresa", label: "Empresa", icon: <ApartmentRoundedIcon fontSize="small" /> },
  { to: "/admin/comprobante", label: "Comprobante", icon: <ReceiptLongRoundedIcon fontSize="small" /> },
]

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    isActive
      ? "bg-brand-500/15 text-brand-300"
      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
  }`

const AdminLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [companyName, setCompanyName] = useState("")

  useEffect(() => {
    getCompany()
      .then((c) => setCompanyName(c?.name || ""))
      .catch(() => {})
  }, [])

  const displayName = user?.name || user?.email?.split("@")[0] || "admin"
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="dark flex h-screen overflow-hidden bg-slate-900 text-slate-100 text-left">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950 md:flex">
        <div className="flex items-center gap-3 px-6 py-5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500 text-slate-900">
            <LocalShippingRoundedIcon fontSize="small" />
          </span>
          <span className="font-display text-base font-semibold leading-tight tracking-tight">
            Control<span className="text-brand-400">Cubiertas</span>
          </span>
        </div>

        <div className="px-3 pb-2 pt-4 text-xs font-medium uppercase tracking-wider text-slate-500">Panel</div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.icon}
              {item.label}
            </NavLink>
          ))}

          <div className="my-3 border-t border-slate-800" />
          <div className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-500">
            <span className="flex items-center gap-3">
              <CreditCardRoundedIcon fontSize="small" />
              Cuenta
            </span>
            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Próximamente
            </span>
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800 p-3">
          <button className="mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition hover:bg-slate-800/60 hover:text-slate-200">
            <HeadsetMicRoundedIcon fontSize="small" />
            <span className="text-left leading-tight">
              ¿Necesitás ayuda?
              <span className="block text-xs text-slate-500">Centro de ayuda</span>
            </span>
          </button>
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-500 text-xs font-semibold text-slate-900">
              {initials}
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-sm font-medium text-slate-200">{displayName}</span>
              <span className="block text-xs text-slate-500">Tenant Admin</span>
            </span>
            <button onClick={logout} title="Cerrar sesión" className="text-slate-500 transition hover:text-slate-300">
              <LogoutRoundedIcon fontSize="small" />
            </button>
          </div>
        </div>
      </aside>

      {/* Columna principal */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between gap-4 border-b border-slate-800 bg-slate-900/80 px-6 py-3 backdrop-blur">
          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm">
            <ApartmentRoundedIcon fontSize="small" className="text-slate-500" />
            <span className="font-medium text-slate-200">{companyName || "Tu empresa"}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 rounded-lg border border-brand-500/40 bg-brand-500/10 px-3 py-2 text-sm font-medium text-brand-300 transition hover:bg-brand-500/20"
            >
              <LaunchRoundedIcon fontSize="small" />
              Ir a la operación
            </button>
            <div className="flex items-center gap-2.5 pl-1">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-500 text-xs font-semibold text-slate-900">
                {initials}
              </span>
              <span className="hidden leading-tight sm:block">
                <span className="block text-sm font-medium text-slate-200">{displayName}</span>
                <span className="block text-xs text-slate-500">Tenant Admin</span>
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
