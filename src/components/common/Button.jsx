import { button } from "@utils/tokens"

// Botón compartido de la app. Una sola variante viva: el lima del sistema.
//
// Hasta el borrado de la UI legacy (2026-08-28) este componente servía a los dos mundos y su
// DEFAULT era `button.primary`, un bg-blue-600 de la paleta anterior — o sea que un <Button>
// sin variant salía azul en una app que no tiene azul primario. Con la paleta legacy fuera,
// `variant` queda como punto de extensión para cuando haga falta una segunda variante real
// (secundaria, destructiva), no como el resto de un sistema muerto.
const Button = ({ variant = "lime", children, className = "", ...props }) => (
  <button className={`${button[variant] || button.lime} ${className}`} {...props}>
    {children}
  </button>
)

export default Button
