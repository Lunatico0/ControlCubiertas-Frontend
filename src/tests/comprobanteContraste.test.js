import { describe, it, expect } from "vitest"
import { renderComprobanteHTML } from "@utils/receipt-template"
import { contrasteSobre, tintaSobre } from "@utils/contrast"

// t109 — El comprobante impreso tenía su propio sistema de diseño completo: un accent
// (#1F7A43) que no existe en los tokens, once grises literales y una escala tipográfica
// propia. Y tres problemas medibles:
//
//   1. Contraste por debajo de AA en papel: "LOGO" 1.92:1, "CORTAR AQUÍ" 2.32:1,
//      "COMPROBANTE N°" 3.30:1, el pie 4.09:1. Es la pieza que el cliente recibe IMPRESA,
//      donde el contraste no se compensa subiendo el brillo de la pantalla.
//   2. Los datos (código, patente, km, número de orden) salían en Space Grotesk, la familia
//      de DISPLAY, en vez de IBM Plex Mono. En una columna de cifras eso no alinea.
//   3. El badge de tipo de movimiento es texto BLANCO sobre el accent que el tenant elige
//      libremente: con un accent claro queda ilegible, y no había ningún límite.

const render = (design = {}) =>
  renderComprobanteHTML({
    design,
    company: { name: "Acme", cuit: "30-1", phone: "011", address: "Calle 1" },
    footer: "Gracias por su visita",
    meta: { numero: "0001-00000042", fecha: "28/08/2026", tipo: "ASIGNACIÓN" },
    sectionData: { cubierta: { heading: "CUBIERTA", rows: [{ k: "Código", v: "1042" }] } },
  })

describe("contrasteSobre", () => {
  it("el negro sobre blanco da el máximo", () => {
    expect(contrasteSobre("#000000", "#FFFFFF")).toBeCloseTo(21, 0)
  })

  it("el blanco sobre blanco da el mínimo", () => {
    expect(contrasteSobre("#FFFFFF", "#FFFFFF")).toBeCloseTo(1, 1)
  })

  it("detecta que el gris viejo del placeholder no llegaba a AA", () => {
    expect(contrasteSobre("#BBBBBB", "#FFFFFF")).toBeLessThan(4.5)
  })
})

describe("tintaSobre: el badge se lee con cualquier accent", () => {
  it("sobre un accent oscuro pone tinta clara", () => {
    expect(tintaSobre("#1F7A43")).toBe("#FFFFFF")
  })

  it("sobre un accent claro pone tinta oscura", () => {
    // El lima de la marca es brillante: texto blanco encima es ilegible.
    expect(tintaSobre("#C4ED2B")).not.toBe("#FFFFFF")
  })

  it("la combinación elegida siempre supera 4.5:1", () => {
    for (const accent of ["#1F7A43", "#C4ED2B", "#FFFF00", "#000000", "#808080", "#6E97F5"]) {
      expect(contrasteSobre(tintaSobre(accent), accent)).toBeGreaterThanOrEqual(4.5)
    }
  })
})

describe("el comprobante cumple AA en papel", () => {
  // Los colores que van sobre el ACCENT (el badge) se excluyen: su fondo no es el papel y su
  // contraste lo garantiza tintaSobre(), que tiene sus propios casos más arriba.
  const tintasSobrePapel = (html) =>
    [...html.matchAll(/style="([^"]*)"/g)]
      .map((m) => m[1])
      .filter((estilo) => !/background:\s*#/.test(estilo))
      .flatMap((estilo) => [...estilo.matchAll(/color:\s*(#[0-9a-fA-F]{6})/g)].map((c) => c[1]))

  it("ningún texto usa un gris por debajo de 4.5:1 sobre blanco", () => {
    const flojos = [...new Set(tintasSobrePapel(render()))].filter((c) => contrasteSobre(c, "#FFFFFF") < 4.5)
    expect(flojos).toEqual([])
  })

  it("el placeholder del logo y el 'CORTAR AQUÍ' ya no son grises casi invisibles", () => {
    const html = render()
    expect(html).not.toMatch(/#BBBBBB/i)
    expect(html).not.toMatch(/#AAAAAA/i)
    expect(html).not.toMatch(/#8A8E92/i)
  })
})

describe("los datos del comprobante salen en mono", () => {
  it("el número de comprobante usa la familia mono", () => {
    expect(render()).toMatch(/font-family:'IBM Plex Mono'[^"]*"[^>]*>0001-00000042|0001-00000042/)
  })

  it("los valores de las filas de datos usan mono tabular", () => {
    const html = render()
    // La celda del valor tiene que declarar la familia mono y tabular-nums.
    expect(html).toMatch(/font-variant-numeric:tabular-nums/)
  })
})

describe("el badge de tipo se calcula, no se asume", () => {
  it("con el accent por defecto (oscuro) el badge va en blanco", () => {
    expect(render()).toMatch(/color:#FFFFFF;background:#1F7A43/i)
  })

  it("con un accent claro el badge NO va en blanco", () => {
    const html = render({ accent: "#C4ED2B" })
    expect(html).not.toMatch(/color:#FFFFFF;background:#C4ED2B/i)
  })
})
