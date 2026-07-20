import { useState, useEffect, useCallback, useMemo } from "react"
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded"
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded"
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded"
import StyleRoundedIcon from "@mui/icons-material/StyleRounded"
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded"
import BoltRoundedIcon from "@mui/icons-material/BoltRounded"
import { getReports, getVehicleReports, getVehicleWear } from "@api/admin"
import { showToast } from "@utils/toast"
import { downloadCSV } from "@utils/csv"
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ScatterChart, Scatter,
} from "recharts"

const RANGES = [
  { label: "Últimos 12 meses", value: "12m" },
  { label: "Últimos 6 meses", value: "6m" },
  { label: "Todo el historial", value: "all" },
]

const RANK_COLS = "24px 1.4fr 0.8fr 2fr 0.9fr 0.9fr"

// Paleta categórica en orden fijo (misma que los dots del ranking). recharts acepta var() en
// fill/stroke → los charts siguen el tema (claro/oscuro) sin JS.
const PALETTE = ["var(--st-lime)", "var(--st-teal)", "var(--st-blue)", "var(--st-purple)", "var(--st-orange)", "var(--st-red)"]
const STAGE_ROTATION = ["var(--st-lime)", "var(--st-teal)", "var(--st-blue)", "var(--st-purple)"]
// Escala de calor (semáforo) por % de desgaste relativo: verde bajo → naranja medio → rojo alto.
const heatColor = (pct) => (pct >= 70 ? "var(--st-red)" : pct >= 40 ? "var(--st-orange)" : "var(--st-lime)")

const tint = (c, pct = 14) => `color-mix(in srgb, ${c} ${pct}%, transparent)`
const fmtKm = (n) => `${Number(n || 0).toLocaleString("es-AR")} km`
const fmtKmShort = (n) => (n >= 1000 ? `${Math.round(n / 1000)}k` : `${Math.round(n || 0)}`)

// Estilos de chart compartidos (temeados a los tokens).
const AXIS = { tick: { fill: "var(--tx-6)", fontSize: 11, fontFamily: "'IBM Plex Mono'" }, tickLine: false, axisLine: { stroke: "var(--bd)" } }
const TOOLTIP = {
  contentStyle: { background: "var(--card)", border: "1px solid var(--bd-strong)", borderRadius: 10, fontSize: 12.5, fontFamily: "'IBM Plex Sans'", boxShadow: "0 8px 24px rgba(0,0,0,.35)" },
  itemStyle: { color: "var(--tx-2)" }, labelStyle: { color: "var(--tx-4)", marginBottom: 2, fontWeight: 600 },
  cursor: { fill: "color-mix(in srgb, var(--tx-7) 12%, transparent)" },
}
const CHART_H = 230

