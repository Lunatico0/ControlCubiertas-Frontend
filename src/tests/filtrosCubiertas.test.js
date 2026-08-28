import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// t147 de la auditoría de QA del operario.
//
// Los chips de filtro eran: "Todas 49 · En stock 30 · Disponibles 24 · En circulación 18 ·
// A recapar 3". Dos de esos nombran conjuntos distintos y NADA en la UI lo dice:
//
//   "En stock"    = toda cubierta sin vehículo → incluye las DESCARTADAS y las que están a recapar.
//   "Disponibles" = sin vehículo Y en un estado montable.
//
// El operario que busca una cubierta para montar toca "En stock", que es el nombre más obvio,
// y le aparecen cubiertas descartadas que no puede usar. Los nombres tienen que decir el
// criterio: "En depósito" (todo lo que está guardado) vs "Listas para montar" (lo usable).
//
// La lógica de filtrado no cambia: lo que estaba mal era cómo se llamaban los conjuntos.

const raiz = resolve(__dirname, '../..')
const cubiertas = readFileSync(resolve(raiz, 'src/components/Operativa/Cubiertas.jsx'), 'utf8')

describe('t147 · los filtros dicen qué conjunto son', () => {
  it('ya no existen los rótulos ambiguos "En stock" y "Disponibles"', () => {
    expect(cubiertas).not.toMatch(/label: "En stock"/)
    expect(cubiertas).not.toMatch(/label: "Disponibles"/)
  })

  it('el conjunto montable se llama "Listas para montar"', () => {
    expect(cubiertas).toMatch(/label: "Listas para montar"/)
  })

  it('el conjunto de todo lo guardado se llama "En depósito"', () => {
    expect(cubiertas).toMatch(/label: "En depósito"/)
  })

  it('cada chip lleva el criterio escrito, no solo un nombre mejor', () => {
    // Un `hint` por pestaña: se muestra como title del chip.
    expect(cubiertas).toMatch(/hint:/)
  })

  it('las CLAVES no cambian: son las que viajan en la URL y en los intents', () => {
    // Renombrar la clave rompería los links compartidos y la navegación desde el Inicio.
    expect(cubiertas).toMatch(/key: "stock"/)
    expect(cubiertas).toMatch(/key: "disponibles"/)
    expect(cubiertas).toMatch(/key: "circulacion"/)
    expect(cubiertas).toMatch(/key: "recapar"/)
  })

  it('el criterio de filtrado sigue siendo el mismo: no se tocó la lógica', () => {
    expect(cubiertas).toMatch(/tab === "stock" && t\.vehicle/)
    expect(cubiertas).toMatch(/tab === "disponibles" && \(t\.vehicle \|\| \["discard", "recap"\]/)
  })
})
