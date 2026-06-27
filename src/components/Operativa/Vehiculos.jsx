import { useState, useMemo, useContext } from "react"
import ApiContext from "@context/apiContext"
import SearchRoundedIcon from "@mui/icons-material/SearchRounded"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded"
import { tint } from "./status"
import NuevoVehiculo from "./NuevoVehiculo"

// Lista de vehículos del tenant. Coherente con el inventario (tabla densa + search).
// Las cubiertas montadas se cuentan desde data.tires (tire.vehicle), NO desde
// vehicle.tires[] — así no dependemos de refs colgadas (Bug 3). Click en una fila →
// inventario filtrado por ese móvil.
const GRID_COLS = "1fr 1fr 1.4fr 0.9fr 0.7fr"

const Vehiculos = ({ onNavigate }) => {
  const { data, ui } = useContext(ApiContext)
  const vehicles = data?.vehicles || []
  const tires = data?.tires || []
  const loading = ui?.loading
  const [query, setQuery] = useState("")
  const [showAlta, setShowAlta] = useState(false)

  const mounted = useMemo(() => {
    const m = {}
    for (const t of tires) {
      const vid = String(t.vehicle?._id || t.vehicle || "")
      if (vid) m[vid] = (m[vid] || 0) + 1
    }
    return m
  }, [tires])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const arr = !q
      ? vehicles
      : vehicles.filter(
          (v) =>
            v.mobile?.toLowerCase().includes(q) ||
            v.licensePlate?.toLowerCase().includes(q) ||
            v.brand?.toLowerCase().includes(q),
        )
    return [...arr].sort((a, b) => (a.mobile || "").localeCompare(b.mobile || "", "es", { numeric: true }))
  }, [vehicles, query])

  const inputStyle = { background: "var(--card)", border: "1.5px solid var(--bd)", color: "var(--tx)" }

  return (
    <div>
      <div className="sticky top-0 z-[5] px-7 pb-4 pt-5" style={{ background: "var(--bg)", borderBottom: "1px solid var(--bd-faint)" }}>
        <div className="flex items-center gap-4">
          <h1 className="text-[24px] font-bold tracking-[-.02em]" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>Vehículos</h1>
          <div className="relative ml-2 max-w-[460px] flex-1">
            <span className="absolute left-[15px] top-1/2 -translate-y-1/2" style={{ color: "var(--tx-7)" }}>
              <SearchRoundedIcon sx={{ fontSize: 18 }} />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar móvil, patente o marca…"
              className="h-[46px] w-full rounded-[11px] pl-[42px] pr-4 text-[14.5px] outline-none"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--ink-lime)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--bd)")}
            />
          </div>
          <button onClick={() => setShowAlta(true)} className="ml-auto inline-flex h-[46px] items-center gap-2 rounded-[11px] px-[18px] text-[14.5px] font-bold" style={{ background: "var(--ink-lime)", color: "var(--bg)" }}>
            <AddRoundedIcon sx={{ fontSize: 18 }} /> Nuevo vehículo
          </button>
        </div>
      </div>

      <div className="px-7 pb-8 pt-5">
        {loading ? (
          <p className="text-[13px]" style={{ color: "var(--tx-5)" }}>Cargando vehículos…</p>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-[17px] font-semibold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>Sin resultados</div>
            <div className="mt-1.5 text-[13px]" style={{ color: "var(--tx-5)" }}>No hay vehículos que coincidan.</div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[13px]" style={{ border: "1px solid var(--bd)", background: "var(--card)" }}>
            <div className="grid gap-3 px-[18px] py-3 text-[10.5px] font-semibold uppercase tracking-[.05em]" style={{ gridTemplateColumns: GRID_COLS, fontFamily: "'IBM Plex Mono'", background: "var(--elev)", borderBottom: "1px solid var(--bd)", color: "var(--tx-6)" }}>
              <div>Móvil</div><div>Patente</div><div>Marca / Tipo</div><div>Cubiertas</div><div className="text-right">Acciones</div>
            </div>
            {filtered.map((v) => {
              const count = mounted[String(v._id)] || 0
              return (
                <div
                  key={v._id}
                  onClick={() => onNavigate?.("cubiertas", { query: v.mobile || "" })}
                  className="grid cursor-pointer items-center gap-3 px-[18px] py-3"
                  style={{ gridTemplateColumns: GRID_COLS, borderBottom: "1px solid var(--bd-faint)" }}
                >
                  <div className="text-[15px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>{v.mobile || "—"}</div>
                  <div className="text-[13px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-2)" }}>{v.licensePlate || "—"}</div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium" style={{ color: "var(--tx-2)" }}>{v.brand || "—"}</div>
                    {v.type && <div className="text-[11.5px]" style={{ color: "var(--tx-5)" }}>{v.type}</div>}
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-semibold" style={{ color: count ? "var(--ink-lime)" : "var(--tx-5)", background: count ? tint("var(--ink-lime)", 14) : "var(--elev)" }}>
                      {count} {count === 1 ? "cubierta" : "cubiertas"}
                    </span>
                  </div>
                  <div className="flex items-center justify-end">
                    <span className="flex h-9 w-9 items-center justify-center rounded-[8px]" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx-3)" }} title="Ver cubiertas del vehículo">
                      <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showAlta && <NuevoVehiculo onClose={() => setShowAlta(false)} />}
    </div>
  )
}

export default Vehiculos