// Un chart categórico conmutable: barras / línea / área / dona sobre [{ name, value, color }].
// xShort: formateador opcional para acortar etiquetas del eje X (el tooltip mantiene el nombre).
const CatChart = ({ type, data, unit, xShort }) => {
  const fmt = (v) => (unit === "km" ? fmtKm(v) : Number(v || 0).toLocaleString("es-AR"))
  if (!data.length) return <div style={{ height: CHART_H, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--tx-6)", fontSize: 13 }}>Sin datos todavía</div>

  if (type === "pie") {
    return (
      <ResponsiveContainer width="100%" height={CHART_H}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={2} stroke="var(--card)" strokeWidth={2}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <Tooltip {...TOOLTIP} formatter={(v, n) => [fmt(v), n]} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11.5, fontFamily: "'IBM Plex Sans'" }} formatter={(v) => <span style={{ color: "var(--tx-4)" }}>{v}</span>} />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  // Etiquetas largas o muchas categorías → se inclinan para no pisarse.
  const needAngle = data.length > 6 || data.some((d) => String(d.name).length > 6)
  const xAxis = (
    <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: "var(--bd)" }} interval={0}
      tick={{ fill: "var(--tx-6)", fontSize: 10.5, fontFamily: "'IBM Plex Mono'" }}
      tickFormatter={xShort} angle={needAngle ? -25 : 0} textAnchor={needAngle ? "end" : "middle"} height={needAngle ? 58 : 22} />
  )
  const yAxis = <YAxis {...AXIS} tickFormatter={unit === "km" ? fmtKmShort : undefined} width={44} />
  const margin = { top: 8, right: 12, left: -12, bottom: needAngle ? 6 : 0 }

  if (type === "line" || type === "area") {
    const Chart = type === "area" ? AreaChart : LineChart
    const Series = type === "area" ? Area : Line
    return (
      <ResponsiveContainer width="100%" height={CHART_H}>
        <Chart data={data} margin={margin}>
          <CartesianGrid vertical={false} stroke="var(--bd-faint)" />
          {xAxis}{yAxis}
          <Tooltip {...TOOLTIP} formatter={(v) => [fmt(v), unit === "km" ? "Km" : "Cant."]} />
          <Series type="monotone" dataKey="value" stroke="var(--ink-teal)" strokeWidth={2.4} fill="color-mix(in srgb, var(--ink-teal) 18%, transparent)" dot={{ r: 3, fill: "var(--ink-teal)", strokeWidth: 0 }} activeDot={{ r: 5 }} />
        </Chart>
      </ResponsiveContainer>
    )
  }

  // barras (default)
  return (
    <ResponsiveContainer width="100%" height={CHART_H}>
      <BarChart data={data} margin={margin}>
        <CartesianGrid vertical={false} stroke="var(--bd-faint)" />
        {xAxis}{yAxis}
        <Tooltip {...TOOLTIP} formatter={(v) => [fmt(v), unit === "km" ? "Km" : "Cant."]} />
        <Bar dataKey="value" radius={[5, 5, 0, 0]} maxBarSize={54}>
          {data.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// Dispersión posición → km de un camión: cada punto es la cubierta montada en una posición
// (X ordenado por eje), a la altura de su km y coloreado por recapado. Deja ver si una posición
// o un eje entero desgasta distinto al resto.
const PosScatter = ({ data }) => {
  if (!data.length) return <div style={{ height: CHART_H, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px", color: "var(--tx-6)", fontSize: 13, lineHeight: 1.5 }}>Este camión no tiene cubiertas montadas con posición asignada.</div>
  return (
    <ResponsiveContainer width="100%" height={272}>
      <ScatterChart margin={{ top: 10, right: 18, left: -4, bottom: 30 }}>
        <CartesianGrid stroke="var(--bd-faint)" />
        <XAxis type="category" dataKey="pos" name="Posición" interval={0} tickLine={false} axisLine={{ stroke: "var(--bd)" }}
          tick={{ fill: "var(--tx-6)", fontSize: 10.5, fontFamily: "'IBM Plex Mono'" }} angle={-25} textAnchor="end" height={54} />
        <YAxis type="number" dataKey="km" name="Km" {...AXIS} tickFormatter={fmtKmShort} width={48} />
        <Tooltip {...TOOLTIP} cursor={{ strokeDasharray: "3 3", stroke: "var(--bd-strong)" }}
          formatter={(v, n) => (n === "Km" ? [fmtKm(v), "Km"] : [v, "Posición"])} />
        <Scatter data={data}>
          {data.map((p, i) => <Cell key={i} fill={p.color} />)}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  )
}

// Vista superior del camión como mapa de calor: cada posición pintada por su % de desgaste
// (km acumulado ahí, relativo al máximo del camión). Ejes de adelante hacia atrás, lado izq/der
// separados por el chasis. Deja ver de un vistazo si una posición o un eje entero se gasta más.
const TruckHeatmap = ({ wear }) => {
  const max = Math.max(1, wear.maxPosKm)
  const HeatBox = ({ p }) => {
    const pct = Math.round((p.km / max) * 100)
    const c = heatColor(pct)
    return (
      <div title={`${p.code} · ${fmtKm(p.km)}${p.current ? ` · #${p.current.code} ${p.current.status}` : " · libre"}`}
        style={{ width: 62, height: 50, borderRadius: 9, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, background: tint(c, 16), border: `1px solid ${tint(c, 38)}` }}>
        <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 15, lineHeight: 1, color: c }}>{pct}%</span>
        <span style={{ fontSize: 8.5, fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>{p.current ? `R${p.current.level ?? 0}·` : ""}{p.code.split("-")[1]}</span>
      </div>
    )
  }
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginBottom: 10, fontSize: 10, letterSpacing: ".14em", color: "var(--tx-6)", fontFamily: "'IBM Plex Mono'" }}>
        FRENTE <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
      </div>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
        <div style={{ position: "absolute", top: 6, bottom: 6, left: "50%", width: 3, transform: "translateX(-50%)", background: "var(--bd-strong)", borderRadius: 3 }} />
        {wear.axles.map((a) => {
          const ps = wear.positions.filter((p) => p.axle === a.axle)
          const left = ps.filter((p) => p.side === "L")
          const right = ps.filter((p) => p.side !== "L")
          return (
            <div key={a.axle} style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", gap: 6 }}>{left.map((p) => <HeatBox key={p.code} p={p} />)}</div>
              <div style={{ width: 30 }} />
              <div style={{ display: "flex", gap: 6 }}>{right.map((p) => <HeatBox key={p.code} p={p} />)}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Resumen accionable: banderas derivadas del desgaste (eje más exigido, posición más caliente,
// desbalance izq/der → alineación, y la recomendación de rotar).
const WearResumen = ({ wear }) => {
  const axles = wear.axles
  const avg = axles.length ? axles.reduce((s, a) => s + a.km, 0) / axles.length : 0
  const hotAxle = axles.reduce((a, b) => (b.km > a.km ? b : a), axles[0] || { km: 0, axle: 0 })
  const hotDev = avg ? Math.round(((hotAxle.km - avg) / avg) * 100) : 0
  const withKm = wear.positions.filter((p) => p.km > 0)
  const hotPos = withKm.length ? withKm.reduce((a, b) => (b.km > a.km ? b : a)) : null
  const leftKm = wear.positions.filter((p) => p.side === "L").reduce((s, p) => s + p.km, 0)
  const rightKm = wear.positions.filter((p) => p.side === "R").reduce((s, p) => s + p.km, 0)
  const base = (leftKm + rightKm) / 2
  const imbalance = base ? Math.round((Math.abs(leftKm - rightKm) / base) * 100) : 0

  const flags = []
  if (axles.length > 1 && hotDev > 15) flags.push({ warn: true, text: `El Eje ${hotAxle.axle} concentra ${hotDev}% más desgaste que el promedio del camión.` })
  if (hotPos) flags.push({ warn: true, text: `La posición ${hotPos.code} es la más exigida (${fmtKm(hotPos.km)}).` })
  if (imbalance > 15) flags.push({ warn: true, text: `Desbalance izquierda/derecha del ${imbalance}% — conviene revisar la alineación.` })
  if (!flags.length) flags.push({ warn: false, text: "El desgaste está parejo entre ejes y posiciones. Buen indicio mecánico." })
  flags.push({ warn: false, text: "Rotá las cubiertas entre posiciones para emparejar el desgaste y estirar su vida útil." })

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--tx-4)" }}>Resumen</div>
      {flags.map((f, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "10px 12px", borderRadius: 10, background: f.warn ? "color-mix(in srgb, var(--st-orange) 8%, var(--elev))" : "var(--elev)", border: `1px solid ${f.warn ? "color-mix(in srgb, var(--st-orange) 30%, transparent)" : "var(--bd)"}` }}>
          <span style={{ display: "inline-flex", flex: "none", marginTop: 1, color: f.warn ? "var(--ink-orange)" : "var(--ink-lime)" }}>
            {f.warn
              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></svg>
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>}
          </span>
          <span style={{ fontSize: 12, color: "var(--tx-3)", lineHeight: 1.45 }}>{f.text}</span>
        </div>
      ))}
    </div>
  )
}

// Selector de tipo/opciones estilo diseño (native select con chevron custom).
const Selector = ({ value, onChange, options, icon }) => (
  <div style={{ position: "relative", flex: "none", minWidth: icon ? 180 : undefined }}>
    {icon && <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--tx-5)", pointerEvents: "none", display: "inline-flex" }}>{icon}</span>}
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{ appearance: "none", WebkitAppearance: "none", width: icon ? "100%" : undefined, height: 34, padding: icon ? "0 30px 0 34px" : "0 30px 0 12px", border: "1px solid var(--bd-strong)", borderRadius: 8, background: "var(--elev)", color: icon ? "var(--tx)" : "var(--tx-2)", fontSize: 12.5, fontWeight: 600, fontFamily: "'IBM Plex Sans'", cursor: "pointer", outline: "none" }}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    <span style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", color: "var(--tx-6)", pointerEvents: "none", display: "inline-flex" }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
    </span>
  </div>
)

// Card de chart con chrome del diseño: título/sub, selector(es) y (opcional) insight al pie.
const ChartCard = ({ title, sub, type, onType, typeOpts, extraSelector, insight, children }) => (
  <div style={{ background: "var(--card)", border: "1px solid var(--bd)", borderRadius: 14, padding: "20px 22px 18px 22px" }}>
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Space Grotesk'", fontSize: 16, fontWeight: 600, color: "var(--tx)" }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--tx-6)", marginTop: 3, lineHeight: 1.45 }}>{sub}</div>
      </div>
      {extraSelector}
      {typeOpts && <Selector value={type} onChange={onType} options={typeOpts} />}
    </div>
    {children}
    {insight && (
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--bd-soft)", fontSize: 12, color: "var(--tx-4)", lineHeight: 1.5 }}>
        <span style={{ display: "inline-flex", color: "var(--ink-lime)", flexShrink: 0, marginTop: 1 }}><BoltRoundedIcon sx={{ fontSize: 15 }} /></span>{insight}
      </div>
    )}
  </div>
)

const TYPE_BAR_LINE = [{ value: "bar", label: "Barras" }, { value: "line", label: "Línea" }]
const TYPE_SEQ = [{ value: "line", label: "Línea" }, { value: "area", label: "Área" }, { value: "bar", label: "Barras" }]
const TYPE_SHARE = [{ value: "pie", label: "Dona" }, { value: "bar", label: "Barras" }]
const VEH_METRICS = [
  { value: "kmTotal", label: "Km total" },
  { value: "avgKmPerStint", label: "Prom. por período" },
  { value: "stints", label: "Períodos" },
  { value: "tires", label: "Cubiertas usadas" },
]

const Reportes = () => {
  const [range, setRange] = useState("12m")
  const [data, setData] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [types, setTypes] = useState({ brandLife: "bar", stages: "line", brandShare: "pie", vehicle: "bar" })
  const [vehMetric, setVehMetric] = useState("kmTotal")
  const [posVeh, setPosVeh] = useState(null) // camión elegido para el desgaste por posición
  const [wear, setWear] = useState(null) // getVehicleWear del camión elegido
  const [wearLoading, setWearLoading] = useState(false)
  const setType = (key, v) => setTypes((t) => ({ ...t, [key]: v }))

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [d, v] = await Promise.all([getReports({ range }), getVehicleReports().catch(() => ({ vehicles: [] }))])
      setData(d)
      setVehicles(v?.vehicles || [])
    } catch (err) {
      showToast("error", err.message || "No se pudieron cargar los reportes")
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => { load() }, [load])

  const exportCSV = () => {
    if (!data?.brands?.length) return
    try {
      const head = ["#", "Marca", "Cubiertas", "Vida útil promedio (km)", "Recapados promedio", "Descarte (%)"]
      const body = data.brands.map((b, i) => [i + 1, b.name, b.count, Math.round(b.life || 0), b.recaps, b.discardRate])
      downloadCSV("reportes-marcas.csv", head, body)
    } catch {
      showToast("error", "No se pudo exportar")
    }
  }

  const brands = data?.brands || []
  const stages = data?.stages || []
  const maxLife = Math.max(1, ...brands.map((b) => b.life || 0))

  // Datos + colores para cada chart (memoizados).
  const brandsDot = useMemo(() => brands.map((b, i) => ({ ...b, dot: PALETTE[i % PALETTE.length] })), [brands])
  const brandLifeData = useMemo(() => brandsDot.map((b) => ({ name: b.name, value: b.life, color: b.dot })), [brandsDot])
  const brandShareData = useMemo(() => brandsDot.map((b) => ({ name: b.name, value: b.count, color: b.dot })), [brandsDot])
  const stagesData = useMemo(() => {
    let idx = 0
    return stages.map((s) => ({ name: s.label, value: s.km, color: s.role === "recap" ? "var(--st-orange)" : STAGE_ROTATION[idx++ % STAGE_ROTATION.length] }))
  }, [stages])

  const vehWithStints = vehicles.filter((v) => v.stints > 0)
  const fleetAvgStint = vehWithStints.length ? Math.round(vehWithStints.reduce((a, v) => a + v.avgKmPerStint, 0) / vehWithStints.length) : 0
  const vehicleData = useMemo(() => {
    const rows = [...vehicles].sort((a, b) => (b[vehMetric] || 0) - (a[vehMetric] || 0)).slice(0, 12)
    return rows.map((v) => {
      const slow = vehMetric === "avgKmPerStint" && v.stints > 0 && fleetAvgStint > 0 && v.avgKmPerStint < fleetAvgStint * 0.6
      return { name: v.mobile, value: v[vehMetric] || 0, color: slow ? "var(--st-orange)" : "var(--st-blue)" }
    })
  }, [vehicles, vehMetric, fleetAvgStint])
  const vehUnit = vehMetric === "kmTotal" || vehMetric === "avgKmPerStint" ? "km" : "count"

  // Desgaste por posición: elegí un camión → mapa de calor de sus posiciones/ejes.
  const posOptions = useMemo(() => vehicles.map((v) => ({ value: v.id, label: v.mobile })), [vehicles])
  const posVehObj = vehicles.find((v) => v.id === posVeh) || null
  // Por defecto, el camión con más km registrado en posiciones (el que más data tiene para mostrar).
  useEffect(() => {
    if (!vehicles.length) return
    if (posVeh && vehicles.some((v) => v.id === posVeh)) return
    const best = [...vehicles].sort((a, b) => (b.kmTotal || 0) - (a.kmTotal || 0))[0]
    setPosVeh(best?.id || null)
  }, [vehicles, posVeh])
  // Traer el desgaste por posición del camión elegido.
  useEffect(() => {
    if (!posVeh) { setWear(null); return }
    let cancelled = false
    setWearLoading(true)
    getVehicleWear(posVeh)
      .then((w) => { if (!cancelled) setWear(w) })
      .catch(() => { if (!cancelled) setWear(null) })
      .finally(() => { if (!cancelled) setWearLoading(false) })
    return () => { cancelled = true }
  }, [posVeh])
  const maxAxleKm = wear ? Math.max(1, ...wear.axles.map((a) => a.km)) : 1
  const axleBars = wear ? wear.axles.map((a) => ({ name: `Eje ${a.axle}`, value: a.km, color: heatColor(Math.round((a.km / maxAxleKm) * 100)) })) : []
  const posDots = wear ? wear.positions.filter((p) => p.km > 0).map((p) => ({ pos: p.code, km: p.km, color: heatColor(Math.round((p.km / Math.max(1, wear.maxPosKm)) * 100)) })) : []

  // Insights dinámicos.
  const brandInsight = useMemo(() => {
    if (brands.length < 2) return brands.length ? `${brands[0].name} es la única marca con historial suficiente.` : ""
    const top = brands[0], last = brands[brands.length - 1]
    const diff = last.life ? Math.round(((top.life - last.life) / last.life) * 100) : 0
    return `${top.name} lidera con ${fmtKm(top.life)}${diff > 0 ? ` — ${diff}% por encima de ${last.name}, la de menor rendimiento` : ""}.`
  }, [brands])
  const stageInsight = useMemo(() => {
    const withKm = stages.filter((s) => s.km > 0)
    if (!withKm.length) return "Todavía no hay suficientes desasignaciones para medir el rendimiento por etapa."
    const best = withKm.reduce((a, b) => (b.km > a.km ? b : a))
    return `El mayor rendimiento promedio se da en “${best.label}” (${fmtKm(best.km)}). Usá la curva para fijar el punto de recambio antes de que caiga el rinde.`
  }, [stages])
  const vehicleInsight = fleetAvgStint
    ? `El promedio de la flota es ${fmtKm(fleetAvgStint)} por período. Un móvil muy por debajo puede indicar un problema de tren delantero o alineación.`
    : "Se llena a medida que asignás y desasignás cubiertas de los vehículos."

  const empty = !loading && (!data || data.total === 0)

  return (
    <div style={{ maxWidth: 1120 }}>
      {/* Header */}
      <div className="mb-[22px] flex items-start gap-5">
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-[-.02em]" style={{ color: "var(--tx)", fontFamily: "'Space Grotesk'" }}>Reportes</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--tx-4)" }}>Trazabilidad y rendimiento de la flota · análisis por kilometraje</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Selector value={range} onChange={setRange} options={RANGES}
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>} />
          <button onClick={exportCSV} className="inline-flex items-center gap-2 rounded-[10px] px-[17px] py-[11px] text-sm font-semibold"
            style={{ background: "var(--elev)", border: "1px solid var(--bd-strong)", color: "var(--tx-2)" }}>
            <FileDownloadRoundedIcon sx={{ fontSize: 17 }} /> Exportar
          </button>
        </div>
      </div>

      {loading ? (
        <p className="py-10 text-sm" style={{ color: "var(--tx-5)" }}>Cargando reportes…</p>
      ) : empty ? (
        <p className="py-10 text-sm" style={{ color: "var(--tx-5)" }}>Todavía no hay datos de kilometraje. Los reportes se llenan a medida que las cubiertas acumulan kilómetros (desasignaciones).</p>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-4">
            <SummaryCard label="Marca líder por vida útil" tint="var(--ink-lime)" icon={<EmojiEventsRoundedIcon sx={{ fontSize: 17 }} />}
              value={data.leader?.name ?? "—"} sublabel={data.leader ? `${fmtKm(data.leader.life)} prom. de vida útil` : "Sin datos suficientes"} />
            <SummaryCard label="Vida útil promedio" tint="var(--ink-blue)" icon={<TimelineRoundedIcon sx={{ fontSize: 17 }} />}
              value={fmtKm(data.fleetLife)} sublabel="por cubierta, toda la flota" />
            <SummaryCard label="Tasa de descarte" tint="var(--ink-red)" icon={<DeleteOutlineRoundedIcon sx={{ fontSize: 17 }} />}
              value={`${data.discardRate}%`} sublabel="de las cubiertas dadas de baja" />
            <SummaryCard label="Cubiertas analizadas" tint="var(--ink-teal)" icon={<StyleRoundedIcon sx={{ fontSize: 17 }} />}
              value={data.total} sublabel="con historial de kilometraje" />
          </div>

          {/* Ranking de marcas */}
          <div className="mt-4 overflow-hidden rounded-[14px]" style={{ background: "var(--card)", border: "1px solid var(--bd)" }}>
            <div className="px-6 pb-1 pt-5">
              <h2 className="font-display text-[17px] font-semibold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>Ranking de marcas</h2>
              <p className="mt-[3px] text-[12.5px]" style={{ color: "var(--tx-6)" }}>Ordenado por vida útil promedio. La base para decidir qué marca conviene comprar.</p>
            </div>
            <div className="px-6 pb-1.5 pt-3.5">
              <div className="grid gap-3.5 border-b pb-2.5 text-[10.5px] font-semibold uppercase tracking-wider" style={{ gridTemplateColumns: RANK_COLS, borderColor: "var(--bd-soft)", fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>
                <div>#</div><div>Marca</div><div>Cubiertas</div><div>Vida útil promedio</div><div className="text-right">Recap. prom.</div><div className="text-right">Descarte</div>
              </div>
              {brandsDot.map((b, i) => (
                <div key={b.name} className="grid items-center gap-3.5 py-[13px]" style={{ gridTemplateColumns: RANK_COLS, borderBottom: "1px solid var(--bd-faint)" }}>
                  <div className="font-display text-[14px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: i === 0 ? "var(--ink-lime)" : i === 1 ? "var(--ink-teal)" : i === 2 ? "var(--ink-blue)" : "var(--tx-4)" }}>{i + 1}</div>
                  <div className="flex items-center gap-2.5 text-[13.5px] font-semibold" style={{ color: "var(--tx)", minWidth: 0 }}>
                    <span className="flex-none rounded-full" style={{ width: 9, height: 9, background: b.dot }} /><span className="truncate">{b.name}</span>
                  </div>
                  <div className="text-[13px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-3)" }}>{b.count}</div>
                  <div className="flex items-center gap-[11px]">
                    <div className="h-2 flex-1 overflow-hidden rounded-[5px]" style={{ background: "var(--bd-soft)" }}>
                      <div className="h-full rounded-[5px]" style={{ width: `${(b.life / maxLife) * 100}%`, background: b.dot }} />
                    </div>
                    <span className="w-[88px] whitespace-nowrap text-right text-[12.5px] font-semibold" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx)" }}>{fmtKm(b.life)}</span>
                  </div>
                  <div className="text-right text-[12.5px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-3)" }}>{b.recaps}</div>
                  <div className="text-right text-[12.5px] font-semibold" style={{ fontFamily: "'IBM Plex Mono'", color: b.discardRate > 15 ? "var(--ink-red)" : "var(--tx-3)" }}>{b.discardRate}%</div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 px-6 pb-[18px] pt-3 text-[12px]" style={{ color: "var(--tx-6)" }}>
              <span className="inline-flex" style={{ color: "var(--ink-lime)" }}><BoltRoundedIcon sx={{ fontSize: 15 }} /></span>{brandInsight}
            </div>
          </div>

          {/* Chart cards conmutables */}
          <div className="mt-4 grid grid-cols-2 items-start gap-4">
            <ChartCard title="Vida útil por marca" sub="Km totales promedio antes del descarte, por marca."
              type={types.brandLife} onType={(v) => setType("brandLife", v)} typeOpts={TYPE_BAR_LINE}>
              <CatChart type={types.brandLife} data={brandLifeData} unit="km" />
            </ChartCard>

            <ChartCard title="Rendimiento por etapa" sub="Km promedio que rinde una cubierta en cada etapa del ciclo. Ayuda a decidir cuándo recapar."
              type={types.stages} onType={(v) => setType("stages", v)} typeOpts={TYPE_SEQ}>
              <CatChart type={types.stages} data={stagesData} unit="km" />
            </ChartCard>

            <ChartCard title="Composición de la flota" sub="Cuántas cubiertas analizadas hay de cada marca (participación)."
              type={types.brandShare} onType={(v) => setType("brandShare", v)} typeOpts={TYPE_SHARE}>
              <CatChart type={types.brandShare} data={brandShareData} unit="count" />
            </ChartCard>

            <ChartCard title="Desgaste por vehículo" sub="Cuánto rinden las cubiertas en cada móvil y cada cuánto las rota."
              type={types.vehicle} onType={(v) => setType("vehicle", v)} typeOpts={TYPE_BAR_LINE}
              insight={vehicleInsight}
              extraSelector={<Selector value={vehMetric} onChange={setVehMetric} options={VEH_METRICS}
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h1" /><path d="M14 9h4l4 4v4a1 1 0 0 1-1 1h-1" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /><path d="M9 18h6" /></svg>} />}>
              <CatChart type={types.vehicle} data={vehicleData} unit={vehUnit} xShort={(v) => String(v).replace("Móvil ", "")} />
            </ChartCard>
          </div>

          {/* Desgaste por posición: mapa de calor (vista superior) + resumen + barras por eje + dot plot */}
          <div className="mt-4">
            <ChartCard
              title="Desgaste por posición"
              sub={posVehObj ? `${posVehObj.mobile} · vista superior — km acumulado en cada posición del eje` : "Elegí un camión para ver el mapa de desgaste."}
              insight="El % de cada posición es su km acumulado relativo a la más exigida del camión (verde = poco, rojo = mucho). Deja ver si una posición o un eje entero desgasta más — señal de alineación o rotación."
              extraSelector={<Selector value={posVeh || ""} onChange={setPosVeh} options={posOptions}
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h1" /><path d="M14 9h4l4 4v4a1 1 0 0 1-1 1h-1" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /><path d="M9 18h6" /></svg>} />}>
              {wearLoading ? (
                <p style={{ padding: "48px 0", textAlign: "center", color: "var(--tx-6)", fontSize: 13 }}>Cargando…</p>
              ) : !wear || !wear.positions.length ? (
                <p style={{ padding: "48px 0", textAlign: "center", color: "var(--tx-6)", fontSize: 13, lineHeight: 1.5 }}>Este camión no tiene ejes configurados. Definí su esquema en Vehículos para ver el desgaste por posición.</p>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: 24, alignItems: "start" }}>
                    <TruckHeatmap wear={wear} />
                    <WearResumen wear={wear} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--bd-soft)" }}>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--tx-3)", marginBottom: 6 }}>Desgaste promedio por eje</div>
                      <CatChart type="bar" data={axleBars} unit="km" />
                    </div>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--tx-3)", marginBottom: 6 }}>Kilometraje por posición</div>
                      <PosScatter data={posDots} />
                    </div>
                  </div>
                </>
              )}
            </ChartCard>
          </div>

          {/* Callout: cuándo recapar */}
          <div className="mt-4 flex items-start gap-2.5 rounded-[12px] px-[18px] py-3.5 text-[12.5px]" style={{ border: "1px solid color-mix(in srgb, var(--st-orange) 28%, transparent)", background: "color-mix(in srgb, var(--st-orange) 7%, transparent)", color: "var(--tx-2)", lineHeight: 1.55 }}>
            <span className="inline-flex flex-none" style={{ color: "var(--ink-orange)", marginTop: 1 }}><BoltRoundedIcon sx={{ fontSize: 16 }} /></span>
            <div><b style={{ color: "var(--tx)" }}>Cuándo recapar:</b> {stageInsight}</div>
          </div>
        </>
      )}
    </div>
  )
}

const SummaryCard = ({ label, icon, tint: accent, value, sublabel }) => (
  <div className="flex flex-col justify-between rounded-[14px] p-[18px_20px]" style={{ background: "var(--card)", border: "1px solid var(--bd)", minHeight: 120 }}>
    <div className="flex items-start justify-between">
      <span className="text-[13px]" style={{ color: "var(--tx-4)" }}>{label}</span>
      <span className="flex flex-none items-center justify-center rounded-[9px]" style={{ width: 32, height: 32, background: tint(accent, 14), color: accent }}>{icon}</span>
    </div>
    <div>
      <div className="font-display text-[26px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>{value}</div>
      <div className="mt-0.5 text-[12px]" style={{ color: "var(--tx-6)" }}>{sublabel}</div>
    </div>
  </div>
)

export default Reportes
