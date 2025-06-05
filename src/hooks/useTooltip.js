import { useState, useCallback } from "react"

/**
 * Hook para manejar tooltips
 * @param {Object} options - Opciones de configuración
 * @param {number} options.offsetX - Desplazamiento horizontal (default: 10)
 * @param {number} options.offsetY - Desplazamiento vertical (default: 10)
 * @returns {Object} Funciones y estados para el tooltip
 */
const useTooltip = ({ offsetX = 10, offsetY = 10 } = {}) => {
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    content: null,
  })

  const showTooltip = useCallback(
    (event, content) => {
      // Calcular posición
      const x = event.clientX + offsetX
      const y = event.clientY + offsetY

      // Ajustar para que no se salga de la pantalla
      const adjustedX = Math.min(x, window.innerWidth - 250) // 250px es un ancho aproximado
      const adjustedY = Math.min(y, window.innerHeight - 100) // 100px es una altura aproximada

      setTooltip({
        visible: true,
        x: adjustedX,
        y: adjustedY,
        content,
      })
    },
    [offsetX, offsetY],
  )

  const hideTooltip = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }))
  }, [])

  const updateTooltipContent = useCallback((content) => {
    setTooltip((prev) => ({ ...prev, content }))
  }, [])

  return {
    tooltip,
    showTooltip,
    hideTooltip,
    updateTooltipContent,
  }
}

export default useTooltip
