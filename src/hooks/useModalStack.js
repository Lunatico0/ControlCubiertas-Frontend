// hooks/useModalStack.js
import { useEffect } from "react"

let modalStack = []

export function useModalEscape(onClose) {
  useEffect(() => {
    const modalId = Symbol("modal")

    modalStack.push(modalId)

    const handler = (e) => {
      if (e.key === "Escape" && modalStack[modalStack.length - 1] === modalId) {
        e.stopImmediatePropagation()
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener("keydown", handler)

    return () => {
      modalStack = modalStack.filter((id) => id !== modalId)
      document.removeEventListener("keydown", handler)
    }
  }, [onClose])
}
