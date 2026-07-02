// Helpers compartidos de la operativa: catálogo de estados (color + nivel + rol),
// badge, pips y formateadores. Los estados son CONFIGURABLES por tenant: el catálogo se
// arma desde tenant.stockStatuses ([{name,role}]) y lo setea ApiProvider al cargar, vía
// setStatusCatalog(). El color es automático por rol + posición en la escalera (no se
// configura). metaOf() lee el catálogo del módulo (evita prop-drilling y ciclos de import).

// Paleta de la escalera (initial + stock) por posición; cicla si hay más estados que colores.
const STOCK_PALETTE = ["--st-lime", "--st-teal", "--st-blue", "--st-purple"]
const FALLBACK = { color: "var(--tx-5)", level: 0, role: "stock" }

// Color por rol: recap y discard tienen color fijo (semántica); initial/stock por posición.
export const colorForStatus = (role, stockIndex) => {
  if (role === "recap") return "var(--st-orange)"
  if (role === "discard") return "var(--st-red)"
  return `var(${STOCK_PALETTE[stockIndex % STOCK_PALETTE.length]})`
}

// Construye el mapa nombre → {color, level, role} desde la config del tenant [{name,role}].
// level = posición dentro de la escalera (initial=0, 1er stock=1, ...), alimenta los pips.
export const buildStatusMeta = (statuses = []) => {
  const meta = {}
  let stockIndex = 0
  for (const s of statuses) {
    if (!s?.name) continue
    const isScale = s.role === "initial" || s.role === "stock"
    const idx = isScale ? stockIndex++ : 0
    // color persistido (preset/custom del panel) o, si no hay, el automático por rol+posición.
    meta[s.name] = { color: s.color || colorForStatus(s.role, idx), level: idx, role: s.role }
  }
  return meta
}

// Catálogo activo del tenant (seteado por ApiProvider al cargar la empresa).
let _catalog = {}
export const setStatusCatalog = (catalog) => { _catalog = catalog || {} }
export const getStatusCatalog = () => _catalog

export const metaOf = (status) => _catalog[status] || FALLBACK
export const tint = (color, pct) => `color-mix(in srgb, ${color} ${pct}%, transparent)`
export const fmtKm = (n) => `${(n ?? 0).toLocaleString("es-AR")} km`
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("es-AR") : "—")

export const StateBadge = ({ status, small }) => {
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

export const Pips = ({ level }) => (
  <div className="flex gap-[5px]">
    {[0, 1, 2].map((i) => (
      <span key={i} className="rounded-[3px]" style={{ width: 18, height: 6, background: i < level ? "var(--st-teal)" : "var(--bd-strong)" }} />
    ))}
  </div>
)
