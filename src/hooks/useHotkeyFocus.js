import { useEffect, useRef } from "react"

// Atajo Ctrl/Cmd + <key> → enfoca el input al que se ata la ref devuelta.
// Devuelve la ref para poner en el <input> (ej. el buscador de una pantalla).
// Unifica el efecto que estaba repetido en Inicio y Cubiertas.
export function useHotkeyFocus(key = "k") {
  const ref = useRef(null)
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === key) {
        e.preventDefault()
        ref.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [key])
  return ref
}
