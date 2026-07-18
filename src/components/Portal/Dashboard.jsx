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
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded"
import DesktopDownload from "./DesktopDownload"

// Paleta de estados del design system (coherente entre donut y barras).
const STATUS_COLORS = {
  Nueva: "var(--st-lime)",
  Recapadas: "var(--st-teal)",
  "A recapar": "var(--st-orange)",
  Descartadas: "var(--st-red)",
}
const card = { background: "var(--card)", border: "1px solid var(--bd)" }
const tintBg = (c, pct = 14) => `color-mix(in srgb, ${c} ${pct}%, transparent)`

// El backend devuelve byStatus con los estados del ciclo; el dashboard los agrupa en 4
// categorías legibles (los recapados suman "Recapadas").
const groupStatuses = (byStatus = {}) => {
  const recapadas = Object.entries(byStatus)
    .filter(([k]) => /recapad/i.test(k))
    .reduce((s, [, v]) => s + (v || 0), 0)
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
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bd-strong)" strokeWidth={stroke} />
        {segments.map((seg, i) => {
          const len = (seg.value / total) * c
          const el = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={seg.color} strokeWidth={stroke}
              strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} strokeLinecap="butt" />
          )
          offset += len
          return el
        })}
      </g>
    </svg>
  )
}

const StatCard = ({ icon, tint, value, label, sublabel }) => (
  <div className="rounded-xl p-5" style={card}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm" style={{ color: "var(--tx-4)" }}>{label}</p>
        <p className="mt-1 font-display text-3xl font-bold" style={{ color: "var(--tx)", fontFamily: "'Space Grotesk'" }}>{value}</p>
      </div>
      <span className="grid h-11 w-11 place-items-center rounded-lg" style={{ background: tintBg(tint, 12), color: tint }}>{icon}</span>
    </div>
    {sublabel && <p className="mt-3 text-xs" style={{ color: "var(--tx-6)" }}>{sublabel}</p>}
  </div>
)

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    getSummary().then(setData).catch((e) => setError(e.message || "No se pudo cargar el resumen")).finally(() => setLoading(false))
  }, [])

  const displayName = user?.name || user?.email?.split("@")[0] || "admin"

  if (loading) return <p className="text-sm" style={{ color: "var(--tx-5)" }}>Cargando resumen…</p>
  if (error) return <p className="text-sm" style={{ color: "var(--ink-red)" }}>{error}</p>

  const { cubiertas, vehiculos, senales } = data
  const segments = groupStatuses(cubiertas.byStatus)
  const totalCub = cubiertas.total || 1

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-3xl font-bold" style={{ color: "var(--tx)", fontFamily: "'Space Grotesk'" }}>¡Hola, {displayName}!</h1>
      <p className="mt-1" style={{ color: "var(--tx-4)" }}>Este es el estado general de tu flota hoy.</p>

      {/* Métricas */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<StyleRoundedIcon />} tint="var(--ink-lime)" value={cubiertas.total} label="Total de cubiertas" sublabel="Todas las ubicaciones" />
        <StatCard icon={<LocalShippingRoundedIcon />} tint="var(--ink-teal)" value={cubiertas.enCirculacion} label="En circulación" sublabel="Asignadas a vehículos" />
        <StatCard icon={<WarehouseRoundedIcon />} tint="var(--ink-blue)" value={cubiertas.enDeposito} label="En depósito" sublabel="Disponibles en depósito" />
        <StatCard icon={<DirectionsBusRoundedIcon />} tint="var(--ink-purple)" value={vehiculos.total} label="Vehículos" sublabel="En la flota activa" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Estado de cubiertas */}
        <section className="rounded-xl p-6" style={card}>
          <h2 className="font-display text-lg font-semibold" style={{ color: "var(--tx)", fontFamily: "'Space Grotesk'" }}>Estado de cubiertas</h2>
          <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row">
            <div className="relative shrink-0">
              <Donut segments={segments} />
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="font-display text-2xl font-bold" style={{ color: "var(--tx)", fontFamily: "'Space Grotesk'" }}>{cubiertas.total}</div>
                  <div className="text-xs" style={{ color: "var(--tx-6)" }}>cubiertas</div>
                </div>
              </div>
            </div>
            <ul className="flex-1 space-y-3">
              {segments.map((s) => {
                const pct = Math.round((s.value / totalCub) * 100)
                return (
                  <li key={s.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2" style={{ color: "var(--tx-3)" }}>
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                        {s.label}
                      </span>
                      <span style={{ color: "var(--tx-5)" }}>{s.value} · {pct}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full" style={{ background: "var(--bd-strong)" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.color }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>

        {/* Atención requerida */}
        <section className="rounded-xl p-6" style={card}>
          <h2 className="font-display text-lg font-semibold" style={{ color: "var(--tx)", fontFamily: "'Space Grotesk'" }}>Atención requerida</h2>
          <div className="mt-4 space-y-3">
            {senales.aRecapar === 0 && senales.vehiculosSinCubiertas === 0 ? (
              /* Sin acciones pendientes → estado positivo */
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-xl" style={{ background: tintBg("var(--ink-teal)", 14), color: "var(--ink-teal)" }}><TaskAltRoundedIcon /></span>
                <div className="font-semibold" style={{ color: "var(--tx)" }}>Todo en orden</div>
                <div className="text-sm" style={{ color: "var(--tx-5)" }}>No hay cubiertas pendientes de recapado ni vehículos sin cubiertas asignadas.</div>
              </div>
            ) : (
              <>
                {senales.aRecapar > 0 && (
                  <button onClick={() => navigate("/", { state: { op: { section: "cubiertas", tab: "recapar" } } })} className="flex w-full items-center gap-4 rounded-lg p-4 text-left"
                    style={{ background: tintBg("var(--ink-orange)", 10), border: "1px solid " + tintBg("var(--ink-orange)", 30) }}>
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg" style={{ background: tintBg("var(--ink-orange)", 20), color: "var(--ink-orange)" }}><WarningAmberRoundedIcon /></span>
                    <span className="flex-1">
                      <span className="block font-semibold" style={{ color: "var(--tx)" }}>{senales.aRecapar} cubiertas</span>
                      <span className="block text-sm" style={{ color: "var(--tx-4)" }}>Pendientes de recapado</span>
                    </span>
                    <ChevronRightRoundedIcon style={{ color: "var(--tx-6)" }} />
                  </button>
                )}
                {senales.vehiculosSinCubiertas > 0 && (
                  <button onClick={() => navigate("/", { state: { op: { section: "vehiculos" } } })} className="flex w-full items-center gap-4 rounded-lg p-4 text-left"
                    style={{ background: "var(--elev)", border: "1px solid var(--bd)" }}>
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg" style={{ background: "var(--bd-strong)", color: "var(--tx-3)" }}><DirectionsBusRoundedIcon /></span>
                    <span className="flex-1">
                      <span className="block font-semibold" style={{ color: "var(--tx)" }}>{senales.vehiculosSinCubiertas} vehículos</span>
                      <span className="block text-sm" style={{ color: "var(--tx-4)" }}>Sin cubiertas asignadas</span>
                    </span>
                    <ChevronRightRoundedIcon style={{ color: "var(--tx-6)" }} />
                  </button>
                )}
              </>
            )}
          </div>
        </section>
      </div>

      {/* Acciones rápidas */}
      <section className="mt-6">
        <h2 className="mb-3 font-display text-lg font-semibold" style={{ color: "var(--tx)", fontFamily: "'Space Grotesk'" }}>Acciones rápidas</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <QuickAction icon={<OpenInNewRoundedIcon />} tint="var(--ink-lime)" title="Abrir operación" subtitle="Ir a la aplicación operativa" onClick={() => navigate("/")} />
          <QuickAction icon={<GroupRoundedIcon />} tint="var(--ink-teal)" title="Gestionar usuarios" subtitle="Administrar el equipo" onClick={() => navigate("/admin/usuarios")} />
          <QuickAction icon={<ApartmentRoundedIcon />} tint="var(--ink-purple)" title="Configuración de empresa" subtitle="Editar datos y preferencias" onClick={() => navigate("/admin/empresa")} />
        </div>
      </section>

      {/* Descarga de la app de escritorio (solo visible en web) */}
      <DesktopDownload />
    </div>
  )
}

const QuickAction = ({ icon, tint, title, subtitle, onClick }) => (
  <button onClick={onClick} className="flex items-center gap-3 rounded-xl p-4 text-left" style={{ background: "var(--card)", border: "1px solid var(--bd)" }}>
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg" style={{ background: tintBg(tint, 12), color: tint }}>{icon}</span>
    <span className="flex-1">
      <span className="block font-medium" style={{ color: "var(--tx)" }}>{title}</span>
      <span className="block text-sm" style={{ color: "var(--tx-6)" }}>{subtitle}</span>
    </span>
    <ChevronRightRoundedIcon style={{ color: "var(--tx-7)" }} />
  </button>
)

export default Dashboard
