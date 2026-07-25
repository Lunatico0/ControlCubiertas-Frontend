import { useState, useContext } from "react"
import ApiContext from "@context/apiContext"
import { showToast } from "@utils/toast"
import { formatPlate, normalizePlate } from "@utils/plateFormat"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import Button from "@components/UI/Button"
import Callout from "@components/common/Callout"
import Drawer from "@components/UI/Drawer"
import FloatingField from "@components/UI/FloatingField"

// Drawer de edición de DATOS de un vehículo (móvil, patente, marca). Usa
// vehicles.updateData → PUT /vehicles/details/:id (valida duplicados de móvil/patente).
// El TIPO ya NO se edita acá: se define junto con los ejes (ConfigurarEjes → deriva el
// tipo del layout). El kilometraje surge de los movimientos.
const EditarVehiculo = ({ vehicle, onClose, onSaved }) => {
  const { vehicles, data } = useContext(ApiContext)
  const [form, setForm] = useState({
    mobile: vehicle?.mobile || "",
    licensePlate: vehicle?.licensePlate || "",
    brand: vehicle?.brand || "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  // La patente se guarda normalizada; el separador del tenant se muestra vía formatPlate.
  // Al editar un campo se limpia su marca de error (border rojo).
  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: k === "licensePlate" ? normalizePlate(e.target.value) : e.target.value }))
    setErrors((p) => (p[k] ? { ...p, [k]: false } : p))
  }

  const submit = async () => {
    // Validación por campo: marcamos en rojo los obligatorios faltantes.
    const e = {}
    if (!form.mobile.trim()) e.mobile = true
    if (!form.licensePlate.trim()) e.licensePlate = true
    if (Object.keys(e).length) { setErrors(e); showToast("warning", "Completá los campos obligatorios"); return }
    setErrors({})
    setSubmitting(true)
    try {
      await vehicles.updateData(vehicle._id, {
        mobile: form.mobile.trim(),
        licensePlate: form.licensePlate.trim().toUpperCase(),
        brand: form.brand.trim() || "—",
      })
      showToast("success", "Vehículo actualizado")
      onSaved?.()
      onClose()
    } catch (e) {
      showToast("error", e.message || "No se pudo actualizar el vehículo")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Drawer onClose={onClose} maxWidth="440px">
        <div className="flex items-center justify-between gap-3 p-5" style={{ borderBottom: "1px solid var(--bd-soft)" }}>
          <div>
            <h2 className="text-[20px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>Editar vehículo</h2>
            <div className="mt-0.5 text-[11.5px]" style={{ color: "var(--tx-5)", fontFamily: "'IBM Plex Mono'" }}>Datos · los ejes se editan aparte</div>
          </div>
          <button onClick={onClose} className="rounded-[7px] p-2" style={{ color: "var(--tx-5)" }} title="Cerrar">
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5">
          <div className="mb-3 flex flex-col gap-3.5">
            <FloatingField label="Móvil / Identificador" required error={errors.mobile} value={form.mobile} onChange={set("mobile")} />
            <FloatingField label="Patente" required error={errors.licensePlate} value={formatPlate(form.licensePlate, data.plateSep)} onChange={set("licensePlate")} style={{ fontFamily: "'IBM Plex Mono'", textTransform: "uppercase" }} />
            <FloatingField label="Marca" value={form.brand} onChange={set("brand")} />
          </div>
          <Callout Icon={InfoOutlinedIcon} tone="var(--ink-blue)" className="mb-3">
            El <b style={{ color: "var(--tx-2)" }}>tipo de vehículo</b> se configura junto con los ejes y las posiciones, desde <b style={{ color: "var(--tx-2)" }}>Reconfigurar ejes</b>.
          </Callout>

          <div className="mt-5 flex gap-3">
            <button onClick={onClose} className="flex-1 rounded-[9px] py-2.5 text-[13px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx-2)" }}>Cancelar</button>
            <Button variant="lime" onClick={submit} disabled={submitting} className="flex-1 text-[13px]" style={{ background: "#C4ED2B", color: "#0A0C0D", opacity: submitting ? 0.6 : 1 }}>
              {submitting ? "Guardando…" : "Guardar cambios"}
            </Button>
          </div>
        </div>
    </Drawer>
  )
}

export default EditarVehiculo
