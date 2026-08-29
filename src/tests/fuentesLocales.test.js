import { describe, it, expect } from "vitest"
import { readFileSync, readdirSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { FUENTES_CSS } from "@utils/fonts"

// t76 + t110 — TireOps se distribuye como app instalable para talleres, muchos sin internet
// estable. Las cuatro familias venían de fonts.googleapis.com: sin red el navegador cae al
// default (serif en muchos casos) en TODA la UI y también en el comprobante impreso. Las
// fuentes se bundlean como assets y se declaran con @font-face desde @fontsource.
//
// De paso muere Inter: quedó como token sin uso después del rediseño (el cuerpo pasó a IBM
// Plex Sans) pero se seguía pidiendo por red en cada arranque.

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const leer = (rel) => readFileSync(resolve(raiz, rel), "utf8")

describe("las fuentes no dependen de la red", () => {
  it("index.html no pide nada a fonts.googleapis.com", () => {
    const html = leer("index.html")
    expect(html).not.toMatch(/fonts\.googleapis\.com/)
    expect(html).not.toMatch(/fonts\.gstatic\.com/)
  })

  it("index.html ya no carga Inter", () => {
    expect(leer("index.html")).not.toMatch(/family=Inter/)
  })

  it("main.jsx importa las familias desde @fontsource", () => {
    const main = leer("src/main.jsx")
    expect(main).toMatch(/@fontsource\/ibm-plex-sans/)
    expect(main).toMatch(/@fontsource\/ibm-plex-mono/)
    expect(main).toMatch(/@fontsource\/space-grotesk/)
  })

  it("la ventana de impresión no pide nada a fonts.googleapis.com", () => {
    const motor = leer("src/hooks/usePrintEngine.js")
    expect(motor).not.toMatch(/fonts\.googleapis\.com/)
    expect(motor).not.toMatch(/fonts\.gstatic\.com/)
  })

  it("la ventana de impresión inyecta las @font-face del bundle", () => {
    expect(leer("src/hooks/usePrintEngine.js")).toMatch(/FUENTES_CSS/)
  })
})

describe("FUENTES_CSS (declaraciones para la ventana de impresión)", () => {
  it("declara las tres familias que usa el comprobante", () => {
    expect(FUENTES_CSS).toMatch(/IBM Plex Sans/)
    expect(FUENTES_CSS).toMatch(/IBM Plex Mono/)
    expect(FUENTES_CSS).toMatch(/Space Grotesk/)
  })

  it("no referencia ningún host externo", () => {
    expect(FUENTES_CSS).not.toMatch(/https?:\/\//)
  })

  it("usa font-display: swap para no dejar el comprobante en blanco", () => {
    expect(FUENTES_CSS).toMatch(/font-display:\s*swap/)
  })
})

describe("los fontFamily inline usan los tokens, no literales sin fallback", () => {
  it("ningún componente escribe la familia a mano", () => {
    const culpables = []
    const recorrer = (dir) => {
      for (const entrada of readdirSync(dir, { withFileTypes: true })) {
        const ruta = resolve(dir, entrada.name)
        if (entrada.isDirectory()) {
          if (entrada.name !== "tests") recorrer(ruta)
        } else if (/\.(js|jsx)$/.test(entrada.name)) {
          // `fontFamily: "'IBM Plex Mono'"` no lleva fallback: si la fuente no cargó, el
          // navegador cae al default del sistema en ese elemento. Los tokens de index.css
          // (--font-sans / --font-display / --font-mono) sí traen el stack completo.
          const m = readFileSync(ruta, "utf8").match(/fontFamily:\s*"'(IBM Plex (Sans|Mono)|Space Grotesk)'/g)
          if (m) culpables.push(`${ruta.slice(raiz.length + 1)} (${m.length})`)
        }
      }
    }
    recorrer(resolve(raiz, "src"))
    expect(culpables).toEqual([])
  })
})
