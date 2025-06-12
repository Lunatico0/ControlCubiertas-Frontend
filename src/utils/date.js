export const formatDate = (date, options = {}) => {
  if (!date) return ""
  try {
    const d = typeof date === "string" ? new Date(date) : date
    return d.toLocaleDateString("es-AR", options)
  } catch (error) {
    console.error("❌ Error al formatear fecha:", error)
    return ""
  }
}

export const daysBetween = (from, to = new Date()) => {
  const d1 = new Date(from)
  const d2 = new Date(to)
  return Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24))
}

export const isToday = (input) => {
  const d = new Date(input)
  const today = new Date()
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  )
}
