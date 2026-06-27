// Espejo (frontend) de backend/src/utils/axles.js → generatePositions.
// Deriva las posiciones de cubierta a partir de los ejes del vehículo, para dibujar
// el esquema en las cards de Vehículos SIN pegarle al endpoint por cada vehículo
// (las cubiertas montadas se cruzan en el front con data.tires por su .position).
const SIMPLE_SLOTS = [
  { suffix: "I" },
  { suffix: "D" },
]
const DUAL_SLOTS = [
  { suffix: "IE" },
  { suffix: "II" },
  { suffix: "DI" },
  { suffix: "DE" },
]
const MOTO_SLOTS = [{ suffix: "U" }] // rueda única (moto)
const SLOTS_BY_TYPE = { simple: SIMPLE_SLOTS, dual: DUAL_SLOTS, moto: MOTO_SLOTS }

// axles: [{ type: 'simple'|'dual'|'moto' }] delantero→trasero. Devuelve [{ code, axle }].
export function generatePositions(axles = []) {
  const positions = []
  ;(axles || []).forEach((axle, i) => {
    const n = i + 1
    const slots = SLOTS_BY_TYPE[axle?.type] || SIMPLE_SLOTS
    for (const s of slots) positions.push({ code: `E${n}-${s.suffix}`, axle: n })
  })
  return positions
}
