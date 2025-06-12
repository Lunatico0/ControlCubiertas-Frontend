export const isValidNumber = (value) => {
  return value !== null && value !== undefined && value !== "" && !isNaN(Number(value))
}

export const isPositiveInteger = (value) => {
  if (!isValidNumber(value)) return false
  const num = Number(value)
  return Number.isInteger(num) && num > 0
}

export const hasMinLength = (value, min = 1) => {
  return typeof value === "string" && value.trim().length >= min
}

export const hasMaxLength = (value, max = 100) => {
  return typeof value === "string" && value.trim().length <= max
}
