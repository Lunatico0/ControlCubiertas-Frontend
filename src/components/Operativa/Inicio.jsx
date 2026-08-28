import { useState, useContext, useEffect, useMemo } from "react"
import ApiContext from "@context/apiContext"
import { useAuth } from "@context/AuthContext"
import { useHotkeyFocus } from "@hooks/useHotkeyFocus"
import SearchRoundedIcon from "@mui/icons-material/SearchRounded"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import TripOriginOutlinedIcon from "@mui/icons-material/TripOriginOutlined"
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined"
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined"
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded"
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import { tint, metaOf, useStatusCatalog } from "./status"
import { formatTireCode } from "@utils/tireCode"
import { tituloPantalla } from "@utils/tokens"
import Skeleton, { SkeletonList } from "@components/common/Skeleton"
import { useOutletContext } from "react-router-dom"

// Fecha + hora en es-AR, con la primera letra en mayúscula (ej. "Viernes 18 de julio, 14:30").
const fmtFechaHora = (d) => {
  const fecha = d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })
  const hora = d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
  return `${fecha.charAt(0).toUpperCase()}${fecha.slice(1)}, ${hora}`
}

// Pantalla de Inicio del operario: saludo + buscador grande + accesos directos.
// onNavigate(section, intent) lo provee el OperativaLayout para saltar al inventario
// (opcionalmente con una búsqueda o un filtro ya aplicado).
const Inicio = () => {
  // onNavigate viaja por el contexto del Outlet: cada sección es su propia ruta y ya no la
  // renderiza el layout con props (ver OperativaLayout / @utils/opRoutes).
  const { onNavigate } = useOutletContext()
  // `loading` es el mismo flag que ya usan Cubiertas y Vehículos. Sin él, Inicio deriva de
  // listas vacías y AFIRMA "Todo en orden" mientras el cold start de Atlas todavía responde
  // (t142). Una pantalla vacía se perdona; una afirmación falsa manda al operario a su casa
  // con tres cubiertas esperando recapado.
  const { data, ui } = useContext(ApiContext)
  const loading = ui?.loading
  const { user } = useAuth()
  const tires = data?.tires || []
  const vehicles = data?.vehicles || []
  const [q, setQ] = useState("")
  const [abierto, setAbierto] = useState(false) // resultados en vivo desplegados
  const [activo, setActivo] = useState(-1) // índice resaltado con las flechas (-1 = ninguno)

  // Reloj vivo para la fecha/hora del saludo (se refresca cada minuto).
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(id)
  }, [])

  // Atajo Ctrl/Cmd + K → enfoca el buscador del inicio.
  const searchRef = useHotkeyFocus()

  const displayName = user?.name || user?.email?.split("@")[0] || "Operario"
  const catalogo = useStatusCatalog() // los conteos por rol dependen del catálogo del tenant
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
    // t145: un vehículo marcado FUERA DE SERVICIO no es una tarea pendiente. Antes, un acoplado
    // de temporada o un móvil parado quedaba clavado en "PARA HOY" todos los días, sin forma de
    // sacarlo; la lista perdía credibilidad y el operario dejaba de mirarla — y con ella dejaba
    // de ver lo que sí importa.
    const vehiclesSinCub = vehicles.filter((v) => !v.outOfService && !mountedVehIds.has(v._id))
    return [
      ...recapTires.map((t) => ({
        key: `t${t._id}`, isTire: true, color: "var(--ink-orange)", iconBg: "rgba(240,133,31,.14)",
        title: `#${formatTireCode(t.code, data?.tireCodePrefix)}${t.brand ? ` · ${t.brand}` : ""}`, desc: "Marcada para recapar", btn: "Recapar",
        onClick: () => onNavigate("cubiertas", { tab: "recapar" }),
      })),
      ...vehiclesSinCub.map((v) => ({
        key: `v${v._id}`, isVeh: true, color: "var(--ink-blue)", iconBg: "rgba(110,151,245,.16)",
        title: v.mobile, desc: "Sin cubiertas montadas", btn: "Montar",
        onClick: () => onNavigate("vehiculos", { openVehicle: v._id }),
      })),
    ].slice(0, 6)
  }, [tires, vehicles, onNavigate, catalogo])

  // Vehículos que cuentan como pendientes (misma regla que hoyItems, sin el cap de 6).
  const hoyVehiculos = useMemo(() => {
    const mountedVehIds = new Set(tires.filter((t) => t.vehicle).map((t) => t.vehicle?._id || t.vehicle))
    return vehicles.filter((v) => !v.outOfService && !mountedVehIds.has(v._id)).length
  }, [tires, vehicles])

  // El contador del saludo tiene que contar EXACTAMENTE lo mismo que la lista: si dice
  // "3 pendientes" y abajo hay 2, el que sobra es el número.
  const pending = counts.recapar + hoyVehiculos
  const resumen = loading ? "Cargando tu día…" : pending > 0 ? `${pending} ${pending === 1 ? "pendiente" : "pendientes"} para hoy` : "Todo en orden"
  const resumenColor = loading ? "var(--tx-5)" : pending > 0 ? "var(--ink-orange)" : "var(--ink-teal)"

  const goSearch = () => onNavigate("cubiertas", { query: q.trim() })

  // Resultados EN VIVO. Los datos ya están en memoria (ApiContext), así que filtrar mientras
  // se tipea no cuesta una request. Antes había que apretar Enter para ver algo y el buscador
  // se leía como roto. Se capea a 6 para no tapar la pantalla.
  const MAX_RESULTADOS = 6
  const resultados = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return []
    return tires
      .filter((t) =>
        [formatTireCode(t.code, data?.tireCodePrefix), String(t.code ?? ""), t.brand, t.serialNumber]
          .some((campo) => String(campo ?? "").toLowerCase().includes(term))
      )
      .slice(0, MAX_RESULTADOS)
  }, [q, tires, data?.tireCodePrefix])

  const desplegado = abierto && q.trim().length > 0

  // Al elegir una cubierta se salta al inventario filtrado por su código, que es único.
  const abrirCubierta = (t) => {
    setAbierto(false)
    onNavigate("cubiertas", { query: String(t.code) })
  }

  const onSearchKeyDown = (e) => {
    if (e.key === "Escape") return setAbierto(false) // cierra sin borrar lo tipeado
    if (e.key === "ArrowDown" && resultados.length) {
      e.preventDefault()
      setAbierto(true)
      return setActivo((i) => (i + 1) % resultados.length)
    }
    if (e.key === "ArrowUp" && resultados.length) {
      e.preventDefault()
      setAbierto(true)
      return setActivo((i) => (i <= 0 ? resultados.length - 1 : i - 1))
    }
    if (e.key === "Enter") {
      // Sin nada resaltado, Enter mantiene el comportamiento viejo: ir al inventario con lo tipeado.
      if (activo >= 0 && resultados[activo]) return abrirCubierta(resultados[activo])
      goSearch()
    }
  }

  const TILES = [
    { key: "alta", title: "Alta de cubierta", sub: "Registrar una nueva", icon: <AddRoundedIcon />, primary: true, onClick: () => onNavigate("cubiertas", { alta: true }) },
    { key: "buscar", title: "Buscar cubierta", sub: "Ver el inventario", icon: <TripOriginOutlinedIcon />, accent: "var(--ink-lime)", onClick: () => onNavigate("cubiertas") },
    { key: "asignar", title: "Asignar a vehículo", sub: "Montar una cubierta", icon: <LocalShippingOutlinedIcon />, accent: "var(--ink-blue)", onClick: () => onNavigate("cubiertas", { tab: "disponibles" }) }, // t147: el que va a montar quiere las montables, no el depósito entero
  ]

  const ACCESS = [
    { label: "En depósito", count: counts.stock, icon: <Inventory2OutlinedIcon />, accent: "var(--ink-lime)", tab: "stock" },
    { label: "En circulación", count: counts.circ, icon: <LocalShippingOutlinedIcon />, accent: "var(--ink-blue)", tab: "circulacion" },
    { label: "A recapar · requieren acción", count: counts.recapar, icon: <WarningAmberRoundedIcon />, accent: "var(--ink-orange)", tab: "recapar", warn: true },
  ]

  return (
    <div className="mx-auto max-w-[1000px] px-8 pb-10 pt-12">
      <h1 className={tituloPantalla} style={{ color: "var(--tx)" }}>
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
          onChange={(e) => { setQ(e.target.value); setAbierto(true); setActivo(-1) }}
          onKeyDown={onSearchKeyDown}
          role="combobox"
          aria-expanded={desplegado}
          aria-controls="inicio-search-results"
          aria-autocomplete="list"
          placeholder="Buscar por código, marca o N° de serie…"
          className="h-16 w-full rounded-[var(--r-lg)] pl-14 pr-24 text-[17px] outline-none"
          style={{ background: "var(--card)", border: "1.5px solid var(--bd)", color: "var(--tx)" }}
          onFocus={(e) => (e.target.style.borderColor = "var(--ink-lime)")}
          onBlur={(e) => { e.target.style.borderColor = "var(--bd)"; setAbierto(false) }}
        />
        <span className="pointer-events-none absolute right-[18px] top-1/2 -translate-y-1/2 rounded-[var(--r-sm)] px-2 py-1 text-[12px]" style={{ fontFamily: "var(--font-mono)", color: "var(--tx-5)", border: "1px solid var(--bd-strong)" }}>Ctrl K</span>

        {desplegado && (
          <ul
            id="inicio-search-results"
            role="listbox"
            onMouseDown={(e) => e.preventDefault()} // que el clic no le robe el foco al input antes del onClick
            className="absolute left-0 right-0 top-[70px] z-30 overflow-hidden rounded-[var(--r-lg)] py-1.5"
            style={{ background: "var(--card)", border: "1px solid var(--bd)", boxShadow: "var(--elev-1)" }}
          >
            {resultados.length === 0 ? (
              <li className="px-5 py-3 text-[14px]" style={{ color: "var(--tx-5)" }}>
                Sin resultados para “{q.trim()}”
              </li>
            ) : (
              resultados.map((t, i) => (
                <li key={t._id} role="option" aria-selected={i === activo}>
                  <button
                    type="button"
                    onClick={() => abrirCubierta(t)}
                    onMouseEnter={() => setActivo(i)}
                    className="flex w-full items-center gap-3 px-5 py-2.5 text-left text-[15px] transition"
                    style={{ background: i === activo ? "var(--bg-2)" : "transparent", color: "var(--tx)" }}
                  >
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--tx-4)" }}>
                      #{formatTireCode(t.code, data?.tireCodePrefix)}
                    </span>
                    <span className="truncate">{t.brand || "Sin marca"}</span>
                    {t.serialNumber && (
                      <span className="ml-auto truncate text-[13px]" style={{ color: "var(--tx-5)" }}>{t.serialNumber}</span>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {/* Tiles de acción — SIEMPRE 3 columnas (no wrappean; se comprimen en pantallas angostas). */}
      <div className="mt-[26px] grid grid-cols-3 gap-[14px]">
        {TILES.map((t) => (
          <button
            key={t.key}
            onClick={t.onClick}
            className="flex min-h-[130px] flex-col justify-between rounded-[var(--r-lg)] p-5 text-left transition"
            style={t.primary
              ? { background: "var(--brand)", color: "var(--brand-ink)" } // lima brillante fijo (no var(--ink-lime), que en tema claro es verde oscuro)
              : { background: "var(--card)", border: "1px solid var(--bd)", color: "var(--tx)" }}
          >
            <span className="grid h-11 w-11 place-items-center rounded-[var(--r-md)]"
              style={t.primary ? { background: "rgba(10,12,13,.12)" } : { background: tint(t.accent, 14), color: t.accent }}>
              {t.icon}
            </span>
            <span>
              <span className="block text-[16px] font-bold" style={{ fontFamily: "var(--font-display)" }}>{t.title}</span>
              <span className="mt-0.5 block text-[12.5px]" style={{ color: t.primary ? "rgba(10,12,13,.7)" : "var(--tx-4)" }}>{t.sub}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Para hoy: cubiertas/vehículos que requieren acción */}
      <div className="mb-3 mt-[30px] text-[11px] tracking-[.08em]" style={{ fontFamily: "var(--font-mono)", color: "var(--tx-6)" }}>PARA HOY</div>
      {loading ? (
        <SkeletonList count={3} label="Cargando lo pendiente para hoy…" />
      ) : hoyItems.length === 0 ? (
        <div className="flex items-center gap-3 rounded-[var(--r-lg)] p-[18px]" style={{ border: "1px dashed var(--bd)" }}>
          <span className="grid h-10 w-10 flex-none place-items-center rounded-full" style={{ background: "rgba(196,237,43,.10)", color: "var(--ink-lime)" }}>
            <CheckRoundedIcon sx={{ fontSize: 20 }} />
          </span>
          <div>
            <div className="text-[14px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--tx)" }}>Todo en orden</div>
            <div className="mt-0.5 text-[12.5px]" style={{ color: "var(--tx-4)" }}>No hay cubiertas ni posiciones pendientes de acción.</div>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[var(--r-lg)]" style={{ border: "1px solid var(--bd)", background: "var(--card)" }}>
          {hoyItems.map((h, i) => (
            <button
              key={h.key}
              onClick={h.onClick}
              className="flex w-full items-center gap-[13px] px-[18px] py-[14px] text-left transition-colors"
              style={{ borderBottom: i < hoyItems.length - 1 ? "1px solid var(--bd-faint)" : "none" }}
            >
              <span className="grid h-[38px] w-[38px] flex-none place-items-center rounded-[var(--r-md)]" style={{ background: h.iconBg, color: h.color }}>
                {h.isTire ? <TripOriginOutlinedIcon sx={{ fontSize: 19 }} /> : <LocalShippingOutlinedIcon sx={{ fontSize: 19 }} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--tx)" }}>{h.title}</span>
                <span className="mt-px block text-[12.5px]" style={{ color: "var(--tx-4)" }}>{h.desc}</span>
              </span>
              <span className="inline-flex flex-none items-center gap-1.5 rounded-[var(--r-md)] px-3 text-[12px] font-semibold" style={{ height: 32, border: "1px solid var(--bd-strong)", background: "var(--elev)", color: h.color }}>
                {h.btn}
                <ChevronRightRoundedIcon sx={{ fontSize: 15 }} />
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Accesos rápidos por estado */}
      <div className="mb-3 mt-[30px] text-[11px] tracking-[.08em]" style={{ fontFamily: "var(--font-mono)", color: "var(--tx-6)" }}>ACCESO RÁPIDO</div>
      <div className="grid grid-cols-3 gap-[14px]">
        {ACCESS.map((a) => (
          <button
            key={a.tab}
            onClick={() => onNavigate("cubiertas", { tab: a.tab })}
            className="flex items-center gap-[14px] rounded-[var(--r-lg)] p-[18px] text-left transition"
            style={{ background: "var(--card)", border: `1px solid ${a.warn ? tint(a.accent, 30) : "var(--bd)"}` }}
          >
            <span className="grid h-[46px] w-[46px] flex-none place-items-center rounded-[var(--r-md)]" style={{ background: tint(a.accent, 14), color: a.accent }}>
              {a.icon}
            </span>
            <span>
              {/* Un 0 mientras carga es la misma mentira que "Todo en orden": el hueco no. */}
              {loading
                ? <Skeleton className="h-[24px] w-[42px]" />
                : <span className="block text-[24px] font-bold leading-none" style={{ fontFamily: "var(--font-display)", color: "var(--tx)" }}>{a.count}</span>}
              <span className="mt-[3px] block text-[13px]" style={{ color: a.warn ? a.accent : "var(--tx-4)" }}>{a.label}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default Inicio
