// Formateo del código interno de cubierta para DISPLAY. El `code` se GUARDA como Number
// autoincremental (nunca lleva prefijo); el prefijo es solo visual y configurable por tenant.
// Función PURA: el prefijo se pasa como argumento (viene del contexto React → reactivo).

// Antepone el prefijo al código. formatTireCode(12, "T-") → "T-12"; sin prefijo → "12".
// code null/undefined → "" (no mostramos "undefined" ni un prefijo suelto).
export const formatTireCode = (code, prefix = "") => {
  if (code == null || code === "") return ""
  return `${prefix ?? ""}${code}`
}
