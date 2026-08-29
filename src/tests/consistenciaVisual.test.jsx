import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen } from '@testing-library/react'
import Pill from '@components/common/Pill'

// t115, t116, t118, t120 y t122 de la auditoría visual. Son hallazgos de FORMA: no hay
// comportamiento que probar, lo que hay que impedir es que el valor viejo vuelva. Este test
// lee el CSS y los componentes como texto, igual que elevacion.test.js.

const raiz = resolve(__dirname, '../..')
const leer = (p) => readFileSync(resolve(raiz, p), 'utf8')

describe('t118 · un solo lima de marca', () => {
  it('ningún SVG de la marca pinta el lima viejo', () => {
    // Los logos pintaban #bddd2f (26 ocurrencias) mientras la UI usa --brand #C4ED2B: dos
    // tonos distintos a 8px de distancia en el sidebar. El logo es la referencia de marca, y
    // que el acento de la UI no fuera exactamente su color dejaba una disonancia permanente.
    const conLimaViejo = readdirSync(resolve(raiz, 'src/assets'))
      .filter((f) => f.endsWith('.svg'))
      .filter((f) => /#bddd2f/i.test(leer(`src/assets/${f}`)))

    expect(conLimaViejo).toEqual([])
  })

  it('los SVG usan exactamente el lima del token --brand', () => {
    const css = leer('src/index.css')
    const brand = css.match(/--brand:\s*(#[0-9A-Fa-f]{6})/)[1].toUpperCase()
    const logo = leer('src/assets/TireOpsDark.svg')

    expect(logo.toUpperCase()).toContain(brand)
  })
})

describe('t122 · el borde del control existe en todos los monitores', () => {
  it('.ff-control no usa 1.5px', () => {
    // getComputedStyle devuelve 1px con devicePixelRatio 1 y 1.5px en un monitor 2x: el mismo
    // input se veía con distinto peso de borde según el equipo.
    const css = leer('src/index.css')
    const bloque = css.slice(css.indexOf('.ff-control'), css.indexOf('.ff-control') + 900)

    expect(bloque).not.toMatch(/border:\s*1\.5px/)
  })
})

describe('t120 · sin emojis en los títulos', () => {
  it('el saludo de la operativa no lleva el emoji, y saluda igual que el panel', () => {
    const inicio = leer('src/components/Operativa/Inicio.jsx')
    const dashboard = leer('src/components/Portal/Dashboard.jsx')
    const sinComentarios = (s) => s.split('\n').filter((l) => !l.trim().startsWith('//') && !l.includes('t120:')).join('\n')

    expect(sinComentarios(inicio)).not.toMatch(/👋/)
    expect(inicio).toMatch(/¡Hola, \{displayName\}!/)
    expect(dashboard).toMatch(/¡Hola, \{displayName\}!/)
  })
})

describe('t115 · la identidad del usuario aparece una sola vez', () => {
  it('la barra superior del panel ya no repite el bloque de perfil', () => {
    const admin = leer('src/components/Portal/AdminLayout.jsx')
    // El sidebar sigue recibiendo la identidad por props; lo que se fue es la copia de arriba.
    expect(admin).toMatch(/user=\{\{ name: displayName/)
    expect(admin).not.toMatch(/width: 30, height: 30, background: "var\(--ink-lime\)"/)
  })
})

describe('t116 · un solo componente para los badges', () => {
  it('Pill tiene dos tamaños con un rol cada uno', () => {
    const { container } = render(<><Pill>Administrador</Pill><Pill size="tag">VOS</Pill></>)
    const [normal, tag] = [...container.querySelectorAll('span')]

    expect(normal.className).toMatch(/text-\[11px\]/)
    expect(tag.className).toMatch(/text-\[10px\]/)
    expect(tag).toHaveStyle({ fontFamily: 'var(--font-mono)' })
  })

  it('el tamaño normal no arrastra la mono del tamaño tag', () => {
    render(<Pill>Operario</Pill>)
    expect(screen.getByText('Operario').style.fontFamily).toBe('')
  })

  it('los tres badges de la tabla de usuarios y el sidebar pasan por Pill', () => {
    const users = leer('src/components/Portal/Users.jsx')
    const admin = leer('src/components/Portal/AdminLayout.jsx')

    expect(users).toMatch(/<Pill size="tag"[^>]*>VOS<\/Pill>/)
    expect(users).not.toMatch(/text-\[9\.5px\]/)
    expect(admin).toMatch(/PRÓXIMAMENTE<\/Pill>/)
    // El púrpura sobre tint púrpura daba 4.11:1 y falla AA a ese tamaño.
    expect(admin).not.toMatch(/var\(--ink-purple\) 16%[^)]*\)" \}}>PRÓXIMAMENTE/)
  })
})
