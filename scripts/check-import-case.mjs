#!/usr/bin/env node
// Verifica que TODOS los imports del proyecto resuelvan con el case exacto del filesystem.
//
// Por qué existe: Windows resuelve rutas sin distinguir mayúsculas y Linux sí. Como en este
// proyecto conviven `components/UI/` y `components/common/` con nombres solapados (Modal.jsx en
// las dos), un import escrito con el case equivocado anda perfecto en la máquina de desarrollo
// y rompe el build de Vercel, sin ninguna señal previa. Este check corre en CI (Linux) y en el
// suite de tests, así que el error aparece antes de llegar al deploy.
//
// Uso:  node scripts/check-import-case.mjs [carpeta]     → exit 1 si hay algún mismatch
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const EXTENSIONES = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.json']
const CANDIDATOS = ['', ...EXTENSIONES, ...EXTENSIONES.map((e) => `/index${e}`)]
const ESCANEABLES = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs'])

// `fixtures` queda afuera a propósito: ahí vive un import roto adrede para probar este mismo
// checker. Sin la exclusión el check se reportaría a sí mismo como falla del proyecto.
const IGNORAR = new Set(['node_modules', 'dist', 'build', 'coverage', '.git', 'fixtures'])

// Los specifiers de import se sacan con regex y no con un parser: alcanza y sobra para las tres
// formas que usa el proyecto, y evita meter una dependencia de build sólo para esto.
const PATRONES = [
  /\bfrom\s*["']([^"']+)["']/g, // import x from "y"  ·  export { x } from "y"
  /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g, // import("y") dinámico
  /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g,
  /\bimport\s+["']([^"']+)["']/g, // import "y" (side effects, ej. CSS)
]

// Alias leídos del vite.config real, para que agregar uno nuevo no deje imports sin chequear en
// silencio. Si el formato del config cambia y no se puede leer ninguno, esto revienta a propósito.
export async function readAliases(configPath = path.join(RAIZ, 'vite.config.js')) {
  const src = await fs.readFile(configPath, 'utf8')
  const bloque = src.slice(src.indexOf('alias:'))
  const alias = {}
  for (const m of bloque.matchAll(/["']([^"']+)["']\s*:\s*path\.resolve\(__dirname,\s*["']([^"']+)["']\)/g)) {
    alias[m[1]] = path.resolve(path.dirname(configPath), m[2])
  }
  if (!Object.keys(alias).length) {
    throw new Error(`No se pudo leer ningún alias de ${configPath}. Cambió el formato del config: actualizá este checker.`)
  }
  return alias
}

// Devuelve la ruta con el case REAL del filesystem, o null si no existe ni ignorando el case.
// Camina segmento a segmento porque en Windows `fs.stat` acepta cualquier case y no serviría.
async function realPath(abs) {
  const partes = abs.split(path.sep)
  let actual = partes[0] + path.sep // raíz del volumen ("C:\") o "/" en POSIX
  for (const parte of partes.slice(1)) {
    if (!parte) continue
    let entradas
    try {
      entradas = await fs.readdir(actual)
    } catch {
      return null
    }
    const exacto = entradas.find((e) => e === parte)
    const flexible = exacto ?? entradas.find((e) => e.toLowerCase() === parte.toLowerCase())
    if (!flexible) return null
    actual = path.join(actual, flexible)
  }
  return actual
}

function resolverAlias(specifier, alias) {
  // Más largo primero: '@components' tiene que ganarle a '@'.
  const claves = Object.keys(alias).sort((a, b) => b.length - a.length)
  for (const clave of claves) {
    if (specifier === clave) return alias[clave]
    if (specifier.startsWith(clave + '/')) return path.join(alias[clave], specifier.slice(clave.length + 1))
  }
  return null
}

async function archivosDe(dir) {
  const salida = []
  const entradas = await fs.readdir(dir, { withFileTypes: true })
  for (const e of entradas) {
    if (IGNORAR.has(e.name)) continue
    const completo = path.join(dir, e.name)
    if (e.isDirectory()) salida.push(...(await archivosDe(completo)))
    else if (ESCANEABLES.has(path.extname(e.name))) salida.push(completo)
  }
  return salida
}

/**
 * Resuelve todos los imports de `dir` contra el filesystem de forma sensible al case.
 * Devuelve la lista de mismatches: [{ file, specifier, resolved, real }].
 * Los paquetes de node_modules se ignoran: no son rutas del proyecto.
 */
export async function findCaseMismatches(dir, { alias } = {}) {
  const mapa = alias ?? (await readAliases())
  const fallos = []

  for (const file of await archivosDe(dir)) {
    const src = await fs.readFile(file, 'utf8')
    const vistos = new Set()

    for (const patron of PATRONES) {
      for (const m of src.matchAll(patron)) {
        const specifier = m[1]
        if (vistos.has(specifier)) continue
        vistos.add(specifier)

        const base = specifier.startsWith('.')
          ? path.resolve(path.dirname(file), specifier)
          : resolverAlias(specifier, mapa)
        if (!base) continue // paquete de node_modules

        // Un specifier puede resolver por varias extensiones; alcanza con que UNA exista con el
        // case exacto para que el build de Linux lo encuentre.
        let existeAlguno = false
        let real = null
        for (const sufijo of CANDIDATOS) {
          const candidato = base + sufijo.replace('/', path.sep)
          const resuelto = await realPath(candidato)
          if (!resuelto) continue
          existeAlguno = true
          if (resuelto === candidato) {
            real = null
            break
          }
          real = resuelto
        }

        if (existeAlguno && real) {
          fallos.push({ file, specifier, resolved: base, real })
        }
      }
    }
  }

  return fallos
}

// Ejecutado directamente (CI o a mano), no importado por un test.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const objetivo = path.resolve(process.argv[2] ?? path.join(RAIZ, 'src'))
  const fallos = await findCaseMismatches(objetivo)
  if (!fallos.length) {
    console.log(`✔ Imports con el case correcto en ${path.relative(RAIZ, objetivo) || '.'}`)
    process.exit(0)
  }
  console.error(`✖ ${fallos.length} import(s) con el case equivocado. En Linux el build de Vercel va a romper:\n`)
  for (const f of fallos) {
    console.error(`  ${path.relative(RAIZ, f.file)}`)
    console.error(`    importa "${f.specifier}"`)
    console.error(`    y en el filesystem es: ${path.relative(RAIZ, f.real)}\n`)
  }
  process.exit(1)
}
