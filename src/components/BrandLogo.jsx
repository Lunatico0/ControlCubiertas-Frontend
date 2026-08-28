import { useTheme } from "@context/ThemeContext"
import tireOpsDark from "@/assets/TireOpsDark.svg"
import tireOpsLight from "@/assets/TireOpsLight.svg"
import wheelDark from "@/assets/TireOpsWheelDark.svg"
import wheelLight from "@/assets/TireOpsWheelLight.svg"

// Logo de marca TireOps (rueda + wordmark), theme-aware. El SVG "Dark" es para fondos
// oscuros (texto claro); el "Light" para fondos claros (texto oscuro) — el nombre = el
// tema donde se usa. variant fuerza uno ("dark"/"light"); "auto" (default) sigue el tema
// de la app. Los SVG se IMPORTAN (no se referencian por ruta absoluta): Vite resuelve la
// URL con el base correcto, así funciona en web (cualquier ruta) y en Electron (file://).
//
// `wheel` rinde SÓLO la ilustración (la rueda, sin el wordmark). Es lo que va en el rail de
// 64px al que colapsa el sidebar por debajo de lg.
//
// Los assets TireOpsWheel*.svg están GENERADOS a partir del logo completo, no dibujados: el
// logo no venía con isotipo. Los TireOpsIcon*.svg parecían serlo pero no lo son — declaran
// viewBox="0 0 285 256" sobre un dibujo de 746 de ancho, o sea el logo entero con el lienzo
// cortado a la mitad, y por eso se veían tajeados. Ver el encabezado de los Wheel para cómo
// se separó la rueda del texto (en la variante Light comparten el mismo path).
const BrandLogo = ({ variant = "auto", height = 32, wheel = false, className, style, alt = "TireOps" }) => {
  const { isDarkMode } = useTheme()
  const dark = variant === "dark" || (variant === "auto" && isDarkMode)
  const src = wheel ? (dark ? wheelDark : wheelLight) : (dark ? tireOpsDark : tireOpsLight)
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ height, width: "auto", display: "block", ...style }}
    />
  )
}

export default BrandLogo
