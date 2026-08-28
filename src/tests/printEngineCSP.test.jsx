import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import usePrintEngine from "@hooks/usePrintEngine"

// t161 — El build declara una Content-Security-Policy con `script-src 'self'`, y una ventana
// abierta con window.open("") HEREDA la CSP de quien la abrió. Verificado en Electron: el
// script inline que el motor escribía en la ventana de impresión quedaba BLOQUEADO, o sea que
// el comprobante nunca se imprimía y la promesa se resolvía sólo por el timeout de 15s.
//
// El motor no escribe más scripts: la ventana hija es same-origin, así que el opener puede
// medir, escalar y disparar la impresión sobre ella directamente. De paso desaparece el
// postMessage, que existía sólo para cruzar esa frontera.
//
// Lo que NO cambia (y no puede cambiar): el motor sigue sin saber si el papel salió. Resuelve
// { dispatched: true } y nunca un booleano "impreso". Ver el comentario del hook.

const crearVentanaFalsa = () => {
  const escrito = []
  const contenedor = {
    scrollHeight: 500,
    style: {},
  }
  const raiz = { style: {}, querySelector: () => contenedor }
  return {
    escrito,
    contenedor,
    closed: false,
    print: vi.fn(),
    close: vi.fn(function cerrar() { this.closed = true }),
    document: {
      write: (html) => escrito.push(html),
      close: vi.fn(),
      getElementById: (id) => (id === "print-root" ? raiz : null),
      fonts: { ready: Promise.resolve() },
    },
  }
}

let ventana

beforeEach(() => {
  ventana = crearVentanaFalsa()
  vi.stubGlobal("open", vi.fn(() => ventana))
})

const html = () => ventana.escrito.join("")

describe("la ventana de impresión no necesita scripts inline", () => {
  it("el HTML escrito no contiene ni una etiqueta script", async () => {
    const { result } = renderHook(() => usePrintEngine())
    await act(async () => {
      const p = result.current.printHtml("<p>comprobante</p>", "C-1")
      ventana.closed = true
      await p
    })
    expect(html()).not.toMatch(/<script/i)
  })

  it("el contenido del comprobante sí está en el HTML", async () => {
    const { result } = renderHook(() => usePrintEngine())
    await act(async () => {
      const p = result.current.printHtml("<p>comprobante</p>", "C-1")
      ventana.closed = true
      await p
    })
    expect(html()).toMatch(/comprobante/)
    expect(html()).toMatch(/C-1/)
  })

  it("dispara la impresión desde el opener", async () => {
    const { result } = renderHook(() => usePrintEngine())
    await act(async () => {
      const p = result.current.printHtml("<p>x</p>")
      await new Promise((r) => setTimeout(r, 50))
      ventana.closed = true
      await p
    })
    expect(ventana.print).toHaveBeenCalled()
  })

  it("escala el contenido que no entra en una A4, desde el opener", async () => {
    ventana.contenedor.scrollHeight = 2090 // el doble del alto imprimible
    const { result } = renderHook(() => usePrintEngine())
    await act(async () => {
      const p = result.current.printHtml("<p>x</p>")
      await new Promise((r) => setTimeout(r, 50))
      ventana.closed = true
      await p
    })
    expect(ventana.contenedor.style.transform).toMatch(/scale\(0\.5/)
  })

  it("no escala lo que ya entra", async () => {
    ventana.contenedor.scrollHeight = 400
    const { result } = renderHook(() => usePrintEngine())
    await act(async () => {
      const p = result.current.printHtml("<p>x</p>")
      await new Promise((r) => setTimeout(r, 50))
      ventana.closed = true
      await p
    })
    expect(ventana.contenedor.style.transform).toBeUndefined()
  })
})

describe("el contrato del motor no cambió", () => {
  it("resuelve { dispatched: true }, nunca un booleano impreso", async () => {
    const { result } = renderHook(() => usePrintEngine())
    let salida
    await act(async () => {
      const p = result.current.printHtml("<p>x</p>")
      await new Promise((r) => setTimeout(r, 50))
      ventana.onafterprint?.()
      salida = await p
    })
    expect(salida).toEqual({ dispatched: true })
  })

  it("resuelve igual si el usuario cierra la ventana sin imprimir", async () => {
    const { result } = renderHook(() => usePrintEngine())
    let salida
    await act(async () => {
      const p = result.current.printHtml("<p>x</p>")
      ventana.closed = true
      salida = await p
    })
    expect(salida).toEqual({ dispatched: true })
  })

  it("rechaza si el popup fue bloqueado", async () => {
    vi.stubGlobal("open", vi.fn(() => null))
    const { result } = renderHook(() => usePrintEngine())
    await expect(result.current.printHtml("<p>x</p>")).rejects.toThrow(/ventana de impresión/i)
  })

  it("carga las fuentes del bundle, no del CDN", async () => {
    const { result } = renderHook(() => usePrintEngine())
    await act(async () => {
      const p = result.current.printHtml("<p>x</p>")
      ventana.closed = true
      await p
    })
    expect(html()).toMatch(/@font-face/)
    expect(html()).not.toMatch(/fonts\.googleapis\.com/)
  })
})
