import { useState, useEffect, useContext } from "react"
import ApiContext from "@context/apiContext"
import { showToast } from "@utils/toast"
import { buildCreateTirePrintData } from "@utils/print-data"
import usePrint from "@hooks/usePrint"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"

// Drawer de alta de cubierta nueva. Crea en depósito (status "Nueva"); la asignación
// a vehículo es una acción aparte. Reutiliza tires.create (refresca la lista sola).
const fieldStyle = { background: "var(--input)", border: "1.5px solid var(--bd)", color: "var(--tx)" }
const labelCls = "mb-1.5 block text-[12.5px] font-medium"
const inputCls = "w-full rounded-[9px] px-3 py-2.5 text-[14px] outline-none"

const Field = ({ label, children }) => (
  <div className="mb-3">
    <label className={labelCls} style={{ color: "var(--tx-3)" }}>{label}</label>
    {children}
  </div>
)

const todayLocal = () => {
  const d = new Date()
  // YYYY-MM-DD en hora local (no UTC), para el value del input date.
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

const AltaDrawer = ({ onClose, onCreated }) => {
  const { tires, data, orders } = useContext(ApiContext)
  const { print } = usePrint()
  const initialStatus = data?.initialStatus || "Nueva" // estado de alta configurable del tenant
  const [form, setForm] = useState({
    code: data?.suggestedCode || "",
    serialNumber: "",
    brand: "",
    size: "",
    pattern: "",
    kilometers: "",
    createdAt: todayLocal(),
    orderNumber: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const submit = async () => {
    if (!form.code || !form.serialNumber || !form.brand || !form.size || !form.pattern || !form.orderNumber) {
      return showToast("warning", "Completá código, serie, marca, rodado, dibujo y N° de orden")
    }
    setSubmitting(true)
    try {
      // Bug 2 (Fase 04): anclar la fecha a mediodía LOCAL para que no se corra de día
      // al serializar a UTC (input date da "YYYY-MM-DD" = medianoche UTC → -1 día en GMT-3).
      const createdAt = form.createdAt ? `${form.createdAt}T12:00:00` : new Date().toISOString()
      // Reservar el N° de comprobante ANTES de crear, para persistirlo en el history "Alta".
      // El backend incrementa el contador por cada llamada → correlativo sin duplicados.
      let receipt = "0000-00000000"
      try { receipt = await orders.getNextReceipt() } catch { /* si falla, se imprime sin N° */ }
      const created = await tires.create({
        status: initialStatus,
        code: form.code,
        serialNumber: form.serialNumber,
        brand: form.brand,
        size: form.size,
        pattern: form.pattern,
        kilometers: Number(form.kilometers) || 0,
        createdAt,
        orderNumber: form.orderNumber,
        vehicle: null,
        receiptNumber: receipt,
      })
      // Imprimir el comprobante de alta (mismo layout unificado que el resto de las acciones).
      try {
        const printData = buildCreateTirePrintData({
          code: form.code || created?.code || created?.tire?.code || "",
          serialNumber: form.serialNumber,
          brand: form.brand,
          size: form.size,
          pattern: form.pattern,
          kilometers: Number(form.kilometers) || 0,
          status: initialStatus,
          orderNumber: form.orderNumber,
          vehicle: null,
        }, receipt)
        await print(printData)
      } catch (printErr) {
        console.error("Error al imprimir el comprobante de alta:", printErr)
        showToast("warning", "La cubierta se creó, pero hubo un problema al imprimir el comprobante")
      }
      showToast("success", "Cubierta creada con éxito")
      onCreated?.()
      onClose()
    } catch (e) {
      showToast("error", e.message || "No se pudo crear la cubierta")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(0,0,0,.45)" }} onClick={onClose}>
      <aside
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-[460px] flex-col"
        style={{ background: "var(--card)", borderLeft: "1px solid var(--bd)", animation: "opDrawerIn .18s ease" }}
      >
        <div className="flex items-center justify-between gap-3 p-5" style={{ borderBottom: "1px solid var(--bd-soft)" }}>
          <h2 className="text-[20px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>Nueva cubierta</h2>
          <button onClick={onClose} className="rounded-[7px] p-2" style={{ color: "var(--tx-5)" }} title="Cerrar">
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5">
          <div className="grid grid-cols-2 gap-x-3">
            <Field label="Código interno"><input className={inputCls} style={fieldStyle} value={form.code} onChange={set("code")} placeholder="Auto" /></Field>
            <Field label="N° de serie"><input className={inputCls} style={fieldStyle} value={form.serialNumber} onChange={set("serialNumber")} /></Field>
          </div>
          <Field label="Marca"><input className={inputCls} style={fieldStyle} value={form.brand} onChange={set("brand")} placeholder="Ej. Bridgestone" /></Field>
          <div className="grid grid-cols-2 gap-x-3">
            <Field label="Rodado"><input className={inputCls} style={fieldStyle} value={form.size} onChange={set("size")} placeholder="295/80 R22.5" /></Field>
            <Field label="Dibujo"><input className={inputCls} style={fieldStyle} value={form.pattern} onChange={set("pattern")} placeholder="Con Taco" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-x-3">
            <Field label="Kilómetros (opcional)"><input type="number" min="0" className={inputCls} style={fieldStyle} value={form.kilometers} onChange={set("kilometers")} placeholder="0" /></Field>
            <Field label="Fecha de alta"><input type="date" className={inputCls} style={fieldStyle} value={form.createdAt} onChange={set("createdAt")} /></Field>
          </div>
          <Field label="N° de orden"><input className={inputCls} style={fieldStyle} value={form.orderNumber} onChange={set("orderNumber")} placeholder="Ej. 2026-000123" /></Field>

          <div className="mt-5 flex gap-3">
            <button onClick={onClose} className="flex-1 rounded-[9px] py-2.5 text-[13px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx-2)" }}>Cancelar</button>
            <button onClick={submit} disabled={submitting} className="flex-1 rounded-[9px] py-2.5 text-[13px] font-bold" style={{ background: "var(--ink-lime)", color: "#0A0C0D", opacity: submitting ? 0.6 : 1 }}>
              {submitting ? "Creando…" : "Crear cubierta"}
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default AltaDrawer
