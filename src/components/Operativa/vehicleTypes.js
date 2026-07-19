// Catálogo de tipos de vehículo. El "tipo" se DERIVA del layout de ejes (delantero→trasero)
// comparándolo contra estos presets del front + los tipos custom del tenant (backend,
// VehicleType[]). Compartido por el alta (NuevoVehiculo) y el editor (ConfigurarEjes) para
// que ambos usen el mismo catálogo, la misma derivación y el mismo flujo de guardar custom.
// El tipo se DERIVA del layout de ejes (simple=2 cubiertas, dual=4, moto=1). Como el modelo
// solo distingue cubiertas-por-eje (no cuál tracciona/dirige), varias categorías del diseño
// comparten el MISMO layout (ej. Camión 6×4 = Camión balancín 6×2 = Tractor 6×4). Por eso el
// catálogo tiene UN preset por layout único (si dos coinciden, quedaría uno "inaccesible" en
// el selector porque matchType elige el primero) — cada entrada acá es un layout distinto.
export const AXLE_PRESETS = {
  moto:      { label: "Moto",                 axles: ["moto", "moto"] },              // 2
  auto:      { label: "Auto / Utilitario",    axles: ["simple", "simple"] },          // 4
  camion42:  { label: "Camión 4×2",           axles: ["simple", "dual"] },            // 6
  camion64:  { label: "Camión 6×4",           axles: ["simple", "dual", "dual"] },    // 10
  semi2:     { label: "Semirremolque 2 ejes", axles: ["dual", "dual"] },              // 8
  bus62:     { label: "Bus larga dist. 6×2",  axles: ["simple", "dual", "simple"] },  // 8
  semi3:     { label: "Semirremolque 3 ejes", axles: ["dual", "dual", "dual"] },      // 12
  bitren4:   { label: "Bitrén 4 ejes",        axles: ["simple", "dual", "dual", "dual"] }, // 14
  acoplado4: { label: "Acoplado 4 ejes",      axles: ["dual", "dual", "dual", "dual"] },   // 16
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
