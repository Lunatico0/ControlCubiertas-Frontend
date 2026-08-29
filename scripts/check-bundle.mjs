#!/usr/bin/env node
// Reporta el peso de los chunks del build y falla si el bundle de entrada vuelve a crecer.
//
// Por qué existe: el proyecto arrancó sin un solo dynamic import, así que TODO viajaba en un
// chunk único: un operario que sólo usa la operativa se bajaba el panel admin entero, recharts
// antes de ver la primera pantalla. El code splitting por rama de ruta lo
// arregló, pero nada impide que el próximo import estático arriba de App.jsx lo deshaga en
// silencio. Este check corre en CI después del build y pone un techo explícito.
//
// Uso:  node scripts/check-bundle.mjs [carpeta-dist]
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// Techo del chunk de ENTRADA (el que carga index.html), en KB sin comprimir. El bundle único
// original pesaba ~1210 KB. Este número es un tope, no una meta: si un cambio legítimo lo
// supera, subirlo a conciencia y dejar dicho por qué; nunca borrar el check.
const MAX_ENTRADA_KB = 800
// Mínimo de chunks: si el splitting se rompe, todo vuelve a un archivo y esto lo caza.
const MIN_CHUNKS = 4

const kb = (bytes) => Math.round(bytes / 1024)

export async function analizarBundle(dist) {
  const html = await fs.readFile(path.join(dist, 'index.html'), 'utf8')

  // El chunk de entrada es el que index.html carga con <script type="module">.
  const m = html.match(/<script[^>]+type="module"[^>]+src="([^"]+)"/)
  if (!m) throw new Error(`No se encontró el <script type="module"> en ${path.join(dist, 'index.html')}`)
  const entrada = path.join(dist, m[1].replace(/^[./]+/, ''))

  const assets = path.join(dist, 'assets')
  const archivos = (await fs.readdir(assets)).filter((f) => f.endsWith('.js'))

  const chunks = []
  for (const f of archivos) {
    const { size } = await fs.stat(path.join(assets, f))
    chunks.push({ name: f, kb: kb(size), entry: path.join(assets, f) === entrada })
  }
  chunks.sort((a, b) => b.kb - a.kb)

  const entryChunk = chunks.find((c) => c.entry)
  if (!entryChunk) throw new Error(`El chunk de entrada (${entrada}) no está en ${assets}`)

  return { chunks, entryChunk, total: chunks.reduce((a, c) => a + c.kb, 0) }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dist = path.resolve(process.argv[2] ?? path.join(RAIZ, 'dist'))
  const { chunks, entryChunk, total } = await analizarBundle(dist)

  console.log(`Chunks JS (${chunks.length}, ${total} KB en total):`)
  for (const c of chunks.slice(0, 12)) {
    console.log(`  ${String(c.kb).padStart(5)} KB  ${c.name}${c.entry ? '   ← entrada' : ''}`)
  }
  if (chunks.length > 12) console.log(`  … y ${chunks.length - 12} chunk(s) más`)

  const problemas = []
  if (entryChunk.kb > MAX_ENTRADA_KB) {
    problemas.push(`El chunk de entrada pesa ${entryChunk.kb} KB y el techo es ${MAX_ENTRADA_KB} KB. Buscá el import estático que metió una rama diferida de vuelta en el arranque.`)
  }
  if (chunks.length < MIN_CHUNKS) {
    problemas.push(`Sólo hay ${chunks.length} chunk(s): el code splitting por rama de ruta se rompió (se esperan al menos ${MIN_CHUNKS}).`)
  }

  if (problemas.length) {
    console.error('\n✖ ' + problemas.join('\n✖ '))
    process.exit(1)
  }
  console.log(`\n✔ Entrada en ${entryChunk.kb} KB (techo ${MAX_ENTRADA_KB} KB) y ${chunks.length} chunks.`)
}
