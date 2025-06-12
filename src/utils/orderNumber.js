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

export const generateRandomOrderNumber = () => {
  const rand = Math.floor(Math.random() * 999999) + 1
  return formatOrderNumber(rand)
}
