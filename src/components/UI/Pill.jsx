// Badge chico redondeado para tipos, estados, roles y contadores.
//
// t116: en la misma tabla de /admin/usuarios convivían TRES tratamientos — "VOS" a 9.5px en
// IBM Plex Mono con padding 1px 7px, "Administrador" a 11.5px en IBM Plex Sans con padding
// 3px 11px, y "Operario" igual pero con fondo sólido — más "PRÓXIMAMENTE" a 9px en el sidebar.
// Tres tamaños y dos familias en una fila. Ahora hay DOS tamaños, cada uno con su rol:
//
//   default  el badge normal: rol, tipo, estado. Tipografía del cuerpo.
//   "tag"    marca micro en versalita monoespaciada: "VOS", "PRÓXIMAMENTE", "CUSTOM".
//
// El color va por `style` (color/background). Un `className` propio reemplaza el tamaño, para
// los casos que ya lo venían pisando (no hay tailwind-merge, así que no se pueden mezclar).
const TAMANOS = {
  default: "px-2.5 py-[3px] text-[11px] font-semibold",
  tag: "px-2 py-[2px] text-[10px] font-semibold tracking-[.06em]",
}

const Pill = ({ children, size = "default", className, style, ...rest }) => (
  <span
    className={`inline-flex items-center rounded-full ${className ?? TAMANOS[size] ?? TAMANOS.default}`}
    style={size === "tag" ? { fontFamily: "var(--font-mono)", ...style } : style}
    {...rest}
  >
    {children}
  </span>
)

export default Pill
