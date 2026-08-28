import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { rutaDeSeccion, seccionDeRuta, rutaDeCubierta, rutaDeVehiculo, intentDesdeQuery, queryDesdeIntent } from "@utils/opRoutes"

// t132 — Toda la operativa vivía en UNA sola URL: el layout usaba useState("inicio") sin
// router. Consecuencias reales, no teóricas:
//   · El botón Atrás (del navegador o del celular) SALE de la aplicación en vez de cerrar el
//     drawer, que es el reflejo automático de cualquier usuario.
//   · No se puede pasarle a un compañero el link de una cubierta, ni dejarla en favoritos.
//   · F5 estando en Cubiertas con un drawer abierto te devuelve al Inicio desde cero.
//
// Ahora cada sección y cada drawer tienen su URL. El mapeo vive en un módulo propio para que
// el layout y las pantallas no lo reimplementen cada uno a su manera.

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const leer = (rel) => readFileSync(resolve(raiz, rel), "utf8")

describe("mapeo sección ↔ ruta", () => {
  it("cada sección tiene su ruta", () => {
    expect(rutaDeSeccion("inicio")).toBe("/inicio")
    expect(rutaDeSeccion("cubiertas")).toBe("/cubiertas")
    expect(rutaDeSeccion("vehiculos")).toBe("/vehiculos")
  })

  it("la ruta devuelve su sección", () => {
    expect(seccionDeRuta("/inicio")).toBe("inicio")
    expect(seccionDeRuta("/cubiertas")).toBe("cubiertas")
    expect(seccionDeRuta("/cubiertas/1042")).toBe("cubiertas")
    expect(seccionDeRuta("/vehiculos/abc123")).toBe("vehiculos")
  })

  it("la raíz es el Inicio", () => {
    expect(seccionDeRuta("/")).toBe("inicio")
  })

  it("una ruta desconocida cae en el Inicio, no en undefined", () => {
    expect(seccionDeRuta("/lo-que-sea")).toBe("inicio")
  })
})

describe("rutas de detalle (el drawer es una URL)", () => {
  it("una cubierta se direcciona por su código", () => {
    expect(rutaDeCubierta(1042)).toBe("/cubiertas/1042")
  })

  it("un vehículo se direcciona por su id", () => {
    expect(rutaDeVehiculo("665f1a2b3c4d5e6f70819234")).toBe("/vehiculos/665f1a2b3c4d5e6f70819234")
  })

  it("sin identificador devuelve la ruta de la sección, no una ruta rota", () => {
    expect(rutaDeCubierta(null)).toBe("/cubiertas")
    expect(rutaDeVehiculo(undefined)).toBe("/vehiculos")
  })
})

describe("el intent de navegación viaja en la query, no en memoria", () => {
  it("serializa búsqueda y pestaña", () => {
    expect(queryDesdeIntent({ query: "michelin", tab: "recapar" })).toBe("?q=michelin&tab=recapar")
  })

  it("serializa el alta abierta", () => {
    expect(queryDesdeIntent({ alta: true })).toBe("?alta=1")
  })

  it("un intent vacío no ensucia la URL", () => {
    expect(queryDesdeIntent(null)).toBe("")
    expect(queryDesdeIntent({})).toBe("")
  })

  it("vuelve a leerse igual desde la query", () => {
    const intent = { query: "michelin", tab: "recapar" }
    expect(intentDesdeQuery(new URLSearchParams(queryDesdeIntent(intent)))).toEqual(intent)
  })

  it("una query vacía devuelve null y no un objeto de basura", () => {
    expect(intentDesdeQuery(new URLSearchParams(""))).toBeNull()
  })

  it("el montaje dirigido sobrevive a un refresh", () => {
    const intent = { assignTo: { vehicleId: "v1", mobile: "M-12", position: "E1-I" } }
    const vuelto = intentDesdeQuery(new URLSearchParams(queryDesdeIntent(intent)))
    expect(vuelto.assignTo).toEqual(intent.assignTo)
  })
})

describe("las rutas están declaradas en App.jsx", () => {
  const app = leer("src/App.jsx")

  it("la operativa ya no vive en una sola ruta", () => {
    expect(app).toMatch(/path="inicio"/)
    expect(app).toMatch(/path="cubiertas"/)
    expect(app).toMatch(/path="vehiculos"/)
  })

  it("los detalles son rutas anidadas con parámetro", () => {
    expect(app).toMatch(/path="cubiertas\/:code"/)
    expect(app).toMatch(/path="vehiculos\/:id"/)
  })
})

describe("el layout deriva la sección de la URL", () => {
  const layout = leer("src/components/Operativa/OperativaLayout.jsx")

  it("no guarda la sección activa en un useState", () => {
    expect(layout).not.toMatch(/useState\(initialOp\?\.section/)
  })

  it("usa el mapeo compartido", () => {
    expect(layout).toMatch(/seccionDeRuta/)
  })
})
