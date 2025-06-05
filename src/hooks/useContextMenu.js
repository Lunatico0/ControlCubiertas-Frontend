import { useState, useRef, useEffect, useCallback } from "react"

/**
 * Hook para manejar menús contextuales
 * @returns {Object} Funciones y estados para el menú contextual
 */
const useContextMenu = () => {
  const [openIndex, setOpenIndex] = useState(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const menuRef = useRef(null)

  // Abrir el menú en una posición específica
  const openMenu = useCallback(
    (index, e) => {
      e.preventDefault() // Prevenir comportamiento por defecto
      e.stopPropagation() // Evitar propagación

      // Calcular posición
      const rect = e.currentTarget.getBoundingClientRect()

      // Ajustar posición para que no se salga de la pantalla
      const x = Math.min(rect.right, window.innerWidth - 160) // 160px es un ancho aproximado del menú
      const y = Math.min(rect.bottom, window.innerHeight - 100) // 100px es una altura aproximada

      setPosition({ x, y })
      setOpenIndex(openIndex === index ? null : index)
    },
    [openIndex],
  )

  // Cerrar el menú
  const closeMenu = useCallback(() => {
    setOpenIndex(null)
  }, [])

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeMenu()
      }
    }

    // Cerrar al hacer scroll
    const handleScroll = () => {
      closeMenu()
    }

    // Cerrar al presionar Escape
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeMenu()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("scroll", handleScroll, true)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("scroll", handleScroll, true)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [closeMenu])

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
