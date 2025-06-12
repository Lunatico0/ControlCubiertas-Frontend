import { useEffect } from "react"

const useClose = (ref, onClose, { escapeKey = true, outsideClick = true } = {}) => {
  useEffect(() => {
    if (!escapeKey) return

    const handleEscape = (e) => {
      if (e.key === "Escape") onClose?.()
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [escapeKey, onClose])

  useEffect(() => {
    if (!outsideClick || !ref?.current) return

    const handleClickOutside = (e) => {
      if (!ref.current.contains(e.target)) onClose?.()
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [outsideClick, ref, onClose])

  return { close: onClose }
}

export default useClose
