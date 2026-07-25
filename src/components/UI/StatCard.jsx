// Tarjeta de métrica (valor grande + label + ícono tintado). Dos variantes que replican los
// dos looks que ya existían en el portal admin, sin cambiar píxeles:
//  - "stacked" (Dashboard): label y valor juntos arriba a la izquierda, ícono arriba a la derecha,
//    sublabel al pie. Padding p-5, radio xl, valor 3xl.
//  - "spread" (Reportes): label + ícono arriba, valor + sublabel abajo, altura mínima 120.
// El fondo del ícono es un color-mix del `tint` (mismo helper que usaban ambas copias).
const mix = (c, pct) => `color-mix(in srgb, ${c} ${pct}%, transparent)`

const StatCard = ({ icon, tint, value, label, sublabel, variant = "stacked", className = "" }) => {
  if (variant === "spread") {
    return (
      <div className={`flex flex-col justify-between rounded-[14px] p-[18px_20px] ${className}`} style={{ background: "var(--card)", border: "1px solid var(--bd)", minHeight: 120 }}>
        <div className="flex items-start justify-between">
          <span className="text-[13px]" style={{ color: "var(--tx-4)" }}>{label}</span>
          {icon && <span className="flex flex-none items-center justify-center rounded-[9px]" style={{ width: 32, height: 32, background: mix(tint, 14), color: tint }}>{icon}</span>}
        </div>
        <div>
          <div className="font-display text-[26px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>{value}</div>
          {sublabel && <div className="mt-0.5 text-[12px]" style={{ color: "var(--tx-6)" }}>{sublabel}</div>}
        </div>
      </div>
    )
  }
  // variant "stacked" (default)
  return (
    <div className={`rounded-xl p-5 ${className}`} style={{ background: "var(--card)", border: "1px solid var(--bd)" }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm" style={{ color: "var(--tx-4)" }}>{label}</p>
          <p className="mt-1 font-display text-3xl font-bold" style={{ color: "var(--tx)", fontFamily: "'Space Grotesk'" }}>{value}</p>
        </div>
        {icon && <span className="grid h-11 w-11 place-items-center rounded-lg" style={{ background: mix(tint, 12), color: tint }}>{icon}</span>}
      </div>
      {sublabel && <p className="mt-3 text-xs" style={{ color: "var(--tx-6)" }}>{sublabel}</p>}
    </div>
  )
}

export default StatCard
