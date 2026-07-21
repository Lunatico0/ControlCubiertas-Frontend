import { useState, useEffect, useContext } from "react"
import ApiContext from "@context/apiContext"
import { showToast } from "@utils/toast"
import Field from "@components/common/Field"
import { formatPlate, normalizePlate } from "@utils/plateFormat"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"

// Drawer de edición de DATOS de un vehículo (móvil, patente, marca). Usa
// vehicles.updateData → PUT /vehicles/details/:id (valida duplicados de móvil/patente).
// El TIPO ya NO se edita acá: se define junto con los ejes (ConfigurarEjes → deriva el
// tipo del layout). El kilometraje surge de los movimientos.
const fieldStyle = { background: "var(--input)", border: "1.5px solid var(--bd)", color: "var(--tx)" }
const inputCls = "w-full rounded-[9px] px-3 py-2.5 text-[14px] outline-none"

const EditarVehiculo = ({ vehicle, onClose, onSaved }) => {
  const { vehicles, data } = useContext(ApiContext)
  const [form, setForm] = useState({
    mobile: vehicle?.mobile || "",
    licensePlate: vehicle?.licensePlate || "",
    brand: vehicle?.brand || "",
  })
  const [submitting, setSubmitting] = useState(false)
  // La patente se guarda normalizada; el separador del tenant se muestra vía formatPlate.
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: k === "licensePlate" ? normalizePlate(e.target.value) : e.target.value }))

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const submit = async () => {
    if (!form.mobile.trim() || !form.licensePlate.trim()) return showToast("warning", "Completá móvil y patente")
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
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(0,0,0,.45)" }} onClick={onClose}>
      <aside
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-[440px] flex-col"
        style={{ background: "var(--card)", borderLeft: "1px solid var(--bd)", animation: "opDrawerIn .18s ease" }}
      >
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
          <Field label="Móvil / Identificador"><input className={inputCls} style={fieldStyle} value={form.mobile} onChange={set("mobile")} placeholder="Móvil 07" /></Field>
          <Field label="Patente"><input className={inputCls} style={{ ...fieldStyle, fontFamily: "'IBM Plex Mono'", textTransform: "uppercase" }} value={formatPlate(form.licensePlate, data.plateSep)} onChange={set("licensePlate")} placeholder={formatPlate("AB123CD", data.plateSep)} /></Field>
          <Field label="Marca"><input className={inputCls} style={fieldStyle} value={form.brand} onChange={set("brand")} placeholder="Scania" /></Field>
          <div className="mb-3 flex items-start gap-2.5 rounded-[10px] px-3 py-2.5" style={{ border: "1px solid var(--bd-soft)", background: "var(--input)" }}>
            <span className="mt-0.5 inline-flex flex-none" style={{ color: "var(--ink-blue)" }}><InfoOutlinedIcon sx={{ fontSize: 16 }} /></span>
            <span className="text-[12px] leading-relaxed" style={{ color: "var(--tx-4)" }}>El <b style={{ color: "var(--tx-2)" }}>tipo de vehículo</b> se configura junto con los ejes y las posiciones, desde <b style={{ color: "var(--tx-2)" }}>Reconfigurar ejes</b>.</span>
          </div>

          <div className="mt-5 flex gap-3">
            <button onClick={onClose} className="flex-1 rounded-[9px] py-2.5 text-[13px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx-2)" }}>Cancelar</button>
            <button onClick={submit} disabled={submitting} className="flex-1 rounded-[9px] py-2.5 text-[13px] font-bold" style={{ background: "#C4ED2B", color: "#0A0C0D", opacity: submitting ? 0.6 : 1 }}>
              {submitting ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default EditarVehiculo
