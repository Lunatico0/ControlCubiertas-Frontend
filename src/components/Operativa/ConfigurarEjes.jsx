import { useState, useContext, useMemo } from "react"
import ApiContext from "@context/apiContext"
import { showToast } from "@utils/toast"
import { tint, fmtKm } from "./status"
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded"
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded"
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded"
import TripOriginRoundedIcon from "@mui/icons-material/TripOriginRounded"
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined"
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"

// Configurar ejes de vehículos preexistentes (migración A4: adaptar los que se migraron
// sin esquema al modelo de ejes). Pantalla con 2 vistas: lista de pendientes (vehículos
// con axles vacío) + editor de ejes (presets + simple/dual/moto + preview). Guarda con
// vehicles.updateAxles → PATCH /api/vehicles/:id/axles.
const PRESETS = {
  auto: { label: "Auto", sub: "4 ruedas", axles: ["simple", "simple"] },
  camion42: { label: "Camión 4×2", sub: "6 ruedas", axles: ["simple", "dual"] },
  camion64: { label: "Camión 6×4", sub: "10 ruedas", axles: ["simple", "dual", "dual"] },
  semi3: { label: "Semi 3 ejes", sub: "12 ruedas", axles: ["dual", "dual", "dual"] },
  bus: { label: "Bus", sub: "6 ruedas", axles: ["simple", "dual"] },
  moto: { label: "Moto", sub: "2 ruedas", axles: ["moto", "moto"] },
}
const wheelsOf = (t) => (t === "dual" ? 4 : t === "moto" ? 1 : 2)
const tiresOf = (axles) => axles.reduce((n, t) => n + wheelsOf(t), 0)
const sectionLabelStyle = { fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }

