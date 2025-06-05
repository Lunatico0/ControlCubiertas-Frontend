/**
 * Formatea un número de orden con el formato YYYY-NNNNNN
 * @param {string|number} input - Número de orden sin formato
 * @returns {string} Número de orden formateado
 * @throws {Error} Si el input no es un número válido
 */
export const formatOrderNumber = (input) => {

  // Limpiar el input
  const cleanInput = String(input).trim()

  // Validar que sea un número
  if (!/^\d+$/.test(cleanInput)) {
    throw new Error("El número de orden debe contener solo dígitos")
  }

  // Verificar que no sea cero
  if (Number.parseInt(cleanInput) === 0) {
    throw new Error("El número de orden debe ser mayor a 0")
  }

  // Obtener el año actual
  const year = new Date().getFullYear()

  // Formatear con padding de ceros (6 dígitos)
  const padded = cleanInput.padStart(6, "0")

  // Retornar formato YYYY-NNNNNN
  const formatted = `${year}-${padded}`

  return formatted
}

/**
 * Valida si un número de orden tiene el formato correcto
 * @param {string} orderNumber - Número de orden a validar
 * @returns {boolean} True si el formato es válido
 */
export const isValidOrderNumberFormat = (orderNumber) => {
  const regex = /^\d{4}-\d{6}$/
  return regex.test(orderNumber)
}

/**
 * Extrae el número sin formato de un número de orden formateado
 * @param {string} formattedOrderNumber - Número de orden formateado
 * @returns {string|null} Número sin formato o null si el formato es inválido
 */
export const extractOrderNumber = (formattedOrderNumber) => {
  if (!isValidOrderNumberFormat(formattedOrderNumber)) {
    return null
  }
  return formattedOrderNumber.split("-")[1]
}

/**
 * Genera un número de orden aleatorio para pruebas
 * @returns {string} Número de orden formateado
 */
export const generateRandomOrderNumber = () => {
  const randomNum = Math.floor(Math.random() * 999999) + 1
  return formatOrderNumber(randomNum)
}

/**
 * Valida si un valor es un número válido para orden
 * @param {any} value - Valor a validar
 * @returns {boolean} True si es válido
 */
export const isValidOrderNumberInput = (value) => {
  if (!value) return false

  const cleanValue = String(value).trim()

  // Solo dígitos
  if (!/^\d+$/.test(cleanValue)) return false

  // Mayor a 0
  if (Number.parseInt(cleanValue) === 0) return false

  return true
}
