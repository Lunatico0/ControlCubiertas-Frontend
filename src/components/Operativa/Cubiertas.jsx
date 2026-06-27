import { useState, useRef, useEffect, useMemo, useContext } from "react"
import ApiContext from "@context/apiContext"
import { showToast } from "@utils/toast"
import SearchRoundedIcon from "@mui/icons-material/SearchRounded"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded"
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded"
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined"
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded"

// Mapa estado → color del design system + nivel de recapado (pips).
const STATUS_META = {
  "Nueva": { color: "var(--st-lime)", level: 0 },
  "1er Recapado": { color: "var(--st-teal)", level: 1 },
  "2do Recapado": { color: "var(--st-blue)", level: 2 },
  "3er Recapado": { color: "var(--st-purple)", level: 3 },
  "A recapar": { color: "var(--st-orange)", level: 0 },
  "Descartada": { color: "var(--st-red)", level: 0 },
}
const metaOf = (status) => STATUS_META[status] || { color: "var(--tx-5)", level: 0 }
const tint = (color, pct) => `color-mix(in srgb, ${color} ${pct}%, transparent)`
const fmtKm = (n) => `${(n ?? 0).toLocaleString("es-AR")} km`

const TABS = [
  { key: "todas", label: "Todas" },
  { key: "stock", label: "En stock" },
  { key: "circulacion", label: "En circulación" },
  { key: "recapar", label: "A recapar" },
]

const StateBadge = ({ status, small }) => {
  const m = metaOf(status)
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full font-semibold"
      style={{ color: m.color, background: tint(m.color, 14), padding: small ? "3px 10px" : "4px 10px", fontSize: "11.5px" }}
    >
      <span className="rounded-full" style={{ width: 6, height: 6, background: m.color }} />
      {status}
    </span>
  )
}

const Pips = ({ level }) => (
  <div className="flex gap-[5px]">
    {[0, 1, 2].map((i) => (
      <span key={i} className="rounded-[3px]" style={{ width: 18, height: 6, background: i < level ? "var(--st-teal)" : "var(--bd-strong)" }} />
    ))}
  </div>
)

