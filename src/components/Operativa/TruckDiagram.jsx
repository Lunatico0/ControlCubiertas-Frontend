import { tint } from "./status"
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded"
import TripOriginOutlinedIcon from "@mui/icons-material/TripOriginOutlined"
import MonoLabel from "@components/UI/MonoLabel"

// Preview del esquema de ejes (vista superior del camión), compartido por NuevoVehiculo y
// ConfigurarEjes: encabezado "ESQUEMA · <tipo>", flecha FRENTE, diagrama de ruedas (una Wheel
// por posición sobre el eje central) y tarjeta de stats (posiciones + cantidad de ejes).
// Las diferencias sutiles de espaciado/textos entre ambas pantallas llegan por props
// (subtitle, spineClass, axlesGapClass, statsMarginClass, positionsLabel). Se pasan como
// strings de clases COMPLETAS (no interpoladas) para que el scanner de Tailwind las detecte.
const Wheel = ({ label }) => (
  <div className="relative" style={{ width: 17, height: 34 }}>
    <div className="h-[34px] w-[17px] rounded-[var(--r-sm)]" style={{ border: "2px solid var(--bd-hover)", background: "var(--elev)" }} />
    {label && <span className="absolute left-1/2 -translate-x-1/2 text-[8px]" style={{ top: 38, fontFamily: "var(--font-mono)", color: "var(--tx-7)" }}>{label}</span>}
  </div>
)

const TruckDiagram = ({
  axles,
  total,
  isCustom,
  typeName,
  subtitle,
  spineClass,
  axlesGapClass,
  statsMarginClass,
  positionsLabel,
}) => (
  <div className="flex flex-1 flex-col items-center overflow-y-auto px-6 py-[30px]" style={{ background: "var(--hover)" }}>
    <MonoLabel className="mb-1.5 flex items-center gap-2 self-start text-[11px]" style={{ color: "var(--tx-5)" }}>
      <span className="h-[7px] w-[7px] rounded-full" style={{ background: "var(--ink-lime)" }} />ESQUEMA · {isCustom ? "Personalizado" : typeName}
    </MonoLabel>
    <div className="mb-[22px] self-start text-[12.5px]" style={{ color: "var(--tx-6)" }}>{subtitle}</div>

    {/* FRENTE */}
    <div className="mb-2 flex flex-col items-center gap-1.5">
      <MonoLabel as="span" className="text-[10px] tracking-widest" style={{ color: "var(--tx-6)" }}>FRENTE</MonoLabel>
      <span style={{ color: "var(--tx-7)" }} className="inline-flex"><ArrowUpwardRoundedIcon sx={{ fontSize: 16 }} /></span>
    </div>

    {/* diagrama */}
    <div className="relative py-1.5">
      <div className={`absolute left-1/2 ${spineClass} w-11 -translate-x-1/2 rounded-[var(--r-lg)]`} style={{ background: "var(--bd-2)", border: "1px solid var(--bd-strong)" }} />
      <div className={`relative z-1 flex flex-col ${axlesGapClass}`}>
        {axles.map((t, i) => {
          const dual = t === "dual"
          const moto = t === "moto"
          const left = dual ? ["IE", "II"] : ["I"]
          const right = dual ? ["DI", "DE"] : ["D"]
          if (moto) {
            return (
              <div key={i} className="flex items-center justify-center">
                <div className="rounded-[var(--r-sm)]" style={{ width: 15, height: 38, border: "2px solid var(--bd-hover)", background: "var(--elev)" }} />
              </div>
            )
          }
          return (
            <div key={i} className="flex items-center justify-center">
              <div className="flex gap-1">{left.map((l) => <Wheel key={l} label={l} />)}</div>
              <div className="h-[5px] w-[66px] rounded-[var(--r-sm)]" style={{ background: "var(--bd-strong)" }} />
              <div className="flex gap-1">{right.map((l) => <Wheel key={l} label={l} />)}</div>
            </div>
          )
        })}
      </div>
    </div>

    {/* stats */}
    <div className={`${statsMarginClass} flex items-center gap-2.5 rounded-[var(--r-md)] px-4 py-[11px]`} style={{ border: "1px solid var(--bd)", background: "var(--elev)" }}>
      <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[var(--r-md)]" style={{ background: tint("var(--ink-lime)", 13), color: "var(--ink-lime)" }}><TripOriginOutlinedIcon sx={{ fontSize: 17 }} /></span>
      <div style={{ lineHeight: 1.2 }}>
        <div className="text-[18px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--tx)" }}>{total}</div>
        <div className="text-[11.5px]" style={{ color: "var(--tx-4)" }}>{positionsLabel}</div>
      </div>
      <div className="mx-1 h-[30px] w-px" style={{ background: "var(--bd)" }} />
      <div style={{ lineHeight: 1.2 }}>
        <div className="text-[18px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--tx)" }}>{axles.length}</div>
        <div className="text-[11.5px]" style={{ color: "var(--tx-4)" }}>ejes</div>
      </div>
    </div>
  </div>
)

export default TruckDiagram
