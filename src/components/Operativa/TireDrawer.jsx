import { useState, useEffect, useContext } from "react"
import ApiContext from "@context/apiContext"
import { fetchTireById } from "@api/tires"
import { fetchVehiclePositions } from "@api/vehicles"
import { useTireAction } from "@hooks/useTireAction"
import { useReprint } from "@hooks/useReprint"
import { showToast } from "@utils/toast"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import UndoRoundedIcon from "@mui/icons-material/UndoRounded"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import LocalPrintshopOutlinedIcon from "@mui/icons-material/LocalPrintshopOutlined"
import { buildAssignPrintData, buildUnassignPrintData, buildFinishRecapPrintData, buildDiscardPrintData, buildUndoPrintData, buildCorrectionPrintData } from "@utils/print-data"
import { metaOf, tint, fmtKm, fmtDate, StateBadge } from "./status"
import { OpActionBtn } from "./opActions"

const fieldStyle = { background: "var(--input)", border: "1.5px solid var(--bd)", color: "var(--tx)" }
const labelCls = "mb-1.5 block text-[12.5px] font-medium"

const Field = ({ label, children }) => (
  <div className="mb-3">
    <label className={labelCls} style={{ color: "var(--tx-3)" }}>{label}</label>
    {children}
  </div>
)

// Botón chico de una entrada del timeline (Reimprimir / Corregir / Deshacer), con hover coloreable.
const TimelineBtn = ({ onClick, disabled, icon, label, hover }) => (
  <button
    type="button" onClick={onClick} disabled={disabled}
    className="inline-flex items-center gap-1.5 rounded-[7px] px-[11px] py-[5px] text-[11.5px] font-semibold"
    style={{ border: "1px solid var(--bd-strong)", background: "var(--card)", color: "var(--tx-2)", fontFamily: "'IBM Plex Sans'", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1 }}
    onMouseEnter={(e) => { if (hover && !disabled) { e.currentTarget.style.borderColor = hover; e.currentTarget.style.color = hover } }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--bd-strong)"; e.currentTarget.style.color = "var(--tx-2)" }}
  >
    {icon}{label}
  </button>
)

// ----- Lifecycle stepper (ciclo de vida de la cubierta) -----
const STEP_STYLE = {
  done: { fill: "color-mix(in srgb, var(--ink-teal) 16%, transparent)", ring: "var(--ink-teal)", fg: "var(--ink-teal)" },
  active: { fill: "color-mix(in srgb, var(--ink-lime) 16%, transparent)", ring: "var(--ink-lime)", fg: "var(--ink-lime)" },
  warn: { fill: "color-mix(in srgb, var(--ink-orange) 16%, transparent)", ring: "var(--ink-orange)", fg: "var(--ink-orange)" },
  x: { fill: "color-mix(in srgb, var(--ink-red) 16%, transparent)", ring: "var(--ink-red)", fg: "var(--ink-red)" },
  pending: { fill: "var(--input)", ring: "var(--bd-strong)", fg: "var(--tx-6)" },
}
const abbr = (name) => String(name || "").replace(/recapado/i, "Rec.")
// Los pasos salen de la ESCALERA del tenant (initial+stock, en orden) + un paso final "Baja".
// El nivel actual se deriva por rol/posición; "a recapar" (recap) y descartada (discard) no
// son parte de la escalera → se resuelven por rol.
const lifecycleSteps = (tire, history, scale = []) => {
  const discarded = metaOf(tire.status).role === "discard"
  const arecapar = metaOf(tire.status).role === "recap"
  const curIdx = scale.indexOf(tire.status)
  const seen = history.map((h) => scale.indexOf(h.status)).filter((x) => x >= 0)
  const level = curIdx >= 0 ? curIdx : (seen.length ? Math.max(...seen) : 0)
  const labels = [...scale.map(abbr), "Baja"]
  return labels.map((label, i) => {
    if (i === labels.length - 1) return { label, kind: discarded ? "x" : "pending" }
    if (i < level) return { label, kind: "done" }
    if (i === level) return { label, kind: discarded ? "done" : arecapar ? "warn" : "active" }
    return { label, kind: "pending" }
  })
}

