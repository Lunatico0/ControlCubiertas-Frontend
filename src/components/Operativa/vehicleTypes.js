// Catálogo de tipos de vehículo. El "tipo" se DERIVA del layout de ejes (delantero→trasero)
// comparándolo contra estos presets del front + los tipos custom del tenant (backend,
// VehicleType[]). Compartido por el alta (NuevoVehiculo) y el editor (ConfigurarEjes) para
// que ambos usen el mismo catálogo, la misma derivación y el mismo flujo de guardar custom.
export const AXLE_PRESETS = {
  moto: { label: "Moto", axles: ["moto", "moto"] },
  auto: { label: "Auto / Utilitario", axles: ["simple", "simple"] },
  camion42: { label: "Camión 4×2", axles: ["simple", "dual"] },
  camion64: { label: "Camión 6×4", axles: ["simple", "dual", "dual"] },
  tractor64: { label: "Tractor 6×4", axles: ["simple", "dual", "dual"] },
  semi2: { label: "Semi 2 ejes", axles: ["dual", "dual"] },
  semi3: { label: "Semi 3 ejes", axles: ["dual", "dual", "dual"] },
  acoplado4: { label: "Acoplado 4 ejes", axles: ["dual", "dual", "dual", "dual"] },
  bus: { label: "Bus", axles: ["simple", "dual"] },
}

export const wheelsOfAxle = (t) => (t === "dual" ? 4 : t === "moto" ? 1 : 2)
export const tiresOf = (axles) => axles.reduce((n, t) => n + wheelsOfAxle(t), 0)
export const eqLayout = (a, b) => a.length === b.length && a.every((x, i) => x === b[i])

// Catálogo completo = presets + tipos custom del tenant. Los custom entran con clave c0, c1…
export const buildCatalog = (customTypes = []) => {
  const cat = { ...AXLE_PRESETS }
  customTypes.forEach((c, i) => { cat[`c${i}`] = { label: c.name, axles: c.axles || [], custom: true } })
  return cat
}

// Tipo derivado del layout: primer preset del catálogo cuyo array de ejes coincide.
// `tipoHint` (nombre previo del vehículo) desempata entre presets con el mismo layout.
// Sin coincidencia → "custom".
export const matchType = (catalog, axles, tipoHint) => {
  const keys = Object.keys(catalog)
  if (tipoHint) {
    const byName = keys.find((k) => catalog[k].label === tipoHint && eqLayout(catalog[k].axles, axles))
    if (byName) return byName
  }
  return keys.find((k) => eqLayout(catalog[k].axles, axles)) || "custom"
}
