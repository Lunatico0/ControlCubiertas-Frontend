import { tiresOf } from "./vehicleTypes"
import { tint } from "./status"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import Button from "@components/common/Button"
import Pill from "@components/common/Pill"
import MonoLabel from "@components/common/MonoLabel"

// Panel de controles del editor de ejes, compartido por NuevoVehiculo y ConfigurarEjes:
//  - Sección "TIPO DE VEHÍCULO": grid de presets del catálogo (presets + custom del tenant)
//    + caja "Esquema personalizado" para nombrar/guardar un layout no reconocido.
//  - Sección "EJES": una fila por eje (toggle Simple/Dual o "Rueda única" en moto) + quitar,
//    y botón "Agregar eje".
// El bloqueo por eje ocupado (isAxleLocked) SOLO lo usa ConfigurarEjes: los ejes con cubierta
// montada se pintan en naranja, se deshabilitan sus controles y no se pueden quitar. En el alta
// isAxleLocked es () => false → nada bloqueado (mismo render que antes).
const AxleEditor = ({
  catalog,
  matchedKey,
  applyPreset,
  isCustom,
  customName,
  setCustomName,
  savingType,
  saveCustomType,
  axles,
  total,
  addAxle,
  removeAxle,
  setAxleType,
  isAxleLocked = () => false,
  // t139: por qué NO se puede aplicar este preset (string) o null si sí se puede. Lo provee
  // ConfigurarEjes cruzando las posiciones ocupadas contra el layout del preset; en el alta no
  // hay nada montado, así que el default deja todo habilitado.
  motivoPreset = () => null,
}) => (
  <>
    {/* TIPO DE VEHÍCULO (derivado de los ejes) */}
    <div className="px-6 py-[22px]" style={{ borderBottom: "1px solid var(--bd-faint)" }}>
      <MonoLabel className="mb-1.5 text-[10px] tracking-[.12em]" style={{ color: "var(--tx-6)" }}>TIPO DE VEHÍCULO</MonoLabel>
      <div className="mb-3.5 text-[11.5px]" style={{ color: "var(--tx-6)" }}>El tipo se deriva de los ejes. Elegí uno y ajustá abajo, o armá el tuyo.</div>
      <div className="flex flex-wrap gap-2">
        {Object.keys(catalog).map((k) => {
          const p = catalog[k]
          const on = matchedKey === k
          // El preset que YA está aplicado nunca se bloquea: es el estado actual del vehículo.
          const motivo = on ? null : motivoPreset(p.axles)
          const bloqueado = !!motivo
          return (
            <button
              key={k}
              onClick={bloqueado ? undefined : applyPreset(k)}
              disabled={bloqueado}
              title={motivo || undefined}
              aria-disabled={bloqueado || undefined}
              className="flex min-w-[104px] flex-col items-start gap-0.5 rounded-[var(--r-md)] px-[13px] py-2.5"
              style={{
                border: `1px solid ${on ? "var(--ink-lime)" : "var(--bd)"}`,
                background: on ? tint("var(--ink-lime)", 8) : "var(--input)",
                opacity: bloqueado ? 0.45 : 1,
                cursor: bloqueado ? "not-allowed" : "pointer",
              }}
            >
              <span className="flex items-center gap-1.5 text-[13px] font-bold" style={{ fontFamily: "var(--font-display)", color: on ? "var(--ink-lime)" : "var(--tx)" }}>
                {p.label}
                {p.custom && <Pill className="px-1.5 py-px text-[8.5px] font-semibold" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-purple)", background: tint("var(--ink-purple)", 16) }}>CUSTOM</Pill>}
              </span>
              <span className="text-[10.5px]" style={{ fontFamily: "var(--font-mono)", color: on ? "var(--ink-lime)" : "var(--tx-5)" }}>{tiresOf(p.axles)} cubiertas</span>
              {bloqueado && (
                <span className="mt-0.5 text-[10px] leading-tight" style={{ color: "var(--ink-orange)" }}>Hay cubiertas montadas</span>
              )}
            </button>
          )
        })}
      </div>

      {isCustom && (
        <div className="mt-3.5 rounded-[var(--r-md)] p-[13px]" style={{ border: "1.5px dashed var(--ink-lime)", background: tint("var(--ink-lime)", 6) }}>
          <div className="text-[12.5px] font-semibold" style={{ color: "var(--tx)" }}>Esquema personalizado</div>
          <div className="mt-1 text-[11.5px]" style={{ color: "var(--tx-5)" }}>No coincide con ningún tipo conocido. Dale un nombre para guardarlo y reusarlo.</div>
          <div className="mt-2.5 flex gap-2">
            <input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Ej. Bitrén 7 ejes" className="h-10 flex-1 rounded-[var(--r-md)] px-3 text-[13px] outline-none" style={{ background: "var(--input)", border: "1.5px solid var(--bd)", color: "var(--tx)" }} />
            <Button variant="lime" onClick={saveCustomType} disabled={savingType} className="h-10 text-[12.5px]" style={{ background: "var(--brand)", color: "var(--brand-ink)", opacity: savingType ? 0.6 : 1 }}>{savingType ? "Guardando…" : "Guardar tipo"}</Button>
          </div>
        </div>
      )}
    </div>

    {/* EJES */}
    <div className="px-6 pb-7 pt-[22px]">
      <div className="mb-3.5 flex items-center">
        <MonoLabel className="text-[10px] tracking-[.12em]" style={{ color: "var(--tx-6)" }}>EJES ({axles.length})</MonoLabel>
        <span className="ml-auto text-[11.5px]" style={{ fontFamily: "var(--font-mono)", color: "var(--ink-lime)" }}>{total} cubiertas</span>
      </div>
      <div className="flex flex-col gap-[9px]">
        {axles.map((t, i) => {
          const dual = t === "dual"
          const moto = t === "moto"
          const locked = isAxleLocked(i)
          const canRemove = axles.length > 1 && !locked
          const seg = (on) => ({ background: on ? "var(--ink-lime)" : "transparent", color: on ? "var(--bg)" : "var(--tx-3)", cursor: locked ? "not-allowed" : "pointer" })
          const sub = (i === 0 ? "Dirección · " : "") + (moto ? "Rueda única (1 cubierta)" : dual ? "Dual (4 cubiertas)" : "Simple (2 cubiertas)")
          return (
            <div key={i} className="flex items-center gap-[11px] rounded-[var(--r-md)] px-[13px] py-[11px]" style={{ border: `1px solid ${locked ? tint("var(--ink-orange)", 35) : "var(--bd)"}`, background: locked ? tint("var(--ink-orange)", 7) : "var(--input)" }}>
              <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[var(--r-sm)] text-[12px] font-semibold" style={{ background: "var(--bd-2)", fontFamily: "var(--font-mono)", color: "var(--tx-2)" }}>{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: "var(--tx)" }}>Eje {i + 1}{locked && <LockOutlinedIcon sx={{ fontSize: 13, color: "var(--ink-orange)" }} />}</div>
                <div className="text-[11px]" style={{ color: locked ? "var(--ink-orange)" : "var(--tx-5)" }}>{locked ? "Cubierta montada — desasigná para reconfigurar" : sub}</div>
              </div>
              {moto ? (
                <span className="inline-flex h-[30px] items-center rounded-[var(--r-sm)] px-[13px] text-[12px] font-semibold" style={{ background: tint("var(--ink-lime)", 10), color: "var(--ink-lime)" }}>Rueda única</span>
              ) : (
                <div className="flex gap-1 rounded-[var(--r-md)] p-[3px]" style={{ border: "1px solid var(--bd-strong)", background: "var(--bg)", opacity: locked ? 0.5 : 1 }}>
                  <button onClick={() => setAxleType(i, "simple")} disabled={locked} className="h-[30px] rounded-[var(--r-sm)] px-[11px] text-[12px] font-semibold" style={seg(!dual)}>Simple</button>
                  <button onClick={() => setAxleType(i, "dual")} disabled={locked} className="h-[30px] rounded-[var(--r-sm)] px-[11px] text-[12px] font-semibold" style={seg(dual)}>Dual</button>
                </div>
              )}
              <button onClick={() => removeAxle(i)} disabled={!canRemove} title={locked ? "Eje con cubierta — desasigná primero" : "Quitar eje"} className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-[var(--r-md)]" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: canRemove ? "var(--ink-red)" : "var(--bd-hover)", cursor: canRemove ? "pointer" : "not-allowed" }}>
                <RemoveRoundedIcon sx={{ fontSize: 15 }} />
              </button>
            </div>
          )
        })}
      </div>
      <button onClick={addAxle} className="mt-[11px] inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--r-md)] text-[13.5px] font-semibold" style={{ border: "1px dashed var(--bd-hover)", background: "transparent", color: "var(--ink-lime)" }}>
        <AddRoundedIcon sx={{ fontSize: 16 }} /> Agregar eje
      </button>
    </div>
  </>
)

export default AxleEditor
