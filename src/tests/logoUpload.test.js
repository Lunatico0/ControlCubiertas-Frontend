import { describe, it, expect, vi } from "vitest"
import { LOGO_MAX_BYTES, LOGO_TIPOS, validarLogo, leerLogoComoDataURL } from "@utils/logo"

// t75 — El logo del comprobante se guarda como dataURL en el control plane y viaja en CADA
// getCompany(): el de cada operario al entrar a /op y el cacheo del splash en desktop. La
// subida usaba FileReader.readAsDataURL sin validar tamaño ni tipo y sin onerror, y el
// accept="image/*" del picker es sólo una sugerencia. Una foto de 8 MB se convertía en ~11 MB
// de base64 permanentes.

const archivo = (nombre, tipo, bytes) => ({ name: nombre, type: tipo, size: bytes })

describe("validarLogo", () => {
  it("acepta un PNG chico", () => {
    expect(validarLogo(archivo("logo.png", "image/png", 40_000))).toBeNull()
  })

  it("acepta los tipos de imagen soportados", () => {
    for (const tipo of LOGO_TIPOS) {
      expect(validarLogo(archivo("l", tipo, 1000))).toBeNull()
    }
  })

  it("rechaza un archivo que no es imagen soportada", () => {
    const error = validarLogo(archivo("doc.pdf", "application/pdf", 1000))
    expect(error).toMatch(/formato/i)
  })

  it("rechaza un archivo por encima del límite", () => {
    const error = validarLogo(archivo("foto.jpg", "image/jpeg", LOGO_MAX_BYTES + 1))
    expect(error).toMatch(/pesa|tamaño|límite/i)
  })

  it("acepta exactamente el límite", () => {
    expect(validarLogo(archivo("foto.jpg", "image/jpeg", LOGO_MAX_BYTES))).toBeNull()
  })

  it("rechaza la ausencia de archivo", () => {
    expect(validarLogo(null)).toMatch(/archivo/i)
  })

  it("el límite es de 500 KB", () => {
    expect(LOGO_MAX_BYTES).toBe(500 * 1024)
  })
})

describe("leerLogoComoDataURL", () => {
  it("resuelve con el dataURL cuando la lectura sale bien", async () => {
    const original = globalThis.FileReader
    globalThis.FileReader = class {
      readAsDataURL() {
        this.result = "data:image/png;base64,AAAA"
        setTimeout(() => this.onload?.(), 0)
      }
    }
    await expect(leerLogoComoDataURL(archivo("l.png", "image/png", 10))).resolves.toBe(
      "data:image/png;base64,AAAA",
    )
    globalThis.FileReader = original
  })

  it("rechaza cuando FileReader falla, en vez de quedarse mudo", async () => {
    const original = globalThis.FileReader
    globalThis.FileReader = class {
      readAsDataURL() {
        setTimeout(() => this.onerror?.(new Error("boom")), 0)
      }
    }
    await expect(leerLogoComoDataURL(archivo("l.png", "image/png", 10))).rejects.toThrow()
    globalThis.FileReader = original
  })

  it("rechaza antes de leer si el archivo no pasa la validación", async () => {
    const spy = vi.fn()
    const original = globalThis.FileReader
    globalThis.FileReader = class { readAsDataURL() { spy() } }
    await expect(leerLogoComoDataURL(archivo("f.pdf", "application/pdf", 10))).rejects.toThrow()
    expect(spy).not.toHaveBeenCalled()
    globalThis.FileReader = original
  })
})
