import { useState, useContext } from "react"
import ApiContext from "@context/apiContext"
import { useModalEscape } from "@hooks/useModalStack"
import isElectron from "@utils/isElectron"
import { showToast } from "@utils/toast"
import { formatPlate, normalizePlate, isValidPlate, describirFormatos } from "@utils/plateFormat"
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded"
import Button from "@components/UI/Button"
import MonoLabel from "@components/UI/MonoLabel"
import FloatingField from "@components/UI/FloatingField"
import { useAxleConfig } from "./useAxleConfig"
import AxleEditor from "./AxleEditor"
import TruckDiagram from "./TruckDiagram"

// Alta de vehículo (rediseño Claude Design). Pantalla dedicada: datos + configuración de
// ejes con preview en vivo. El TIPO ya NO se elige a mano: se DERIVA del layout de ejes
// (catálogo compartido en vehicleTypes.js = presets + custom del tenant); si no coincide con
// ninguno, se puede nombrar y guardar como tipo custom. Crea con vehicles.create → POST
// /api/vehicles { mobile, licensePlate, brand, type (derivado), kilometers, axles }.
// La lógica/UI del editor de ejes es compartida: hook useAxleConfig + AxleEditor + TruckDiagram.
const NuevoVehiculo = ({ onClose, onCreated }) => {
  const { vehicles, data } = useContext(ApiContext)
  const [form, setForm] = useState({ movil: "", patente: "", marca: "", km: "" })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({}) // errores de validación front (obligatorios faltantes)
  const [errField, setErrField] = useState(null) // "movil" | "patente" — campo en conflicto (backend)
  const [errMsg, setErrMsg] = useState("")

  // En el alta nada está bloqueado (no hay cubiertas montadas) → useAxleConfig sin isAxleLocked.
  const {
    axles, catalog, matchedKey, isCustom, typeName, total,
    customName, setCustomName, savingType, saveCustomType,
    applyPreset, addAxle, removeAxle, setAxleType,
  } = useAxleConfig({ initialAxles: ["simple", "dual"] })

  // La patente se guarda normalizada (alfanumérica MAYÚS, sin separadores); el separador
  // configurado por el tenant se muestra en el input vía formatPlate. Al editar un campo se
  // limpia tanto su error front como el conflicto de backend.
  const set = (k) => (e) => {
    const v = k === "patente" ? normalizePlate(e.target.value) : e.target.value
    setForm((f) => ({ ...f, [k]: v }))
    if (errField === k) { setErrField(null); setErrMsg("") }
    setErrors((p) => (p[k] ? { ...p, [k]: false } : p))
  }

  // Escape cierra la pantalla (stack-aware, unificado con el resto de modales/drawers).
  useModalEscape(onClose)

  const submit = async () => {
    // Validación por campo: marcamos en rojo los obligatorios faltantes en vez del toast genérico.
    const e = {}
    if (!form.movil.trim()) e.movil = true
    if (!form.patente.trim()) e.patente = true
    if (Object.keys(e).length) { setErrors(e); showToast("warning", "Completá los campos obligatorios"); return }
    // t138: el formato se chequea ACÁ además del backend. No es una validación duplicada por
    // desconfianza: es para que el error aparezca al lado del campo en vez de volver como un
    // 400 y un toast, después de un viaje entero por un error de tipeo.
    if (!isValidPlate(form.patente, data.plateFormats)) {
      setErrors({ patente: `Formato de patente inválido. Se espera: ${describirFormatos(data.plateFormats, data.plateSep)}` })
      return
    }
    setErrors({})
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
      const field = e?.field || e?.response?.data?.field
      const msg = e?.message || "No se pudo crear el vehículo"
      const mapped = field === "mobile" ? "movil" : field === "licensePlate" ? "patente" : null
      setErrField(mapped)
      setErrMsg(mapped ? msg : "")
      showToast("error", msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Error a mostrar en cada FloatingField: combina el error front (obligatorio faltante) con
  // el conflicto reportado por el backend (errField/errMsg) → borde rojo + mensaje debajo.
  const fieldError = (name) => errors[name] || (errField === name ? errMsg || true : false)

  return (
    <div className="fixed bottom-0 right-0 left-64 z-60 flex flex-col" style={{ top: isElectron() ? 38 : 0, background: "var(--bg)", borderLeft: "1px solid var(--bd-faint)" }}>
      {/* ===== TOP BAR ===== */}
      <div className="flex h-16 flex-none items-center gap-3.5 px-6" style={{ background: "var(--sidebar)", borderBottom: "1px solid var(--bd-faint)" }}>
        <button onClick={onClose} title="Volver" className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-[var(--r-md)]" style={{ border: "1px solid var(--bd)", background: "var(--elev)", color: "var(--tx-3)" }}>
          <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
        </button>
        <div style={{ lineHeight: 1.2 }}>
          <div className="text-[17px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--tx)" }}>Nuevo vehículo</div>
          <div className="text-[11.5px]" style={{ color: "var(--tx-5)", fontFamily: "var(--font-mono)" }}>Vehículos · Alta</div>
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          <button onClick={onClose} className="h-10 rounded-[var(--r-md)] px-[15px] text-[13.5px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx)" }}>Cancelar</button>
          <Button variant="lime" onClick={submit} disabled={submitting} className="h-10 text-[13.5px]" style={{ background: "var(--brand)", color: "var(--brand-ink)", opacity: submitting ? 0.6 : 1 }}>
            {submitting ? "Creando…" : "Crear vehículo"}
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* ===== FORM ===== */}
        <div className="w-[440px] flex-none overflow-y-auto" style={{ background: "var(--elev)", borderRight: "1px solid var(--bd)" }}>
          {/* DATOS */}
          <div className="px-6 py-[22px]" style={{ borderBottom: "1px solid var(--bd-faint)" }}>
            <MonoLabel className="mb-4 text-[10px] tracking-[.12em]" style={{ color: "var(--tx-6)" }}>DATOS DEL VEHÍCULO</MonoLabel>
            <div className="grid grid-cols-2 gap-[13px]">
              <FloatingField label="Móvil / Identificador" required error={fieldError("movil")} value={form.movil} onChange={set("movil")} />
              <FloatingField label="Patente" required error={fieldError("patente")} value={formatPlate(form.patente, data.plateSep)} onChange={set("patente")} style={{ fontFamily: "var(--font-mono)", textTransform: "uppercase" }} />
              <FloatingField label="Marca" value={form.marca} onChange={set("marca")} />
              <FloatingField label="Kilometraje actual" type="number" min="0" value={form.km} onChange={set("km")} style={{ fontFamily: "var(--font-mono)" }} />
            </div>
          </div>

          {/* TIPO DE VEHÍCULO + EJES (editor compartido) */}
          <AxleEditor
            catalog={catalog}
            matchedKey={matchedKey}
            applyPreset={applyPreset}
            isCustom={isCustom}
            customName={customName}
            setCustomName={setCustomName}
            savingType={savingType}
            saveCustomType={saveCustomType}
            axles={axles}
            total={total}
            addAxle={addAxle}
            removeAxle={removeAxle}
            setAxleType={setAxleType}
          />
        </div>

        {/* ===== PREVIEW ===== */}
        <TruckDiagram
          axles={axles}
          total={total}
          isCustom={isCustom}
          typeName={typeName}
          subtitle={`Vista superior · ${total} cubiertas (todas vacías al crear)`}
          spineClass="top-3.5 bottom-3.5"
          axlesGapClass="gap-5"
          statsMarginClass="mt-[22px]"
          positionsLabel="posiciones de cubierta"
        />
      </div>
    </div>
  )
}

export default NuevoVehiculo
