import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { ubicacionDe, setStatusCatalog, buildStatusMeta } from '@components/Operativa/status'

// t144 de la auditoría de QA del operario.
//
// Reproducido en dos cubiertas: badge rojo "Descartada", ciclo de vida cerrado en "Baja", y el
// campo Ubicación diciendo "En depósito" — exactamente lo mismo que muestra una cubierta
// disponible. La ubicación contradice al badge, y un operario que barre la lista por esa
// columna puede ir a buscar al depósito una cubierta que está en el cementerio.
//
// La causa es que la ubicación se derivaba SOLO de `tire.vehicle`: sin vehículo montado, "En
// depósito". Pero "sin vehículo" no significa "en depósito": una cubierta dada de baja tampoco
// tiene vehículo. La ubicación tiene que mirar el ROL del estado, no la ausencia de vehículo.
//
// Los estados son configurables por tenant (utils/statuses.js del backend): el rol `discard` se
// resuelve por lookup en el catálogo, y la etiqueta que se muestra es el NOMBRE configurado del
// estado de descarte, no un literal hardcodeado.

const CATALOGO = [
  { name: 'Nueva', role: 'initial' },
  { name: 'Usada', role: 'stock' },
  { name: 'A recapar', role: 'recap' },
  { name: 'Descartada', role: 'discard' },
]

beforeEach(() => setStatusCatalog(buildStatusMeta(CATALOGO)))

describe('t144 · la ubicación de una cubierta descartada', () => {
  it('NO dice "En depósito": usa el nombre configurado del estado de descarte', () => {
    const { label } = ubicacionDe({ status: 'Descartada', vehicle: null })

    expect(label).not.toMatch(/depósito/i)
    expect(label).toBe('Descartada')
  })

  it('respeta el nombre que el tenant le puso al estado de descarte', () => {
    setStatusCatalog(buildStatusMeta([{ name: 'Nueva', role: 'initial' }, { name: 'Al cementerio', role: 'discard' }]))

    expect(ubicacionDe({ status: 'Al cementerio', vehicle: null }).label).toBe('Al cementerio')
  })

  it('se pinta con el rojo de baja, no con el gris de una cubierta disponible', () => {
    expect(ubicacionDe({ status: 'Descartada', vehicle: null }).color).toBe('var(--ink-red)')
  })
})

describe('t144 · el resto de las ubicaciones no cambia', () => {
  it('montada en un vehículo muestra el móvil, en azul', () => {
    const r = ubicacionDe({ status: 'Usada', vehicle: { mobile: 'M-101' } })

    expect(r.label).toBe('M-101')
    expect(r.color).toBe('var(--ink-blue)')
  })

  it('sin vehículo y sin descartar sigue siendo "En depósito"', () => {
    const r = ubicacionDe({ status: 'Usada', vehicle: null })

    expect(r.label).toBe('En depósito')
    expect(r.color).toBe('var(--tx-4)')
  })

  it('una cubierta a recapar sin vehículo también está en depósito: todavía existe', () => {
    expect(ubicacionDe({ status: 'A recapar', vehicle: null }).label).toBe('En depósito')
  })

  it('no explota con una cubierta sin estado', () => {
    expect(() => ubicacionDe({})).not.toThrow()
  })
})

describe('t144 · las tres vistas usan el helper, no el literal', () => {
  const raiz = resolve(__dirname, '../..')
  const leer = (p) => readFileSync(resolve(raiz, p), 'utf8')

  it.each([
    'src/components/Operativa/Cubiertas.jsx',
    'src/components/Operativa/TireDrawer.jsx',
  ])('%s ya no deriva la ubicación de la ausencia de vehículo', (archivo) => {
    const src = leer(archivo)

    // El patrón exacto del bug: caer al depósito por no haber vehículo montado. El literal
    // suelto sigue siendo legítimo en otros lados (el rótulo del filtro, por ejemplo, t147).
    expect(src).not.toMatch(/\|\|\s*"En depósito"/)
    expect(src).toMatch(/ubicacionDe/)
  })
})
