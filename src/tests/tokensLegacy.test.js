import { readFileSync, readdirSync } from 'node:fs'
import { resolve, join, relative, sep } from 'node:path'
import * as tokens from '@utils/tokens'

// t119 de la auditoría visual.
//
// `utils/tokens.js` exportaba, al lado de los tokens del rediseño, la paleta ANTERIOR completa:
// primary bg-blue-600, bgSidebar gray-100/gray-800, button.indigo, button.purple, input.base
// con focus:ring-blue-500 y rounded-xl. Es exactamente la "paleta índigo + slate genérica" que
// ART-DIRECTION.md pone en la lista negra.
//
// El problema no era que existiera —la app legacy la sigue necesitando hasta que se retire—,
// era que estaba EN EL MISMO MÓDULO que los tokens vigentes: una segunda fuente de verdad,
// contradictoria, viva y a un import de distancia de cualquiera. De ahí salían varios de los
// rounded-xl y shadow-md que rompían la escala.
//
// Y había una vía viva: `<Button>` sin variant caía en `button.primary`, o sea que un botón
// del rediseño salía azul en una app que no tiene azul primario.

const raiz = resolve(__dirname, '../..')
const leer = (p) => readFileSync(resolve(raiz, p), 'utf8')

// Pantallas de la app LEGACY (/legacy/*), las únicas que pueden importar la paleta vieja.
const CARPETAS_LEGACY = [
  'src/components/Forms',
  'src/components/TireList',
  'src/components/TireDetails',
  'src/components/vehicleList',
  'src/components/Sidebar',
  'src/components/actions',
  'src/components/Settings',
  'src/components/UpdateTire',
]
const ARCHIVOS_LEGACY = [
  'src/components/Help.jsx',
  'src/components/SearchFilter.jsx',
  'src/components/common/Button.jsx', // sirve a los dos mundos: expone las variantes legacy por nombre
  'src/components/UI/Modal.jsx',
  'src/components/UI/InfoItem.jsx',
  'src/components/UI/InfoRow.jsx',
]

const esLegacy = (rel) =>
  CARPETAS_LEGACY.some((c) => rel.startsWith(`${c}/`)) || ARCHIVOS_LEGACY.includes(rel)

const listar = (dir) => readdirSync(resolve(raiz, dir), { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? listar(join(dir, e.name)) : [join(dir, e.name)]))
  .map((p) => relative(raiz, resolve(raiz, p)).split(sep).join('/'))

describe('t119 · @utils/tokens ya no es una segunda paleta', () => {
  it('no exporta nada de la paleta anterior', () => {
    expect(tokens.colors).toBeUndefined()
    expect(tokens.text).toBeUndefined()
    expect(tokens.input).toBeUndefined()
    expect(tokens.Label).toBeUndefined()
    expect(tokens.utility).toBeUndefined()
  })

  it('el único botón que exporta es el lima del sistema', () => {
    expect(Object.keys(tokens.button)).toEqual(['lime'])
    expect(tokens.button.lime).toMatch(/var\(--brand\)/)
  })

  it('sigue exportando el título de pantalla, que es del rediseño', () => {
    expect(tokens.tituloPantalla).toMatch(/text-\[28px\]/)
  })

  it('ni un color de Tailwind sobrevive en el módulo', () => {
    const src = leer('src/utils/tokens.js')
    const codigo = src.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n')

    expect(codigo).not.toMatch(/bg-(blue|indigo|purple|gray|slate)-\d/)
    expect(codigo).not.toMatch(/rounded-xl/)
    expect(codigo).not.toMatch(/shadow-md/)
  })
})

describe('t119 · la paleta vieja solo la alcanza la app legacy', () => {
  it('ningún archivo del rediseño importa @utils/legacyTokens', () => {
    const intrusos = listar('src')
      .filter((p) => /\.(jsx|js)$/.test(p) && !p.startsWith('src/tests/'))
      // Un import de verdad, no una mención en un comentario.
      .filter((p) => /^\s*import\s[^\n]*@utils\/legacyTokens/m.test(leer(p)))
      .filter((p) => !esLegacy(p))

    expect(intrusos).toEqual([])
  })
})

describe('t119 · el botón del rediseño no cae en el azul anterior', () => {
  it('sin variant, <Button> es lima', () => {
    const src = leer('src/components/common/Button.jsx')

    expect(src).toMatch(/variant = "lime"/)
    expect(src).not.toMatch(/\|\| VARIANTES\.primary/)
  })
})
