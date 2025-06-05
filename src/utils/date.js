/**
 * Formatea una fecha en formato local (es-AR)
 * @param {Date|string} date - Fecha a formatear
 * @param {Object} options - Opciones de formato
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, options = {}) => {
  if (!date) return ""

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return dateObj.toLocaleDateString("es-AR", options)
  } catch (error) {
    console.error("Error al formatear fecha:", error)
    return ""
  }
}

/**
 * Calcula la diferencia en días entre dos fechas
 * @param {Date|string} date1 - Primera fecha
 * @param {Date|string} date2 - Segunda fecha (default: fecha actual)
 * @returns {number} Diferencia en días
 */
export const daysBetween = (date1, date2 = new Date()) => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d2 - d1)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Verifica si una fecha es hoy
 * @param {Date|string} date - Fecha a verificar
 * @returns {boolean} True si la fecha es hoy
 */
export const isToday = (date) => {
  const today = new Date()
  const dateObj = new Date(date)
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  )
}
