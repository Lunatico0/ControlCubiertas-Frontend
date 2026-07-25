// Callout — bloque de aviso reutilizable (borde + fondo teñidos del mismo tono + ícono
// opcional + texto). Promovido desde GuiaShell para unificar los avisos ad-hoc que estaban
// dispersos por la app. Fórmula visual: borde a 30% de opacidad del `tone` y fondo a 7%
// (color-mix), de modo que un solo color semántico define todo el bloque.
//
// Props:
//   - tone: CSS var (o color) del que se derivan borde, fondo e ícono. Ej: var(--ink-blue).
//   - Icon: componente de ícono MUI (OPCIONAL — algunos avisos no llevan ícono).
//   - dashed: borde punteado en vez de sólido (avisos "por-tarjeta"/placeholder).
//   - className: overridea el margen por defecto (mt-3.5) según el contexto de uso.
const Callout = ({ Icon, tone, dashed = false, className = "mt-3.5", children }) => (
  <div
    className={`flex gap-[11px] rounded-[11px] px-4 py-3.5 ${className}`}
    style={{
      border: `1px ${dashed ? "dashed" : "solid"} color-mix(in srgb, ${tone} 30%, transparent)`,
      background: `color-mix(in srgb, ${tone} 7%, transparent)`,
    }}
  >
    {Icon && (
      <span className="inline-flex flex-none" style={{ color: tone }}>
        <Icon sx={{ fontSize: 18 }} />
      </span>
    )}
    <div className="text-[13.5px]" style={{ lineHeight: 1.6, color: "var(--tx-2)" }}>{children}</div>
  </div>
)

export default Callout
