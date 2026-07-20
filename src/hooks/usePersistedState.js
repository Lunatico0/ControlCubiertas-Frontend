import { useState } from "react"

// useState cuyo valor (string) se persiste en localStorage bajo `key`. Tolera devices sin
// storage (no crashea). Unifica el patrón de los toggles de vista grid/tabla de la operativa.
export function usePersistedState(key, initial) {
  const [value, setValue] = useState(() => {
    try { return localStorage.getItem(key) || initial } catch { return initial }
  })
  const set = (v) => {
    setValue(v)
    try { localStorage.setItem(key, v) } catch { /* device sin storage */ }
  }
  return [value, set]
}
