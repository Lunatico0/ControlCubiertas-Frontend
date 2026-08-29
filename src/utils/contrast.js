// Contraste WCAG. Se usa donde el color NO lo elegimos nosotros: el accent del comprobante lo
// configura cada empresa, y encima va texto que tiene que leerse igual con cualquier valor.
//
// El comprobante es la pieza que el cliente recibe EN PAPEL: ahí el contraste no se compensa
// subiendo el brillo de la pantalla, y un gris flojo directamente no se lee.

const canal = (v) => {
  const c = v / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

// Expande #abc a #aabbcc y devuelve [r, g, b].
export function aRgb(hex) {
  let h = String(hex ?? "").trim().replace("#", "")
  if (h.length === 3) h = h.split("").map((c) => c + c).join("")
  if (h.length === 8) h = h.slice(0, 6)
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return [0, 0, 0]
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
}

// Luminancia relativa (WCAG 2.x), de 0 (negro) a 1 (blanco).
export function luminancia(hex) {
  const [r, g, b] = aRgb(hex)
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b)
}

// Razón de contraste entre dos colores: de 1:1 (idénticos) a 21:1 (negro sobre blanco).
// AA pide 4.5 para texto normal y 3 para texto grande o componentes de UI.
export function contrasteSobre(color, fondo) {
  const a = luminancia(color)
  const b = luminancia(fondo)
  const [claro, oscuro] = a > b ? [a, b] : [b, a]
  return (claro + 0.05) / (oscuro + 0.05)
}

// Tinta legible sobre un fondo arbitrario: la que más contraste dé entre blanco y casi-negro.
// Es lo que hace falta cuando el fondo lo elige el usuario (el accent del comprobante): asumir
// blanco dejaba el badge ilegible con cualquier accent claro.
export function tintaSobre(fondo) {
  const OSCURO = "#16181A"
  return contrasteSobre("#FFFFFF", fondo) >= contrasteSobre(OSCURO, fondo) ? "#FFFFFF" : OSCURO
}