const ConfigurarEjes = ({ onClose, vehicle }) => {
  const { data, vehicles } = useContext(ApiContext)
  const tires = data?.tires || []
  // Modo puntual: si viene `vehicle`, arranca directo en el editor de ESE vehículo
  // (reconfigurar ejes desde el detalle). Sin `vehicle`, es el flujo batch de migración.
  const [view, setView] = useState(vehicle ? "editor" : "list")
  const [sel, setSel] = useState(vehicle || null)
  const [preset, setPreset] = useState(vehicle?.axles?.length ? "custom" : "camion42")
  const [axles, setAxles] = useState(vehicle?.axles?.length ? vehicle.axles.map((a) => a.type || "simple") : ["simple", "dual"])
  const [saving, setSaving] = useState(false)

  // Pendientes: vehículos sin esquema de ejes (axles vacío). Conteo de cubiertas montadas
  // desde data.tires (modelo viejo: montadas sin posición).
  const pending = useMemo(() => {
    return (data?.vehicles || [])
      .filter((v) => !(v.axles && v.axles.length))
      .map((v) => ({
        ...v,
        cubiertas: tires.filter((t) => String(t.vehicle?._id || t.vehicle || "") === String(v._id)).length,
      }))
      .sort((a, b) => (a.mobile || "").localeCompare(b.mobile || "", "es", { numeric: true }))
  }, [data?.vehicles, tires])

  const total = useMemo(() => tiresOf(axles), [axles])

  const openEditor = (v) => { setSel(v); setPreset("camion42"); setAxles(["simple", "dual"]); setView("editor") }
  // En modo puntual no hay lista a la que volver: "cancelar"/"volver" cierra el overlay.
  const backToList = () => { if (vehicle) return onClose(); setView("list"); setSel(null) }
  const applyPreset = (key) => () => { setPreset(key); setAxles(PRESETS[key].axles.slice()) }
  const addAxle = () => { setAxles((a) => [...a, "dual"]); setPreset("custom") }
  const removeAxle = (i) => setAxles((a) => (a.length <= 1 ? a : a.filter((_, idx) => idx !== i)))
  const setAxleType = (i, type) => { setAxles((a) => a.map((t, idx) => (idx === i ? type : t))); setPreset("custom") }

  const save = async () => {
    if (!sel) return
    setSaving(true)
    try {
      await vehicles.updateAxles(sel._id, { axles: axles.map((t) => ({ type: t })) })
      showToast("success", `Esquema guardado · ${sel.mobile} · ${total} posiciones`)
      backToList()
    } catch (e) {
      showToast("error", e.message || "No se pudo guardar el esquema")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div data-app-theme="dark" className="fixed inset-0 z-[60] flex flex-col" style={{ background: "var(--bg)", color: "var(--tx)", fontFamily: "'IBM Plex Sans',system-ui,sans-serif" }}>
      {view === "list" ? (
        /* ===================== LISTA DE PENDIENTES ===================== */
        <>
          <div className="flex-none px-[30px] py-5" style={{ background: "var(--sidebar)", borderBottom: "1px solid var(--bd-faint)" }}>
            <div className="flex items-center gap-3.5">
              <button onClick={onClose} title="Volver" className="inline-flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[9px]" style={{ border: "1px solid var(--bd)", background: "var(--elev)", color: "var(--tx-3)" }}>
                <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
              </button>
              <div>
                <h1 className="m-0 text-[21px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>Configurar ejes</h1>
                <p className="mt-1 text-[13px]" style={{ color: "var(--tx-4)" }}>Vehículos que migraste sin esquema de ejes. Definí su configuración para habilitar el montaje de cubiertas.</p>
              </div>
              {pending.length > 0 && (
                <div className="ml-auto inline-flex items-center gap-2 rounded-[9px] px-[13px] py-[7px] text-[12.5px] font-semibold" style={{ color: "var(--ink-orange)", background: tint("var(--ink-orange)", 10), border: `1px solid ${tint("var(--ink-orange)", 30)}` }}>
                  <ReportProblemRoundedIcon sx={{ fontSize: 15 }} /> {pending.length} {pending.length === 1 ? "pendiente" : "pendientes"}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-[30px] py-6">
            {pending.length === 0 ? (
              <div className="mx-auto my-10 max-w-[460px] text-center">
                <div className="mx-auto mb-4 flex h-[58px] w-[58px] items-center justify-center rounded-[14px]" style={{ background: tint("var(--ink-teal)", 14), color: "var(--ink-teal)" }}>
                  <CheckRoundedIcon sx={{ fontSize: 28 }} />
                </div>
                <div className="text-[18px] font-semibold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>Todo configurado</div>
                <div className="mt-1.5 text-[13px]" style={{ color: "var(--tx-4)" }}>No quedan vehículos pendientes de configuración de ejes.</div>
              </div>
            ) : (
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(420px,1fr))" }}>
                {pending.map((v) => (
                  <div key={v._id} className="flex flex-col gap-3.5 rounded-[14px] p-[18px]" style={{ border: "1px solid var(--bd)", background: "var(--card)" }}>
                    <div className="flex items-start gap-3">
                      <span className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-[11px]" style={{ background: tint("var(--ink-blue)", 16), color: "var(--ink-blue)" }}><LocalShippingOutlinedIcon sx={{ fontSize: 22 }} /></span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[18px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>{v.mobile || "—"}</div>
                        <div className="mt-0.5 text-[12px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-5)" }}>{v.licensePlate || "—"} · {v.brand || "—"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 rounded-[10px] px-[13px] py-[11px]" style={{ border: "1px dashed var(--bd-hover)", background: "var(--elev)" }}>
                      <span className="inline-flex flex-none" style={{ color: "var(--ink-orange)" }}><ReportProblemRoundedIcon sx={{ fontSize: 17 }} /></span>
                      <span className="text-[12.5px]" style={{ color: "var(--tx-3)" }}>Ejes sin configurar — definí el esquema del vehículo.</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-[7px] text-[12.5px] font-semibold" style={{ color: v.cubiertas === 0 ? "var(--ink-orange)" : "var(--ink-teal)" }}>
                        <TripOriginRoundedIcon sx={{ fontSize: 15 }} />{v.cubiertas} {v.cubiertas === 1 ? "cubierta" : "cubiertas"}
                      </span>
                      <span className="text-[12.5px]" style={{ color: "var(--tx-5)", fontFamily: "'IBM Plex Mono'" }}>{fmtKm(v.kilometers)}</span>
                      <button onClick={() => openEditor(v)} className="ml-auto inline-flex h-10 items-center gap-2 rounded-[9px] px-4 text-[13.5px] font-bold" style={{ background: "var(--ink-lime)", color: "var(--bg)" }}>
                        Configurar ejes <ArrowForwardRoundedIcon sx={{ fontSize: 15 }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* ===================== EDITOR ===================== */
        <>
          <div className="flex h-16 flex-none items-center gap-3.5 px-6" style={{ background: "var(--sidebar)", borderBottom: "1px solid var(--bd-faint)" }}>
            <button onClick={backToList} title="Volver" className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-[9px]" style={{ border: "1px solid var(--bd)", background: "var(--elev)", color: "var(--tx-3)" }}>
              <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
            </button>
            <div style={{ lineHeight: 1.2 }}>
              <div className="text-[17px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>Configurar ejes · {sel?.mobile}</div>
              <div className="text-[11.5px]" style={{ color: "var(--tx-5)", fontFamily: "'IBM Plex Mono'" }}>{sel?.licensePlate} · {sel?.brand}</div>
            </div>
            <div className="ml-auto flex items-center gap-2.5">
              <button onClick={backToList} className="h-10 rounded-[9px] px-[15px] text-[13.5px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx)" }}>Cancelar</button>
              <button onClick={save} disabled={saving} className="h-10 rounded-[9px] px-[18px] text-[13.5px] font-bold" style={{ background: "var(--ink-lime)", color: "var(--bg)", opacity: saving ? 0.6 : 1 }}>{saving ? "Guardando…" : "Guardar esquema"}</button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1">
            {/* controles */}
            <div className="w-[430px] flex-none overflow-y-auto" style={{ background: "var(--elev)", borderRight: "1px solid var(--bd)" }}>
              <div className="px-6 py-[22px]" style={{ borderBottom: "1px solid var(--bd-faint)" }}>
                <div className="mb-1.5 text-[10px] tracking-[.12em]" style={sectionLabelStyle}>PRESET</div>
                <div className="mb-3.5 text-[11.5px]" style={{ color: "var(--tx-6)" }}>Arrancá con un preset y ajustá los ejes abajo.</div>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(PRESETS).map((k) => {
                    const p = PRESETS[k]
                    const on = preset === k
                    return (
                      <button key={k} onClick={applyPreset(k)} className="flex min-w-[100px] flex-col items-start gap-0.5 rounded-[10px] px-[13px] py-2.5" style={{ border: `1px solid ${on ? "var(--ink-lime)" : "var(--bd)"}`, background: on ? tint("var(--ink-lime)", 8) : "var(--input)" }}>
                        <span className="text-[13px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: on ? "var(--ink-lime)" : "var(--tx)" }}>{p.label}</span>
                        <span className="text-[10.5px]" style={{ fontFamily: "'IBM Plex Mono'", color: on ? "var(--ink-lime)" : "var(--tx-5)" }}>{p.sub}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

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
                          <div className="flex gap-1 rounded-[8px] p-[3px]" style={{ border: "1px solid var(--bd-strong)", background: "var(--bg)" }}>
                            <button onClick={() => setAxleType(i, "simple")} className="h-[30px] rounded-[6px] px-[11px] text-[12px] font-semibold" style={seg(!dual)}>Simple</button>
                            <button onClick={() => setAxleType(i, "dual")} className="h-[30px] rounded-[6px] px-[11px] text-[12px] font-semibold" style={seg(dual)}>Dual</button>
                          </div>
                        )}
                        <button onClick={() => canRemove && removeAxle(i)} title="Quitar eje" className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-[8px]" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: canRemove ? "var(--ink-red)" : "var(--bd-hover)", cursor: canRemove ? "pointer" : "not-allowed" }}>
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

            {/* preview */}
            <div className="flex flex-1 flex-col items-center overflow-y-auto px-6 py-[30px]" style={{ background: "var(--hover)" }}>
              <div className="mb-1.5 flex items-center gap-2 self-start text-[11px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-5)" }}>
                <span className="h-[7px] w-[7px] rounded-full" style={{ background: "var(--ink-lime)" }} />ESQUEMA DEL VEHÍCULO
              </div>
              <div className="mb-[22px] self-start text-[12.5px]" style={{ color: "var(--tx-6)" }}>Vista superior · {total} cubiertas (todas vacías al configurar)</div>

              <div className="mb-2 flex flex-col items-center gap-1.5">
                <span className="text-[10px] tracking-[.1em]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>FRENTE</span>
                <span style={{ color: "var(--tx-7)" }} className="inline-flex"><ArrowUpwardRoundedIcon sx={{ fontSize: 16 }} /></span>
              </div>

              <div className="relative py-1.5">
                <div className="absolute left-1/2 top-4 bottom-4 w-11 -translate-x-1/2 rounded-[14px]" style={{ background: "var(--bd-2)", border: "1px solid var(--bd-strong)" }} />
                <div className="relative z-[1] flex flex-col gap-6">
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

              <div className="mt-6 flex items-center gap-2.5 rounded-[11px] px-4 py-[11px]" style={{ border: "1px solid var(--bd)", background: "var(--elev)" }}>
                <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[8px]" style={{ background: tint("var(--ink-lime)", 13), color: "var(--ink-lime)" }}><TripOriginRoundedIcon sx={{ fontSize: 17 }} /></span>
                <div style={{ lineHeight: 1.2 }}>
                  <div className="text-[18px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>{total}</div>
                  <div className="text-[11.5px]" style={{ color: "var(--tx-4)" }}>posiciones</div>
                </div>
                <div className="mx-1 h-[30px] w-px" style={{ background: "var(--bd)" }} />
                <div style={{ lineHeight: 1.2 }}>
                  <div className="text-[18px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>{axles.length}</div>
                  <div className="text-[11.5px]" style={{ color: "var(--tx-4)" }}>ejes</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ConfigurarEjes
