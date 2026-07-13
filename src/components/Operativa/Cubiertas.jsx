import { useState, useRef, useEffect, useMemo, useContext } from "react"
import ApiContext from "@context/apiContext"
import { showToast } from "@utils/toast"
import SearchRoundedIcon from "@mui/icons-material/SearchRounded"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded"
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded"
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded"
import TuneRoundedIcon from "@mui/icons-material/TuneRounded"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import { metaOf, tint, fmtKm, fmtDate, StateBadge, Pips } from "./status"
import { OpActionBtn } from "./opActions"
import TireDrawer from "./TireDrawer"
import AltaDrawer from "./AltaDrawer"

const TABS = [
  { key: "todas", label: "Todas" },
  { key: "stock", label: "En stock" },
  { key: "circulacion", label: "En circulación" },
  { key: "recapar", label: "A recapar" },
]

// Rank de estado para ordenar de forma significativa (no alfabética): escalera por nivel,
// luego a-recapar, luego baja. Deriva del catálogo del tenant vía metaOf (rol + nivel).
const statusRank = (status) => {
  const m = metaOf(status)
  const base = { initial: 0, stock: 0, recap: 1000, discard: 2000 }[m.role] ?? 0
  return base + (m.level || 0)
}

// Columnas de la tabla. `sort` define el criterio; null = no ordenable.
const COLUMNS = [
  { key: "code", label: "Código", sort: (a, b) => (a.code ?? 0) - (b.code ?? 0) },
  { key: "status", label: "Estado", sort: (a, b) => statusRank(a.status) - statusRank(b.status) },
  { key: "brand", label: "Marca / Rodado", sort: (a, b) => (a.brand || "").localeCompare(b.brand || "") },
  { key: "location", label: "Ubicación", sort: (a, b) => (a.vehicle?.mobile || "~").localeCompare(b.vehicle?.mobile || "~") },
  { key: "km", label: "Km", align: "right", sort: (a, b) => (a.kilometers || 0) - (b.kilometers || 0) },
  { key: "updatedAt", label: "Actualizada", align: "right", sort: (a, b) => new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0) },
  { key: "actions", label: "Acciones", align: "right", sort: null },
]
const GRID_COLS = "0.8fr 1fr 1.2fr 0.9fr 0.6fr 0.8fr 1.1fr"

// Atajo de teclado según plataforma (⌘K en Mac/iOS, Ctrl+K en el resto).
const IS_MAC = typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || "")
const SHORTCUT_LABEL = IS_MAC ? "⌘K" : "Ctrl K"

