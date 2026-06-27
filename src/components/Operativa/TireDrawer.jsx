import { useState, useEffect, useContext } from "react"
import ApiContext from "@context/apiContext"
import { fetchTireById } from "@api/tires"
import { useTireAction } from "@hooks/useTireAction"
import { showToast } from "@utils/toast"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded"
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined"
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import { metaOf, tint, fmtKm, fmtDate, StateBadge, Pips } from "./status"

const RECAP_STATES = ["1er Recapado", "2do Recapado", "3er Recapado"]

const fieldStyle = { background: "var(--input)", border: "1.5px solid var(--bd)", color: "var(--tx)" }
const labelCls = "mb-1.5 block text-[12.5px] font-medium"

const Field = ({ label, children }) => (
  <div className="mb-3">
    <label className={labelCls} style={{ color: "var(--tx-3)" }}>{label}</label>
    {children}
  </div>
)

const InfoRow = ({ label, value, mono, color }) => (
  <div className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--bd-faint)" }}>
    <span className="text-[12.5px]" style={{ color: "var(--tx-5)" }}>{label}</span>
    <span className="text-[13px] font-medium" style={{ color: color || "var(--tx-2)", fontFamily: mono ? "'IBM Plex Mono'" : undefined }}>{value}</span>
  </div>
)

