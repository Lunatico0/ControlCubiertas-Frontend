import { describe, it, expect, beforeEach, vi } from "vitest"
import { renderHook } from "@testing-library/react"
import { SettingsProvider } from "@context/SettingsContext"
import useSettings from "@hooks/useSettings"
import usePrint from "@hooks/usePrint"
import { useReprint } from "@hooks/useReprint"

// t72 — El layout del comprobante tenía DOS defaults distintos para el mismo setting:
// SettingsContext arrancaba en "fixed" y usePrint/useReprint leían localStorage directo con
// `|| "dynamic"`. Si se imprimía antes de que corriera el efecto del provider (o con el
// localStorage vacío), el comprobante salía con un layout distinto al que decía la pantalla
// de Ajustes. Hay UN default y UNA fuente: el contexto.

vi.mock("@hooks/usePrintEngine", () => ({
  default: () => ({ printHtml: vi.fn(async () => ({ dispatched: true })), isPrinting: false }),
}))

const wrapper = ({ children }) => <SettingsProvider>{children}</SettingsProvider>

beforeEach(() => {
  localStorage.clear()
})

describe("receiptLayout tiene un único default", () => {
  it('el contexto arranca en "fixed"', () => {
    const { result } = renderHook(() => useSettings(), { wrapper })
    expect(result.current.receiptLayout).toBe("fixed")
  })

  it("usePrint expone el MISMO layout que el contexto, sin localStorage", () => {
    const { result } = renderHook(
      () => ({ ajustes: useSettings(), impresion: usePrint() }),
      { wrapper },
    )
    expect(result.current.impresion.layoutMode).toBe(result.current.ajustes.receiptLayout)
  })

  it("useReprint expone el MISMO layout que el contexto, sin localStorage", () => {
    const { result } = renderHook(
      () => ({ ajustes: useSettings(), reimpresion: useReprint() }),
      { wrapper },
    )
    expect(result.current.reimpresion.layoutMode).toBe(result.current.ajustes.receiptLayout)
  })

  it("los tres siguen el valor guardado en localStorage", () => {
    localStorage.setItem("receiptLayout", "dynamic")
    const { result } = renderHook(
      () => ({ ajustes: useSettings(), impresion: usePrint(), reimpresion: useReprint() }),
      { wrapper },
    )
    expect(result.current.ajustes.receiptLayout).toBe("dynamic")
    expect(result.current.impresion.layoutMode).toBe("dynamic")
    expect(result.current.reimpresion.layoutMode).toBe("dynamic")
  })
})
