import { useState, useMemo, useContext } from "react"
import ApiContext from "@context/apiContext"
import { usePersistedState } from "@hooks/usePersistedState"
import { useHotkeyFocus } from "@hooks/useHotkeyFocus"
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded"
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined"
import TripOriginOutlinedIcon from "@mui/icons-material/TripOriginOutlined"
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined"
import { metaOf, tint, fmtKm, useStatusCatalog } from "./status"
import { usePagination } from "@hooks/usePagination"
import Paginador from "@components/common/Paginador"
import { formatPlate } from "@utils/plateFormat"
import { formatTireCode } from "@utils/tireCode"
import { clickable } from "@utils/clickable"
import { generatePositions } from "./axles"
import NuevoVehiculo from "./NuevoVehiculo"
import ConfigurarEjes from "./ConfigurarEjes"
import VehicleDrawer from "./VehicleDrawer"
import ScreenHeader from "@components/common/ScreenHeader"
import Pill from "@components/common/Pill"
import { useOutletContext, useParams, useNavigate, useLocation } from "react-router-dom"
import { rutaDeVehiculo, rutaDeSeccion } from "@utils/opRoutes"
import { SkeletonCards, SkeletonRows } from "@components/common/Skeleton"

// Lista de vehículos (rediseño Claude Design). Dos vistas con toggle (persistido por
// device): CARDS con el esquema de ejes/posiciones, y TABLA densa. El esquema se deriva
// en el front desde vehicle.axles + las cubiertas montadas (data.tires por .position),
// sin pegarle al endpoint por cada vehículo. Click → inventario filtrado por ese móvil.
const TABLE_COLS = "1.4fr 1fr 1fr 1.4fr 0.7fr"

const VehTypeIcon = ({ size = 22 }) => <LocalShippingOutlinedIcon sx={{ fontSize: size }} />