const Cubiertas = () => {
  const { data, ui } = useContext(ApiContext)
  const tires = data?.tires || []
  const loading = ui?.loading

  const [query, setQuery] = useState("")
  const [tab, setTab] = useState("todas")
  const [view, setView] = useState("table") // tabla densa por defecto (decisión del brief)
  const searchRef = useRef(null)

  // Atajo "/" para enfocar la búsqueda.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && !/^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName || "")) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const counts = useMemo(
    () => ({
      todas: tires.length,
      stock: tires.filter((t) => !t.vehicle).length,
      circulacion: tires.filter((t) => t.vehicle).length,
      recapar: tires.filter((t) => t.status === "A recapar").length,
    }),
    [tires],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return tires.filter((t) => {
      if (tab === "stock" && t.vehicle) return false
      if (tab === "circulacion" && !t.vehicle) return false
      if (tab === "recapar" && t.status !== "A recapar") return false
      if (!q) return true
      return (
        String(t.code ?? "").includes(q) ||
        t.serialNumber?.toLowerCase().includes(q) ||
        t.brand?.toLowerCase().includes(q) ||
        t.vehicle?.mobile?.toLowerCase().includes(q)
      )
    })
  }, [tires, query, tab])

  const soon = (msg) => showToast("info", msg || "Llega en el próximo hito del rediseño")

  const inputStyle = { background: "var(--card)", border: "1.5px solid var(--bd)", color: "var(--tx)" }

  return (
    <div>
      {/* Toolbar sticky */}
      <div
        className="sticky top-0 z-[5] px-7 pb-4 pt-5"
        style={{ background: "var(--bg)", borderBottom: "1px solid var(--bd-faint)" }}
      >
        <div className="mb-4 flex items-center gap-4">
          <h1 className="text-[24px] font-bold tracking-[-.02em]" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>
            Cubiertas
          </h1>
          <div className="relative ml-2 max-w-[460px] flex-1">
            <span className="absolute left-[15px] top-1/2 -translate-y-1/2" style={{ color: "var(--tx-7)" }}>
              <SearchRoundedIcon sx={{ fontSize: 18 }} />
            </span>
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar código, marca, N° de serie…"
              className="h-[46px] w-full rounded-[11px] pl-[42px] pr-[42px] text-[14.5px] outline-none"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--ink-lime)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--bd)")}
            />
            <span
              className="absolute right-[13px] top-1/2 -translate-y-1/2 rounded-[5px] px-[7px] py-[3px] text-[11px]"
              style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-5)", border: "1px solid var(--bd-strong)" }}
            >
              /
            </span>
          </div>
          <button
            onClick={() => soon("Alta de cubierta — próximo hito")}
            className="ml-auto inline-flex h-[46px] items-center gap-2 rounded-[11px] px-[18px] text-[14.5px] font-bold"
            style={{ background: "var(--ink-lime)", color: "#0A0C0D" }}
          >
            <AddRoundedIcon sx={{ fontSize: 18 }} /> Alta de cubierta
          </button>
        </div>

        <div className="flex items-center gap-[14px]">
          {/* Filtros rápidos */}
          <div className="flex flex-wrap gap-2">
            {TABS.map((f) => {
              const on = tab === f.key
              return (
                <button
                  key={f.key}
                  onClick={() => setTab(f.key)}
                  className="inline-flex h-[38px] items-center gap-2 rounded-[9px] px-[15px] text-[13.5px] font-semibold"
                  style={{
                    border: `1px solid ${on ? "var(--ink-lime)" : "var(--bd)"}`,
                    background: on ? tint("var(--ink-lime)", 12) : "var(--card)",
                    color: on ? "var(--tx)" : "var(--tx-3)",
                  }}
                >
                  {f.label}
                  <span
                    className="rounded-full px-[7px] py-px text-[11.5px]"
                    style={{ fontFamily: "'IBM Plex Mono'", background: "var(--elev)", color: "var(--tx-5)" }}
                  >
                    {counts[f.key]}
                  </span>
                </button>
              )
            })}
          </div>
          {/* Toggle de vista */}
          <div className="ml-auto flex gap-[3px] rounded-[9px] p-[3px]" style={{ border: "1px solid var(--bd)", background: "var(--card)" }}>
            {[
              { key: "grid", icon: <GridViewRoundedIcon sx={{ fontSize: 17 }} /> },
              { key: "table", icon: <ViewListRoundedIcon sx={{ fontSize: 17 }} /> },
            ].map((v) => {
              const on = view === v.key
              return (
                <button
                  key={v.key}
                  onClick={() => setView(v.key)}
                  className="flex h-8 w-[38px] items-center justify-center rounded-[6px]"
                  style={{ background: on ? "var(--hover)" : "transparent", color: on ? "var(--ink-lime)" : "var(--tx-5)" }}
                >
                  {v.icon}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="px-7 pb-8 pt-5">
        {loading ? (
          <p className="text-[13px]" style={{ color: "var(--tx-5)" }}>Cargando cubiertas…</p>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-[17px] font-semibold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>Sin resultados</div>
            <div className="mt-1.5 text-[13px]" style={{ color: "var(--tx-5)" }}>No hay cubiertas que coincidan con tu búsqueda o filtro.</div>
          </div>
        ) : view === "grid" ? (
          /* ---------- GRID ---------- */
          <div className="grid gap-[14px]" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
            {filtered.map((t) => {
              const m = metaOf(t.status)
              return (
                <div
                  key={t._id}
                  onClick={() => soon("Detalle de cubierta — próximo hito (drawer)")}
                  className="flex cursor-pointer flex-col gap-[13px] rounded-[13px] p-4"
                  style={{ border: "1px solid var(--bd)", background: "var(--card)" }}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div>
                      <div className="text-[11px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>{t.serialNumber || "—"}</div>
                      <div className="text-[22px] font-bold leading-[1.05]" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>#{t.code}</div>
                    </div>
                    <StateBadge status={t.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] tracking-[.05em]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>RECAPADOS</span>
                    <Pips level={m.level} />
                  </div>
                  <div className="flex flex-col gap-[5px] text-[12.5px]">
                    <Row label="Marca" value={t.brand} />
                    <Row label="Rodado" value={t.size} mono />
                    <Row label="Ubicación" value={t.vehicle?.mobile || "En depósito"} valueColor={t.vehicle ? "var(--ink-blue)" : "var(--tx-4)"} />
                    <Row label="Km" value={fmtKm(t.kilometers)} mono strong />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* ---------- TABLA ---------- */
          <div className="overflow-hidden rounded-[13px]" style={{ border: "1px solid var(--bd)", background: "var(--card)" }}>
            <div
              className="grid gap-3 px-[18px] py-3 text-[10.5px] font-semibold uppercase tracking-[.05em]"
              style={{ gridTemplateColumns: "0.9fr 1.1fr 1.2fr 1fr 0.7fr 1.2fr", fontFamily: "'IBM Plex Mono'", background: "var(--elev)", borderBottom: "1px solid var(--bd)", color: "var(--tx-6)" }}
            >
              <div>Código</div><div>Estado</div><div>Marca / Rodado</div><div>Ubicación</div><div className="text-right">Km</div><div className="text-right">Acciones</div>
            </div>
            {filtered.map((t) => {
              const m = metaOf(t.status)
              return (
                <div
                  key={t._id}
                  className="grid items-center gap-3 py-3 pl-[14px] pr-[18px]"
                  style={{ gridTemplateColumns: "0.9fr 1.1fr 1.2fr 1fr 0.7fr 1.2fr", borderLeft: `4px solid ${m.color}`, borderBottom: "1px solid var(--bd-faint)" }}
                >
                  <div className="cursor-pointer" onClick={() => soon("Detalle de cubierta — próximo hito (drawer)")}>
                    <div className="text-[15px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>#{t.code}</div>
                    <div className="text-[10.5px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>{t.serialNumber || "—"}</div>
                  </div>
                  <div><StateBadge status={t.status} small /></div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium" style={{ color: "var(--tx-2)" }}>{t.brand}</div>
                    <div className="text-[11.5px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-5)" }}>{t.size}{t.pattern ? ` · ${t.pattern}` : ""}</div>
                  </div>
                  <div className="text-[12.5px] font-medium" style={{ color: t.vehicle ? "var(--ink-blue)" : "var(--tx-4)" }}>{t.vehicle?.mobile || "En depósito"}</div>
                  <div className="text-right text-[13px] font-semibold" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx)" }}>{fmtKm(t.kilometers)}</div>
                  <div className="flex items-center justify-end gap-1.5">
                    {!t.vehicle && t.status !== "Descartada" && (
                      <ActionBtn onClick={() => soon("Asignar a vehículo — próximo hito")} color="var(--ink-lime)" icon={<LocalShippingOutlinedIcon sx={{ fontSize: 15 }} />} />
                    )}
                    {t.vehicle && (
                      <ActionBtn onClick={() => soon("Desasignar — próximo hito")} color="var(--tx-3)" icon={<RemoveRoundedIcon sx={{ fontSize: 15 }} />} />
                    )}
                    {t.status === "A recapar" && (
                      <ActionBtn onClick={() => soon("Recapado listo — próximo hito")} color="var(--ink-teal)" icon={<CheckRoundedIcon sx={{ fontSize: 15 }} />} />
                    )}
                    <ActionBtn onClick={() => soon("Detalle — próximo hito (drawer)")} color="var(--tx-3)" icon={<ChevronRightRoundedIcon sx={{ fontSize: 16 }} />} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const Row = ({ label, value, valueColor, mono, strong }) => (
  <div className="flex justify-between">
    <span style={{ color: "var(--tx-5)" }}>{label}</span>
    <span style={{ color: valueColor || "var(--tx-2)", fontWeight: strong ? 600 : 500, fontFamily: mono ? "'IBM Plex Mono'" : undefined }}>{value}</span>
  </div>
)

const ActionBtn = ({ onClick, color, icon }) => (
  <button
    onClick={onClick}
    className="flex h-9 w-9 items-center justify-center rounded-[8px]"
    style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color }}
  >
    {icon}
  </button>
)

export default Cubiertas
