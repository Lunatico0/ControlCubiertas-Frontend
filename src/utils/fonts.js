// @font-face para la VENTANA DE IMPRESIÓN.
//
// El comprobante se arma en una ventana aparte (window.open + document.write), así que no
// hereda nada del CSS de la app: necesita sus propias declaraciones. Antes las traía de
// fonts.googleapis.com, o sea que en un taller sin internet el comprobante impreso salía en
// la fuente por defecto del sistema.
//
// Las URLs se resuelven con `new URL(..., import.meta.url)`: Vite las reemplaza por la ruta
// del asset en el bundle, que funciona igual servido por http y por file:// en Electron.

const url = (ruta) => new URL(ruta, import.meta.url).href

const sans400 = url("../../node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2")
const sans500 = url("../../node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-500-normal.woff2")
const sans600 = url("../../node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2")
const sans700 = url("../../node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-700-normal.woff2")
const mono400 = url("../../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2")
const mono500 = url("../../node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2")
const grotesk500 = url("../../node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-500-normal.woff2")
const grotesk600 = url("../../node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-600-normal.woff2")
const grotesk700 = url("../../node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2")

const cara = (familia, peso, archivo) => `
@font-face {
  font-family: "${familia}";
  font-style: normal;
  font-weight: ${peso};
  font-display: swap;
  src: url("${archivo}") format("woff2");
}`

export const FUENTES_CSS = [
  cara("IBM Plex Sans", 400, sans400),
  cara("IBM Plex Sans", 500, sans500),
  cara("IBM Plex Sans", 600, sans600),
  cara("IBM Plex Sans", 700, sans700),
  cara("IBM Plex Mono", 400, mono400),
  cara("IBM Plex Mono", 500, mono500),
  cara("Space Grotesk", 500, grotesk500),
  cara("Space Grotesk", 600, grotesk600),
  cara("Space Grotesk", 700, grotesk700),
].join("\n")

export default FUENTES_CSS
