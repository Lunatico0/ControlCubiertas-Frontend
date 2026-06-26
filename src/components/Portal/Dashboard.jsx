import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@context/AuthContext"
import { getSummary } from "@api/admin"

import StyleRoundedIcon from "@mui/icons-material/StyleRounded"
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded"
import WarehouseRoundedIcon from "@mui/icons-material/WarehouseRounded"
import DirectionsBusRoundedIcon from "@mui/icons-material/DirectionsBusRounded"
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded"
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded"
import GroupRoundedIcon from "@mui/icons-material/GroupRounded"
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded"
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded"

// Paleta de estados (independiente del brand): coherente entre donut y barras.
const STATUS_COLORS = {
  Nueva: "#a3e635",
  Recapadas: "#2dd4bf",
  "A recapar": "#f59e0b",
  Descartadas: "#64748b",
}

// El backend devuelve byStatus con los 6 estados del ciclo; el dashboard los agrupa
// en 4 categorías legibles (los 3 recapados suman "Recapadas").
const groupStatuses = (byStatus = {}) => {
  const recapadas =
    (byStatus["1er Recapado"] || 0) + (byStatus["2do Recapado"] || 0) + (byStatus["3er Recapado"] || 0)
  return [
    { label: "Nueva", value: byStatus["Nueva"] || 0 },
    { label: "Recapadas", value: recapadas },
    { label: "A recapar", value: byStatus["A recapar"] || 0 },
    { label: "Descartadas", value: byStatus["Descartada"] || 0 },
  ].map((s) => ({ ...s, color: STATUS_COLORS[s.label] }))
}

const Donut = ({ segments, size = 176, stroke = 22 }) => {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  let offset = 0
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={stroke} />
        {segments.map((seg, i) => {
          const len = (seg.value / total) * c
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          )
          offset += len
          return el
        })}
      </g>
    </svg>
  )
}

const StatCard = ({ icon, tint, value, label, sublabel }) => (
  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="mt-1 font-display text-3xl font-bold text-white">{value}</p>
      </div>
      <span className="grid h-11 w-11 place-items-center rounded-lg" style={{ backgroundColor: `${tint}1f`, color: tint }}>
        {icon}
      </span>
    </div>
    {sublabel && <p className="mt-3 text-xs text-slate-500">{sublabel}</p>}
  </div>
)

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    getSummary()
      .then(setData)
      .catch((e) => setError(e.message || "No se pudo cargar el resumen"))
      .finally(() => setLoading(false))
  }, [])

  const displayName = user?.name || user?.email?.split("@")[0] || "admin"

  if (loading) return <p className="text-sm text-slate-400">Cargando resumen…</p>
  if (error) return <p className="text-sm text-red-400">{error}</p>

  const { cubiertas, vehiculos, senales } = data
  const segments = groupStatuses(cubiertas.byStatus)
  const totalCub = cubiertas.total || 1

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-3xl font-bold text-white">¡Hola, {displayName}!</h1>
      <p className="mt-1 text-slate-400">Este es el estado general de tu flota hoy.</p>

      {/* Métricas */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<StyleRoundedIcon />} tint="#a3e635" value={cubiertas.total} label="Total de cubiertas" sublabel="Todas las ubicaciones" />
        <StatCard icon={<LocalShippingRoundedIcon />} tint="#2dd4bf" value={cubiertas.enCirculacion} label="En circulación" sublabel="Asignadas a vehículos" />
        <StatCard icon={<WarehouseRoundedIcon />} tint="#60a5fa" value={cubiertas.enDeposito} label="En depósito" sublabel="Disponibles en depósito" />
        <StatCard icon={<DirectionsBusRoundedIcon />} tint="#a78bfa" value={vehiculos.total} label="Vehículos" sublabel="En la flota activa" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Estado de cubiertas */}
        <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-6">
          <h2 className="font-display text-lg font-semibold text-white">Estado de cubiertas</h2>
          <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row">
            <div className="relative shrink-0">
              <Donut segments={segments} />
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="font-display text-2xl font-bold text-white">{cubiertas.total}</div>
                  <div className="text-xs text-slate-500">cubiertas</div>
                </div>
              </div>
            </div>
            <ul className="flex-1 space-y-3">
              {segments.map((s) => {
                const pct = Math.round((s.value / totalCub) * 100)
                return (
                  <li key={s.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-300">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                        {s.label}
                      </span>
                      <span className="text-slate-400">
                        {s.value} · {pct}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: s.color }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>

        {/* Atención requerida */}
        <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-6">
          <h2 className="font-display text-lg font-semibold text-white">Atención requerida</h2>
          <div className="mt-4 space-y-3">
            <button
              onClick={() => navigate("/")}
              className="flex w-full items-center gap-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-left transition hover:bg-amber-500/15"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-amber-500/20 text-amber-400">
                <WarningAmberRoundedIcon />
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-white">{senales.aRecapar} cubiertas</span>
                <span className="block text-sm text-slate-400">Pendientes de recapado</span>
              </span>
              <ChevronRightRoundedIcon className="text-slate-500" />
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex w-full items-center gap-4 rounded-lg border border-slate-700/60 bg-slate-800/40 p-4 text-left transition hover:bg-slate-800/70"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-slate-700/40 text-slate-300">
                <DirectionsBusRoundedIcon />
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-white">{senales.vehiculosSinCubiertas} vehículos</span>
                <span className="block text-sm text-slate-400">Sin cubiertas asignadas</span>
              </span>
              <ChevronRightRoundedIcon className="text-slate-500" />
            </button>
          </div>
        </section>
      </div>

      {/* Acciones rápidas */}
      <section className="mt-6">
        <h2 className="mb-3 font-display text-lg font-semibold text-white">Acciones rápidas</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <QuickAction icon={<OpenInNewRoundedIcon />} tint="#a3e635" title="Abrir operación" subtitle="Ir a la aplicación operativa" onClick={() => navigate("/")} />
          <QuickAction icon={<GroupRoundedIcon />} tint="#2dd4bf" title="Gestionar usuarios" subtitle="Administrar el equipo" onClick={() => navigate("/admin/usuarios")} />
          <QuickAction icon={<ApartmentRoundedIcon />} tint="#a78bfa" title="Configuración de empresa" subtitle="Editar datos y preferencias" onClick={() => navigate("/admin/empresa")} />
        </div>
      </section>
    </div>
  )
}

const QuickAction = ({ icon, tint, title, subtitle, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-left transition hover:border-slate-700 hover:bg-slate-900"
  >
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: `${tint}1f`, color: tint }}>
      {icon}
    </span>
    <span className="flex-1">
      <span className="block font-medium text-white">{title}</span>
      <span className="block text-sm text-slate-500">{subtitle}</span>
    </span>
    <ChevronRightRoundedIcon className="text-slate-600" />
  </button>
)

export default Dashboard
