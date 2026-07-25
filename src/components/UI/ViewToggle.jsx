import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded"
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded"

// Toggle de vista (tarjetas / lista) reutilizable: contenedor con borde + N botones cuadrados;
// el activo se pinta con --ink-lime sobre --bg. Centraliza el patrón que estaba duplicado en
// Cubiertas y Vehículos. Los `options` traen su value/title/icon; se puede pasar un set propio.
const DEFAULT_OPTIONS = [
  { value: "grid", title: "Tarjetas", icon: <GridViewRoundedIcon sx={{ fontSize: 17 }} /> },
  { value: "table", title: "Lista", icon: <ViewListRoundedIcon sx={{ fontSize: 17 }} /> },
]

const ViewToggle = ({ value, onChange, options = DEFAULT_OPTIONS, className = "", ...rest }) => (
  <div className={`flex gap-[3px] rounded-[9px] p-[3px] ${className}`} style={{ border: "1px solid var(--bd)", background: "var(--card)" }} {...rest}>
    {options.map((o) => {
      const on = value === o.value
      return (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          title={o.title}
          className="inline-flex h-8 w-[38px] items-center justify-center rounded-md"
          style={{ background: on ? "var(--ink-lime)" : "transparent", color: on ? "var(--bg)" : "var(--tx-5)" }}
        >
          {o.icon}
        </button>
      )
    })}
  </div>
)

export default ViewToggle
