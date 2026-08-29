import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as tokens from '@utils/tokens'

// t78 y t77 de la auditoría, cerradas con el BORRADO de la UI legacy (2026-08-28).
//
// La app arrastraba dos interfaces completas: el rediseño en `/` y `/admin`, y la UI anterior
// preservada en `/legacy/*` "por adaptación". Eran ~58 archivos —doce pares de componentes
// duplicados: dos sidebars, dos listas de cubiertas, dos altas, dos sistemas de modales— que se
// compilaban y se enviaban al cliente en cada deploy. La decisión de retirarla la tomó Patricio.
//
// Con ella se fueron también su paleta (@utils/legacyTokens), sus hooks propios y el gate de
// contraseña client-side. Este test es el que impide que algo de eso vuelva a entrar: no hay
// "un poquito de legacy", o está borrado o no lo está.

const raiz = resolve(__dirname, '../..')
const hay = (p) => existsSync(resolve(raiz, p))
const leer = (p) => readFileSync(resolve(raiz, p), 'utf8')

const listar = (dir) => readdirSync(resolve(raiz, dir), { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? listar(`${dir}/${e.name}`) : [`${dir}/${e.name}`]))

describe('t78 · la UI legacy no existe más', () => {
  it.each([
    'src/components/Layout/Layout.jsx',
    'src/components/Sidebar',
    'src/components/TireList',
    'src/components/TireDetails',
    'src/components/vehicleList',
    'src/components/Forms',
    'src/components/New',
    'src/components/actions',
    'src/components/Settings',
    'src/components/UpdateTire',
    'src/components/UI',
    'src/components/Help.jsx',
    'src/components/HelpNew.jsx',
    'src/components/Home.jsx',
    'src/components/SearchFilter.jsx',
  ])('%s ya no está', (p) => {
    expect(hay(p)).toBe(false)
  })

  it('la ruta /legacy/* salió del router', () => {
    const app = leer('src/App.jsx')

    expect(app).not.toMatch(/path="\/legacy/)
    expect(app).not.toMatch(/Layout\/Layout/)
  })

  it('ningún archivo importa algo de la UI borrada', () => {
    const rotos = listar('src')
      .filter((p) => /\.(jsx|js)$/.test(p))
      .filter((p) => /@components\/(UI|Sidebar|TireList|TireDetails|vehicleList|Forms|New|actions|Settings|UpdateTire)\//.test(leer(p)))

    expect(rotos).toEqual([])
  })
})

describe('t119 · queda UNA sola paleta', () => {
  it('@utils/legacyTokens desapareció con su única clientela', () => {
    expect(hay('src/utils/legacyTokens.js')).toBe(false)
  })

  it('nada lo importa', () => {
    const rotos = listar('src')
      .filter((p) => /\.(jsx|js)$/.test(p))
      .filter((p) => /^\s*import\s[^\n]*legacyTokens/m.test(leer(p)))

    expect(rotos).toEqual([])
  })

  it('@utils/tokens no exporta ni un color de Tailwind', () => {
    expect(tokens.colors).toBeUndefined()
    expect(tokens.text).toBeUndefined()
    expect(tokens.input).toBeUndefined()
    expect(Object.keys(tokens.button)).toEqual(['lime'])

    const codigo = leer('src/utils/tokens.js').split('\n').filter((l) => !l.trim().startsWith('//')).join('\n')
    expect(codigo).not.toMatch(/bg-(blue|indigo|purple|gray|slate)-\d/)
    expect(codigo).not.toMatch(/rounded-xl|shadow-md/)
  })

  it('<Button> sin variant es lima', () => {
    const src = leer('src/components/common/Button.jsx')
    const codigo = src.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n')

    expect(codigo).toMatch(/variant = "lime"/)
    expect(codigo).not.toMatch(/primary/) // la variante azul de la paleta anterior
  })
})

describe('t77 · la frontera dejó de existir porque quedó un solo lado', () => {
  it('components/common/ es el hogar del sistema, y tiene lo que tiene que tener', () => {
    const common = readdirSync(resolve(raiz, 'src/components/common'))

    for (const c of ['Drawer.jsx', 'FloatingField.jsx', 'Pill.jsx', 'MonoLabel.jsx', 'ScreenHeader.jsx',
      'StatCard.jsx', 'ViewToggle.jsx', 'Button.jsx', 'Modal.jsx', 'Field.jsx', 'Skeleton.jsx']) {
      expect(common).toContain(c)
    }
  })

  it('ya no hay dos Modal con el mismo nombre: se acabó el gotcha de mayúsculas', () => {
    expect(hay('src/components/UI/Modal.jsx')).toBe(false)
    expect(hay('src/components/common/Modal.jsx')).toBe(true)
  })
})

describe('t3/t51 · el gate de contraseña client-side no volvió', () => {
  it('usePasswordCheck no existe', () => {
    expect(hay('src/hooks/usePasswordCheck.js')).toBe(false)
  })

  it('sweetalert2 no es una dependencia', () => {
    const pkg = JSON.parse(leer('package.json'))

    expect(pkg.dependencies?.sweetalert2).toBeUndefined()
    expect(pkg.devDependencies?.sweetalert2).toBeUndefined()
  })
})
