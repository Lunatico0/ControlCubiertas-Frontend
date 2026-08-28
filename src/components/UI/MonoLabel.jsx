// Label monoespaciado (IBM Plex Mono): típicamente títulos de sección en mayúsculas con
// tracking y color tenue ("DATOS DEL VEHÍCULO", "EJES (N)", "POSICIONES"…). Sólo aplica la
// fuente mono; el tamaño/color/tracking/margen va por `className` y `style` según el caso.
// `as` permite renderizar span en vez de div (labels inline).
const MonoLabel = ({ children, className = "", style, as: Tag = "div", ...rest }) => (
  <Tag className={className} style={{ fontFamily: "var(--font-mono)", ...style }} {...rest}>
    {children}
  </Tag>
)

export default MonoLabel
