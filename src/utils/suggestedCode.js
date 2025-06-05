/**
 * Obtiene un código sugerido para una nueva cubierta
 * @param {Array} tires - Lista de cubiertas existentes
 * @returns {number} Código sugerido (máximo + 1)
 */
export const getSuggestedCode = (tires = []) => {
  // Si no hay cubiertas, empezar desde 1
  if (!tires || tires.length === 0) {
    return 1
  }

  // Encontrar el código máximo
  const maxCode = tires.reduce((max, tire) => {
    const code = Number.parseInt(tire.code)
    return !isNaN(code) && code > max ? code : max
  }, 0)

  // Sugerir el siguiente código
  return maxCode + 1
}

/**
 * Verifica si un código ya existe en la lista de cubiertas
 * @param {number|string} code - Código a verificar
 * @param {Array} tires - Lista de cubiertas existentes
 * @returns {boolean} True si el código ya existe
 */
export const isCodeUnique = (code, tires = []) => {
  if (!tires || tires.length === 0) {
    return true
  }

  return !tires.some((tire) => tire.code === Number.parseInt(code))
}
