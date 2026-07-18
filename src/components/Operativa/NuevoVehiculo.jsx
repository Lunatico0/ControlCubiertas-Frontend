import { useState, useEffect, useContext, useMemo } from "react"
import ApiContext from "@context/apiContext"
import { showToast } from "@utils/toast"
import { getVehicleTypes, createVehicleType } from "@api/vehicles"
import { buildCatalog, matchType, tiresOf } from "./vehicleTypes"
import { tint } from "./status"
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded"
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded"
import TripOriginRoundedIcon from "@mui/icons-material/TripOriginRounded"

// Alta de vehículo (rediseño Claude Design). Pantalla dedicada: datos + configuración de
// ejes con preview en vivo. El TIPO ya NO se elige a mano: se DERIVA del layout de ejes
// (catálogo compartido en vehicleTypes.js = presets + custom del tenant); si no coincide con
// ninguno, se puede nombrar y guardar como tipo custom. Crea con vehicles.create → POST
// /api/vehicles { mobile, licensePlate, brand, type (derivado), kilometers, axles }.
const NuevoVehiculo = ({ onClose, onCreated }) => {
  const { vehicles } = useContext(ApiContext)
  const [form, setForm] = useState({ movil: "", patente: "", marca: "", km: "" })
  const [axles, setAxles] = useState(["simple", "dual"])
  const [customTypes, setCustomTypes] = useState([])
  const [customName, setCustomName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [savingType, setSavingType] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    getVehicleTypes().then((r) => setCustomTypes(Array.isArray(r) ? r : [])).catch(() => {})
  }, [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const catalog = useMemo(() => buildCatalog(customTypes), [customTypes])
  const matchedKey = useMemo(() => matchType(catalog, axles, null), [catalog, axles])
  const isCustom = matchedKey === "custom"
  const typeName = isCustom ? "" : catalog[matchedKey].label
  const total = useMemo(() => tiresOf(axles), [axles])

  const applyPreset = (key) => () => setAxles(catalog[key].axles.slice())
  const addAxle = () => setAxles((a) => [...a, "dual"])
  const removeAxle = (i) => setAxles((a) => (a.length <= 1 ? a : a.filter((_, idx) => idx !== i)))
  const setAxleType = (i, type) => setAxles((a) => a.map((t, idx) => (idx === i ? type : t)))

  const valid = form.movil.trim() && form.patente.trim()

  const saveCustomType = async () => {
    const name = customName.trim()
    if (!name) return showToast("warning", "Poné un nombre para el tipo")
    setSavingType(true)
    try {
      await createVehicleType({ name, axles: axles.slice() })
      const list = await getVehicleTypes()
      setCustomTypes(Array.isArray(list) ? list : [])
      setCustomName("")
      showToast("success", `Tipo "${name}" guardado`)
    } catch (e) {
      showToast("error", e?.response?.data?.message || e.message || "No se pudo guardar el tipo")
    } finally {
      setSavingType(false)
    }
  }

  const submit = async () => {
    if (!valid) return showToast("warning", "Completá móvil y patente")
    setSubmitting(true)
    try {
      await vehicles.create({
        mobile: form.movil.trim(),
        licensePlate: form.patente.trim().toUpperCase(),
        brand: form.marca.trim() || "—",
        type: isCustom ? (customName.trim() || "Personalizado") : typeName,
        kilometers: Number(form.km) || 0,
        axles: axles.map((t) => ({ type: t })),
        tires: [],
      })
      showToast("success", `Vehículo creado · ${total} posiciones`)
      onCreated?.()
      onClose()
    } catch (e) {
      showToast("error", e?.response?.data?.message || e.message || "No se pudo crear el vehículo")
    } finally {
      setSubmitting(false)
    }
  }

  const inputBase = "w-full rounded-lg px-3 text-[14px] outline-none"
  const inputStyle = { height: 42, background: "var(--input)", border: "1px solid var(--bd-strong)", color: "var(--tx)" }
  const onFocusLime = (e) => (e.target.style.borderColor = "var(--ink-lime)")
  const onBlurBd = (e) => (e.target.style.borderColor = "var(--bd-strong)")
  const labelCls = "mb-1.5 block text-[11.5px] font-semibold"
  const sectionLabel = "mb-4 text-[10px] tracking-[.12em]"
  const sectionLabelStyle = { fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }

  return (
    <div className="fixed inset-y-0 right-0 left-[248px] z-60 flex flex-col" style={{ background: "var(--bg)", borderLeft: "1px solid var(--bd-faint)" }}>
      {/* ===== TOP BAR ===== */}
      <div className="flex h-16 flex-none items-center gap-3.5 px-6" style={{ background: "var(--sidebar)", borderBottom: "1px solid var(--bd-faint)" }}>
        <button onClick={onClose} title="Volver" className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-[9px]" style={{ border: "1px solid var(--bd)", background: "var(--elev)", color: "var(--tx-3)" }}>
          <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
        </button>
        <div style={{ lineHeight: 1.2 }}>
          <div className="text-[17px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>Nuevo vehículo</div>
          <div className="text-[11.5px]" style={{ color: "var(--tx-5)", fontFamily: "'IBM Plex Mono'" }}>Vehículos · Alta</div>
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          <button onClick={onClose} className="h-10 rounded-[9px] px-[15px] text-[13.5px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx)" }}>Cancelar</button>
          <button onClick={submit} disabled={!valid || submitting} className="h-10 rounded-[9px] px-[18px] text-[13.5px] font-bold" style={{ background: valid ? "var(--ink-lime)" : "var(--bd-2)", color: valid ? "var(--bg)" : "var(--tx-7)", cursor: valid ? "pointer" : "not-allowed", opacity: submitting ? 0.6 : 1 }}>
            {submitting ? "Creando…" : "Crear vehículo"}
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* ===== FORM ===== */}
        <div className="w-[440px] flex-none overflow-y-auto" style={{ background: "var(--elev)", borderRight: "1px solid var(--bd)" }}>
          {/* DATOS */}
          <div className="px-6 py-[22px]" style={{ borderBottom: "1px solid var(--bd-faint)" }}>
            <div className={sectionLabel} style={sectionLabelStyle}>DATOS DEL VEHÍCULO</div>
            <div className="grid grid-cols-2 gap-[13px]">
              <label className="block"><span className={labelCls} style={{ color: "var(--tx-4)" }}>Móvil / Identificador</span><input value={form.movil} onChange={set("movil")} placeholder="Móvil 07" className={inputBase} style={inputStyle} onFocus={onFocusLime} onBlur={onBlurBd} /></label>
              <label className="block"><span className={labelCls} style={{ color: "var(--tx-4)" }}>Patente</span><input value={form.patente} onChange={set("patente")} placeholder="AB123CD" className={inputBase} style={{ ...inputStyle, fontFamily: "'IBM Plex Mono'", textTransform: "uppercase" }} onFocus={onFocusLime} onBlur={onBlurBd} /></label>
              <label className="block"><span className={labelCls} style={{ color: "var(--tx-4)" }}>Marca</span><input value={form.marca} onChange={set("marca")} placeholder="Scania" className={inputBase} style={inputStyle} onFocus={onFocusLime} onBlur={onBlurBd} /></label>
              <label className="block"><span className={labelCls} style={{ color: "var(--tx-4)" }}>Kilometraje actual</span><input value={form.km} onChange={set("km")} placeholder="0" inputMode="numeric" className={inputBase} style={{ ...inputStyle, fontFamily: "'IBM Plex Mono'" }} onFocus={onFocusLime} onBlur={onBlurBd} /></label>
            </div>
          </div>

          {/* TIPO DE VEHÍCULO (derivado de los ejes) */}
          <div className="px-6 py-[22px]" style={{ borderBottom: "1px solid var(--bd-faint)" }}>
            <div className="mb-1.5 text-[10px] tracking-[.12em]" style={sectionLabelStyle}>TIPO DE VEHÍCULO</div>
            <div className="mb-3.5 text-[11.5px]" style={{ color: "var(--tx-6)" }}>El tipo se deriva de los ejes. Elegí uno y ajustá abajo, o armá el tuyo.</div>
            <div className="flex flex-wrap gap-2">
              {Object.keys(catalog).map((k) => {
                const p = catalog[k]
                const on = matchedKey === k
                return (
                  <button key={k} onClick={applyPreset(k)} className="flex min-w-[104px] flex-col items-start gap-0.5 rounded-[10px] px-[13px] py-2.5" style={{ border: `1px solid ${on ? "var(--ink-lime)" : "var(--bd)"}`, background: on ? tint("var(--ink-lime)", 8) : "var(--input)" }}>
                    <span className="flex items-center gap-1.5 text-[13px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: on ? "var(--ink-lime)" : "var(--tx)" }}>
                      {p.label}
                      {p.custom && <span className="rounded-full px-1.5 py-px text-[8.5px] font-semibold" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--ink-purple)", background: tint("var(--ink-purple)", 16) }}>CUSTOM</span>}
                    </span>
                    <span className="text-[10.5px]" style={{ fontFamily: "'IBM Plex Mono'", color: on ? "var(--ink-lime)" : "var(--tx-5)" }}>{tiresOf(p.axles)} cubiertas</span>
                  </button>
                )
              })}
            </div>

            {isCustom && (
              <div className="mt-3.5 rounded-[10px] p-[13px]" style={{ border: "1.5px dashed var(--ink-lime)", background: tint("var(--ink-lime)", 6) }}>
                <div className="text-[12.5px] font-semibold" style={{ color: "var(--tx)" }}>Esquema personalizado</div>
                <div className="mt-1 text-[11.5px]" style={{ color: "var(--tx-5)" }}>No coincide con ningún tipo conocido. Dale un nombre para guardarlo y reusarlo.</div>
                <div className="mt-2.5 flex gap-2">
                  <input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Ej. Bitrén 7 ejes" className="h-10 flex-1 rounded-[9px] px-3 text-[13px] outline-none" style={{ background: "var(--input)", border: "1.5px solid var(--bd)", color: "var(--tx)" }} />
                  <button onClick={saveCustomType} disabled={savingType} className="h-10 rounded-[9px] px-3.5 text-[12.5px] font-bold" style={{ background: "var(--ink-lime)", color: "var(--bg)", opacity: savingType ? 0.6 : 1 }}>{savingType ? "Guardando…" : "Guardar tipo"}</button>
                </div>
              </div>
            )}
          </div>

          {/* EJES */}
          <div className="px-6 pb-7 pt-[22px]">
            <div className="mb-3.5 flex items-center">
              <div className="text-[10px] tracking-[.12em]" style={sectionLabelStyle}>EJES ({axles.length})</div>
              <span className="ml-auto text-[11.5px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--ink-lime)" }}>{total} cubiertas</span>
            </div>
            <div className="flex flex-col gap-[9px]">
              {axles.map((t, i) => {
                const dual = t === "dual"
                const moto = t === "moto"
                const canRemove = axles.length > 1
                const seg = (on) => ({ background: on ? "var(--ink-lime)" : "transparent", color: on ? "var(--bg)" : "var(--tx-3)" })
                const sub = (i === 0 ? "Dirección · " : "") + (moto ? "Rueda única (1 cubierta)" : dual ? "Dual (4 cubiertas)" : "Simple (2 cubiertas)")
                return (
                  <div key={i} className="flex items-center gap-[11px] rounded-[10px] px-[13px] py-[11px]" style={{ border: "1px solid var(--bd)", background: "var(--input)" }}>
                    <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[7px] text-[12px] font-semibold" style={{ background: "var(--bd-2)", fontFamily: "'IBM Plex Mono'", color: "var(--tx-2)" }}>{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold" style={{ color: "var(--tx)" }}>Eje {i + 1}</div>
                      <div className="text-[11px]" style={{ color: "var(--tx-5)" }}>{sub}</div>
                    </div>
                    {moto ? (
                      <span className="inline-flex h-[30px] items-center rounded-[7px] px-[13px] text-[12px] font-semibold" style={{ background: tint("var(--ink-lime)", 10), color: "var(--ink-lime)" }}>Rueda única</span>
                    ) : (
                      <div className="flex gap-1 rounded-lg p-[3px]" style={{ border: "1px solid var(--bd-strong)", background: "var(--bg)" }}>
                        <button onClick={() => setAxleType(i, "simple")} className="h-[30px] rounded-md px-[11px] text-[12px] font-semibold" style={seg(!dual)}>Simple</button>
                        <button onClick={() => setAxleType(i, "dual")} className="h-[30px] rounded-md px-[11px] text-[12px] font-semibold" style={seg(dual)}>Dual</button>
                      </div>
                    )}
                    <button onClick={() => canRemove && removeAxle(i)} title="Quitar eje" className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-lg" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: canRemove ? "var(--ink-red)" : "var(--bd-hover)", cursor: canRemove ? "pointer" : "not-allowed" }}>
                      <RemoveRoundedIcon sx={{ fontSize: 15 }} />
                    </button>
                  </div>
                )
              })}
            </div>
            <button onClick={addAxle} className="mt-[11px] inline-flex h-11 w-full items-center justify-center gap-2 rounded-[10px] text-[13.5px] font-semibold" style={{ border: "1px dashed var(--bd-hover)", background: "transparent", color: "var(--ink-lime)" }}>
              <AddRoundedIcon sx={{ fontSize: 16 }} /> Agregar eje
            </button>
          </div>
        </div>

        {/* ===== PREVIEW ===== */}
        <div className="flex flex-1 flex-col items-center overflow-y-auto px-6 py-[30px]" style={{ background: "var(--hover)" }}>
          <div className="mb-1.5 flex items-center gap-2 self-start text-[11px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-5)" }}>
            <span className="h-[7px] w-[7px] rounded-full" style={{ background: "var(--ink-lime)" }} />ESQUEMA · {isCustom ? "Personalizado" : typeName}
          </div>
          <div className="mb-[22px] self-start text-[12.5px]" style={{ color: "var(--tx-6)" }}>Vista superior · {total} cubiertas (todas vacías al crear)</div>

          {/* FRENTE */}
          <div className="mb-2 flex flex-col items-center gap-1.5">
            <span className="text-[10px] tracking-widest" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>FRENTE</span>
            <span style={{ color: "var(--tx-7)" }} className="inline-flex"><ArrowUpwardRoundedIcon sx={{ fontSize: 16 }} /></span>
          </div>

          {/* diagrama */}
          <div className="relative py-1.5">
            <div className="absolute left-1/2 top-3.5 bottom-3.5 w-11 -translate-x-1/2 rounded-[14px]" style={{ background: "var(--bd-2)", border: "1px solid var(--bd-strong)" }} />
            <div className="relative z-1 flex flex-col gap-5">
              {axles.map((t, i) => {
                const dual = t === "dual"
                const moto = t === "moto"
                const left = dual ? ["IE", "II"] : ["I"]
                const right = dual ? ["DI", "DE"] : ["D"]
                const Wheel = ({ label }) => (
                  <div className="relative" style={{ width: 17, height: 34 }}>
                    <div className="h-[34px] w-[17px] rounded-[5px]" style={{ border: "2px solid var(--bd-hover)", background: "var(--elev)" }} />
                    {label && <span className="absolute left-1/2 -translate-x-1/2 text-[8px]" style={{ top: 38, fontFamily: "'IBM Plex Mono'", color: "var(--tx-7)" }}>{label}</span>}
                  </div>
                )
                if (moto) {
                  return (
                    <div key={i} className="flex items-center justify-center">
                      <div className="rounded-[5px]" style={{ width: 15, height: 38, border: "2px solid var(--bd-hover)", background: "var(--elev)" }} />
                    </div>
                  )
                }
                return (
                  <div key={i} className="flex items-center justify-center">
                    <div className="flex gap-1">{left.map((l) => <Wheel key={l} label={l} />)}</div>
                    <div className="h-[5px] w-[66px] rounded-[3px]" style={{ background: "var(--bd-strong)" }} />
                    <div className="flex gap-1">{right.map((l) => <Wheel key={l} label={l} />)}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* stats */}
          <div className="mt-[22px] flex items-center gap-2.5 rounded-[11px] px-4 py-[11px]" style={{ border: "1px solid var(--bd)", background: "var(--elev)" }}>
            <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-lg" style={{ background: tint("var(--ink-lime)", 13), color: "var(--ink-lime)" }}><TripOriginRoundedIcon sx={{ fontSize: 17 }} /></span>
            <div style={{ lineHeight: 1.2 }}>
              <div className="text-[18px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>{total}</div>
              <div className="text-[11.5px]" style={{ color: "var(--tx-4)" }}>posiciones de cubierta</div>
            </div>
            <div className="mx-1 h-[30px] w-px" style={{ background: "var(--bd)" }} />
            <div style={{ lineHeight: 1.2 }}>
              <div className="text-[18px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>{axles.length}</div>
              <div className="text-[11.5px]" style={{ color: "var(--tx-4)" }}>ejes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NuevoVehiculo
