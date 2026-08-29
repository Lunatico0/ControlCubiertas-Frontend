import { readFileSync, readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'

// t92 de la auditoría visual: dos familias de iconos conviviendo. El sidebar en Material RELLENO
// y el contenido al lado en SVG lineal fino, a 30 cm de distancia. Y ocho grosores de trazo
// distintos entre los SVG hechos a mano (1.4, 1.8, 1.9, 2, 2.1, 2.2, 2.4, 2.6, 3.4).
//
// La card proponía migrar todo a lucide-react y retirar @mui/icons-material: 47 archivos y un
// cambio de bundle que no se puede medir porque la regla del repo prohíbe buildear. Se eligió la
// vía sin dependencia nueva: los iconos MUI de glifo SÓLIDO pasan a su variante Outlined, y los
// SVG a mano comparten un único grosor.
//
// Los iconos MUI que son puro trazo (Close, Add, Check, flechas, Search, Tune, Undo…) se ven igual
// en filled y en outlined, así que quedan como están: cambiarlos sería ruido en el diff sin
// diferencia en pantalla.

const raiz = resolve(__dirname, '../..')
// Con la UI legacy eliminada (t78) ya no hay carpetas que excluir: el guard cubre
// src/components entero, incluido common/, que antes quedaba afuera de la lista.
const REDISENO = ['Portal', 'Layout', 'Operativa', 'dialog', 'Auth', 'Updater', 'common']

// Recorre los directorios del rediseño y devuelve sus .jsx con el contenido.
const archivos = () => {
  const salida = []
  const recorrer = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name)
      if (e.isDirectory()) recorrer(p)
      else if (e.name.endsWith('.jsx')) salida.push([p.replace(raiz, '').replace(/\\/g, '/'), readFileSync(p, 'utf8')])
    }
  }
  for (const d of REDISENO) recorrer(resolve(raiz, 'src/components', d))
  return salida
}

// Iconos de glifo sólido: los que se leen como una mancha al lado de un SVG lineal.
const SOLIDOS = [
  'AdminPanelSettings', 'Apartment', 'Bolt', 'CheckCircle', 'ContentCopy', 'CreditCard', 'DarkMode',
  'DesktopWindows', 'DirectionsBus', 'Edit', 'EmojiEvents', 'Group', 'Home', 'Info', 'Insights',
  'LightMode', 'LocalShipping', 'LockReset', 'Logout', 'MenuBook', 'PersonAddAlt', 'PlayArrow',
  'Print', 'ReceiptLong', 'ReportProblem', 'SettingsInputComponent', 'Style', 'TaskAlt',
  'TripOrigin', 'Visibility', 'Warehouse', 'Warning',
]

describe('familia de iconos', () => {
  it('ningún icono de glifo sólido se importa en su variante rellena', () => {
    const rellenos = []
    for (const [ruta, src] of archivos()) {
      for (const icono of SOLIDOS) {
        if (src.includes(`@mui/icons-material/${icono}Rounded"`)) rellenos.push(`${ruta}: ${icono}Rounded`)
      }
    }
    expect(rellenos).toEqual([])
  })

  it('los SVG a mano comparten un único grosor de trazo', () => {
    // Excepciones, cada una con su motivo:
    //   TitleBar        — los controles de ventana de Windows imitan el chrome nativo, que es más fino.
    //   Reportes:Pie/Series y Dashboard — no son iconos: es el grosor del anillo y de la línea del gráfico.
    //   GuiaShell       — anillo de progreso, tampoco un icono.
    const EXENTOS = ['/Layout/TitleBar.jsx', '/Portal/Dashboard.jsx', '/Operativa/GuiaShell.jsx']

    const grosores = new Set()
    for (const [ruta, src] of archivos()) {
      if (EXENTOS.some((e) => ruta.endsWith(e))) continue
      for (const m of src.matchAll(/strokeWidth=(?:"([\d.]+)"|\{([\d.]+)\})/g)) {
        const valor = m[1] ?? m[2]
        // En Reportes conviven iconos con gráficos de recharts; los de recharts van en <Pie>/<Series>.
        const linea = src.slice(0, m.index).split('\n').pop() + src.slice(m.index).split('\n')[0]
        if (/<(Pie|Series|Line|Area|Bar)\b/.test(linea)) continue
        grosores.add(valor)
      }
    }
    expect([...grosores]).toEqual(['1.75'])
  })
})
