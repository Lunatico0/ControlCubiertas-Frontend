import { useState, useRef, useEffect, useCallback } from "react"

const useContextMenu = (customRef = null) => {
  const [openIndex, setOpenIndex] = useState(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const menuRef = customRef || useRef(null)

  const openMenu = useCallback((index, e) => {
    e.preventDefault()
    e.stopPropagation()

    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.min(rect.right, window.innerWidth - 160)
    const y = Math.min(rect.bottom, window.innerHeight - 100)

    setPosition({ x, y })
    setOpenIndex(index)
  }, [])

  const closeMenu = useCallback(() => {
    setOpenIndex(null)
  }, [])

  useEffect(() => {
    const handleEvents = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) closeMenu()
    }

    const handleScroll = () => closeMenu()
    const handleEscape = (e) => e.key === "Escape" && closeMenu()

    document.addEventListener("mousedown", handleEvents)
    document.addEventListener("scroll", handleScroll, true)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleEvents)
      document.removeEventListener("scroll", handleScroll, true)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [menuRef, closeMenu])

  return {
    openIndex,
    setOpenIndex,
    position,
    openMenu,
    closeMenu,
    menuRef,
  }
}

export default useContextMenu
