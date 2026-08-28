import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// t77 de la auditoría del frontend.
//
// Convivían DOS sistemas de diseño: el legacy (@utils/legacyTokens, paleta Tailwind gray/blue,
// dark: por clase) y el vigente (variables CSS de index.css con --tx, --card, --bd, --ink-*,
// más data-app-theme). Eso en sí no era el problema: el legacy muere con /legacy/*.
//
// El problema era que `components/UI/` estaba PARTIDO entre los dos. Modal, StatusBadge,
// InfoItem e InfoRow eran legacy; Drawer, FloatingField, Pill, MonoLabel, ScreenHeader,
// StatCard y ViewToggle eran del rediseño; y Button servía variantes de ambos. Nadie podía
// saber, mirando la RUTA DEL IMPORT, en qué sistema estaba parado.
//
// La frontera quedó así:
//   components/common/  →  el sistema VIGENTE. Todo lo compartido y lo nuevo va acá.
//   components/UI/      →  SOLO legacy. Se retira con /legacy/*. No agregar nada.
//
// Bonus: es lo que desactiva de raíz el gotcha de mayúsculas que documenta CLAUDE.md (había
// un `Modal.jsx` en `UI/` y otro en `common/`, y un import con el case equivocado pasaba en
// Windows y rompía el build de Vercel). El día que muera UI/, el par desaparece.

const raiz = resolve(__dirname, '../..')
const listar = (dir) => readdirSync(resolve(raiz, dir)).filter((f) => f.endsWith('.jsx'))

// Lo que puede seguir viviendo en UI/. Cualquier otra cosa ahí es un componente nuevo puesto
// del lado equivocado de la frontera.
const RESTO_LEGACY = ['Modal.jsx', 'StatusBadge.jsx', 'InfoItem.jsx', 'InfoRow.jsx']

describe('t77 · la frontera entre los dos sistemas es la ruta del import', () => {
  it('UI/ quedó SOLO con lo legacy', () => {
    expect(listar('src/components/UI').sort()).toEqual([...RESTO_LEGACY].sort())
  })

  it('los componentes del rediseño viven en common/', () => {
    const common = listar('src/components/common')

    for (const c of ['Drawer.jsx', 'FloatingField.jsx', 'Pill.jsx', 'MonoLabel.jsx',
      'ScreenHeader.jsx', 'StatCard.jsx', 'ViewToggle.jsx', 'Button.jsx', 'Spinner.jsx']) {
      expect(common).toContain(c)
    }
  })

  it('no quedó ningún import apuntando a la ubicación vieja', () => {
    const walk = (dir) => readdirSync(resolve(raiz, dir), { withFileTypes: true })
      .flatMap((e) => (e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`]))

    const rotos = walk('src')
      .filter((p) => /\.(jsx|js)$/.test(p))
      .filter((p) => {
        const src = readFileSync(resolve(raiz, p), 'utf8')
        return /@components\/UI\/(Drawer|FloatingField|Pill|MonoLabel|ScreenHeader|StatCard|ViewToggle|Button|Spinner)\b/.test(src)
      })

    expect(rotos).toEqual([])
  })
})
