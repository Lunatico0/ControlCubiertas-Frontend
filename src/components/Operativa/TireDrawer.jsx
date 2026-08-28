import { useState, useEffect, useContext, useCallback } from "react"
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
import { buildAssignPrintData, buildUnassignPrintData, buildFinishRecapPrintData, buildDiscardPrintData, buildUndoPrintData, buildCorrectionPrintData, buildEditTirePrintData } from "@utils/print-data"
import { metaOf, tint, fmtKm, fmtDate, StateBadge, useStatusCatalog, ubicacionDe } from "./status"
import SelectorPosicion from "./SelectorPosicion"
import { OpActionBtn } from "./opActions"
import Field from "@components/common/Field"
import Drawer from "@components/UI/Drawer"
import FloatingField from "@components/UI/FloatingField"
import { formatTireCode } from "@utils/tireCode"

// Botón chico de una entrada del timeline (Reimprimir / Corregir / Deshacer), con hover coloreable.
const TimelineBtn = ({ onClick, disabled, icon, label, hover }) => (
  <button
    type="button" onClick={onClick} disabled={disabled}
    className="inline-flex items-center gap-1.5 rounded-[var(--r-sm)] px-[11px] py-[5px] text-[11.5px] font-semibold"
    style={{ border: "1px solid var(--bd-strong)", background: "var(--card)", color: "var(--tx-2)", fontFamily: "var(--font-sans)", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1 }}
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
  // t140: la palabra "Km" nombraba tres cosas distintas. h.km son los km que RECORRIÓ la
  // cubierta en ese tramo; kmAlta y kmBaja son el ODÓMETRO DEL MÓVIL al montar y al desmontar.
  // Un mismo movimiento mostraba "Km 50.000" y "Km baja 250.000" mientras la cubierta pasaba
  // de 39.527 a 89.527: tres números que no cerraban entre sí porque medían cosas distintas.
  if (h.km != null) bits.push({ k: "Recorridos", val: fmtKm(h.km) })
  if (h.kmAlta != null) bits.push({ k: "Odóm. al montar", val: fmtKm(h.kmAlta) })
  if (h.kmBaja != null) bits.push({ k: "Odóm. al desmontar", val: fmtKm(h.kmBaja) })
  if (h.orderNumber) bits.push({ k: "Orden", val: h.orderNumber })
  if (h.receiptNumber) bits.push({ k: "Comp.", val: h.receiptNumber })
  return bits
}

// Qué va a pasar concretamente al deshacer, en castellano. Antes el aviso solo nombraba el
// movimiento y la fecha, y el operario no tenía forma de saber que iba a generar un movimiento
// nuevo con fecha de hoy.
const efectoDelUndo = (entry, tire) => {
  const tipo = (entry?.type || "").replace(/^correcc[ií]on-/i, "")
  if (tipo === "Asignación") return `Se va a desmontar del vehículo ${entry?.vehicle?.mobile || "asignado"} y volver al depósito.`
  if (tipo === "Desasignación") return `Se va a volver a montar en ${entry?.vehicle?.mobile || "el vehículo anterior"}.`
  if (tipo === "Estado") return `El estado vuelve a ser el anterior a "${entry?.status || tire?.status}".`
  return "Se va a registrar el movimiento inverso."
}

