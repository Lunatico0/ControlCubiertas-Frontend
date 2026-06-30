import { useState, useMemo, useContext } from "react"
import ApiContext from "@context/apiContext"
import SearchRoundedIcon from "@mui/icons-material/SearchRounded"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded"
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined"
import TripOriginRoundedIcon from "@mui/icons-material/TripOriginRounded"
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded"
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded"
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded"
import { metaOf, tint, fmtKm } from "./status"
import { generatePositions } from "./axles"
import NuevoVehiculo from "./NuevoVehiculo"
import ConfigurarEjes from "./ConfigurarEjes"

// Lista de vehículos (rediseño Claude Design). Dos vistas con toggle (persistido por
// device): CARDS con el esquema de ejes/posiciones, y TABLA densa. El esquema se deriva
// en el front desde vehicle.axles + las cubiertas montadas (data.tires por .position),
// sin pegarle al endpoint por cada vehículo. Click → inventario filtrado por ese móvil.
const TABLE_COLS = "1.4fr 1fr 1fr 1.4fr 0.7fr"

const VehTypeIcon = ({ size = 22 }) => <LocalShippingOutlinedIcon sx={{ fontSize: size }} />

const Vehiculos = ({ onNavigate }) => {
  const { data, ui } = useContext(ApiContext)
  const vehicles = data?.vehicles || []
  const tires = data?.tires || []
  const loading = ui?.loading
  const [query, setQuery] = useState("")
  const [showAlta, setShowAlta] = useState(false)
  const [showConfigEjes, setShowConfigEjes] = useState(false)
  const pendingAxles = vehicles.filter((v) => !(v.axles && v.axles.length)).length
  const [vview, setVview] = useState(() => localStorage.getItem("op_vehview") || "grid")
  const setView = (v) => {
    setVview(v)
    try { localStorage.setItem("op_vehview", v) } catch { /* device sin storage */ }
  }

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
    const filtered = !q
      ? base
      : base.filter(({ v }) => `${v.mobile} ${v.licensePlate} ${v.brand}`.toLowerCase().includes(q))
    return filtered.sort((a, b) => (a.v.mobile || "").localeCompare(b.v.mobile || "", "es", { numeric: true }))
  }, [vehicles, mountedByVeh, query])

  const inputStyle = { background: "var(--card)", border: "1.5px solid var(--bd)", color: "var(--tx)" }
  const toggleBtn = (active) => ({ background: active ? "var(--ink-lime)" : "transparent", color: active ? "var(--bg)" : "var(--tx-5)" })
  const open = (v) => onNavigate?.("cubiertas", { query: v.mobile || "" })

  return (
    <div>
      {/* ===== TOOLBAR ===== */}
      <div className="sticky top-0 z-[5] px-7 pb-4 pt-5" style={{ background: "var(--bg)", borderBottom: "1px solid var(--bd-faint)" }}>
        <div className="flex items-center gap-4">
          <h1 className="text-[24px] font-bold tracking-[-.02em]" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>Vehículos</h1>
          <div className="relative ml-2 max-w-[420px] flex-1">
            <span className="absolute left-[15px] top-1/2 -translate-y-1/2" style={{ color: "var(--tx-7)" }}><SearchRoundedIcon sx={{ fontSize: 18 }} /></span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar móvil, patente o marca…" className="h-[46px] w-full rounded-[11px] pl-[42px] pr-4 text-[14.5px] outline-none" style={inputStyle} onFocus={(e) => (e.target.style.borderColor = "var(--ink-lime)")} onBlur={(e) => (e.target.style.borderColor = "var(--bd)")} />
          </div>
          {pendingAxles > 0 && (
            <button onClick={() => setShowConfigEjes(true)} title="Configurar ejes de vehículos migrados" className="ml-auto inline-flex h-[46px] items-center gap-2 rounded-[11px] px-4 text-[13.5px] font-semibold" style={{ color: "var(--ink-orange)", background: tint("var(--ink-orange)", 12), border: `1px solid ${tint("var(--ink-orange)", 30)}` }}>
              <ReportProblemRoundedIcon sx={{ fontSize: 17 }} /> Configurar ejes ({pendingAxles})
            </button>
          )}
          <button onClick={() => setShowAlta(true)} className={`${pendingAxles > 0 ? "" : "ml-auto "}inline-flex h-[46px] items-center gap-2 rounded-[11px] px-[18px] text-[14.5px] font-bold`} style={{ background: "var(--ink-lime)", color: "var(--bg)" }}>
            <AddRoundedIcon sx={{ fontSize: 18 }} /> Nuevo vehículo
          </button>
          {/* toggle cards/tabla */}
          <div className="flex gap-[3px] rounded-[9px] p-[3px]" style={{ border: "1px solid var(--bd)", background: "var(--card)" }}>
            <button onClick={() => setView("grid")} title="Tarjetas" className="inline-flex h-8 w-[38px] items-center justify-center rounded-[6px]" style={toggleBtn(vview !== "table")}><GridViewRoundedIcon sx={{ fontSize: 17 }} /></button>
            <button onClick={() => setView("table")} title="Lista" className="inline-flex h-8 w-[38px] items-center justify-center rounded-[6px]" style={toggleBtn(vview === "table")}><ViewListRoundedIcon sx={{ fontSize: 17 }} /></button>
          </div>
        </div>
      </div>

      <div className="px-7 pb-8 pt-5">
        {loading ? (
          <p className="text-[13px]" style={{ color: "var(--tx-5)" }}>Cargando vehículos…</p>
        ) : fleet.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-[17px] font-semibold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>Sin resultados</div>
            <div className="mt-1.5 text-[13px]" style={{ color: "var(--tx-5)" }}>No hay vehículos que coincidan.</div>
          </div>
        ) : vview === "table" ? (
          /* ===== TABLA ===== */
          <div className="overflow-hidden rounded-[13px]" style={{ border: "1px solid var(--bd)", background: "var(--card)" }}>
            <div className="grid gap-3 px-[18px] py-3 text-[10.5px] font-semibold uppercase tracking-[.05em]" style={{ gridTemplateColumns: TABLE_COLS, fontFamily: "'IBM Plex Mono'", background: "var(--elev)", borderBottom: "1px solid var(--bd)", color: "var(--tx-6)" }}>
              <div>Móvil</div><div>Patente</div><div>Tipo</div><div>Cubiertas</div><div className="text-right">Km</div>
            </div>
            {fleet.map(({ v, countLabel, countColor, tipoColor, tipoBg, kmLabel }) => (
              <div key={v._id} onClick={() => open(v)} className="grid cursor-pointer items-center gap-3 px-[18px] py-[13px]" style={{ gridTemplateColumns: TABLE_COLS, borderBottom: "1px solid var(--bd-faint)" }}>
                <div className="flex min-w-0 items-center gap-[11px]">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-[8px]" style={{ background: tipoBg, color: tipoColor }}><VehTypeIcon size={17} /></span>
                  <span className="text-[14.5px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>{v.mobile || "—"}</span>
                </div>
                <div className="text-[13px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-2)" }}>{v.licensePlate || "—"}</div>
                <div>{v.type && <span className="inline-flex rounded-full px-2.5 py-[3px] text-[11px] font-semibold" style={{ color: tipoColor, background: tipoBg }}>{v.type}</span>}</div>
                <div className="flex items-center gap-[7px] text-[13px] font-semibold" style={{ color: countColor }}><TripOriginRoundedIcon sx={{ fontSize: 14 }} />{countLabel}</div>
                <div className="text-right text-[13px] font-semibold" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx)" }}>{kmLabel}</div>
              </div>
            ))}
          </div>
        ) : (
          /* ===== CARDS ===== */
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(330px,1fr))" }}>
            {fleet.map(({ v, positions, hasAxles, countLabel, countColor, tipoColor, tipoBg, kmLabel }) => (
              <div key={v._id} onClick={() => open(v)} className="flex cursor-pointer flex-col gap-[15px] rounded-[14px] p-[18px]" style={{ border: "1px solid var(--bd)", background: "var(--card)" }}>
                {/* header */}
                <div className="flex items-start gap-3">
                  <span className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-[11px]" style={{ background: tipoBg, color: tipoColor }}><VehTypeIcon /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[18px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>{v.mobile || "—"}</span>
                      {v.type && <span className="rounded-full px-[9px] py-[2px] text-[10.5px] font-semibold" style={{ color: tipoColor, background: tipoBg }}>{v.type}</span>}
                    </div>
                    <div className="mt-0.5 text-[12px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-5)" }}>{v.licensePlate || "—"} · {v.brand || "—"}</div>
                  </div>
                  <span className="inline-flex flex-none" style={{ color: "var(--tx-6)" }}><ChevronRightRoundedIcon sx={{ fontSize: 18 }} /></span>
                </div>

                {/* esquema de posiciones */}
                {hasAxles ? (
                  <div className="flex flex-wrap gap-[7px]">
                    {positions.map((p, i) => (
                      <div key={i} title={`${p.label} · ${p.empty ? "Vacía" : `#${p.tireCode} ${p.status}`}`} className="flex w-[42px] flex-col items-center gap-1">
                        <div className="flex h-[30px] w-full items-center justify-center rounded-[7px]" style={{ background: p.empty ? "var(--input)" : p.bg, border: p.empty ? "1.5px dashed var(--bd-strong)" : "1.5px solid transparent" }}>
                          <span className="rounded-full" style={{ width: 9, height: 9, background: p.empty ? "transparent" : p.dot, border: p.empty ? "1.5px solid var(--bd-strong)" : "none" }} />
                        </div>
                        <span className="text-[9px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>{p.label}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[9px] px-3 py-2.5 text-[12px]" style={{ background: "var(--input)", border: "1px dashed var(--bd-strong)", color: "var(--tx-5)" }}>
                    Ejes sin configurar — editá el vehículo para definir su esquema.
                  </div>
                )}

                {/* footer */}
                <div className="flex items-center gap-[14px] border-t pt-[13px] text-[12.5px]" style={{ borderColor: "var(--bd-soft)" }}>
                  <span className="inline-flex items-center gap-[7px] font-semibold" style={{ color: countColor }}><TripOriginRoundedIcon sx={{ fontSize: 15 }} />{countLabel}</span>
                  <span className="ml-auto" style={{ color: "var(--tx-5)", fontFamily: "'IBM Plex Mono'" }}>{kmLabel}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAlta && <NuevoVehiculo onClose={() => setShowAlta(false)} />}
      {showConfigEjes && <ConfigurarEjes onClose={() => setShowConfigEjes(false)} />}
    </div>
  )
}

export default Vehiculos