// Color de la entrada por TIPO de movimiento (no por estado): asignación y desasignación
// SIEMPRE deben distinguirse. Los cambios de estado (recapados) sí usan el color del estado.
const histColor = (h) => {
  const t = h.type || ""
  if (/^asign/i.test(t)) return "var(--ink-blue)"
  if (/^desasign/i.test(t)) return "var(--ink-orange)"
  if (/^correcc/i.test(t)) return "var(--ink-purple)"
  if (t === "Alta") return "var(--ink-lime)"
  if (/descart/i.test(t) || metaOf(h.status).role === "discard") return "var(--ink-red)"
  return metaOf(h.status).color
}

// Descripción legible + chips de datos para cada entrada del historial.
const histDetail = (h) => {
  const t = (h.type || "").toLowerCase()
  if (t.startsWith("asign")) return `Montada${h.vehicle?.mobile ? ` en ${h.vehicle.mobile}` : " en un vehículo"}`
  if (t.startsWith("desasign")) return "Desmontada del vehículo"
  if (t === "alta") return "Ingreso a stock"
  if (t.startsWith("correcc")) return "Corrección de un movimiento anterior"
  if (metaOf(h.status).role === "discard") return "Baja definitiva"
  if (h.status) return `Cambio de estado a ${h.status}`
  return "Movimiento"
}
const histBits = (h) => {
  const bits = []
  const km = h.km ?? h.kmAlta
  if (km != null) bits.push({ k: "Km", val: fmtKm(km) })
  if (h.kmBaja != null) bits.push({ k: "Km baja", val: fmtKm(h.kmBaja) })
  if (h.orderNumber) bits.push({ k: "Orden", val: h.orderNumber })
  if (h.receiptNumber) bits.push({ k: "Comp.", val: h.receiptNumber })
  return bits
}

