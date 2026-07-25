import { useState, useEffect, useMemo } from "react"
import { showToast } from "@utils/toast"
import { getVehicleTypes, createVehicleType } from "@api/vehicles"
import { buildCatalog, matchType, tiresOf } from "./vehicleTypes"

// Estado + derivación compartidos por el editor de ejes (alta NuevoVehiculo y reconfiguración
// ConfigurarEjes). El "tipo" se DERIVA del layout de ejes contra el catálogo (presets del
// front + tipos custom del tenant); si no coincide con ninguno, se puede nombrar y guardar
// como tipo custom (GET/POST /api/vehicles/types). El guardado del VEHÍCULO (create vs
// updateAxles) NO vive acá: queda en cada pantalla.
//
// Params:
//  - initialAxles: layout inicial (["simple","dual"] en el alta; el del vehículo en reconfig).
//  - typeHint:     nombre previo del vehículo; desempata presets con el mismo layout (null en alta).
//  - isAxleLocked(i): ejes con cubierta montada que no se pueden quitar/cambiar (solo lo usa
//    ConfigurarEjes; en el alta nada está bloqueado). Se consulta en removeAxle/setAxleType.
export const useAxleConfig = ({ initialAxles = ["simple", "dual"], typeHint = null, isAxleLocked = () => false } = {}) => {
  const [axles, setAxles] = useState(initialAxles)
  const [customTypes, setCustomTypes] = useState([])
  const [customName, setCustomName] = useState("")
  const [savingType, setSavingType] = useState(false)

  useEffect(() => {
    getVehicleTypes().then((r) => setCustomTypes(Array.isArray(r) ? r : [])).catch(() => {})
  }, [])

  const catalog = useMemo(() => buildCatalog(customTypes), [customTypes])
  const matchedKey = useMemo(() => matchType(catalog, axles, typeHint), [catalog, axles, typeHint])
  const isCustom = matchedKey === "custom"
  const typeName = isCustom ? "" : catalog[matchedKey].label
  const total = useMemo(() => tiresOf(axles), [axles])

  const applyPreset = (key) => () => setAxles(catalog[key].axles.slice())
  const addAxle = () => setAxles((a) => [...a, "dual"])
  const removeAxle = (i) => { if (isAxleLocked(i)) return; setAxles((a) => (a.length <= 1 ? a : a.filter((_, idx) => idx !== i))) }
  const setAxleType = (i, type) => { if (isAxleLocked(i)) return; setAxles((a) => a.map((t, idx) => (idx === i ? type : t))) }

  const saveCustomType = async () => {
    const name = customName.trim()
    if (!name) return showToast("warning", "Poné un nombre para el tipo")
    setSavingType(true)
    try {
      await createVehicleType({ name, axles: axles.slice() })
      const list = await getVehicleTypes()
      setCustomTypes(Array.isArray(list) ? list : [])
      setCustomName("")
      showToast("success", `Tipo "${name}" guardado`)
    } catch (e) {
      showToast("error", e?.response?.data?.message || e.message || "No se pudo guardar el tipo")
    } finally {
      setSavingType(false)
    }
  }

  return { axles, setAxles, catalog, matchedKey, isCustom, typeName, total, customTypes, customName, setCustomName, savingType, saveCustomType, applyPreset, addAxle, removeAxle, setAxleType }
}

export default useAxleConfig
