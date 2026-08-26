import { useState, useContext } from "react"
import ApiContext from "@context/apiContext"
import { showToast } from "@utils/toast"
import { buildCreateTirePrintData } from "@utils/print-data"
import usePrint from "@hooks/usePrint"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import Button from "@components/UI/Button"
import Drawer from "@components/UI/Drawer"
import FloatingField from "@components/UI/FloatingField"

// Drawer de alta de cubierta nueva. Crea en depósito (status "Nueva"); la asignación
// a vehículo es una acción aparte. Reutiliza tires.create (refresca la lista sola).
// Espejo de KM_MAX en el backend (validators/tire.validator.js). Por encima de esto el número
// dejó de ser un dato y pasó a ser un dedazo. El backend igual lo rechaza; esto es para que el
// operario lo vea marcado en rojo en vez de comerse un error después de mandar el formulario.
const KM_MAX = 1_500_000

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
  const [errors, setErrors] = useState({})
  // Al editar un campo se limpia su marca de error (border rojo).
  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((p) => (p[k] ? { ...p, [k]: false } : p))
  }

  const submit = async () => {
    // Validación por campo: en vez de un toast genérico, marcamos en rojo los faltantes.
    const e = {}
    if (!String(form.code ?? "").trim()) e.code = true
    if (!form.serialNumber?.trim()) e.serialNumber = true
    if (!form.brand?.trim()) e.brand = true
    if (!form.size?.trim()) e.size = true
    if (!form.pattern?.trim()) e.pattern = true
    if (!form.createdAt) e.createdAt = true
    if (!form.orderNumber?.trim()) e.orderNumber = true
    if (Object.keys(e).length) { setErrors(e); showToast("warning", "Completá los campos obligatorios"); return }

    // Reglas de valor. Van aparte de las de "campo vacío" porque el mensaje tiene que decir QUÉ
    // está mal: un km negativo se imprimía tal cual en el comprobante y arrastraba a todos los
    // cálculos de rendimiento.
    const km = Number(form.kilometers || 0)
    if (!Number.isFinite(km) || km < 0) { setErrors({ kilometers: true }); showToast("warning", "El kilometraje no puede ser negativo"); return }
    if (km > KM_MAX) { setErrors({ kilometers: true }); showToast("warning", `El kilometraje no puede superar los ${KM_MAX.toLocaleString("es-AR")} km`); return }
    if (form.createdAt > todayLocal()) { setErrors({ createdAt: true }); showToast("warning", "La fecha de alta no puede ser futura"); return }

    setErrors({})
    setSubmitting(true)
    try {
      // Bug 2 (Fase 04): anclar la fecha a mediodía LOCAL para que no se corra de día
      // al serializar a UTC (input date da "YYYY-MM-DD" = medianoche UTC → -1 día en GMT-3).
      const createdAt = form.createdAt ? `${form.createdAt}T12:00:00` : new Date().toISOString()
      // El N° de comprobante lo reserva el BACKEND dentro del alta y vuelve en la respuesta.
      // Pedirlo antes quemaba el número cuando el alta se rechazaba (código duplicado, estado
      // inválido), y dejaba huecos inexplicables en el correlativo.
      const created = await tires.create({
        status: initialStatus,
        code: Number(form.code), // el input es editable (string) pero el code se guarda como Number
        serialNumber: form.serialNumber,
        brand: form.brand,
        size: form.size,
        pattern: form.pattern,
        kilometers: Number(form.kilometers) || 0,
        createdAt,
        orderNumber: form.orderNumber,
        vehicle: null,
      })
      const receipt = created?.receiptNumber || "0000-00000000"
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
    <Drawer onClose={onClose} onSubmit={() => !submitting && submit()}>
        <div className="flex items-center justify-between gap-3 p-5" style={{ borderBottom: "1px solid var(--bd-soft)" }}>
          <h2 className="text-[20px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>Nueva cubierta</h2>
          <button onClick={onClose} className="rounded-[7px] p-2" style={{ color: "var(--tx-5)" }} title="Cerrar">
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5">
          <div className="flex flex-col gap-3.5">
            <div className="grid grid-cols-2 gap-3">
              {/* Código interno: se SUGIERE el siguiente del tenant (último + 1) pero es EDITABLE.
                  El code va termofundido en el caucho de la cubierta (inmutable físicamente); al
                  reingresar/dar de alta una cubierta que ya tiene su código grabado, hay que poder
                  tipear ESE código, no el sugerido. */}
              <FloatingField label="Código interno" type="number" min="1" required error={errors.code} value={form.code} onChange={set("code")} />
              <FloatingField label="N° de serie" required error={errors.serialNumber} value={form.serialNumber} onChange={set("serialNumber")} />
            </div>
            <FloatingField label="Marca" required error={errors.brand} value={form.brand} onChange={set("brand")} />
            <div className="grid grid-cols-2 gap-3">
              <FloatingField label="Rodado" required error={errors.size} value={form.size} onChange={set("size")} />
              <FloatingField label="Dibujo" required error={errors.pattern} value={form.pattern} onChange={set("pattern")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FloatingField label="Kilómetros" type="number" min="0" max={KM_MAX} error={errors.kilometers} value={form.kilometers} onChange={set("kilometers")} />
              <FloatingField label="Fecha de alta" type="date" required max={todayLocal()} error={errors.createdAt} value={form.createdAt} onChange={set("createdAt")} />
            </div>
            <FloatingField label="N° de orden" required error={errors.orderNumber} value={form.orderNumber} onChange={set("orderNumber")} />
          </div>

          <div className="mt-5 flex gap-3">
            <button onClick={onClose} className="flex-1 rounded-[9px] py-2.5 text-[13px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx-2)" }}>Cancelar</button>
            <Button variant="lime" onClick={submit} disabled={submitting} className="flex-1 text-[13px]" style={{ background: "#C4ED2B", color: "#0A0C0D", opacity: submitting ? 0.6 : 1 }}>
              {submitting ? "Creando…" : "Crear cubierta"}
            </Button>
          </div>
        </div>
    </Drawer>
  )
}

export default AltaDrawer
