// Helpers compartidos de la operativa: mapa de estado → color del design system +
// nivel de recapado, badge de estado, pips y formateadores. Usados por el inventario
// (Cubiertas) y el drawer de detalle (TireDrawer).

export const STATUS_META = {
  "Nueva": { color: "var(--st-lime)", level: 0 },
  "1er Recapado": { color: "var(--st-teal)", level: 1 },
  "2do Recapado": { color: "var(--st-blue)", level: 2 },
  "3er Recapado": { color: "var(--st-purple)", level: 3 },
  "A recapar": { color: "var(--st-orange)", level: 0 },
  "Descartada": { color: "var(--st-red)", level: 0 },
}

export const metaOf = (status) => STATUS_META[status] || { color: "var(--tx-5)", level: 0 }
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
