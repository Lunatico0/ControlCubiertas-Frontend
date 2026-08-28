import { readFileSync, readdirSync } from 'node:fs'
import { resolve, join, relative, sep } from 'node:path'

// t97 de la auditoría visual: NUEVE sombras distintas para un solo nivel de elevación, todas con
// negro literal, ninguna tokenizada, ninguna theme-aware. Dos overlays apilados proyectaban
// densidades distintas y el ojo leía profundidades distintas donde el sistema tiene una sola.
//
// ART-DIRECTION.md (sección de superficies) es explícito: "Sombras: solo en overlays reales
// (modales, dropdowns) y sutil. Las cards van con borde, sin sombra flotante."
//
// Los tres niveles viven en index.css como --elev-1/2/3, con valores propios por tema. Este test
// lee el CSS y los componentes del rediseño como texto: no hay layout que medir, lo que hay que
// impedir es que vuelva a aparecer un rgba(0,0,0,...) suelto en un boxShadow.

const raiz = resolve(__dirname, '../..')
const leer = (p) => readFileSync(resolve(raiz, p), 'utf8')

const css = leer('src/index.css')

// Antes esto era una lista de DIEZ archivos escritos a mano, porque la app legacy tenía 32 usos
// de shadow-* de Tailwind en pantallas que el rediseño reemplazaba y un chequeo global era
// imposible. Con la UI legacy eliminada (t78, 2026-08-28) el guard cubre TODO el árbol: es
// justamente el tipo de cosa que se destraba al borrar el código muerto en vez de convivir.
const REDISENO = (() => {
  const salida = []
  const recorrer = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name)
      if (e.isDirectory()) recorrer(p)
      else if (/\.(jsx|js)$/.test(e.name)) salida.push(relative(raiz, p).split(sep).join('/'))
    }
  }
  recorrer(resolve(raiz, 'src/components'))
  return salida
})()

describe('escala de elevación', () => {
  it('los tres niveles están declarados y tienen valor propio en cada tema', () => {
    for (const nivel of ['--elev-1', '--elev-2', '--elev-3']) {
      const enDark = css.match(new RegExp(`${nivel}\\s*:[^;]+;`, 'g')) || []
      expect(enDark.length, `${nivel} debe declararse en oscuro y en claro`).toBe(2)
    }
  })

  it('en tema claro las sombras son más suaves que en oscuro', () => {
    const alfa = (bloque, nivel) => {
      const m = bloque.match(new RegExp(`${nivel}\\s*:[^;]*rgba\\([^)]*?([\\d.]+)\\s*\\)`))
      return m ? parseFloat(m[1]) : null
    }
    const claro = css.slice(css.indexOf('[data-app-theme="light"]'))
    const oscuro = css.slice(css.indexOf(':root,'), css.indexOf('[data-app-theme="light"]'))

    for (const nivel of ['--elev-1', '--elev-2', '--elev-3']) {
      expect(alfa(claro, nivel)).toBeLessThan(alfa(oscuro, nivel))
    }
  })

  it('ningún componente del rediseño proyecta una sombra negra a mano', () => {
    const sueltas = []
    for (const archivo of REDISENO) {
      for (const m of leer(archivo).matchAll(/boxShadow:\s*"([^"]+)"/g)) {
        // El spotlight del tour no es elevación: es la máscara que oscurece todo menos el foco.
        if (m[1].startsWith('0 0 0 9999px')) continue
        // La perilla del switch tampoco: es el relieve de un objeto blanco sobre su propio riel,
        // no una superficie flotando sobre la página. Se ve igual en los dos temas a propósito.
        if (m[1] === '0 1px 2px rgba(0,0,0,.25)') continue
        if (/rgba\(\s*0\s*,\s*0\s*,\s*0/.test(m[1])) sueltas.push(`${archivo}: ${m[1]}`)
      }
    }
    expect(sueltas).toEqual([])
  })

  it('las superficies del rediseño no usan las escalas de sombra de Tailwind', () => {
    const conTailwind = REDISENO.filter((a) => /\bshadow-(sm|md|lg|xl|2xl)\b/.test(leer(a)))
    expect(conTailwind).toEqual([])
  })
})
