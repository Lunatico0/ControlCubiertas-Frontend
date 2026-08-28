import { button } from "@utils/tokens"
import { buttonLegacy } from "@utils/legacyTokens"

// Botón compartido. El DEFAULT es lima, que es el primario real del sistema (t119): antes
// caía en `button.primary`, un bg-blue-600 de la paleta anterior — o sea que un <Button> sin
// variant salía azul en una app que no tiene azul primario, y era una vía viva desde el
// rediseño hacia la paleta que ART-DIRECTION pone en la lista negra.
//
// Las variantes legacy siguen disponibles POR NOMBRE (primary, secondary, danger…) para las
// pantallas de /legacy/*, que se retiran con ellas. Código nuevo: usar lima, o los tokens CSS.
const VARIANTES = { ...buttonLegacy, ...button }

const Button = ({ variant = "lime", children, className = "", ...props }) => {
  const variantStyle = VARIANTES[variant] || VARIANTES.lime
  return (
    <button className={`${variantStyle} ${className}`} {...props}>
      {children}
    </button>
  )
}

export default Button