const TireDrawer = ({ tireId, initialAction, initialAssign, onClose }) => {
  const { tires, orders, data } = useContext(ApiContext)
  const vehicles = data?.vehicles || []
  const { statuses = [], stockScale = [], discardStatus } = data || {}

  const [tire, setTire] = useState(null)
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState(initialAction || null) // null | assign | unassign | recap | discard | undo | editHist
  const [actionEntry, setActionEntry] = useState(null) // entrada del historial sobre la que opera undo/editHist
  const [form, setForm] = useState({})
  const [positions, setPositions] = useState(null) // posiciones del vehículo elegido al asignar (null = sin cargar)

  // Acciones reales del ApiContext. tires.* (handlers) ya hacen replaceTireInList →
  // la LISTA se refresca sola. El `refresh` re-fetchea el drawer (historial fresco).
  const assignAct = useTireAction({ apiCall: tires.assign, successMessage: "Cubierta asignada con éxito", printBuilder: buildAssignPrintData })
  const unassignAct = useTireAction({ apiCall: tires.unassign, successMessage: "Cubierta desasignada", printBuilder: buildUnassignPrintData })
  const recapAct = useTireAction({ apiCall: tires.updateStatus, successMessage: "Recapado registrado", printBuilder: buildFinishRecapPrintData })
  const discardAct = useTireAction({ apiCall: tires.updateStatus, successMessage: "Cubierta descartada", printBuilder: buildDiscardPrintData })
  // undo: firma (id, historyId, data) → el entry va por closure (actionEntry). editHist: firma
  // (id, data, entry) → calza con el branch `entry` de useTireAction.
  const undoAct = useTireAction({ apiCall: (tireId, formData) => tires.undoHistory(tireId, actionEntry?._id, formData), successMessage: "Entrada deshecha", printBuilder: buildUndoPrintData })
  const editHistAct = useTireAction({ apiCall: tires.updateHistory, successMessage: "Historial corregido", printBuilder: buildCorrectionPrintData })
  const reprintAct = useReprint()
  const submitting = assignAct.isSubmitting || unassignAct.isSubmitting || recapAct.isSubmitting || discardAct.isSubmitting || undoAct.isSubmitting || editHistAct.isSubmitting

  const load = (id) =>
    fetchTireById(id)
      .then(setTire)
      .catch((e) => showToast("error", e.message || "No se pudo cargar la cubierta"))

  useEffect(() => {
    if (!tireId) return
    let alive = true
    setLoading(true)
    fetchTireById(tireId)
      .then((t) => alive && setTire(t))
      .catch((e) => showToast("error", e.message || "No se pudo cargar la cubierta"))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [tireId])

  // Montaje dirigido desde una posición de vehículo: pre-carga vehículo + posición para que
  // el operario solo ingrese km + N° de orden y confirme (el resto ya viene fijado).
  useEffect(() => {
    if (initialAction === "assign" && initialAssign?.vehicleId) {
      setForm((f) => ({ ...f, vehicle: initialAssign.vehicleId, position: initialAssign.position || "" }))
    }
  }, [initialAssign, initialAction])

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") (action ? closeAction() : onClose()) }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose, action])

  // Al elegir vehículo en la asignación, traer su esquema de posiciones (ejes + ocupación).
  useEffect(() => {
    if (action !== "assign" || !form.vehicle) { setPositions(null); return }
    let alive = true
    fetchVehiclePositions(form.vehicle)
      .then((d) => alive && setPositions(d.positions || []))
      .catch(() => alive && setPositions([]))
    return () => { alive = false }
  }, [form.vehicle, action])

  const openAction = (a) => { setForm({}); setActionEntry(null); setAction(a) }
  const closeAction = () => { setAction(null); setActionEntry(null) }
  const reload = (id) => load(id) // re-fetch del drawer tras la acción → mata Bug 1
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  // Tipo base de una entrada (sin el prefijo "corrección-"), para decidir qué campos corregir.
  const editBaseType = (entry) => (entry?.type || "").replace(/^correcc[ií]on-/i, "")
  // Abrir una acción sobre una entrada del historial (deshacer / corregir), prellenando el form.
  const openEntryAction = (a, entry) => {
    setActionEntry(entry)
    setForm(a === "editHist"
      ? { status: entry.status || tire.status, kmAlta: entry.kmAlta ?? "", kmBaja: entry.kmBaja ?? "", vehicle: entry.vehicle?._id || "", reason: `Corrección de Orden N°${entry.orderNumber || ""}`, orderNumber: "" }
      : {})
    setAction(a)
  }

  const doAssign = () => {
    if (!form.vehicle || !form.kmAlta || !form.orderNumber) return showToast("warning", "Completá vehículo, km y N° de orden")
    // Si el vehículo tiene ejes configurados, la posición es obligatoria; si no, se asigna sin posición.
    if (positions && positions.length > 0 && !form.position) return showToast("warning", "Elegí la posición en el vehículo")
    assignAct.execute({
      tire,
      formData: { vehicle: form.vehicle, kmAlta: Number(form.kmAlta), orderNumber: form.orderNumber, position: form.position || null, getReceiptNumber: orders.getNextReceipt },
      refresh: reload,
      close: closeAction,
    })
  }
  const doUnassign = () => {
    if (!form.kmBaja || !form.orderNumber) return showToast("warning", "Completá km y N° de orden")
    unassignAct.execute({
      tire,
      formData: { kmBaja: Number(form.kmBaja), orderNumber: form.orderNumber, getReceiptNumber: orders.getNextReceipt },
      refresh: reload,
      close: closeAction,
    })
  }
  const doRecap = () => {
    if (!form.status || !form.orderNumber) return showToast("warning", "Elegí el estado y el N° de orden")
    recapAct.execute({
      tire,
      formData: { status: form.status, orderNumber: form.orderNumber, getReceiptNumber: orders.getNextReceipt },
      refresh: reload,
      close: closeAction,
    })
  }
  const doDiscard = () => {
    if (!form.orderNumber) return showToast("warning", "Completá el N° de orden")
    discardAct.execute({
      tire,
      formData: { status: discardStatus, orderNumber: form.orderNumber, getReceiptNumber: orders.getNextReceipt },
      refresh: reload,
      close: closeAction,
    })
  }
  const doUndo = () => {
    if (!form.orderNumber) return showToast("warning", "Completá el N° de orden")
    undoAct.execute({
      tire,
      formData: { orderNumber: form.orderNumber, getReceiptNumber: orders.getNextReceipt },
      refresh: reload,
      close: closeAction,
    })
  }
  const doEditHist = () => {
    const base = editBaseType(actionEntry)
    if (!form.orderNumber || !form.status || !form.reason) return showToast("warning", "Completá N° de orden, estado y motivo")
    if (base === "Asignación" && (!form.vehicle || !form.kmAlta)) return showToast("warning", "Completá vehículo y km inicial")
    if (base === "Desasignación" && !form.kmBaja) return showToast("warning", "Completá el km final")
    editHistAct.execute({
      tire,
      entry: actionEntry,
      formData: {
        form: {
          orderNumber: form.orderNumber,
          status: form.status,
          reason: form.reason,
          kmAlta: form.kmAlta !== "" && form.kmAlta != null ? Number(form.kmAlta) : undefined,
          kmBaja: form.kmBaja !== "" && form.kmBaja != null ? Number(form.kmBaja) : undefined,
          vehicle: form.vehicle || undefined,
        },
        getReceiptNumber: orders.getNextReceipt,
      },
      refresh: reload,
      close: closeAction,
    })
  }
  const actionHandlers = { assign: doAssign, unassign: doUnassign, recap: doRecap, discard: doDiscard, undo: doUndo, editHist: doEditHist }

  const history = [...(tire?.history || [])].sort((a, b) => new Date(b.date) - new Date(a.date))
  const lastReceiptEntry = history.find((h) => h.receiptNumber) // para "Imprimir recibo" (último comprobante)
  const steps = tire ? lifecycleSteps(tire, history, stockScale) : []
  const infoItems = tire ? [
    { label: "Marca", value: tire.brand || "—" },
    { label: "Rodado", value: tire.size || "—", mono: true },
    { label: "Dibujo", value: tire.pattern || "—" },
    { label: "N° de serie", value: tire.serialNumber || "—", mono: true },
    { label: "Ubicación", value: tire.vehicle?.mobile || "En depósito", accent: tire.vehicle ? "var(--ink-blue)" : undefined },
    ...(tire.position ? [{ label: "Posición", value: tire.position, mono: true }] : []),
    { label: "Kilómetros", value: fmtKm(tire.kilometers), mono: true },
    { label: "Fecha de alta", value: fmtDate(tire.createdAt), mono: true },
  ] : []
  // Opciones de "recapado listo": los estados de la escalera con rol stock (los recapados).
  const recapOptions = statuses.filter((s) => s.role === "stock").map((s) => s.name)

  const ACTION_TITLES = { assign: "Asignar a vehículo", unassign: "Desasignar cubierta", recap: "Registrar recapado", discard: "Descartar cubierta", undo: "Deshacer entrada", editHist: "Corregir entrada de historial" }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(0,0,0,.45)" }} onClick={onClose}>
      <aside
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-[460px] flex-col"
        style={{ background: "var(--card)", borderLeft: "1px solid var(--bd)", animation: "opDrawerIn .18s ease" }}
      >
        {loading || !tire ? (
          <div className="flex h-full items-center justify-center text-[13px]" style={{ color: "var(--tx-5)" }}>
            {loading ? "Cargando…" : "Sin datos"}
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 p-5" style={{ borderBottom: "1px solid var(--bd-soft)" }}>
              <div className="flex items-center gap-3">
                {action && (
                  <button onClick={closeAction} className="rounded-[7px] p-1" style={{ color: "var(--tx-4)" }} title="Volver">
                    <ArrowBackRoundedIcon sx={{ fontSize: 20 }} />
                  </button>
                )}
                <div>
                  <div className="text-[11px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>{tire.serialNumber || "—"}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-[26px] font-bold leading-none" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>#{tire.code}</span>
                    <StateBadge status={tire.status} />
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="rounded-[7px] p-2" style={{ color: "var(--tx-5)" }} title="Cerrar">
                <CloseRoundedIcon sx={{ fontSize: 20 }} />
              </button>
            </div>

            {action ? (
              /* ---------- Formulario de acción (inline, sin apilar modales) ---------- */
              <div className="flex-1 overflow-auto p-5">
                <h3 className="mb-4 text-[15px] font-semibold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>{ACTION_TITLES[action]}</h3>

                {action === "assign" && (
                  <>
                    <Field label="Vehículo">
                      <select className="w-full rounded-[9px] px-3 py-2.5 text-[14px] outline-none" style={fieldStyle} value={form.vehicle || ""} onChange={(e) => setForm((f) => ({ ...f, vehicle: e.target.value, position: "" }))}>
                        <option value="">Seleccionar vehículo…</option>
                        {vehicles.map((v) => (
                          <option key={v._id} value={v._id}>{v.mobile}{v.licensePlate ? ` · ${v.licensePlate}` : ""}</option>
                        ))}
                      </select>
                    </Field>

                    {form.vehicle && positions && (
                      positions.length === 0 ? (
                        <div className="mb-3 rounded-[9px] px-3 py-2.5 text-[12.5px]" style={{ background: "var(--input)", border: "1px dashed var(--bd-strong)", color: "var(--tx-5)" }}>
                          Este vehículo no tiene ejes configurados — se asignará sin posición.
                        </div>
                      ) : (
                        <Field label="Posición en el vehículo">
                          <div className="flex flex-wrap gap-2">
                            {positions.map((p) => {
                              const occupied = !!p.tire
                              const selected = form.position === p.code
                              return (
                                <button
                                  key={p.code}
                                  type="button"
                                  disabled={occupied}
                                  onClick={() => setForm((f) => ({ ...f, position: p.code }))}
                                  title={occupied ? `Ocupada por #${p.tire.code}` : p.label}
                                  className="rounded-lg px-2.5 py-2 text-[11.5px] font-semibold"
                                  style={{
                                    border: `1.5px solid ${selected ? "var(--ink-lime)" : "var(--bd-strong)"}`,
                                    background: selected ? tint("var(--ink-lime)", 14) : "var(--input)",
                                    color: occupied ? "var(--tx-6)" : selected ? "var(--ink-lime)" : "var(--tx-2)",
                                    fontFamily: "'IBM Plex Mono'",
                                    cursor: occupied ? "not-allowed" : "pointer",
                                    opacity: occupied ? 0.55 : 1,
                                  }}
                                >
                                  {p.code}{occupied ? ` · #${p.tire.code}` : ""}
                                </button>
                              )
                            })}
                          </div>
                        </Field>
                      )
                    )}

                    <Field label="Kilometraje inicial">
                      <input type="number" min="0" className="w-full rounded-[9px] px-3 py-2.5 text-[14px] outline-none" style={fieldStyle} value={form.kmAlta || ""} onChange={set("kmAlta")} placeholder="0" />
                    </Field>
                  </>
                )}

                {action === "unassign" && (
                  <Field label="Kilometraje final">
                    <input type="number" min="0" className="w-full rounded-[9px] px-3 py-2.5 text-[14px] outline-none" style={fieldStyle} value={form.kmBaja || ""} onChange={set("kmBaja")} placeholder={String(tire.kilometers ?? 0)} />
                  </Field>
                )}

                {action === "recap" && (
                  <Field label="Nuevo estado de recapado">
                    <select className="w-full rounded-[9px] px-3 py-2.5 text-[14px] outline-none" style={fieldStyle} value={form.status || ""} onChange={set("status")}>
                      <option value="">Seleccionar estado…</option>
                      {recapOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                )}

                {action === "discard" && (
                  <div className="mb-3 rounded-[9px] px-3 py-2.5 text-[12.5px]" style={{ background: tint("var(--ink-red)", 8), border: "1px solid " + tint("var(--ink-red)", 35), color: "var(--ink-red)" }}>
                    Vas a dar de baja definitiva esta cubierta (#{tire.code}). Queda registrado en el historial con su comprobante.
                  </div>
                )}

                {action === "undo" && (
                  <div className="mb-3 rounded-[9px] px-3 py-2.5 text-[12.5px]" style={{ background: "var(--input)", border: "1px solid var(--bd-strong)", color: "var(--tx-4)" }}>
                    Vas a revertir el movimiento «<b style={{ color: "var(--tx-2)" }}>{actionEntry?.type}</b>» del {fmtDate(actionEntry?.date)}. La reversión queda registrada con su comprobante.
                  </div>
                )}

                {action === "editHist" && (
                  <>
                    <Field label="Estado">
                      <select className="w-full rounded-[9px] px-3 py-2.5 text-[14px] outline-none" style={fieldStyle} value={form.status || ""} onChange={set("status")}>
                        <option value="">Seleccionar estado…</option>
                        {statuses.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
                      </select>
                    </Field>
                    {editBaseType(actionEntry) === "Asignación" && (
                      <>
                        <Field label="Vehículo">
                          <select className="w-full rounded-[9px] px-3 py-2.5 text-[14px] outline-none" style={fieldStyle} value={form.vehicle || ""} onChange={set("vehicle")}>
                            <option value="">Seleccionar vehículo…</option>
                            {vehicles.map((v) => <option key={v._id} value={v._id}>{v.mobile}{v.licensePlate ? ` · ${v.licensePlate}` : ""}</option>)}
                          </select>
                        </Field>
                        <Field label="Kilometraje inicial">
                          <input type="number" min="0" className="w-full rounded-[9px] px-3 py-2.5 text-[14px] outline-none" style={fieldStyle} value={form.kmAlta ?? ""} onChange={set("kmAlta")} placeholder="0" />
                        </Field>
                      </>
                    )}
                    {editBaseType(actionEntry) === "Desasignación" && (
                      <Field label="Kilometraje final">
                        <input type="number" min="0" className="w-full rounded-[9px] px-3 py-2.5 text-[14px] outline-none" style={fieldStyle} value={form.kmBaja ?? ""} onChange={set("kmBaja")} placeholder="0" />
                      </Field>
                    )}
                    <Field label="Motivo de la corrección">
                      <input className="w-full rounded-[9px] px-3 py-2.5 text-[14px] outline-none" style={fieldStyle} value={form.reason || ""} onChange={set("reason")} placeholder="Ej. Corrección de km mal cargado" />
                    </Field>
                  </>
                )}

                <Field label="N° de orden">
                  <input className="w-full rounded-[9px] px-3 py-2.5 text-[14px] outline-none" style={fieldStyle} value={form.orderNumber || ""} onChange={set("orderNumber")} placeholder="Ej. 2026-000123" />
                </Field>

                <div className="mt-5 flex gap-3">
                  <button onClick={() => setAction(null)} className="flex-1 rounded-[9px] py-2.5 text-[13px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx-2)" }}>
                    Cancelar
                  </button>
                  <button
                    onClick={actionHandlers[action]}
                    disabled={submitting}
                    className="flex-1 rounded-[9px] py-2.5 text-[13px] font-bold"
                    style={{ background: action === "discard" ? "var(--ink-red)" : "var(--ink-lime)", color: action === "discard" ? "#fff" : "#0A0C0D", opacity: submitting ? 0.6 : 1 }}
                  >
                    {submitting ? "Guardando…" : action === "discard" ? "Descartar" : action === "undo" ? "Deshacer" : action === "editHist" ? "Guardar" : "Confirmar"}
                  </button>
                </div>
              </div>
            ) : (
              /* ---------- Vista de detalle · sidePanel (Claude Design) ---------- */
              <div className="flex-1 overflow-auto" style={{ padding: "22px 24px" }}>
                {/* Lifecycle stepper */}
                <div className="mb-4 text-[10.5px] tracking-[.06em]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>CICLO DE VIDA</div>
                <div className="mb-6 flex items-start">
                  {steps.map((st, i) => {
                    const S = STEP_STYLE[st.kind]
                    const prevDone = i > 0 && steps[i - 1].kind === "done"
                    const doneLine = st.kind === "done"
                    return (
                      <div key={i} className="flex min-w-0 flex-1 flex-col items-center">
                        <div className="flex w-full items-center">
                          <div style={{ height: 2, flex: 1, background: i === 0 ? "transparent" : prevDone ? "var(--ink-teal)" : "var(--bd)" }} />
                          <div className="flex flex-none items-center justify-center" style={{ width: 30, height: 30, borderRadius: "50%", background: S.fill, border: `2px solid ${S.ring}`, color: S.fg }}>
                            {st.kind === "done" ? <CheckRoundedIcon sx={{ fontSize: 15 }} /> : st.kind === "x" ? <CloseRoundedIcon sx={{ fontSize: 14 }} /> : <span style={{ width: 8, height: 8, borderRadius: "50%", background: "currentColor" }} />}
                          </div>
                          <div style={{ height: 2, flex: 1, background: i === steps.length - 1 ? "transparent" : doneLine ? "var(--ink-teal)" : "var(--bd)" }} />
                        </div>
                        <div className="mt-2 text-center text-[10px] font-semibold leading-tight" style={{ color: st.kind === "pending" ? "var(--tx-6)" : S.ring, whiteSpace: "nowrap" }}>{st.label}</div>
                      </div>
                    )
                  })}
                </div>

                {/* Info grid */}
                <div className="mb-6 grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "16px 18px", padding: "18px 19px", border: "1px solid var(--bd-soft)", borderRadius: 12, background: "var(--input)" }}>
                  {infoItems.map((it) => (
                    <div key={it.label}>
                      <div className="mb-[3px] text-[11px] font-medium" style={{ color: "var(--tx-5)" }}>{it.label}</div>
                      <div className="text-[14px] font-semibold" style={{ color: it.accent || "var(--tx)", fontFamily: it.mono ? "'IBM Plex Mono'" : undefined }}>{it.value}</div>
                    </div>
                  ))}
                </div>

                {/* Acciones (estilo Claude Design) */}
                <div className="mb-7 flex flex-wrap gap-2">
                  {!tire.vehicle && metaOf(tire.status).role !== "discard" && <OpActionBtn type="assign" size={44} onClick={() => openAction("assign")} />}
                  {tire.vehicle && <OpActionBtn type="unassign" size={44} onClick={() => openAction("unassign")} />}
                  {metaOf(tire.status).role === "recap" && <OpActionBtn type="recap" size={44} onClick={() => openAction("recap")} />}
                  {lastReceiptEntry && <OpActionBtn type="print" size={44} onClick={() => reprintAct.execute({ entry: lastReceiptEntry, tire })} disabled={reprintAct.isPrinting} />}
                  {!tire.vehicle && metaOf(tire.status).role !== "discard" && <OpActionBtn type="discard" size={44} onClick={() => openAction("discard")} />}
                </div>

                {/* Timeline del historial */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-[10.5px] tracking-[.06em]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>HISTORIAL DE MOVIMIENTOS</div>
                  <span className="rounded-full px-2.5 py-[3px] text-[11px] font-semibold" style={{ fontFamily: "'IBM Plex Mono'", background: "var(--bd-soft)", color: "var(--tx-4)" }}>{history.length}</span>
                </div>
                {history.length === 0 ? (
                  <p className="text-[13px]" style={{ color: "var(--tx-5)" }}>Esta cubierta todavía no tiene movimientos registrados.</p>
                ) : (
                  <div>
                    {history.map((h, i) => {
                      const color = histColor(h)
                      const isCorr = /^correcc/i.test(h.type || "")
                      const last = i === history.length - 1
                      return (
                        <div key={h._id || i} className="flex gap-[14px]">
                          <div className="flex flex-none flex-col items-center" style={{ width: 26 }}>
                            <div className="flex items-center justify-center" style={{ width: 26, height: 26, borderRadius: "50%", background: tint(color, 15) }}>
                              <span style={{ width: 9, height: 9, borderRadius: "50%", background: color }} />
                            </div>
                            {!last && <div style={{ flex: 1, width: 2, background: "var(--bd)", margin: "2px 0", minHeight: 12 }} />}
                          </div>
                          <div className="min-w-0 flex-1 pb-[18px]">
                            <div className="flex items-baseline justify-between gap-2.5">
                              <span className="text-[14px] font-semibold" style={{ color, fontFamily: "'Space Grotesk'" }}>{h.type || "Movimiento"}</span>
                              <span className="flex-none text-[11.5px]" style={{ color: "var(--tx-6)", fontFamily: "'IBM Plex Mono'" }}>{fmtDate(h.date)}</span>
                            </div>
                            <div className="mt-[3px] text-[12.5px]" style={{ color: "var(--tx-4)" }}>{histDetail(h)}</div>
                            {histBits(h).length > 0 && (
                              <div className="mt-[9px] flex flex-wrap gap-[6px]">
                                {histBits(h).map((bit, bi) => (
                                  <span key={bi} className="rounded-md px-[9px] py-[2px] text-[11px]" style={{ background: "var(--hover)", border: "1px solid var(--bd)" }}>
                                    <span style={{ color: "var(--tx-6)" }}>{bit.k} </span>
                                    <span style={{ fontFamily: "'IBM Plex Mono'", fontWeight: 600, color: "var(--tx-2)" }}>{bit.val}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="mt-[10px] flex flex-wrap gap-[6px]">
                              {h.receiptNumber && <TimelineBtn onClick={() => reprintAct.execute({ entry: h, tire })} disabled={reprintAct.isPrinting} icon={<LocalPrintshopOutlinedIcon sx={{ fontSize: 13 }} />} label="Reimprimir" hover="var(--bd-hover)" />}
                              {!isCorr && <TimelineBtn onClick={() => openEntryAction("editHist", h)} icon={<EditOutlinedIcon sx={{ fontSize: 13 }} />} label="Corregir" hover="var(--ink-blue)" />}
                              {!isCorr && h.type !== "Alta" && <TimelineBtn onClick={() => openEntryAction("undo", h)} icon={<UndoRoundedIcon sx={{ fontSize: 13 }} />} label="Deshacer" hover="var(--ink-red)" />}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </aside>
    </div>
  )
}

export default TireDrawer