const Vehiculos = () => {
  // Misma idea que en Cubiertas: `onNavigate` por el contexto del Outlet, el intent por la
  // query y el vehículo abierto por el parámetro :id de la ruta anidada. Ver @utils/opRoutes.
  const { onNavigate } = useOutletContext()
  const { id: idEnRuta } = useParams()
  const irA = useNavigate()
  const { search } = useLocation() // se conserva al abrir/cerrar el drawer
  useStatusCatalog() // el color de las cubiertas montadas sale del catálogo del tenant
  const { data, ui } = useContext(ApiContext)
  const vehicles = data?.vehicles || []
  const tires = data?.tires || []
  const loading = ui?.loading
  const [query, setQuery] = useState("")
  const [showAlta, setShowAlta] = useState(false)
  const [showConfigEjes, setShowConfigEjes] = useState(false)
  const [fType, setFType] = useState("")
  const types = useMemo(() => [...new Set(vehicles.map((v) => v.type).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es")), [vehicles])
  const pendingAxles = vehicles.filter((v) => !(v.axles && v.axles.length)).length
  const [vview, setView] = usePersistedState("op_vehview", "grid")
  const searchRef = useHotkeyFocus() // Ctrl/⌘+K enfoca el buscador (igual que Cubiertas)

  // t148: qué está escondiendo los vehículos, para que el estado vacío no sea un callejón.
  const escondidoPor = [
    query.trim() && `la búsqueda “${query.trim()}”`,
    fType && `el tipo “${fType}”`,
  ].filter(Boolean)

  // Cubiertas montadas indexadas por vehículo → { byPos: {E1-I: tire}, count }
  const mountedByVeh = useMemo(() => {
    const m = {}
    for (const t of tires) {
      const vid = String(t.vehicle?._id || t.vehicle || "")
      if (!vid) continue
      if (!m[vid]) m[vid] = { byPos: {}, count: 0 }
      m[vid].count += 1
      if (t.position) m[vid].byPos[t.position] = t
    }
    return m
  }, [tires])

  const fleet = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = vehicles.map((v) => {
      const entry = mountedByVeh[String(v._id)] || { byPos: {}, count: 0 }
      const positions = generatePositions(v.axles || []).map((pos) => {
        const tire = entry.byPos[pos.code]
        if (!tire) return { label: pos.code, empty: true }
        const m = metaOf(tire.status)
        return { label: pos.code, empty: false, dot: m.color, bg: tint(m.color, 14), tireCode: tire.code, status: tire.status }
      })
      const total = positions.length
      const mounted = positions.filter((p) => !p.empty).length
      const hasAxles = total > 0
      const isAcopl = /acopl/i.test(v.type || "")
      const empty = hasAxles ? mounted === 0 : entry.count === 0
      return {
        v,
        positions,
        hasAxles,
        countLabel: hasAxles ? `${mounted}/${total} cubiertas` : `${entry.count} ${entry.count === 1 ? "cubierta" : "cubiertas"}`,
        countColor: empty ? "var(--ink-orange)" : hasAxles && mounted < total ? "var(--tx-3)" : "var(--ink-teal)",
        tipoColor: isAcopl ? "var(--ink-purple)" : "var(--ink-blue)",
        tipoBg: isAcopl ? tint("var(--ink-purple)", 16) : tint("var(--ink-blue)", 16),
        kmLabel: fmtKm(v.kilometers),
      }
    })
    let filtered = base
    if (fType) filtered = filtered.filter(({ v }) => v.type === fType)
    if (q) filtered = filtered.filter(({ v }) => `${v.mobile} ${v.licensePlate} ${v.brand}`.toLowerCase().includes(q))
    return filtered.sort((a, b) => (a.v.mobile || "").localeCompare(b.v.mobile || "", "es", { numeric: true }))
  }, [vehicles, mountedByVeh, query, fType])

  // Idem Cubiertas: la flota entera se montaba de una. Las tarjetas de vehículo traen además
  // el diagrama de ejes, así que pesan más que las de cubierta.
  const pag = usePagination(fleet, 24)

  // El vehículo abierto sale de la RUTA (:id): el drawer es una URL compartible y el botón
  // Atrás lo cierra. Ya no hace falta el efecto que lo auto-abría desde un intent en memoria
  // (volver de montar una cubierta ahora es, simplemente, navegar a /vehiculos/:id).
  const detailVeh = useMemo(
    () => (idEnRuta ? fleet.find((it) => String(it.v._id) === String(idEnRuta)) || null : null),
    [idEnRuta, fleet],
  )

  // Click en un vehículo → abre su drawer de detalle (no navega directo al inventario).
  const open = (v) => irA(rutaDeVehiculo(v._id) + search)

  return (
    <div>
      {/* ===== TOOLBAR ===== */}
      <ScreenHeader
        title="Vehículos"
        count={fleet.length}
        search={{
          value: query,
          onChange: (e) => setQuery(e.target.value),
          placeholder: "Buscar móvil, patente o marca…",
          showShortcut: true,
          inputRef: searchRef,
          onClear: () => setQuery(""),
        }}
        secondaryAction={pendingAxles > 0 ? (
          <button onClick={() => setShowConfigEjes(true)} title="Configurar ejes de vehículos migrados" className="inline-flex h-[46px] items-center gap-2 rounded-[var(--r-md)] px-4 text-[13.5px] font-semibold" style={{ color: "var(--ink-orange)", background: tint("var(--ink-orange)", 12), border: `1px solid ${tint("var(--ink-orange)", 30)}` }}>
            <ReportProblemOutlinedIcon sx={{ fontSize: 17 }} /> Configurar ejes ({pendingAxles})
          </button>
        ) : null}
        primaryAction={{ label: "Nuevo vehículo", onClick: () => setShowAlta(true) }}
        viewToggle={{ value: vview === "table" ? "table" : "grid", onChange: setView }}
      >
        {types.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {["", ...types].map((t) => {
              const on = fType === t
              return (
                <button key={t || "all"} onClick={() => setFType(t)} className="inline-flex h-[34px] items-center rounded-[var(--r-md)] px-[13px] text-[12.5px] font-semibold"
                  style={{ border: `1px solid ${on ? "var(--ink-lime)" : "var(--bd)"}`, background: on ? tint("var(--ink-lime)", 12) : "var(--card)", color: on ? "var(--tx)" : "var(--tx-4)" }}>
                  {t || "Todos"}
                </button>
              )
            })}
          </div>
        )}
      </ScreenHeader>

      <div className="px-7 pb-8 pt-5">
        {loading ? (
          // t143: misma silueta que la vista activa (tabla o tarjetas), no un renglón gris.
          vview === "table"
            ? <SkeletonRows count={8} cols={5} label="Cargando vehículos…" />
            : <SkeletonCards count={8} label="Cargando vehículos…" />
        ) : fleet.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-[17px] font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--tx)" }}>Sin resultados</div>
            <div className="mt-1.5 text-[13px]" style={{ color: "var(--tx-5)" }}>
              {/* t148: mismo criterio que en Cubiertas — decir qué lo está escondiendo y dar la salida. */}
              {escondidoPor.length ? <>Está filtrado por {escondidoPor.join(" y ")}.</> : <>No hay vehículos que coincidan.</>}
            </div>
            {escondidoPor.length > 0 && (
              <button
                onClick={() => { setQuery(""); setFType("") }}
                className="mt-4 inline-flex h-[38px] items-center gap-1.5 rounded-[var(--r-md)] px-[15px] text-[13px] font-semibold"
                style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx-2)" }}
              >
                Limpiar búsqueda y filtros
              </button>
            )}
          </div>
        ) : vview === "table" ? (
          /* ===== TABLA ===== */
          <div className="overflow-hidden rounded-[var(--r-lg)]" style={{ border: "1px solid var(--bd)", background: "var(--card)" }}>
            <div className="grid gap-3 px-[18px] py-3 text-[10.5px] font-semibold uppercase tracking-wider" style={{ gridTemplateColumns: TABLE_COLS, fontFamily: "var(--font-mono)", background: "var(--elev)", borderBottom: "1px solid var(--bd)", color: "var(--tx-6)" }}>
              <div>Móvil</div><div>Patente</div><div>Tipo</div><div>Cubiertas</div><div className="text-right">Km</div>
            </div>
            {pag.currentItems.map(({ v, countLabel, countColor, tipoColor, tipoBg, kmLabel }) => (
              <div key={v._id} {...clickable(() => open(v))} aria-label={`Vehículo ${v.mobile}`} className="grid cursor-pointer items-center gap-3 px-[18px] py-[13px]" style={{ gridTemplateColumns: TABLE_COLS, borderBottom: "1px solid var(--bd-faint)" }}>
                <div className="flex min-w-0 items-center gap-[11px]">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-[var(--r-md)]" style={{ background: tipoBg, color: tipoColor }}><VehTypeIcon size={17} /></span>
                  <span className="text-[14.5px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--tx)" }}>{v.mobile || "—"}</span>
                </div>
                <div className="text-[13px]" style={{ fontFamily: "var(--font-mono)", color: "var(--tx-2)" }}>{formatPlate(v.licensePlate, data.plateSep) || "—"}</div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {v.type && <Pill style={{ color: tipoColor, background: tipoBg }}>{v.type}</Pill>}
                  {/* t145: un vehículo parado no es un pendiente, y tiene que verse desde la lista. */}
                  {v.outOfService && <Pill style={{ color: "var(--ink-orange)", background: tint("var(--ink-orange)", 16) }}>PARADO</Pill>}
                </div>
                <div className="flex items-center gap-[7px] text-[13px] font-semibold" style={{ color: countColor }}><TripOriginOutlinedIcon sx={{ fontSize: 14 }} />{countLabel}</div>
                <div className="flex items-center justify-end">
                  <span className="text-[13px] font-semibold" style={{ fontFamily: "var(--font-mono)", color: "var(--tx)" }}>{kmLabel}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ===== CARDS ===== */
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(330px,1fr))" }}>
            {pag.currentItems.map(({ v, positions, hasAxles, countLabel, countColor, tipoColor, tipoBg, kmLabel }) => (
              <div key={v._id} {...clickable(() => open(v))} aria-label={`Vehículo ${v.mobile}`} className="flex cursor-pointer flex-col gap-[15px] rounded-[var(--r-lg)] p-[18px]" style={{ border: "1px solid var(--bd)", background: "var(--card)" }}>
                {/* header */}
                <div className="flex items-start gap-3">
                  <span className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-[var(--r-md)]" style={{ background: tipoBg, color: tipoColor }}><VehTypeIcon /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[18px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--tx)" }}>{v.mobile || "—"}</span>
                      {v.type && <Pill className="px-[9px] py-[2px] text-[10.5px] font-semibold" style={{ color: tipoColor, background: tipoBg }}>{v.type}</Pill>}
                    </div>
                    <div className="mt-0.5 text-[12px]" style={{ fontFamily: "var(--font-mono)", color: "var(--tx-5)" }}>{formatPlate(v.licensePlate, data.plateSep) || "—"} · {v.brand || "—"}</div>
                  </div>
                  <span className="inline-flex flex-none" style={{ color: "var(--tx-6)" }}><ChevronRightRoundedIcon sx={{ fontSize: 18 }} /></span>
                </div>

                {/* esquema de posiciones */}
                {hasAxles ? (
                  <div className="flex flex-1 flex-wrap content-start gap-[7px]">
                    {positions.map((p, i) => (
                      <div key={i} title={`${p.label} · ${p.empty ? "Vacía" : `#${formatTireCode(p.tireCode, data?.tireCodePrefix)} ${p.status}`}`} className="flex w-[42px] flex-col items-center gap-1">
                        <div className="flex h-[30px] w-full items-center justify-center rounded-[var(--r-sm)]" style={{ background: p.empty ? "var(--input)" : p.bg, border: p.empty ? "1.5px dashed var(--bd-strong)" : "1.5px solid transparent" }}>
                          <span className="rounded-full" style={{ width: 9, height: 9, background: p.empty ? "transparent" : p.dot, border: p.empty ? "1.5px solid var(--bd-strong)" : "none" }} />
                        </div>
                        <span className="text-[9px]" style={{ fontFamily: "var(--font-mono)", color: "var(--tx-6)" }}>{p.label}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[var(--r-md)] px-3 py-2.5 text-[12px]" style={{ background: "var(--input)", border: "1px dashed var(--bd-strong)", color: "var(--tx-5)" }}>
                    Ejes sin configurar — abrí el detalle para configurarlos.
                  </div>
                )}

                {/* footer — pineado al fondo (mt-auto): el espacio sobrante queda entre las cubiertas y el divider */}
                <div className="mt-auto flex items-center gap-[14px] border-t pt-[13px] text-[12.5px]" style={{ borderColor: "var(--bd-soft)" }}>
                  <span className="inline-flex items-center gap-[7px] font-semibold" style={{ color: countColor }}><TripOriginOutlinedIcon sx={{ fontSize: 15 }} />{countLabel}</span>
                  <span className="ml-auto" style={{ color: "var(--tx-5)", fontFamily: "var(--font-mono)" }}>{kmLabel}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <Paginador {...pag} total={fleet.length} mostrados={pag.currentItems.length} />
      </div>

      {showAlta && <NuevoVehiculo onClose={() => setShowAlta(false)} />}
      {showConfigEjes && <ConfigurarEjes onClose={() => setShowConfigEjes(false)} />}
      {detailVeh && <VehicleDrawer item={detailVeh} onClose={() => irA(rutaDeSeccion("vehiculos") + search)} onNavigate={onNavigate} />}
    </div>
  )
}

export default Vehiculos