const TireDrawer = ({ tireId, onClose }) => {
  const { tires, orders, data } = useContext(ApiContext)
  const vehicles = data?.vehicles || []

  const [tire, setTire] = useState(null)
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState(null) // null | "assign" | "unassign" | "recap"
  const [form, setForm] = useState({})

  // Acciones reales del ApiContext. tires.* (handlers) ya hacen replaceTireInList →
  // la LISTA se refresca sola. El `refresh` re-fetchea el drawer (historial fresco).
  const assignAct = useTireAction({ apiCall: tires.assign, successMessage: "Cubierta asignada con éxito" })
  const unassignAct = useTireAction({ apiCall: tires.unassign, successMessage: "Cubierta desasignada" })
  const recapAct = useTireAction({ apiCall: tires.updateStatus, successMessage: "Recapado registrado" })
  const submitting = assignAct.isSubmitting || unassignAct.isSubmitting || recapAct.isSubmitting

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

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") (action ? setAction(null) : onClose()) }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose, action])

  const openAction = (a) => { setForm({}); setAction(a) }
  const reload = (id) => load(id) // re-fetch del drawer tras la acción → mata Bug 1
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const doAssign = () => {
    if (!form.vehicle || !form.kmAlta || !form.orderNumber) return showToast("warning", "Completá vehículo, km y N° de orden")
    assignAct.execute({
      tire,
      formData: { vehicle: form.vehicle, kmAlta: Number(form.kmAlta), orderNumber: form.orderNumber, getReceiptNumber: orders.getNextReceipt },
      refresh: reload,
      close: () => setAction(null),
    })
  }
  const doUnassign = () => {
    if (!form.kmBaja || !form.orderNumber) return showToast("warning", "Completá km y N° de orden")
    unassignAct.execute({
      tire,
      formData: { kmBaja: Number(form.kmBaja), orderNumber: form.orderNumber, getReceiptNumber: orders.getNextReceipt },
      refresh: reload,
      close: () => setAction(null),
    })
  }
  const doRecap = () => {
    if (!form.status || !form.orderNumber) return showToast("warning", "Elegí el estado y el N° de orden")
    recapAct.execute({
      tire,
      formData: { status: form.status, orderNumber: form.orderNumber, getReceiptNumber: orders.getNextReceipt },
      refresh: reload,
      close: () => setAction(null),
    })
  }

  const history = [...(tire?.history || [])].sort((a, b) => new Date(b.date) - new Date(a.date))
  const m = tire ? metaOf(tire.status) : null
  const recapOptions = RECAP_STATES.filter((s) => RECAP_STATES.indexOf(s) > RECAP_STATES.indexOf(tire?.status))

  const ACTION_TITLES = { assign: "Asignar a vehículo", unassign: "Desasignar cubierta", recap: "Registrar recapado" }

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
                  <button onClick={() => setAction(null)} className="rounded-[7px] p-1" style={{ color: "var(--tx-4)" }} title="Volver">
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
                      <select className="w-full rounded-[9px] px-3 py-2.5 text-[14px] outline-none" style={fieldStyle} value={form.vehicle || ""} onChange={set("vehicle")}>
                        <option value="">Seleccionar vehículo…</option>
                        {vehicles.map((v) => (
                          <option key={v._id} value={v._id}>{v.mobile}{v.licensePlate ? ` · ${v.licensePlate}` : ""}</option>
                        ))}
                      </select>
                    </Field>
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

                <Field label="N° de orden">
                  <input className="w-full rounded-[9px] px-3 py-2.5 text-[14px] outline-none" style={fieldStyle} value={form.orderNumber || ""} onChange={set("orderNumber")} placeholder="Ej. 2026-000123" />
                </Field>

                <div className="mt-5 flex gap-3">
                  <button onClick={() => setAction(null)} className="flex-1 rounded-[9px] py-2.5 text-[13px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx-2)" }}>
                    Cancelar
                  </button>
                  <button
                    onClick={action === "assign" ? doAssign : action === "unassign" ? doUnassign : doRecap}
                    disabled={submitting}
                    className="flex-1 rounded-[9px] py-2.5 text-[13px] font-bold"
                    style={{ background: "var(--ink-lime)", color: "#0A0C0D", opacity: submitting ? 0.6 : 1 }}
                  >
                    {submitting ? "Guardando…" : "Confirmar"}
                  </button>
                </div>
              </div>
            ) : (
              /* ---------- Vista de detalle ---------- */
              <div className="flex-1 overflow-auto p-5">
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-[10px] tracking-[.06em]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>RECAPADOS</span>
                  <Pips level={m.level} />
                </div>

                <div className="mb-5">
                  <InfoRow label="Marca" value={tire.brand} />
                  <InfoRow label="Rodado" value={tire.size} mono />
                  <InfoRow label="Dibujo" value={tire.pattern || "—"} />
                  <InfoRow label="Ubicación" value={tire.vehicle?.mobile || "En depósito"} color={tire.vehicle ? "var(--ink-blue)" : "var(--tx-2)"} />
                  <InfoRow label="Kilómetros" value={fmtKm(tire.kilometers)} mono />
                  <InfoRow label="Fecha de alta" value={fmtDate(tire.createdAt)} mono />
                </div>

                {/* Acciones reales */}
                <div className="mb-6 flex flex-wrap gap-2">
                  {!tire.vehicle && tire.status !== "Descartada" && (
                    <button onClick={() => openAction("assign")} className="inline-flex h-10 items-center gap-2 rounded-[9px] px-4 text-[13px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--ink-lime)" }}>
                      <LocalShippingOutlinedIcon sx={{ fontSize: 16 }} /> Asignar
                    </button>
                  )}
                  {tire.vehicle && (
                    <button onClick={() => openAction("unassign")} className="inline-flex h-10 items-center gap-2 rounded-[9px] px-4 text-[13px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx-2)" }}>
                      <RemoveRoundedIcon sx={{ fontSize: 16 }} /> Desasignar
                    </button>
                  )}
                  {tire.status === "A recapar" && (
                    <button onClick={() => openAction("recap")} className="inline-flex h-10 items-center gap-2 rounded-[9px] px-4 text-[13px] font-semibold" style={{ border: "1px solid " + tint("var(--ink-teal)", 40), background: tint("var(--ink-teal)", 10), color: "var(--ink-teal)" }}>
                      <CheckRoundedIcon sx={{ fontSize: 16 }} /> Recapado listo
                    </button>
                  )}
                </div>

                {/* Timeline del historial */}
                <div className="mb-2 text-[10px] tracking-[.06em]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>HISTORIAL</div>
                {history.length === 0 ? (
                  <p className="text-[13px]" style={{ color: "var(--tx-5)" }}>Esta cubierta todavía no tiene movimientos registrados.</p>
                ) : (
                  <ol className="relative ml-1" style={{ borderLeft: "1.5px solid var(--bd)" }}>
                    {history.map((h, i) => {
                      const hm = metaOf(h.status)
                      return (
                        <li key={h._id || i} className="relative py-3 pl-5">
                          <span className="absolute left-0 top-[18px] -translate-x-1/2 rounded-full" style={{ width: 10, height: 10, background: hm.color, boxShadow: "0 0 0 3px var(--card)" }} />
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[13px] font-semibold" style={{ color: "var(--tx)" }}>{h.type || "Movimiento"}</span>
                            <span className="text-[11px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>{fmtDate(h.date)}</span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px]" style={{ color: "var(--tx-5)" }}>
                            {h.status && <span style={{ color: hm.color }}>{h.status}</span>}
                            {(h.km != null || h.kmAlta != null) && <span style={{ fontFamily: "'IBM Plex Mono'" }}>{fmtKm(h.km ?? h.kmAlta)}</span>}
                            {h.receiptNumber && <span style={{ fontFamily: "'IBM Plex Mono'" }}>Comp. {h.receiptNumber}</span>}
                          </div>
                        </li>
                      )
                    })}
                  </ol>
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
