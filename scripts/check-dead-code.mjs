// Archivos de src/ que no son alcanzables desde main.jsx.
//
// Existen porque nadie los borra cuando se los deja de usar: la auditoría encontró módulos y
// barrels enteros que se seguían manteniendo (y a veces compilando) sin que ninguna pantalla
// los importara. El grafo se recorre siguiendo tanto los imports estáticos como los dinámicos
// (React.lazy), que es lo que hacía falso-positivo a la primera versión de este chequeo.
//
// Uso: node scripts/check-dead-code.mjs [src]
import fs from 'node:fs'
import path from 'node:path'

const RAIZ = process.argv[2] || 'src'
const ENTRADA = path.resolve(RAIZ, 'main.jsx')

// Espejo de los alias de vite.config.js. Si se agrega uno allá, va acá también.
const ALIAS = {
  '@': 'src',
  '@components': 'src/components',
  '@context': 'src/context',
  '@constants': 'src/constants',
  '@utils': 'src/utils',
  '@hooks': 'src/hooks',
  '@api': 'src/api',
}
const EXTENSIONES = ['', '.js', '.jsx', '/index.js', '/index.jsx']

// Directorios que no forman parte del grafo de la app.
const EXCLUIDOS = new Set(['tests'])

function resolver(spec, desde) {
  let base
  if (spec.startsWith('.')) {
    base = path.resolve(path.dirname(desde), spec)
  } else {
    const clave = Object.keys(ALIAS)
      .sort((a, b) => b.length - a.length)
      .find((a) => spec === a || spec.startsWith(`${a}/`))
    if (!clave) return null
    base = path.resolve(ALIAS[clave] + spec.slice(clave.length))
  }
  for (const ext of EXTENSIONES) {
    // path.resolve normaliza los separadores: las variantes con "/index.js" quedaban mezcladas
    // en Windows y no coincidían con las rutas del recorrido del árbol.
    const p = path.resolve(base + ext)
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p
  }
  return null
}

const alcanzables = new Set()
const cola = [ENTRADA]
while (cola.length) {
  const archivo = cola.pop()
  if (alcanzables.has(archivo)) continue
  alcanzables.add(archivo)
  let fuente
  try {
    fuente = fs.readFileSync(archivo, 'utf8')
  } catch {
    continue
  }
  // `from "x"`, `import "x"` e `import("x")` (React.lazy).
  for (const m of fuente.matchAll(/(?:from\s*|import\s*\(\s*|import\s+)["']([^"']+)["']/g)) {
    const destino = resolver(m[1], archivo)
    if (destino) cola.push(destino)
  }
}

const todos = []
;(function recorrer(dir) {
  for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entrada.name)
    if (entrada.isDirectory()) {
      if (!EXCLUIDOS.has(entrada.name)) recorrer(p)
    } else if (/\.(js|jsx)$/.test(entrada.name)) {
      todos.push(path.resolve(p))
    }
  }
})(RAIZ)

const huerfanos = todos.filter((f) => !alcanzables.has(f)).sort()

if (huerfanos.length) {
  console.error(`\n✖ ${huerfanos.length} archivo(s) de ${RAIZ}/ no se alcanzan desde main.jsx:\n`)
  for (const f of huerfanos) console.error(`   ${path.relative(process.cwd(), f)}`)
  console.error('\nBorralos, o importalos desde donde correspondan.\n')
  process.exit(1)
}

console.log(`✔ Los ${todos.length} archivos de ${RAIZ}/ se alcanzan desde main.jsx`)
