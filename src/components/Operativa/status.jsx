import { useSyncExternalStore } from "react"

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

// Catálogo activo del tenant (lo setea ApiProvider al cargar la empresa).
//
// Vive fuera de React a propósito: metaOf() se usa en montones de lugares y pasarlo por props
// sería prop-drilling por toda la operativa. Pero la carga es ASYNC y compite con la de
// cubiertas: si las cubiertas ganan la carrera, el primer render sale con el FALLBACK. Antes
// eso quedaba así hasta que cualquier otro cambio forzara un render, y se veía como badges
// todos grises, el contador de "a recapar" en cero y el stepper del drawer vacío.
//
// Por eso el módulo es un STORE SUSCRIBIBLE: quien lo consuma en render llama a
// useStatusCatalog() y React lo vuelve a pintar solo cuando el catálogo llega o cambia.
let _catalog = {}
const suscriptores = new Set()

export const setStatusCatalog = (catalog) => {
  _catalog = catalog || {}
  suscriptores.forEach((fn) => fn())
}

const suscribir = (fn) => {
  suscriptores.add(fn)
  return () => suscriptores.delete(fn)
}

const leerCatalogo = () => _catalog

// Suscribe el componente a los cambios del catálogo. Devuelve el catálogo, pero lo que
// importa es el efecto: sin esto, un componente que use metaOf() no se entera de que llegó.
export const useStatusCatalog = () => useSyncExternalStore(suscribir, leerCatalogo, leerCatalogo)

export const metaOf = (status) => _catalog[status] || FALLBACK
export const tint = (color, pct) => `color-mix(in srgb, ${color} ${pct}%, transparent)`
export const fmtKm = (n) => `${(n ?? 0).toLocaleString("es-AR")} km`
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("es-AR") : "—")

export const StateBadge = ({ status, small, truncate }) => {
  useStatusCatalog() // repinta cuando llega/cambia el catálogo del tenant
  const m = metaOf(status)
  return (
    <span
      className="inline-flex max-w-full items-center gap-1.5 rounded-full font-semibold"
      style={{ color: m.color, background: tint(m.color, 14), padding: small ? "3px 10px" : "4px 10px", fontSize: "11.5px" }}
      title={truncate ? status : undefined}
    >
      <span className="rounded-full" style={{ width: 6, height: 6, background: m.color, flex: "none" }} />
      {/* En vistas angostas (lista) el texto se trunca con "…" en vez de desbordar/wrappear. */}
      <span style={truncate ? { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } : undefined}>{status}</span>
    </span>
  )
}

// Escalera de recapados del tenant: los estados de rol "stock" ordenados por nivel, con
// su color. La cantidad = recapados posibles (configurables en el panel admin).
export const recapScale = () =>
  Object.values(_catalog)
    .filter((m) => m.role === "stock")
    .sort((a, b) => a.level - b.level)
    .map((m) => m.color)

// Pips de recapado: un chip por recapado posible; prendidos = nivel de recapado de la
// cubierta (level), cada chip con el color de SU recapado. Apagados = gris.
export const Pips = ({ level = 0 }) => {
  useStatusCatalog() // idem: la escalera de recapados sale del catálogo
  const colors = recapScale()
  if (!colors.length) return null
  return (
    <div className="flex gap-[5px]">
      {colors.map((c, i) => (
        <span key={i} className="rounded-[3px]" style={{ width: 18, height: 6, background: i < level ? c : "var(--bd-strong)" }} />
      ))}
    </div>
  )
}