const Cubiertas = ({ intent }) => {
  const { data, ui } = useContext(ApiContext)
  const tires = data?.tires || []
  const loading = ui?.loading

  const [query, setQuery] = useState("")
  const [tab, setTab] = useState("todas")
  const [view, setViewState] = useState(() => localStorage.getItem("op_tireview") || "table")
  const setView = (v) => {
    setViewState(v)
    try { localStorage.setItem("op_tireview", v) } catch { /* device sin storage */ }
  }
  const [selectedId, setSelectedId] = useState(null)
  const [pendingAction, setPendingAction] = useState(null)
  const [showAlta, setShowAlta] = useState(false)
  const [sortBy, setSortBy] = useState("code")
  const [sortDir, setSortDir] = useState("asc")
  // Filtros avanzados (panel desplegable)
  const [showFilters, setShowFilters] = useState(false)
  const [fBrand, setFBrand] = useState("")
  const [fStatus, setFStatus] = useState("")
  const [fKmMin, setFKmMin] = useState("")
  const [fKmMax, setFKmMax] = useState("")
  const searchRef = useRef(null)

  const brands = useMemo(() => [...new Set(tires.map((t) => t.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es")), [tires])
  const activeFilters = (fBrand ? 1 : 0) + (fStatus ? 1 : 0) + (fKmMin || fKmMax ? 1 : 0)
  const clearFilters = () => { setFBrand(""); setFStatus(""); setFKmMin(""); setFKmMax("") }

  // Atajo Ctrl/Cmd + K para enfocar la búsqueda.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // Aplica la intención de navegación que llega desde Inicio (búsqueda o filtro).
  useEffect(() => {
    if (!intent) return
    if (intent.query != null) setQuery(intent.query)
    if (intent.tab) setTab(intent.tab)
    if (intent.alta) setShowAlta(true)
  }, [intent])

  const counts = useMemo(
    () => ({
      todas: tires.length,
      stock: tires.filter((t) => !t.vehicle).length,
      circulacion: tires.filter((t) => t.vehicle).length,
      recapar: tires.filter((t) => metaOf(t.status).role === "recap").length,
    }),
    [tires],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const kmMin = fKmMin !== "" ? Number(fKmMin) : null
    const kmMax = fKmMax !== "" ? Number(fKmMax) : null
    const base = tires.filter((t) => {
      if (tab === "stock" && t.vehicle) return false
      if (tab === "circulacion" && !t.vehicle) return false
      if (tab === "recapar" && metaOf(t.status).role !== "recap") return false
      if (fBrand && t.brand !== fBrand) return false
      if (fStatus && t.status !== fStatus) return false
      if (kmMin != null && (t.kilometers || 0) < kmMin) return false
      if (kmMax != null && (t.kilometers || 0) > kmMax) return false
      if (!q) return true
      return (
        String(t.code ?? "").includes(q) ||
        t.serialNumber?.toLowerCase().includes(q) ||
        t.brand?.toLowerCase().includes(q) ||
        t.vehicle?.mobile?.toLowerCase().includes(q)
      )
    })
    const col = COLUMNS.find((c) => c.key === sortBy)
    if (!col?.sort) return base
    const sorted = [...base].sort(col.sort)
    return sortDir === "desc" ? sorted.reverse() : sorted
  }, [tires, query, tab, sortBy, sortDir, fBrand, fStatus, fKmMin, fKmMax])

  const toggleSort = (key) => {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortBy(key); setSortDir("asc") }
  }

  const openDrawer = (id, action = null) => () => { setSelectedId(id); setPendingAction(action) }
  const closeDrawer = () => { setSelectedId(null); setPendingAction(null) }

  const inputStyle = { background: "var(--card)", border: "1.5px solid var(--bd)", color: "var(--tx)" }

  return (
    <div>
      {/* Toolbar sticky */}
      <div className="sticky top-0 z-[5] px-7 pb-4 pt-5" style={{ background: "var(--bg)", borderBottom: "1px solid var(--bd-faint)" }}>
        <div className="mb-4 flex items-center gap-4">
          <h1 className="text-[24px] font-bold tracking-[-.02em]" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>Cubiertas</h1>
          <div className="relative ml-2 max-w-[460px] flex-1">
            <span className="absolute left-[15px] top-1/2 -translate-y-1/2" style={{ color: "var(--tx-7)" }}>
              <SearchRoundedIcon sx={{ fontSize: 18 }} />
            </span>
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar código, marca, N° de serie…"
              className="h-[46px] w-full rounded-[11px] pl-[42px] pr-[58px] text-[14.5px] outline-none"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--ink-lime)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--bd)")}
            />
            <span className="absolute right-[13px] top-1/2 -translate-y-1/2 rounded-[5px] px-[7px] py-[3px] text-[11px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-5)", border: "1px solid var(--bd-strong)" }}>
              {SHORTCUT_LABEL}
            </span>
          </div>
          <button data-tour="cub-alta" onClick={() => setShowAlta(true)} className="ml-auto inline-flex h-[46px] items-center gap-2 rounded-[11px] px-[18px] text-[14.5px] font-bold" style={{ background: "var(--ink-lime)", color: "#0A0C0D" }}>
            <AddRoundedIcon sx={{ fontSize: 18 }} /> Alta de cubierta
          </button>
        </div>

        <div className="flex items-center gap-[14px]">
          <div data-tour="cub-filters" className="flex flex-wrap gap-2">
            {TABS.map((f) => {
              const on = tab === f.key
              return (
                <button key={f.key} onClick={() => setTab(f.key)} className="inline-flex h-[38px] items-center gap-2 rounded-[9px] px-[15px] text-[13.5px] font-semibold"
                  style={{ border: `1px solid ${on ? "var(--ink-lime)" : "var(--bd)"}`, background: on ? tint("var(--ink-lime)", 12) : "var(--card)", color: on ? "var(--tx)" : "var(--tx-3)" }}>
                  {f.label}
                  <span className="rounded-full px-[7px] py-px text-[11.5px]" style={{ fontFamily: "'IBM Plex Mono'", background: "var(--elev)", color: "var(--tx-5)" }}>{counts[f.key]}</span>
                </button>
              )
            })}
          </div>
          <button onClick={() => setShowFilters((v) => !v)} className="ml-auto inline-flex h-[38px] items-center gap-2 rounded-[9px] px-[14px] text-[13.5px] font-semibold"
            style={{ border: `1px solid ${showFilters || activeFilters ? "var(--ink-lime)" : "var(--bd)"}`, background: showFilters || activeFilters ? tint("var(--ink-lime)", 12) : "var(--card)", color: showFilters || activeFilters ? "var(--tx)" : "var(--tx-3)" }}>
            <TuneRoundedIcon sx={{ fontSize: 16 }} /> Filtros
            {activeFilters > 0 && <span className="rounded-full px-[7px] py-px text-[11px]" style={{ fontFamily: "'IBM Plex Mono'", background: "var(--ink-lime)", color: "var(--bg)" }}>{activeFilters}</span>}
          </button>
          <div data-tour="cub-viewtoggle" className="flex gap-[3px] rounded-[9px] p-[3px]" style={{ border: "1px solid var(--bd)", background: "var(--card)" }}>
            {[{ key: "grid", icon: <GridViewRoundedIcon sx={{ fontSize: 17 }} /> }, { key: "table", icon: <ViewListRoundedIcon sx={{ fontSize: 17 }} /> }].map((v) => {
              const on = view === v.key
              return (
                <button key={v.key} onClick={() => setView(v.key)} className="flex h-8 w-[38px] items-center justify-center rounded-[6px]" style={{ background: on ? "var(--hover)" : "transparent", color: on ? "var(--ink-lime)" : "var(--tx-5)" }}>{v.icon}</button>
              )
            })}
          </div>
        </div>

        {showFilters && (
          <div className="mt-3 flex flex-wrap items-end gap-3.5 rounded-[11px] p-3.5" style={{ border: "1px solid var(--bd)", background: "var(--card)" }}>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold" style={{ color: "var(--tx-4)" }}>Marca</span>
              <select value={fBrand} onChange={(e) => setFBrand(e.target.value)} className="h-[38px] min-w-[150px] rounded-[8px] px-2.5 text-[13px] outline-none" style={inputStyle}>
                <option value="">Todas</option>
                {brands.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold" style={{ color: "var(--tx-4)" }}>Estado</span>
              <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} className="h-[38px] min-w-[150px] rounded-[8px] px-2.5 text-[13px] outline-none" style={inputStyle}>
                <option value="">Todos</option>
                {(data?.stateOrder || []).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold" style={{ color: "var(--tx-4)" }}>Km desde</span>
              <input type="number" min="0" value={fKmMin} onChange={(e) => setFKmMin(e.target.value)} placeholder="0" className="h-[38px] w-[120px] rounded-[8px] px-2.5 text-[13px] outline-none" style={{ ...inputStyle, fontFamily: "'IBM Plex Mono'" }} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold" style={{ color: "var(--tx-4)" }}>Km hasta</span>
              <input type="number" min="0" value={fKmMax} onChange={(e) => setFKmMax(e.target.value)} placeholder="—" className="h-[38px] w-[120px] rounded-[8px] px-2.5 text-[13px] outline-none" style={{ ...inputStyle, fontFamily: "'IBM Plex Mono'" }} />
            </label>
            {activeFilters > 0 && (
              <button onClick={clearFilters} className="inline-flex h-[38px] items-center gap-1.5 rounded-[8px] px-3 text-[12.5px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx-3)" }}>
                <CloseRoundedIcon sx={{ fontSize: 15 }} /> Limpiar
              </button>
            )}
            <span className="ml-auto self-center text-[12px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-5)" }}>{filtered.length} resultado{filtered.length === 1 ? "" : "s"}</span>
          </div>
        )}
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
                <div key={t._id} onClick={openDrawer(t._id)} className="flex cursor-pointer flex-col gap-[13px] rounded-[13px] p-4" style={{ border: "1px solid var(--bd)", background: "var(--card)" }}>
                  <div className="flex items-start justify-between gap-2.5">
                    <div>
                      <div className="text-[11px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>{t.serialNumber || "—"}</div>
                      <div className="text-[22px] font-bold leading-[1.05]" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>#{t.code}</div>
                    </div>
                    <StateBadge status={t.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] tracking-[.05em]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>RECAPADOS</span>
                    <Pips level={t.recapLevel ?? m.level} />
                  </div>
                  <div className="flex flex-col gap-[5px] text-[12.5px]">
                    <Row label="Marca" value={t.brand} />
                    <Row label="Rodado" value={t.size} mono />
                    <Row label="Ubicación" value={t.vehicle?.mobile || "En depósito"} valueColor={t.vehicle ? "var(--ink-blue)" : "var(--tx-4)"} />
                    <Row label="Km" value={fmtKm(t.kilometers)} mono strong />
                    <Row label="Actualizada" value={fmtDate(t.updatedAt)} mono />
                  </div>
                  <div className="flex border-t pt-[11px]" style={{ borderColor: "var(--bd-soft)", gap: "clamp(5px, 2.5cqi, 8px)", containerType: "inline-size" }} onClick={(e) => e.stopPropagation()}>
                    {!t.vehicle && metaOf(t.status).role !== "discard" && <OpActionBtn type="assign" full onClick={openDrawer(t._id, "assign")} />}
                    {t.vehicle && <OpActionBtn type="unassign" full onClick={openDrawer(t._id, "unassign")} />}
                    {metaOf(t.status).role === "recap" && <OpActionBtn type="recap" full onClick={openDrawer(t._id, "recap")} />}
                    <OpActionBtn type="view" square onClick={openDrawer(t._id)} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* ---------- TABLA ---------- */
          <div className="overflow-hidden rounded-[13px]" style={{ border: "1px solid var(--bd)", background: "var(--card)" }}>
            <div className="grid gap-3 px-[18px] py-3 text-[10.5px] font-semibold uppercase tracking-[.05em]" style={{ gridTemplateColumns: GRID_COLS, fontFamily: "'IBM Plex Mono'", background: "var(--elev)", borderBottom: "1px solid var(--bd)", color: "var(--tx-6)" }}>
              {COLUMNS.map((c) => {
                const active = sortBy === c.key
                return (
                  <div
                    key={c.key}
                    onClick={c.sort ? () => toggleSort(c.key) : undefined}
                    className={`flex items-center gap-1 ${c.align === "right" ? "justify-end" : ""}`}
                    style={{ cursor: c.sort ? "pointer" : "default", color: active ? "var(--ink-lime)" : "var(--tx-6)" }}
                  >
                    {c.label}
                    {active && (
                      <ArrowUpwardRoundedIcon sx={{ fontSize: 13, transform: sortDir === "desc" ? "rotate(180deg)" : "none" }} />
                    )}
                  </div>
                )
              })}
            </div>
            {filtered.map((t) => {
              const m = metaOf(t.status)
              return (
                <div key={t._id} className="grid items-center gap-3 py-3 pl-[14px] pr-[18px]" style={{ gridTemplateColumns: GRID_COLS, borderLeft: `4px solid ${m.color}`, borderBottom: "1px solid var(--bd-faint)" }}>
                  <div className="cursor-pointer" onClick={openDrawer(t._id)}>
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
                  <div className="text-right text-[12px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-5)" }}>{fmtDate(t.updatedAt)}</div>
                  <div className="flex items-center justify-end gap-1.5">
                    {!t.vehicle && metaOf(t.status).role !== "discard" && <OpActionBtn type="assign" square size={36} onClick={openDrawer(t._id, "assign")} />}
                    {t.vehicle && <OpActionBtn type="unassign" square size={36} onClick={openDrawer(t._id, "unassign")} />}
                    {metaOf(t.status).role === "recap" && <OpActionBtn type="recap" square size={36} onClick={openDrawer(t._id, "recap")} />}
                    {!t.vehicle && metaOf(t.status).role !== "discard" && <OpActionBtn type="discard" square size={36} onClick={openDrawer(t._id, "discard")} />}
                    <OpActionBtn type="view" square size={36} onClick={openDrawer(t._id)} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {selectedId && <TireDrawer tireId={selectedId} initialAction={pendingAction} onClose={closeDrawer} />}
      {showAlta && <AltaDrawer onClose={() => setShowAlta(false)} />}
    </div>
  )
}

const Row = ({ label, value, valueColor, mono, strong }) => (
  <div className="flex justify-between">
    <span style={{ color: "var(--tx-5)" }}>{label}</span>
    <span style={{ color: valueColor || "var(--tx-2)", fontWeight: strong ? 600 : 500, fontFamily: mono ? "'IBM Plex Mono'" : undefined }}>{value}</span>
  </div>
)

export default Cubiertas
