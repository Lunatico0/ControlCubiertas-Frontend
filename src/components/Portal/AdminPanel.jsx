import { useState } from "react"
import Users from "./Users"

const TABS = [
  { key: "users", label: "Usuarios" },
  { key: "company", label: "Empresa" },
  { key: "summary", label: "Resumen" },
]

// Shell del panel del tenant-admin. Navegación interna por tabs (sin sub-rutas).
const AdminPanel = () => {
  const [tab, setTab] = useState("users")

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Administración</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Gestioná los usuarios y la configuración de tu empresa.
        </p>
      </header>

      <nav className="mb-8 flex gap-6 border-b border-slate-200 dark:border-slate-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 pb-3 text-sm font-medium transition ${
              tab === t.key
                ? "border-brand-500 text-brand-600 dark:text-brand-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "users" && <Users />}
      {tab === "company" && (
        <p className="text-sm text-slate-500 dark:text-slate-400">Configuración de empresa — próximamente.</p>
      )}
      {tab === "summary" && (
        <p className="text-sm text-slate-500 dark:text-slate-400">Resumen operativo — próximamente.</p>
      )}
    </div>
  )
}

export default AdminPanel
