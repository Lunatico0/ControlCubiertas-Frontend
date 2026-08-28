// Fechas del formulario, en un solo lugar.
//
// El problema (Bug 2): un input `type="date"` entrega un DÍA SUELTO, "2026-08-28". Mandarlo
// tal cual al backend hace que `new Date("2026-08-28")` lo lea como medianoche UTC, que en
// GMT-3 es el 27 a las 21:00: la fecha queda corrida un día para atrás. Y `new Date().toISOString()`
// sufre lo mismo al revés: después de las 21:00 en GMT-3 ya devuelve MAÑANA.
//
// La solución es anclar el día suelto al MEDIODÍA local: con 12 horas de colchón a cada lado,
// ninguna zona horaria real (UTC-11 a UTC+14) puede empujarlo a otro día.
//
// Cualquier campo `date` nuevo tiene que pasar por acá. No reimplementar esto en el formulario.

const DIA_SUELTO = /^\d{4}-\d{2}-\d{2}$/

// YYYY-MM-DD del día de hoy en zona LOCAL. Es el valor que espera un input type="date".
export const todayLocal = () => formatDateOnly(new Date())

// Date (o algo parseable) → YYYY-MM-DD en zona local. Cadena vacía si no es una fecha.
export function formatDateOnly(valor) {
  const d = valor instanceof Date ? valor : new Date(valor)
  if (!valor || Number.isNaN(d.getTime())) return ""
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

// Día suelto del formulario → cadena anclada al mediodía local, lista para mandar al backend.
// Si el valor ya trae hora se devuelve intacto; si está vacío, null.
export function dateOnlyToLocalNoon(valor) {
  if (!valor) return null
  const limpio = String(valor).trim()
  if (!limpio) return null
  return DIA_SUELTO.test(limpio) ? `${limpio}T12:00:00` : limpio
}
