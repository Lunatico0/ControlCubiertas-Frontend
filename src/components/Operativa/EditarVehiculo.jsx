import { useState, useEffect, useContext } from "react"
import ApiContext from "@context/apiContext"
import { showToast } from "@utils/toast"
import { tint } from "./status"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"

// Drawer de edición de DATOS de un vehículo (móvil, patente, marca, tipo). Usa
// vehicles.updateData → PUT /vehicles/details/:id (valida duplicados de móvil/patente).
// Los EJES se editan aparte con ConfigurarEjes; el kilometraje surge de los movimientos.
const TIPOS = ["Camión", "Semi", "Acoplado", "Bus", "Auto", "Moto"]
const fieldStyle = { background: "var(--input)", border: "1.5px solid var(--bd)", color: "var(--tx)" }
const labelCls = "mb-1.5 block text-[12.5px] font-medium"
const inputCls = "w-full rounded-[9px] px-3 py-2.5 text-[14px] outline-none"

const Field = ({ label, children }) => (
  <div className="mb-3">
    <label className={labelCls} style={{ color: "var(--tx-3)" }}>{label}</label>
    {children}
  </div>
)

const EditarVehiculo = ({ vehicle, onClose, onSaved }) => {
  const { vehicles } = useContext(ApiContext)
  const [form, setForm] = useState({
    mobile: vehicle?.mobile || "",
    licensePlate: vehicle?.licensePlate || "",
    brand: vehicle?.brand || "",
    type: vehicle?.type || "Camión",
  })
  const [submitting, setSubmitting] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

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
        type: form.type,
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
          <Field label="Patente"><input className={inputCls} style={{ ...fieldStyle, fontFamily: "'IBM Plex Mono'", textTransform: "uppercase" }} value={form.licensePlate} onChange={set("licensePlate")} placeholder="AB123CD" /></Field>
          <Field label="Marca"><input className={inputCls} style={fieldStyle} value={form.brand} onChange={set("brand")} placeholder="Scania" /></Field>
          <Field label="Tipo">
            <div className="flex flex-wrap gap-[7px]">
              {TIPOS.map((t) => {
                const on = form.type === t
                return (
                  <button key={t} onClick={() => setForm((f) => ({ ...f, type: t }))} className="h-9 rounded-lg px-3.5 text-[13px] font-semibold" style={{ border: `1px solid ${on ? "var(--ink-lime)" : "var(--bd-strong)"}`, background: on ? tint("var(--ink-lime)", 10) : "var(--input)", color: on ? "var(--ink-lime)" : "var(--tx-3)" }}>{t}</button>
                )
              })}
            </div>
          </Field>

          <div className="mt-5 flex gap-3">
            <button onClick={onClose} className="flex-1 rounded-[9px] py-2.5 text-[13px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx-2)" }}>Cancelar</button>
            <button onClick={submit} disabled={submitting} className="flex-1 rounded-[9px] py-2.5 text-[13px] font-bold" style={{ background: "var(--ink-lime)", color: "#0A0C0D", opacity: submitting ? 0.6 : 1 }}>
              {submitting ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default EditarVehiculo
