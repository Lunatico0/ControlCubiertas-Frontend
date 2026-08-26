// hooks/useModalStack.js
import { useEffect, useRef } from "react"

// Stack de capas cerrables por Escape. Solo la de ARRIBA responde: un diálogo abierto sobre un
// drawer tiene que cerrarse él, no el drawer de atrás.
//
// El orden lo da el MONTAJE, que es como aparecen en la app: el drawer se monta primero y el
// diálogo o el modal después. (No cubre overlays ANIDADOS en el árbol: React corre los efectos del
// hijo antes que los del padre, así que ahí el stack nacería invertido. Hoy no hay ninguno: en
// VehicleDrawer, EditarVehiculo es HERMANO del Drawer, no hijo.)
let modalStack = []

export function useModalEscape(onClose) {
  // onClose en un ref y el efecto con deps VACÍAS. Antes el efecto dependía de onClose y todos los
  // callers pasan un arrow inline: identidad nueva en cada render → pop + push → la capa que
  // re-renderizaba se reinsertaba ARRIBA del stack. Con el drawer y el DialogHost en árboles
  // separados, cualquier cambio de estado del drawer le robaba el Escape al diálogo de encima,
  // que es justo lo que este hook existe para evitar.
  const ref = useRef(onClose)
  ref.current = onClose

  useEffect(() => {
    const modalId = Symbol("modal")

    modalStack.push(modalId)

    const handler = (e) => {
      if (e.key === "Escape" && modalStack[modalStack.length - 1] === modalId) {
        e.stopImmediatePropagation()
        e.preventDefault()
        ref.current()
      }
    }

    document.addEventListener("keydown", handler)

    return () => {
      modalStack = modalStack.filter((id) => id !== modalId)
      document.removeEventListener("keydown", handler)
    }
  }, [])
}
