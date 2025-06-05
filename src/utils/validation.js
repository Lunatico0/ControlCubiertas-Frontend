/**
 * Valida si un valor es un número válido
 * @param {any} value - Valor a validar
 * @returns {boolean} True si es un número válido
 */
export const isValidNumber = (value) => {
  if (value === null || value === undefined || value === "") return false
  return !isNaN(Number(value))
}

/**
 * Valida si un valor es un entero positivo
 * @param {any} value - Valor a validar
 * @returns {boolean} True si es un entero positivo
 */
export const isPositiveInteger = (value) => {
  if (!isValidNumber(value)) return false
  const num = Number(value)
  return Number.isInteger(num) && num > 0
}

/**
 * Valida si un string tiene una longitud mínima
 * @param {string} value - Valor a validar
 * @param {number} minLength - Longitud mínima
 * @returns {boolean} True si cumple con la longitud mínima
 */
export const hasMinLength = (value, minLength = 1) => {
  if (!value || typeof value !== "string") return false
  return value.trim().length >= minLength
}

/**
 * Valida si un string tiene una longitud máxima
 * @param {string} value - Valor a validar
 * @param {number} maxLength - Longitud máxima
 * @returns {boolean} True si cumple con la longitud máxima
 */
export const hasMaxLength = (value, maxLength = 100) => {
  if (!value || typeof value !== "string") return false
  return value.trim().length <= maxLength
}
