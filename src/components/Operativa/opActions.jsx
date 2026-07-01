import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined"
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded"
import LocalPrintshopOutlinedIcon from "@mui/icons-material/LocalPrintshopOutlined"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"
import { tint } from "./status"

// Action buttons de la operativa, con el estilo de Claude Design (App Operativa.dc.html):
// label + ícono + color por tipo. Un solo lugar para que cards, drawer y tabla
// compartan exactamente el mismo look. `full` = flex:1 (barra), `square` = solo ícono.
const TONES = {
  lime: { bd: "var(--bd-strong)", bg: "var(--elev)", fg: "var(--ink-lime)", hover: "var(--ink-lime)" },
  neutral: { bd: "var(--bd-strong)", bg: "var(--elev)", fg: "var(--tx)", hover: "var(--bd-hover)" },
  muted: { bd: "var(--bd-strong)", bg: "var(--elev)", fg: "var(--tx-3)", hover: "var(--bd-hover)" },
  teal: { bd: tint("var(--ink-teal)", 40), bg: tint("var(--ink-teal)", 10), fg: "var(--ink-teal)", hover: "var(--ink-teal)" },
  red: { bd: tint("var(--ink-red)", 35), bg: tint("var(--ink-red)", 8), fg: "var(--ink-red)", hover: "var(--ink-red)" },
}

const ACTIONS = {
  assign: { label: "Asignar", Icon: LocalShippingOutlinedIcon, tone: "lime" },
  unassign: { label: "Desasignar", Icon: RemoveRoundedIcon, tone: "neutral" },
  recap: { label: "Recapado listo", Icon: CheckRoundedIcon, tone: "teal" },
  discard: { label: "Descartar", Icon: DeleteOutlineRoundedIcon, tone: "red" },
  print: { label: "Imprimir recibo", Icon: LocalPrintshopOutlinedIcon, tone: "neutral" },
  view: { label: "Ver detalle", Icon: VisibilityOutlinedIcon, tone: "muted" },
}

export const OpActionBtn = ({ type, onClick, disabled, full, square, size = 40 }) => {
  const a = ACTIONS[type]
  const T = TONES[a.tone]
  const label = !square ? a.label : null
  // En botones `full` (barra de la tarjeta) el padding y el gap son ADAPTATIVOS: se
  // encogen con el ancho de la card (unidad cqi, requiere container en el contenedor)
  // entre un mínimo y un máximo, para que nunca desborden. minWidth:0 + ellipsis es la
  // red de seguridad final. En botones fijos/square el padding es constante.
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={a.label}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.hover; if (a.tone === "muted") e.currentTarget.style.color = "var(--tx)" }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.bd; if (a.tone === "muted") e.currentTarget.style.color = T.fg }}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        gap: label ? (full ? "clamp(4px, 2.2cqi, 7px)" : 7) : 0,
        height: size, width: square ? size : undefined, flex: full ? 1 : "none",
        minWidth: full ? 0 : undefined,
        padding: label ? (full ? "0 clamp(6px, 3.6cqi, 14px)" : "0 14px") : 0,
        border: `1px solid ${T.bd}`, background: T.bg, color: T.fg, borderRadius: 9,
        fontSize: 13, fontWeight: 600, fontFamily: "'IBM Plex Sans'",
        cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.55 : 1, overflow: "hidden",
      }}
    >
      <a.Icon sx={{ fontSize: square ? 17 : 16, flexShrink: 0 }} />
      {label && <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{label}</span>}
    </button>
  )
}
