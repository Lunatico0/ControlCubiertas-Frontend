import { useEffect, useCallback } from "react"

/**
 * Hook para manejar el cierre de modales y dropdowns
 * @param {React.RefObject} ref - Referencia al elemento a monitorear
 * @param {Function} onClose - Función para cerrar el elemento
 * @param {Object} options - Opciones adicionales
 * @param {boolean} options.escapeKey - Si debe cerrarse con la tecla Escape (default: true)
 * @param {boolean} options.outsideClick - Si debe cerrarse al hacer clic fuera (default: true)
 */
const useClose = (ref, onClose, { escapeKey = true, outsideClick = true } = {}) => {
  const handleClose = useCallback(() => {
    if (onClose && typeof onClose === "function") {
      onClose()
    }
  }, [onClose])

  // Manejar tecla Escape
  useEffect(() => {
    if (!escapeKey) return

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        handleClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [escapeKey, handleClose])

  // Manejar clic fuera del elemento
  useEffect(() => {
    if (!outsideClick || !ref?.current) return

    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        handleClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [outsideClick, ref, handleClose])

  return { close: handleClose }
}

export default useClose
