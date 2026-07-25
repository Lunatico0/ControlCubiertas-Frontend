// Badge chico redondeado (rounded-full) para tipos/estados/contadores. Sólo centraliza la
// FORMA (pastilla inline). El tamaño/tipografía viene por `className` (default = el tamaño más
// común: px-2.5 py-[3px] text-[11px] font-semibold); pasá tu propio className para reemplazarlo
// y evitar colisiones de clases (no hay tailwind-merge). El color va por `style` (color/background).
const Pill = ({ children, className = "px-2.5 py-[3px] text-[11px] font-semibold", style, ...rest }) => (
  <span className={`inline-flex items-center rounded-full ${className}`} style={style} {...rest}>
    {children}
  </span>
)

export default Pill
