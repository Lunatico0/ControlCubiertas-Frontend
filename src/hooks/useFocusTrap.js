import { useEffect, useRef } from "react"

// Atrapa el foco dentro de un contenedor (drawer, modal) mientras está montado.
//
// Por qué existe: los drawers de la operativa se abrían dejando el foco en el botón que los
// disparó, con todas las tarjetas del fondo todavía tabulables. Medido en la auditoría: 109
// tabulaciones hasta el primer input del alta de cubierta. Cargar con guantes obligaba a
// levantar el mouse en cada campo.
//
// Hace tres cosas:
//   1. autofocus al primer CAMPO de datos (input/select/textarea); si no hay, al primer
//      focusable; si tampoco, al contenedor. Nunca deja el foco atrás.
//   2. Tab / Shift+Tab circulan dentro del contenedor y no se escapan al fondo.
//   3. al desmontar devuelve el foco a quien lo tenía antes de abrir.
//
// El handler va sobre el contenedor y no sobre document: con drawers apilados sólo reacciona
// el que tiene el foco adentro, sin necesidad de un stack aparte.
const SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",")

const esCampo = (el) => ["INPUT", "SELECT", "TEXTAREA"].includes(el.tagName)

export function useFocusTrap(activo = true) {
  const ref = useRef(null)

  useEffect(() => {
    const cont = ref.current
    if (!activo || !cont) return

    // Se recalcula en cada Tab: los drawers montan y desmontan secciones (reconfigurar ejes,
    // acciones del stepper) y una lista congelada al abrir apuntaría a nodos muertos.
    const focusables = () => Array.from(cont.querySelectorAll(SELECTOR))

    const previo = document.activeElement
    const lista = focusables()
    const destino = lista.find(esCampo) || lista[0] || cont
    destino.focus()

    const onKeyDown = (e) => {
      if (e.key !== "Tab") return
      const items = focusables()
      if (items.length === 0) return e.preventDefault()
      const i = items.indexOf(document.activeElement)
      const siguiente = e.shiftKey
        ? items[(i <= 0 ? items.length : i) - 1]
        : items[(i + 1) % items.length]
      e.preventDefault()
      siguiente.focus()
    }

    cont.addEventListener("keydown", onKeyDown)
    return () => {
      cont.removeEventListener("keydown", onKeyDown)
      previo?.focus?.() // el disparador puede haberse desmontado con el drawer
    }
  }, [activo])

  return ref
}
