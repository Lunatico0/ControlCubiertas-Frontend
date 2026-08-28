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
// `wheel` rinde el ISOTIPO: la ilustración entera (estelas, cubierta, arco lima y la "T"),
// sin el wordmark "ireOps". Es lo que va en el rail de 64px al que colapsa el sidebar. Con
// su relación de aspecto (340x256) un height de 34 es lo que entra en el rail sin tocar los
// bordes; más grande se come el padding.
//
// Los assets TireOpsWheel*.svg están GENERADOS a partir del logo completo, no dibujados: el
// logo no venía con isotipo. Los TireOpsIcon*.svg NO sirven para esto: declaran
// viewBox="0 0 285 256" sobre un dibujo que llega hasta x=339, o sea parten la "T" y el arco
// por la mitad (esa era la medialuna que se veía en el rail). Ver el encabezado de los
// TireOpsWheel*.svg para el detalle de cómo se separó la ilustración del texto.
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
