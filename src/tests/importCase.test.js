import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { findCaseMismatches } from '../../scripts/check-import-case.mjs'

// GOTCHA de mayúsculas, blindado.
//
// Conviven `components/UI/` y `components/common/` con nombres solapados (Modal.jsx está en las
// dos). Windows resuelve rutas sin distinguir mayúsculas y Linux sí: un import con el case
// equivocado anda perfecto en la máquina de desarrollo y ROMPE el build de Vercel, sin ninguna
// señal previa. Hoy los imports están todos bien; este test existe para que sigan estándolo.

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const fixtures = path.join(raiz, 'src/tests/fixtures/import-case')

describe('resolución de imports sensible a mayúsculas', () => {
  // 20s: este caso recorre src/ ENTERO resolviendo cada specifier contra el filesystem real,
  // y con el resto del suite corriendo en paralelo no entra en el default de 5s.
  it('src/ no tiene ni un import con el case equivocado', async () => {
    const fallos = await findCaseMismatches(path.join(raiz, 'src'))
    expect(fallos).toEqual([])
  }, 20000)

  it('detecta un import relativo con el case equivocado', async () => {
    const fallos = await findCaseMismatches(path.join(fixtures, 'malo'))
    expect(fallos).toHaveLength(1)
    expect(fallos[0].specifier).toBe('./ui/Modal')
    expect(fallos[0].real).toContain('UI')
  })

  it('un import con el case correcto no se reporta', async () => {
    const fallos = await findCaseMismatches(path.join(fixtures, 'bueno'))
    expect(fallos).toEqual([])
  })

  it('resuelve también los alias (@components, @hooks, …)', async () => {
    const fallos = await findCaseMismatches(path.join(fixtures, 'alias'), {
      alias: { '@components': path.join(fixtures, 'alias/components') },
    })
    expect(fallos).toHaveLength(1)
    expect(fallos[0].specifier).toBe('@components/ui/Modal')
  })

  it('ignora paquetes de node_modules: no son rutas del proyecto', async () => {
    const fallos = await findCaseMismatches(path.join(fixtures, 'paquetes'))
    expect(fallos).toEqual([])
  })
})
