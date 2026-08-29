const ORDER_FORMAT_REGEX = /^\d{4}-\d{6}$/

export const formatOrderNumber = (input) => {
  const clean = String(input).trim()
  if (!/^\d+$/.test(clean)) throw new Error("Solo se permiten dígitos")
  if (parseInt(clean, 10) === 0) throw new Error("Debe ser mayor a 0")

  const year = new Date().getFullYear()
  return `${year}-${clean.padStart(6, "0")}`
}

export const isValidOrderNumberFormat = (value) => ORDER_FORMAT_REGEX.test(value)

export const isValidOrderNumberInput = (value) => {
  const clean = String(value).trim()
  return /^\d+$/.test(clean) && parseInt(clean, 10) > 0
}

export const extractOrderNumber = (formatted) =>
  isValidOrderNumberFormat(formatted) ? formatted.split("-")[1] : null

// Forma canónica del número de orden, tolerante con lo que ya está en circulación.
// Devuelve AAAA-NNNNNN si puede; si no, el valor original tal cual (para que el backend
// devuelva el 400 con `field: "orderNumber"` y el formulario lo muestre en el campo).
// A diferencia de formatOrderNumber, NO lanza: se usa en la capa de API, donde tirar una
// excepción rompería la mutación antes de llegar al servidor.
export const normalizeOrderNumber = (value) => {
  const clean = String(value ?? "").trim()
  if (ORDER_FORMAT_REGEX.test(clean)) return clean
  if (!isValidOrderNumberInput(clean)) return value
  return `${new Date().getFullYear()}-${clean.padStart(6, "0")}`
}

export const generateRandomOrderNumber = () => {
  const rand = Math.floor(Math.random() * 999999) + 1
  return formatOrderNumber(rand)
}
