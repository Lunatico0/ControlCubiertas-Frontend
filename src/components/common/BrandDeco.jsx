import { useTheme } from "@context/ThemeContext"
import tireOpsDark from "@/assets/TireOpsDark.svg"
import tireOpsLight from "@/assets/TireOpsLight.svg"
import tireOpsIconDark from "@/assets/TireOpsIconDark.svg"
import tireOpsIconLight from "@/assets/TireOpsIconLight.svg"

// Deco de marca del fondo (logos TireOps muy tenues, detrás del contenido, sin capturar clicks).
// - variant="icon" (default): solo el ÍCONO, arriba-derecha (usado en Inicio operativa y Resumen admin).
// - variant="full": el logo COMPLETO (ícono + wordmark), abajo-izquierda (solo Inicio operativa).
// Theme-aware. zIndex 0 → queda detrás del contenido de la columna (que va en z-[1]).
const BrandDeco = ({ variant = "icon" }) => {
  const { isDarkMode } = useTheme()

  if (variant === "full") {
    return (
      <div style={{ position: "absolute", bottom: 70, left: -120, pointerEvents: "none", zIndex: 0 }}>
        <img src={isDarkMode ? tireOpsDark : tireOpsLight} alt="" style={{ display: "block", width: 560, height: "auto", opacity: 0.035 }} />
      </div>
    )
  }

  return (
    <div style={{ position: "absolute", top: -110, right: -80, width: 460, height: 460, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <img src={isDarkMode ? tireOpsIconDark : tireOpsIconLight} alt="" style={{ display: "block", height: 460, width: "auto", opacity: 0.05 }} />
    </div>
  )
}

export default BrandDeco