const TireDrawer = ({ tireId, initialAction, initialAssign, onAssigned, onClose }) => {
  useStatusCatalog() // el stepper del ciclo de vida y los guards por rol dependen del catálogo
  const { tires, orders, data } = useContext(ApiContext)
  const vehicles = data?.vehicles || []
  const { statuses = [], stockScale = [], discardStatus, recapStatus } = data || {}

  const [tire, setTire] = useState(null)
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState(initialAction || null) // null | assign | unassign | recap | discard | undo | editHist
  const [actionEntry, setActionEntry] = useState(null) // entrada del historial sobre la que opera undo/editHist
  const [form, setForm] = useState({})
  const [errors, setErrors] = useState({}) // marcado de campos obligatorios faltantes por acción
  const [positions, setPositions] = useState(null) // posiciones del vehículo elegido al asignar (null = sin cargar)

  // Acciones reales del ApiContext. tires.* (handlers) ya hacen replaceTireInList →
  // la LISTA se refresca sola. El `refresh` re-fetchea el drawer (historial fresco).
  const assignAct = useTireAction({ apiCall: tires.assign, successMessage: "Cubierta asignada con éxito", printBuilder: buildAssignPrintData })
  const unassignAct = useTireAction({ apiCall: tires.unassign, successMessage: "Cubierta desasignada", printBuilder: buildUnassignPrintData })
  const recapAct = useTireAction({ apiCall: tires.updateStatus, successMessage: "Recapado registrado", printBuilder: buildFinishRecapPrintData })
  const discardAct = useTireAction({ apiCall: tires.updateStatus, successMessage: "Cubierta descartada", printBuilder: buildDiscardPrintData })
  // Enviar a recapar: mismo endpoint de cambio de estado, destino = el estado de rol recap.
  const sendRecapAct = useTireAction({ apiCall: tires.updateStatus, successMessage: "Cubierta enviada a recapar", printBuilder: buildFinishRecapPrintData })
  // Editar los datos de la cubierta reusa el endpoint de corrección de alta, que ya registra
  // los campos editados en el historial: la trazabilidad sale gratis.
  const editAct = useTireAction({ apiCall: tires.correct, successMessage: "Datos corregidos", printBuilder: buildEditTirePrintData })
  // undo: firma (id, historyId, data) → el entry va por closure (actionEntry). editHist: firma
  // (id, data, entry) → calza con el branch `entry` de useTireAction.
  const undoAct = useTireAction({ apiCall: (tireId, formData) => tires.undoHistory(tireId, actionEntry?._id, formData), successMessage: "Entrada deshecha", printBuilder: buildUndoPrintData })
  const editHistAct = useTireAction({ apiCall: tires.updateHistory, successMessage: "Historial corregido", printBuilder: buildCorrectionPrintData })
  const reprintAct = useReprint()
  const submitting = assignAct.isSubmitting || unassignAct.isSubmitting || recapAct.isSubmitting || sendRecapAct.isSubmitting || editAct.isSubmitting || discardAct.isSubmitting || undoAct.isSubmitting || editHistAct.isSubmitting

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

  // Al elegir vehículo en la asignación, traer su esquema de posiciones (ejes + ocupación).
  useEffect(() => {
    if (action !== "assign" || !form.vehicle) { setPositions(null); return }
    let alive = true
    fetchVehiclePositions(form.vehicle)
      .then((d) => alive && setPositions(d.positions || []))
      .catch(() => alive && setPositions([]))
    return () => { alive = false }
  }, [form.vehicle, action])

  // Al abrir "recapado listo" el estado viene preseleccionado en el nivel que SIGUE: sin default,
  // el operario elegía el primero de la lista y repetía un recapado ya hecho.
  const openAction = (a) => {
    const inicial =
      a === "recap" && siguienteRecap ? { status: siguienteRecap }
        : a === "edit" ? { serialNumber: tire?.serialNumber || "", code: tire?.code ?? "", brand: tire?.brand || "", size: tire?.size || "", pattern: tire?.pattern || "", reason: "", orderNumber: "" }
          : {}
    setForm(inicial); setActionEntry(null); setErrors({}); setAction(a)
  }
  const closeAction = useCallback(() => { setAction(null); setActionEntry(null); setErrors({}) }, [])
  // Cierre action-aware (Escape / backdrop / botón X): si hay un formulario de acción abierto
  // vuelve al detalle (closeAction); si no, cierra el drawer entero. Antes solo el Escape era
  // action-aware — ahora backdrop y X respetan la misma lógica vía el <Drawer> común.
  const handleClose = useCallback(() => (action ? closeAction() : onClose()), [action, closeAction, onClose])
  const reload = (id) => load(id) // re-fetch del drawer tras la acción → mata Bug 1
  // Al editar un campo se limpia su marca de error (border rojo).
  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((p) => (p[k] ? { ...p, [k]: false } : p))
  }
  // Tipo base de una entrada (sin el prefijo "corrección-"), para decidir qué campos corregir.
  const editBaseType = (entry) => (entry?.type || "").replace(/^correcc[ií]on-/i, "")
  // Abrir una acción sobre una entrada del historial (deshacer / corregir), prellenando el form.
  const openEntryAction = (a, entry) => {
    setActionEntry(entry)
    setErrors({})
    setForm(a === "editHist"
      // t150: `reason` venía precargado con "Corrección de Orden N°…", un texto genérico que
      // el operario aceptaba sin tocar. Eso anulaba el valor de auditoría del campo: quedaba
      // registrado QUE hubo una corrección, nunca POR QUÉ. Arranca vacío, con placeholder.
      ? { status: entry.status || tire.status, kmAlta: entry.kmAlta ?? "", kmBaja: entry.kmBaja ?? "", vehicle: entry.vehicle?._id || "", reason: "", orderNumber: "" }
      : {})
    setAction(a)
  }

  const doAssign = () => {
    const e = {}
    if (!form.vehicle) e.vehicle = true
    if (!form.kmAlta) e.kmAlta = true
    if (!form.orderNumber) e.orderNumber = true
    if (Object.keys(e).length) { setErrors(e); showToast("warning", "Completá los campos obligatorios"); return }
    // Si el vehículo tiene ejes configurados, la posición es obligatoria; si no, se asigna sin
    // posición. La grilla de posición no es un FloatingField → se avisa por toast.
    if (positions && positions.length > 0 && !form.position) { setErrors({}); return showToast("warning", "Elegí la posición en el vehículo") }
    setErrors({})
    // Montaje dirigido: al éxito no cerramos el panel acá; avisamos (onAssigned) para que el
    // padre limpie el banner de montaje, cierre el drawer y vuelva al vehículo. Flujo normal:
    // se cierra el panel de acción como siempre.
    assignAct.execute({
      tire,
      formData: { vehicle: form.vehicle, kmAlta: Number(form.kmAlta), orderNumber: form.orderNumber, position: form.position || null, getReceiptNumber: orders.getNextReceipt },
      refresh: reload,
      close: initialAssign ? undefined : closeAction,
    }).then((updated) => { if (updated && initialAssign) onAssigned?.() }).catch(() => { /* error ya notificado */ })
  }
  const doUnassign = () => {
    const e = {}
    if (!form.kmBaja) e.kmBaja = true
    if (!form.orderNumber) e.orderNumber = true
    if (Object.keys(e).length) { setErrors(e); showToast("warning", "Completá los campos obligatorios"); return }
    setErrors({})
    unassignAct.execute({
      tire,
      formData: { kmBaja: Number(form.kmBaja), orderNumber: form.orderNumber, getReceiptNumber: orders.getNextReceipt },
      refresh: reload,
      close: closeAction,
    })
  }
  const doRecap = () => {
    const e = {}
    if (!form.status) e.status = true
    if (!form.orderNumber) e.orderNumber = true
    if (Object.keys(e).length) { setErrors(e); showToast("warning", "Completá los campos obligatorios"); return }
    setErrors({})
    recapAct.execute({
      tire,
      formData: { status: form.status, orderNumber: form.orderNumber, getReceiptNumber: orders.getNextReceipt },
      refresh: reload,
      close: closeAction,
    })
  }
  const doSendRecap = () => {
    if (!form.orderNumber) { setErrors({ orderNumber: true }); showToast("warning", "Completá los campos obligatorios"); return }
    setErrors({})
    sendRecapAct.execute({
      tire,
      formData: { status: recapStatus, orderNumber: form.orderNumber, getReceiptNumber: orders.getNextReceipt },
      refresh: reload,
      close: closeAction,
    })
  }
  const doEdit = () => {
    const e = {}
    if (!form.reason) e.reason = true
    if (!form.orderNumber) e.orderNumber = true
    // El backend rechaza la corrección si no cambió nada; avisarlo acá es más claro.
    const sinCambios = ["serialNumber", "brand", "size", "pattern"].every((k) => (form[k] ?? "") === (tire[k] ?? "")) && Number(form.code) === Number(tire.code)
    if (Object.keys(e).length) { setErrors(e); showToast("warning", "Completá los campos obligatorios"); return }
    if (sinCambios) { showToast("warning", "No cambiaste ningún dato"); return }
    setErrors({})
    editAct.execute({
      tire,
      formData: {
        form: {
          serialNumber: form.serialNumber,
          code: Number(form.code),
          brand: form.brand,
          size: form.size,
          pattern: form.pattern,
          reason: form.reason,
          orderNumber: form.orderNumber,
        },
        getReceiptNumber: orders.getNextReceipt,
      },
      refresh: reload,
      close: closeAction,
    })
  }
  const doDiscard = () => {
    if (!form.orderNumber) { setErrors({ orderNumber: true }); showToast("warning", "Completá los campos obligatorios"); return }
    setErrors({})
    discardAct.execute({
      tire,
      formData: { status: discardStatus, orderNumber: form.orderNumber, getReceiptNumber: orders.getNextReceipt },
      refresh: reload,
      close: closeAction,
    })
  }
  const doUndo = () => {
    if (!form.orderNumber) { setErrors({ orderNumber: true }); showToast("warning", "Completá los campos obligatorios"); return }
    setErrors({})
    undoAct.execute({
      tire,
      formData: { orderNumber: form.orderNumber, getReceiptNumber: orders.getNextReceipt },
      refresh: reload,
      close: closeAction,
    })
  }
  const doEditHist = () => {
    const base = editBaseType(actionEntry)
    const e = {}
    if (!form.orderNumber) e.orderNumber = true
    if (!form.status) e.status = true
    if (!form.reason) e.reason = true
    if (base === "Asignación") {
      if (!form.vehicle) e.vehicle = true
      if (!form.kmAlta) e.kmAlta = true
    }
    if (base === "Desasignación" && !form.kmBaja) e.kmBaja = true
    if (Object.keys(e).length) { setErrors(e); showToast("warning", "Completá los campos obligatorios"); return }
    setErrors({})
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
  const actionHandlers = { assign: doAssign, unassign: doUnassign, recap: doRecap, sendRecap: doSendRecap, edit: doEdit, discard: doDiscard, undo: doUndo, editHist: doEditHist }

  const history = [...(tire?.history || [])].sort((a, b) => new Date(b.date) - new Date(a.date))
  const lastReceiptEntry = history.find((h) => h.receiptNumber) // para "Imprimir recibo" (último comprobante)
  // history está ordenado desc por fecha: la primera es el último movimiento, el único que se
  // puede deshacer sin inventar movimientos que nunca pasaron.
  const ultimaEntrada = history[0]
  const steps = tire ? lifecycleSteps(tire, history, stockScale) : []

  // t141: contexto del montaje vigente, para la cabecera de "Desasignar". El formulario era
  // sólo "Kilometraje final" + "N° de orden": no decía de qué móvil ni de qué posición se
  // estaba bajando la cubierta, ni contra qué odómetro se iba a validar. El operario tenía
  // que cerrar el modal, ir al historial, anotar el número y volver.
  const montajeVigente = history.find((h) => /^asign/i.test(h.type || ""))
  const odometroAlMontar = montajeVigente?.kmAlta ?? montajeVigente?.km
  const infoItems = tire ? [
    { label: "Marca", value: tire.brand || "—" },
    { label: "Rodado", value: tire.size || "—", mono: true },
    { label: "Dibujo", value: tire.pattern || "—" },
    { label: "N° de serie", value: tire.serialNumber || "—", mono: true },
    // t144: una cubierta descartada no está guardada en ningún lado. Ver ubicacionDe en ./status.
    { label: "Ubicación", value: ubicacionDe(tire).label, accent: tire.vehicle || metaOf(tire.status).role === "discard" ? ubicacionDe(tire).color : undefined },
    ...(tire.position ? [{ label: "Posición", value: tire.position, mono: true }] : []),
    { label: "Kilómetros", value: fmtKm(tire.kilometers), mono: true },
    { label: "Fecha de alta", value: fmtDate(tire.createdAt), mono: true },
  ] : []
  // Opciones de "recapado listo": los estados de la escalera con rol stock (los recapados).
  //
  // El nivel de recapado define cuánta vida le queda a la cubierta y cuándo se descarta, así que
  // dejar elegir uno ya alcanzado corrompe el dato más caro del negocio. Pasaba: el select
  // arrancaba vacío, ofrecía los tres niveles y un operario apurado tomaba el primero de la
  // lista, dejando la cubierta con dos "1er Recapado" y el contador atrasado, sin un solo aviso.
  //
  // Ahora los niveles ya alcanzados quedan deshabilitados y el siguiente viene preseleccionado.
  // El nivel se deriva del HISTORIAL y no de tire.recapLevel: ese campo lo calcula getAll para
  // el listado, y el detalle que trae el drawer no lo incluye. Tampoco sirve el level del estado
  // actual: una cubierta "Para reparar" tiene rol recap, cuyo level es 0, y quedaría como si
  // nunca la hubieran recapado.
  const nivelAlcanzado = (estado) => {
    const m = metaOf(estado)
    return m.role === "stock" || m.role === "initial" ? m.level ?? 0 : 0
  }
  const nivelActual = tire
    ? Math.max(nivelAlcanzado(tire.status), ...history.map((h) => nivelAlcanzado(h.status)), 0)
    : 0
  const recapOptions = statuses
    .filter((s) => s.role === "stock")
    .map((s) => ({ name: s.name, nivel: metaOf(s.name).level ?? 0 }))
  const siguienteRecap = recapOptions.find((o) => o.nivel > nivelActual)?.name || ""

  // Preselecciona el siguiente recapado también cuando el drawer abre directo en esta acción
  // desde la tarjeta del inventario (initialAction), camino que no pasa por openAction.
  useEffect(() => {
    if (action !== "recap" || !siguienteRecap) return
    // Corrige también cuando el valor puesto quedó inválido: el efecto puede correr antes de
    // que llegue el historial, y ahí nivelActual todavía es 0 y preselecciona un recapado que
    // la cubierta ya hizo. Un nivel ya alcanzado nunca puede ser una elección del usuario,
    // porque en el select está deshabilitado.
    const elegido = form.status
    const yaAlcanzado = elegido && (metaOf(elegido).level ?? 0) <= nivelActual
    if (!elegido || yaAlcanzado) setForm((f) => ({ ...f, status: siguienteRecap }))
  }, [action, siguienteRecap, form.status, nivelActual])

  const ACTION_TITLES = { assign: "Asignar a vehículo", unassign: "Desasignar cubierta", recap: "Registrar recapado", sendRecap: "Enviar a recapar", edit: "Editar datos de la cubierta", discard: "Descartar cubierta", undo: "Deshacer entrada", editHist: "Corregir entrada de historial" }

  return (
    <Drawer onClose={handleClose}>
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
                  <button onClick={closeAction} className="rounded-[var(--r-sm)] p-1" style={{ color: "var(--tx-4)" }} title="Volver">
                    <ArrowBackRoundedIcon sx={{ fontSize: 20 }} />
                  </button>
                )}
                <div>
                  <div className="text-[11px]" style={{ fontFamily: "var(--font-mono)", color: "var(--tx-6)" }}>{tire.serialNumber || "—"}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-[26px] font-bold leading-none" style={{ fontFamily: "var(--font-display)", color: "var(--tx)" }}>#{formatTireCode(tire.code, data?.tireCodePrefix)}</span>
                    <StateBadge status={tire.status} />
                  </div>
                </div>
              </div>
              <button onClick={handleClose} className="rounded-[var(--r-sm)] p-2" style={{ color: "var(--tx-5)" }} title="Cerrar">
                <CloseRoundedIcon sx={{ fontSize: 20 }} />
              </button>
            </div>

            {action ? (
              /* ---------- Formulario de acción (inline, sin apilar modales) ---------- */
              <div className="flex-1 overflow-auto p-5">
                <h3 className="mb-4 text-[15px] font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--tx)" }}>{ACTION_TITLES[action]}</h3>

                <div className="flex flex-col gap-3.5">
                {action === "assign" && (
                  <>
                    <FloatingField as="select" label="Vehículo" required error={errors.vehicle} value={form.vehicle || ""} onChange={(e) => { const v = e.target.value; setForm((f) => ({ ...f, vehicle: v, position: "" })); setErrors((p) => (p.vehicle ? { ...p, vehicle: false } : p)) }}>
                      <option value="">Seleccionar vehículo…</option>
                      {vehicles.map((v) => (
                        <option key={v._id} value={v._id}>{v.mobile}{v.licensePlate ? ` · ${v.licensePlate}` : ""}</option>
                      ))}
                    </FloatingField>

                    {form.vehicle && positions && (
                      positions.length === 0 ? (
                        <div className="rounded-[var(--r-md)] px-3 py-2.5 text-[12.5px]" style={{ background: "var(--input)", border: "1px dashed var(--bd-strong)", color: "var(--tx-5)" }}>
                          Este vehículo no tiene ejes configurados — se asignará sin posición.
                        </div>
                      ) : (
                        <Field label="Posición en el vehículo">
                          <SelectorPosicion
                            positions={positions}
                            value={form.position}
                            onChange={(code) => setForm((f) => ({ ...f, position: code }))}
                          />
                        </Field>
                      )
                    )}

                    <FloatingField label="Odómetro del móvil al montar (km)" type="number" min="0" required error={errors.kmAlta} value={form.kmAlta || ""} onChange={set("kmAlta")} />
                  </>
                )}

                {action === "unassign" && (
                  <>
                    <div className="rounded-[var(--r-md)] px-3.5 py-3 text-[12.5px]" style={{ background: tint("var(--ink-orange)", 8), border: `1px solid ${tint("var(--ink-orange)", 30)}`, color: "var(--tx-2)" }}>
                      Bajando de <b style={{ color: "var(--tx)" }}>{tire.vehicle?.mobile || "el vehículo"}</b>
                      {tire.position && <> · posición <b style={{ color: "var(--tx)", fontFamily: "var(--font-mono)" }}>{tire.position}</b></>}
                      {odometroAlMontar != null && (
                        <div className="mt-1" style={{ color: "var(--tx-4)" }}>
                          Se montó con el odómetro en <b style={{ color: "var(--tx-2)", fontFamily: "var(--font-mono)" }}>{fmtKm(odometroAlMontar)}</b>: el valor de abajo no puede ser menor.
                        </div>
                      )}
                    </div>
                    <FloatingField label="Odómetro del móvil al desmontar (km)" type="number" min="0" required error={errors.kmBaja} value={form.kmBaja || ""} onChange={set("kmBaja")} />
                  </>
                )}

                {action === "recap" && (
                  <>
                    <FloatingField as="select" label="Nuevo estado de recapado" required error={errors.status} value={form.status || ""} onChange={set("status")}>
                      <option value="">Seleccionar estado…</option>
                      {recapOptions.map((o) => (
                        <option key={o.name} value={o.name} disabled={o.nivel <= nivelActual}>
                          {o.name}{o.nivel <= nivelActual ? " — ya alcanzado" : ""}
                        </option>
                      ))}
                    </FloatingField>
                    {!siguienteRecap && (
                      <div className="rounded-[var(--r-md)] px-3 py-2.5 text-[12.5px]" style={{ background: tint("var(--ink-orange)", 8), border: "1px solid " + tint("var(--ink-orange)", 35), color: "var(--ink-orange)" }}>
                        Esta cubierta ya recorrió toda la escalera de recapados del tenant. El paso que sigue es descartarla.
                      </div>
                    )}
                  </>
                )}

                {action === "edit" && (
                  <>
                    <FloatingField label="N° de serie" required error={errors.serialNumber} value={form.serialNumber || ""} onChange={set("serialNumber")} />
                    <FloatingField label="Código interno" type="number" required error={errors.code} value={form.code ?? ""} onChange={set("code")} />
                    <FloatingField label="Marca" required error={errors.brand} value={form.brand || ""} onChange={set("brand")} />
                    <FloatingField label="Rodado" required error={errors.size} value={form.size || ""} onChange={set("size")} />
                    <FloatingField label="Dibujo" required error={errors.pattern} value={form.pattern || ""} onChange={set("pattern")} />
                    <FloatingField label="Motivo de la corrección" required error={errors.reason} value={form.reason || ""} onChange={set("reason")} title="Ej.: se cargó el odómetro del móvil equivocado" />
                  </>
                )}

                {action === "sendRecap" && (
                  <div className="rounded-[var(--r-md)] px-3 py-2.5 text-[12.5px]" style={{ background: tint("var(--ink-orange)", 8), border: "1px solid " + tint("var(--ink-orange)", 35), color: "var(--ink-orange)" }}>
                    Vas a marcar esta cubierta (#{formatTireCode(tire.code, data?.tireCodePrefix)}) como gastada: pasa a «{recapStatus}» y queda a la espera del recapado. Mientras tanto no se puede montar en un vehículo.
                  </div>
                )}

                {action === "discard" && (
                  <div className="rounded-[var(--r-md)] px-3 py-2.5 text-[12.5px]" style={{ background: tint("var(--ink-red)", 8), border: "1px solid " + tint("var(--ink-red)", 35), color: "var(--ink-red)" }}>
                    Vas a dar de baja definitiva esta cubierta (#{formatTireCode(tire.code, data?.tireCodePrefix)}). Queda registrado en el historial con su comprobante.
                  </div>
                )}

                {action === "undo" && (
                  <div className="rounded-[var(--r-md)] px-3 py-2.5 text-[12.5px]" style={{ background: "var(--input)", border: "1px solid var(--bd-strong)", color: "var(--tx-4)" }}>
                    Vas a revertir el movimiento «<b style={{ color: "var(--tx-2)" }}>{actionEntry?.type}</b>» del {fmtDate(actionEntry?.date)}.
                    {" "}<b style={{ color: "var(--tx-2)" }}>{efectoDelUndo(actionEntry, tire)}</b>
                    {" "}La reversión queda registrada con su comprobante.
                  </div>
                )}

                {action === "editHist" && (
                  <>
                    {/* t150: corregir era a ciegas. El formulario pedía re-elegir TODO sin
                        mostrar los valores originales, así que arreglar un odómetro mal
                        tipeado exponía a cambiar el estado sin querer. Acá está lo que dice
                        hoy el movimiento; lo que quede distinto abajo es lo que se corrige. */}
                    <div className="rounded-[var(--r-md)] px-3.5 py-3 text-[12px]" style={{ background: "var(--input)", border: "1px solid var(--bd-strong)", color: "var(--tx-4)" }}>
                      <div className="mb-1.5 text-[10.5px] tracking-[.08em]" style={{ fontFamily: "var(--font-mono)", color: "var(--tx-6)" }}>VALORES ACTUALES DEL MOVIMIENTO</div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {actionEntry?.status && <span>Estado: <b style={{ color: "var(--tx-2)" }}>{actionEntry.status}</b></span>}
                        {actionEntry?.vehicle?.mobile && <span>Vehículo: <b style={{ color: "var(--tx-2)" }}>{actionEntry.vehicle.mobile}</b></span>}
                        {actionEntry?.kmAlta != null && <span>Odóm. al montar: <b style={{ color: "var(--tx-2)", fontFamily: "var(--font-mono)" }}>{fmtKm(actionEntry.kmAlta)}</b></span>}
                        {actionEntry?.kmBaja != null && <span>Odóm. al desmontar: <b style={{ color: "var(--tx-2)", fontFamily: "var(--font-mono)" }}>{fmtKm(actionEntry.kmBaja)}</b></span>}
                        {actionEntry?.orderNumber && <span>Orden: <b style={{ color: "var(--tx-2)", fontFamily: "var(--font-mono)" }}>{actionEntry.orderNumber}</b></span>}
                      </div>
                    </div>
                    <FloatingField as="select" label="Estado" required error={errors.status} value={form.status || ""} onChange={set("status")}>
                      <option value="">Seleccionar estado…</option>
                      {statuses.map((s) => <option key={s.name} value={s.name}>{s.name}{s.name === actionEntry?.status ? " — actual" : ""}</option>)}
                    </FloatingField>
                    {editBaseType(actionEntry) === "Asignación" && (
                      <>
                        <FloatingField as="select" label="Vehículo" required error={errors.vehicle} value={form.vehicle || ""} onChange={set("vehicle")}>
                          <option value="">Seleccionar vehículo…</option>
                          {vehicles.map((v) => <option key={v._id} value={v._id}>{v.mobile}{v.licensePlate ? ` · ${v.licensePlate}` : ""}</option>)}
                        </FloatingField>
                        <FloatingField label="Odómetro del móvil al montar (km)" type="number" min="0" required error={errors.kmAlta} value={form.kmAlta ?? ""} onChange={set("kmAlta")} />
                      </>
                    )}
                    {editBaseType(actionEntry) === "Desasignación" && (
                      <FloatingField label="Odómetro del móvil al desmontar (km)" type="number" min="0" required error={errors.kmBaja} value={form.kmBaja ?? ""} onChange={set("kmBaja")} />
                    )}
                    <FloatingField label="Motivo de la corrección" required error={errors.reason} value={form.reason || ""} onChange={set("reason")} title="Ej.: se cargó el odómetro del móvil equivocado" />
                  </>
                )}

                <FloatingField label="N° de orden" required error={errors.orderNumber} value={form.orderNumber || ""} onChange={set("orderNumber")} />
                </div>

                <div className="mt-5 flex gap-3">
                  <button onClick={() => setAction(null)} className="flex-1 rounded-[var(--r-md)] py-2.5 text-[13px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx-2)" }}>
                    Cancelar
                  </button>
                  <button
                    onClick={actionHandlers[action]}
                    disabled={submitting}
                    className="flex-1 rounded-[var(--r-md)] py-2.5 text-[13px] font-bold"
                    style={{ background: action === "discard" ? "var(--ink-red)" : "var(--ink-lime)", color: action === "discard" ? "#fff" : "var(--brand-ink)", opacity: submitting ? 0.6 : 1 }}
                  >
                    {submitting ? "Guardando…" : action === "discard" ? "Descartar" : action === "sendRecap" ? "Enviar a recapar" : action === "edit" ? "Guardar cambios" : action === "undo" ? "Deshacer" : action === "editHist" ? "Guardar" : "Confirmar"}
                  </button>
                </div>
              </div>
            ) : (
              /* ---------- Vista de detalle · sidePanel (Claude Design) ---------- */
              <div className="flex-1 overflow-auto" style={{ padding: "22px 24px" }}>
                {/* Lifecycle stepper */}
                <div className="mb-4 text-[10.5px] tracking-[.06em]" style={{ fontFamily: "var(--font-mono)", color: "var(--tx-6)" }}>CICLO DE VIDA</div>
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
                <div className="mb-6 grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "16px 18px", padding: "18px 19px", border: "1px solid var(--bd-soft)", borderRadius: "var(--r-md)", background: "var(--input)" }}>
                  {infoItems.map((it) => (
                    <div key={it.label}>
                      <div className="mb-[3px] text-[11px] font-medium" style={{ color: "var(--tx-5)" }}>{it.label}</div>
                      <div className="text-[14px] font-semibold" style={{ color: it.accent || "var(--tx)", fontFamily: it.mono ? "var(--font-mono)" : undefined }}>{it.value}</div>
                    </div>
                  ))}
                </div>

                {/* Acciones (estilo Claude Design) */}
                <div className="mb-7 flex flex-wrap gap-2">
                  {!tire.vehicle && !["discard", "recap"].includes(metaOf(tire.status).role) && <OpActionBtn type="assign" size={44} onClick={() => openAction("assign")} />}
                  {tire.vehicle && <OpActionBtn type="unassign" size={44} onClick={() => openAction("unassign")} />}
                  {metaOf(tire.status).role === "recap" && <OpActionBtn type="recap" size={44} onClick={() => openAction("recap")} />}
                  {!tire.vehicle && recapStatus && ["initial", "stock"].includes(metaOf(tire.status).role) && <OpActionBtn type="sendRecap" size={44} onClick={() => openAction("sendRecap")} />}
                  {metaOf(tire.status).role !== "discard" && <OpActionBtn type="edit" size={44} onClick={() => openAction("edit")} />}
                  {lastReceiptEntry && <OpActionBtn type="print" size={44} onClick={() => reprintAct.execute({ entry: lastReceiptEntry, tire })} disabled={reprintAct.isPrinting} />}
                  {!tire.vehicle && metaOf(tire.status).role !== "discard" && <OpActionBtn type="discard" size={44} onClick={() => openAction("discard")} />}
                </div>

                {/* Timeline del historial */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-[10.5px] tracking-[.06em]" style={{ fontFamily: "var(--font-mono)", color: "var(--tx-6)" }}>HISTORIAL DE MOVIMIENTOS</div>
                  <span className="rounded-full px-2.5 py-[3px] text-[11px] font-semibold" style={{ fontFamily: "var(--font-mono)", background: "var(--bd-soft)", color: "var(--tx-4)" }}>{history.length}</span>
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
                              <span className="text-[14px] font-semibold" style={{ color, fontFamily: "var(--font-display)" }}>{h.type || "Movimiento"}</span>
                              <span className="flex-none text-[11.5px]" style={{ color: "var(--tx-6)", fontFamily: "var(--font-mono)" }}>{fmtDate(h.date)}</span>
                            </div>
                            <div className="mt-[3px] text-[12.5px]" style={{ color: "var(--tx-4)" }}>{histDetail(h)}</div>
                            {histBits(h).length > 0 && (
                              <div className="mt-[9px] flex flex-wrap gap-[6px]">
                                {histBits(h).map((bit, bi) => (
                                  <span key={bi} className="rounded-[var(--r-sm)] px-[9px] py-[2px] text-[11px]" style={{ background: "var(--hover)", border: "1px solid var(--bd)" }}>
                                    <span style={{ color: "var(--tx-6)" }}>{bit.k} </span>
                                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--tx-2)" }}>{bit.val}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="mt-[10px] flex flex-wrap gap-[6px]">
                              {h.receiptNumber && <TimelineBtn onClick={() => reprintAct.execute({ entry: h, tire })} disabled={reprintAct.isPrinting} icon={<LocalPrintshopOutlinedIcon sx={{ fontSize: 13 }} />} label="Reimprimir" hover="var(--bd-hover)" />}
                              {!isCorr && <TimelineBtn onClick={() => openEntryAction("editHist", h)} icon={<EditOutlinedIcon sx={{ fontSize: 13 }} />} label="Corregir" hover="var(--ink-blue)" />}
                              {/* Deshacer SOLO en el último movimiento. Fuera de orden, el backend arma la
                                  reversión contra el estado de HOY: deshacer una asignación vieja de una
                                  cubierta ya desmontada creaba una desasignación con fecha de hoy y 0 km,
                                  de un vehículo del que ya no estaba montada. Movimientos que nunca
                                  ocurrieron, en el historial que respalda cada operación. */}
                              {!isCorr && h.type !== "Alta" && String(h._id) === String(ultimaEntrada?._id) && (
                                <TimelineBtn onClick={() => openEntryAction("undo", h)} icon={<UndoRoundedIcon sx={{ fontSize: 13 }} />} label="Deshacer" hover="var(--ink-red)" />
                              )}
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
    </Drawer>
  )
}

export default TireDrawer
