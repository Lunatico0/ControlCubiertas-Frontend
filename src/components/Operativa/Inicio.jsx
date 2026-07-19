import { useState, useContext, useEffect, useMemo, useRef } from "react"
import ApiContext from "@context/apiContext"
import { useAuth } from "@context/AuthContext"
import { showToast } from "@utils/toast"
import SearchRoundedIcon from "@mui/icons-material/SearchRounded"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import TripOriginRoundedIcon from "@mui/icons-material/TripOriginRounded"
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined"
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined"
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded"
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import { tint, metaOf } from "./status"

// Fecha + hora en es-AR, con la primera letra en mayúscula (ej. "Viernes 18 de julio, 14:30").
const fmtFechaHora = (d) => {
  const fecha = d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })
  const hora = d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
  return `${fecha.charAt(0).toUpperCase()}${fecha.slice(1)}, ${hora}`
}

// Pantalla de Inicio del operario: saludo + buscador grande + accesos directos.
// onNavigate(section, intent) lo provee el OperativaLayout para saltar al inventario
// (opcionalmente con una búsqueda o un filtro ya aplicado).
const Inicio = ({ onNavigate }) => {
  const { data } = useContext(ApiContext)
  const { user } = useAuth()
  const tires = data?.tires || []
  const vehicles = data?.vehicles || []
  const [q, setQ] = useState("")

  // Reloj vivo para la fecha/hora del saludo (se refresca cada minuto).
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(id)
  }, [])

  // Atajo Ctrl/Cmd + K → enfoca el buscador del inicio.
  const searchRef = useRef(null)
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const displayName = user?.name || user?.email?.split("@")[0] || "Operario"
  const counts = {
    stock: tires.filter((t) => !t.vehicle).length,
    circ: tires.filter((t) => t.vehicle).length,
    recapar: tires.filter((t) => metaOf(t.status).role === "recap").length,
  }

  // "Para hoy": lo accionable = cubiertas a recapar + vehículos sin cubiertas montadas.
  // Cada fila navega a donde se resuelve. Se cap­ea para no inundar el inicio.
  const hoyItems = useMemo(() => {
    const recapTires = tires.filter((t) => metaOf(t.status).role === "recap")
    const mountedVehIds = new Set(tires.filter((t) => t.vehicle).map((t) => t.vehicle?._id || t.vehicle))
    const vehiclesSinCub = vehicles.filter((v) => !mountedVehIds.has(v._id))
    return [
      ...recapTires.map((t) => ({
        key: `t${t._id}`, isTire: true, color: "var(--ink-orange)", iconBg: "rgba(240,133,31,.14)",
        title: `#${t.code}${t.brand ? ` · ${t.brand}` : ""}`, desc: "Marcada para recapar", btn: "Recapar",
        onClick: () => onNavigate("cubiertas", { tab: "recapar" }),
      })),
      ...vehiclesSinCub.map((v) => ({
        key: `v${v._id}`, isVeh: true, color: "var(--ink-blue)", iconBg: "rgba(110,151,245,.16)",
        title: v.mobile, desc: "Sin cubiertas montadas", btn: "Montar",
        onClick: () => onNavigate("vehiculos", { openVehicle: v._id }),
      })),
    ].slice(0, 6)
  }, [tires, vehicles, onNavigate])

  const pending = counts.recapar + vehicles.filter((v) => !new Set(tires.filter((t) => t.vehicle).map((t) => t.vehicle?._id || t.vehicle)).has(v._id)).length
  const resumen = pending > 0 ? `${pending} ${pending === 1 ? "pendiente" : "pendientes"} para hoy` : "Todo en orden"
  const resumenColor = pending > 0 ? "var(--ink-orange)" : "var(--ink-teal)"

  const goSearch = () => onNavigate("cubiertas", { query: q.trim() })
  const soon = (m) => showToast("info", m)

  const TILES = [
    { key: "alta", title: "Alta de cubierta", sub: "Registrar una nueva", icon: <AddRoundedIcon />, primary: true, onClick: () => onNavigate("cubiertas", { alta: true }) },
    { key: "buscar", title: "Buscar cubierta", sub: "Ver el inventario", icon: <TripOriginRoundedIcon />, accent: "var(--ink-lime)", onClick: () => onNavigate("cubiertas") },
    { key: "asignar", title: "Asignar a vehículo", sub: "Montar una cubierta", icon: <LocalShippingOutlinedIcon />, accent: "var(--ink-blue)", onClick: () => onNavigate("cubiertas", { tab: "stock" }) },
  ]

  const ACCESS = [
    { label: "En stock", count: counts.stock, icon: <Inventory2OutlinedIcon />, accent: "var(--ink-lime)", tab: "stock" },
    { label: "En circulación", count: counts.circ, icon: <LocalShippingOutlinedIcon />, accent: "var(--ink-blue)", tab: "circulacion" },
    { label: "A recapar · requieren acción", count: counts.recapar, icon: <WarningAmberRoundedIcon />, accent: "var(--ink-orange)", tab: "recapar", warn: true },
  ]

  return (
    <div className="mx-auto max-w-[1000px] px-8 pb-10 pt-12">
      <h1 className="text-[32px] font-bold tracking-[-.02em]" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>
        Hola, {displayName} 👋
      </h1>
      <p className="mt-[7px] text-[15px]" style={{ color: "var(--tx-4)" }}>
        {fmtFechaHora(now)} · <span style={{ color: resumenColor, fontWeight: 500 }}>{resumen}</span>
      </p>

      {/* Buscador grande */}
      <div data-tour="inicio-search" className="relative mt-[26px]">
        <span className="absolute left-5 top-1/2 -translate-y-1/2" style={{ color: "var(--tx-7)" }}>
          <SearchRoundedIcon sx={{ fontSize: 22 }} />
        </span>
        <input
          ref={searchRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && goSearch()}
          placeholder="Buscar por código, marca o N° de serie…"
          className="h-16 w-full rounded-[14px] pl-14 pr-24 text-[17px] outline-none"
          style={{ background: "var(--card)", border: "1.5px solid var(--bd)", color: "var(--tx)" }}
          onFocus={(e) => (e.target.style.borderColor = "var(--ink-lime)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--bd)")}
        />
        <span className="pointer-events-none absolute right-[18px] top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-[12px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-5)", border: "1px solid var(--bd-strong)" }}>Ctrl K</span>
      </div>

      {/* Tiles de acción — SIEMPRE 3 columnas (no wrappean; se comprimen en pantallas angostas). */}
      <div className="mt-[26px] grid grid-cols-3 gap-[14px]">
        {TILES.map((t) => (
          <button
            key={t.key}
            onClick={t.onClick}
            className="flex min-h-[130px] flex-col justify-between rounded-[14px] p-5 text-left transition"
            style={t.primary
              ? { background: "#C4ED2B", color: "#0A0C0D" } // lima brillante fijo (no var(--ink-lime), que en tema claro es verde oscuro)
              : { background: "var(--card)", border: "1px solid var(--bd)", color: "var(--tx)" }}
          >
            <span className="grid h-11 w-11 place-items-center rounded-[11px]"
              style={t.primary ? { background: "rgba(10,12,13,.12)" } : { background: tint(t.accent, 14), color: t.accent }}>
              {t.icon}
            </span>
            <span>
              <span className="block text-[16px] font-bold" style={{ fontFamily: "'Space Grotesk'" }}>{t.title}</span>
              <span className="mt-0.5 block text-[12.5px]" style={{ color: t.primary ? "rgba(10,12,13,.7)" : "var(--tx-4)" }}>{t.sub}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Para hoy: cubiertas/vehículos que requieren acción */}
      <div className="mb-3 mt-[30px] text-[11px] tracking-[.08em]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>PARA HOY</div>
      {hoyItems.length === 0 ? (
        <div className="flex items-center gap-3 rounded-[13px] p-[18px]" style={{ border: "1px dashed var(--bd)" }}>
          <span className="grid h-10 w-10 flex-none place-items-center rounded-full" style={{ background: "rgba(196,237,43,.10)", color: "var(--ink-lime)" }}>
            <CheckRoundedIcon sx={{ fontSize: 20 }} />
          </span>
          <div>
            <div className="text-[14px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>Todo en orden</div>
            <div className="mt-0.5 text-[12.5px]" style={{ color: "var(--tx-4)" }}>No hay cubiertas ni posiciones pendientes de acción.</div>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[13px]" style={{ border: "1px solid var(--bd)", background: "var(--card)" }}>
          {hoyItems.map((h, i) => (
            <button
              key={h.key}
              onClick={h.onClick}
              className="flex w-full items-center gap-[13px] px-[18px] py-[14px] text-left transition-colors"
              style={{ borderBottom: i < hoyItems.length - 1 ? "1px solid var(--bd-faint)" : "none" }}
            >
              <span className="grid h-[38px] w-[38px] flex-none place-items-center rounded-[10px]" style={{ background: h.iconBg, color: h.color }}>
                {h.isTire ? <TripOriginRoundedIcon sx={{ fontSize: 19 }} /> : <LocalShippingOutlinedIcon sx={{ fontSize: 19 }} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>{h.title}</span>
                <span className="mt-px block text-[12.5px]" style={{ color: "var(--tx-4)" }}>{h.desc}</span>
              </span>
              <span className="inline-flex flex-none items-center gap-1.5 rounded-lg px-3 text-[12px] font-semibold" style={{ height: 32, border: "1px solid var(--bd-strong)", background: "var(--elev)", color: h.color }}>
                {h.btn}
                <ChevronRightRoundedIcon sx={{ fontSize: 15 }} />
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Accesos rápidos por estado */}
      <div className="mb-3 mt-[30px] text-[11px] tracking-[.08em]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>ACCESO RÁPIDO</div>
      <div className="grid grid-cols-3 gap-[14px]">
        {ACCESS.map((a) => (
          <button
            key={a.tab}
            onClick={() => onNavigate("cubiertas", { tab: a.tab })}
            className="flex items-center gap-[14px] rounded-[13px] p-[18px] text-left transition"
            style={{ background: "var(--card)", border: `1px solid ${a.warn ? tint(a.accent, 30) : "var(--bd)"}` }}
          >
            <span className="grid h-[46px] w-[46px] flex-none place-items-center rounded-[11px]" style={{ background: tint(a.accent, 14), color: a.accent }}>
              {a.icon}
            </span>
            <span>
              <span className="block text-[24px] font-bold leading-none" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>{a.count}</span>
              <span className="mt-[3px] block text-[13px]" style={{ color: a.warn ? a.accent : "var(--tx-4)" }}>{a.label}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default Inicio
