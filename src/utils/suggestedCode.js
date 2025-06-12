export const getSuggestedCode = (tires = []) => {
  if (!Array.isArray(tires) || tires.length === 0) return 1

  const max = tires.reduce((acc, t) => {
    const code = parseInt(t.code, 10)
    return isNaN(code) ? acc : Math.max(acc, code)
  }, 0)

  return max + 1
}

export const isCodeUnique = (code, tires = []) =>
  !tires.some(t => String(t.code) === String(code))
