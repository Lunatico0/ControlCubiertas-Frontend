import { useTheme } from "@context/ThemeContext"

// Logo de marca TireOps (rueda + wordmark), theme-aware. El SVG "Dark" es para fondos
// oscuros (texto claro); el "Light" para fondos claros (texto oscuro) — el nombre = el
// tema donde se usa. variant fuerza uno ("dark"/"light"); "auto" (default) sigue el tema
// de la app. Los SVG viven en frontend/public.
const BrandLogo = ({ variant = "auto", height = 32, className, style, alt = "TireOps" }) => {
  const { isDarkMode } = useTheme()
  const dark = variant === "dark" || (variant === "auto" && isDarkMode)
  return (
    <img
      src={dark ? "/TireOpsDark.svg" : "/TireOpsLight.svg"}
      alt={alt}
      className={className}
      style={{ height, width: "auto", display: "block", ...style }}
    />
  )
}

export default BrandLogo
