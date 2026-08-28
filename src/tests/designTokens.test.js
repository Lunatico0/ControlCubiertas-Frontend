import { describe, it, expect } from "vitest"
import { readFileSync, readdirSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

// t80 + t100 + t113 + t114 — El sistema de diseño prometía en un comentario que "cambiar un
// token acá se propaga a toda la app", y era falso: dieciocho tokens @theme con CERO usos,
// dos verdes distintos declarados como primario (--color-brand-500 #84cc16 contra el
// #C4ED2B real de la marca), y ninguna escala para radios, espaciado, transiciones ni
// z-index — dieciséis radios, veinte paddings y ocho duraciones sueltas por el proyecto.
//
// Este test fija las escalas y evita que vuelvan a nacer tokens muertos.

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const css = readFileSync(resolve(raiz, "src/index.css"), "utf8")

const archivosFuente = () => {
  const salida = []
  const recorrer = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = resolve(dir, e.name)
      if (e.isDirectory()) {
        if (e.name !== "tests") recorrer(p)
      } else if (/\.(js|jsx|css)$/.test(e.name)) {
        salida.push(p)
      }
    }
  }
  recorrer(resolve(raiz, "src"))
  return salida
}

const fuenteEntera = archivosFuente()
  .filter((p) => !p.endsWith("index.css"))
  .map((p) => readFileSync(p, "utf8"))
  .join("\n")

describe("no quedan tokens muertos", () => {
  it("la escala --color-brand-* ya no existe: declaraba un verde que no es el de la marca", () => {
    expect(css).not.toMatch(/--color-brand-\d/)
  })

  it("los ocho colores del ciclo de cubierta se fueron: no los usaba nadie", () => {
    for (const t of ["nueva", "primer-recap", "segundo-recap", "tercer-recap", "descartada", "vehiculo", "cubierta"]) {
      expect(css).not.toMatch(new RegExp(`--color-${t}\\s*:`))
    }
  })

  it("el verde de marca es uno solo", () => {
    const verdes = [...css.matchAll(/#(84cc16|a3e635|bddd2f)/gi)]
    expect(verdes.map((m) => m[0])).toEqual([])
  })
})

describe("escala de radios (t100)", () => {
  const TOKENS = ["--r-sm", "--r-md", "--r-lg", "--r-pill"]

  it("declara los cuatro pasos", () => {
    for (const t of TOKENS) expect(css).toMatch(new RegExp(`${t}\\s*:`))
  })

  it("son 6 / 10 / 14 / 999", () => {
    expect(css).toMatch(/--r-sm:\s*6px/)
    expect(css).toMatch(/--r-md:\s*10px/)
    expect(css).toMatch(/--r-lg:\s*14px/)
    expect(css).toMatch(/--r-pill:\s*999px/)
  })
})

describe("escala de espaciado (t113)", () => {
  it("declara los seis pasos de 4 en 4", () => {
    for (const [t, v] of [["--sp-1", 4], ["--sp-2", 8], ["--sp-3", 12], ["--sp-4", 16], ["--sp-5", 20], ["--sp-6", 24]]) {
      expect(css).toMatch(new RegExp(`${t}:\\s*${v}px`))
    }
  })
})

describe("escala de transiciones (t114)", () => {
  it("declara tres duraciones y una sola curva", () => {
    expect(css).toMatch(/--t-fast:\s*120ms/)
    expect(css).toMatch(/--t-base:\s*180ms/)
    expect(css).toMatch(/--t-slow:\s*300ms/)
    expect(css).toMatch(/--t-ease:/)
  })
})

describe("escala de z-index (t80)", () => {
  it("declara una capa por rol, en vez de z-10/20/50/60/70 sueltos", () => {
    for (const t of ["--z-sticky", "--z-drawer", "--z-modal", "--z-toast"]) {
      expect(css).toMatch(new RegExp(`${t}:`))
    }
  })
})

describe("el color de marca vive en un solo lugar", () => {
  it("--ink-lime sigue siendo el primario declarado", () => {
    expect(css).toMatch(/--ink-lime:\s*#C4ED2B/i)
  })

  it("ningún componente escribe el lima a mano", () => {
    // 28 sitios lo hacían: cambiar el primario obligaba a tocar 28 archivos.
    expect(fuenteEntera).not.toMatch(/#C4ED2B/i)
  })

  it("ningún componente escribe el fondo oscuro a mano", () => {
    expect(fuenteEntera).not.toMatch(/#0A0C0D/i)
  })
})

describe("cifras: mono y tabular (t104, t106)", () => {
  it("toda cifra en la familia mono es tabular", () => {
    // Sin tabular-nums los dígitos tienen anchos distintos y las columnas de números no
    // alinean por dígito, que es la ÚNICA razón para usar mono en una tabla.
    expect(css).toMatch(/font-variant-numeric:\s*tabular-nums/)
    // El selector tiene que enganchar el style inline, que es como está escrito en los
    // call sites: fontFamily: "var(--font-mono)".
    expect(css).toMatch(/\[style\*="--font-mono"\]/)
  })

  it("StatCard muestra el valor en mono, no en la familia de display", () => {
    // ART-DIRECTION es explícito: las cifras van en IBM Plex Mono. El KPI salía en Space
    // Grotesk, así que en la misma tabla convivían mono y proporcional.
    const statCard = readFileSync(resolve(raiz, "src/components/UI/StatCard.jsx"), "utf8")
    expect(statCard).not.toMatch(/--font-display/)
    expect(statCard).toMatch(/--font-mono/)
  })

  it("la columna numérica del ranking alinea a la derecha", () => {
    const reportes = readFileSync(resolve(raiz, "src/components/Portal/Reportes.jsx"), "utf8")
    const cabecera = reportes.match(/<div>Cubiertas<\/div>/)
    expect(cabecera).toBeNull() // tiene que llevar text-right
  })
})
