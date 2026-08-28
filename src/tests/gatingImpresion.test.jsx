import { renderHook, act } from '@testing-library/react'
import { showToast } from '@utils/toast'

// t125 / t2 — el gating de impresión funcionaba al revés y, peor, era IMPOSIBLE de sostener.
//
// El flujo viejo persistía la mutación, después esperaba `print()` y recién ahí cantaba éxito.
// Si el operario cancelaba el diálogo el movimiento YA estaba en la base y no se revertía. Y la
// app ni siquiera podía enterarse: `window.print()` no informa el resultado, `onafterprint`
// dispara igual al cancelar y el `beforeunload` de la ventana posteaba `printed: true` siempre.
// O sea que el booleano que devolvía el motor no significaba nada, y todo mensaje construido
// sobre él ("reimpreso correctamente", "la impresión fue cancelada") era ficción.
//
// Además, imprimir ANTES de persistir exigiría el número de comprobante por adelantado, que es
// exactamente el bug de los correlativos quemados que ya se cerró (el backend lo reserva dentro
// de la mutación).
//
// Decisión: la impresión sale del camino crítico. La acción se registra, el comprobante se
// despacha después y la UI dice lo que REALMENTE pasó ("enviado a impresión"), nunca "impreso".
// Y queda opcional por tenant vía company.autoPrint.

vi.mock('@utils/toast', () => ({ showToast: vi.fn() }))

const company = { autoPrint: true }
vi.mock('@api/company', () => ({
  getCompanyCached: vi.fn(async () => company),
}))

const printHtml = vi.fn(async () => ({ dispatched: true }))
vi.mock('@hooks/usePrintEngine', () => ({
  default: () => ({ printHtml, isPrinting: false }),
}))

vi.mock('@utils/receipt-html', () => ({ generateReceiptHTML: () => '<div>comprobante</div>' }))
vi.mock('@utils/print-data', () => ({ buildReprintData: (entry) => ({ receiptNumber: entry.receiptNumber }) }))

const { usePrint } = await import('@hooks/usePrint')
const { useTireAction } = await import('@hooks/useTireAction')
const { useReprint } = await import('@hooks/useReprint')

const tire = { _id: 't1', code: 1001 }

beforeEach(() => {
  company.autoPrint = true
  printHtml.mockClear()
  printHtml.mockResolvedValue({ dispatched: true })
  showToast.mockClear()
})

const mensajes = () => showToast.mock.calls.map(([, texto]) => texto).join(' | ')

describe('usePrint respeta la preferencia del tenant', () => {
  it('con autoPrint activo despacha la impresión', async () => {
    const { result } = renderHook(() => usePrint())
    let salida
    await act(async () => {
      salida = await result.current.print({ receiptNumber: '0001-00000283' })
    })
    expect(printHtml).toHaveBeenCalledTimes(1)
    expect(salida.status).toBe('dispatched')
  })

  it('con autoPrint apagado NO abre ninguna ventana de impresión', async () => {
    company.autoPrint = false
    const { result } = renderHook(() => usePrint())
    let salida
    await act(async () => {
      salida = await result.current.print({ receiptNumber: '0001-00000283' })
    })
    expect(printHtml).not.toHaveBeenCalled()
    expect(salida.status).toBe('disabled')
  })
})

describe('useTireAction: la impresión no gatea la acción y el mensaje no miente', () => {
  it('la acción se registra ANTES de imprimir y no depende del resultado del diálogo', async () => {
    const orden = []
    const apiCall = vi.fn(async () => {
      orden.push('api')
      return { tire, receiptNumber: '0001-00000283' }
    })
    printHtml.mockImplementation(async () => {
      orden.push('print')
      return { dispatched: true }
    })

    const { result } = renderHook(() =>
      useTireAction({ apiCall, printBuilder: () => ({ receiptNumber: '0001-00000283' }), successMessage: 'Cubierta asignada' }),
    )
    await act(async () => {
      await result.current.execute({ tire, formData: {} })
    })

    expect(orden).toEqual(['api', 'print'])
  })

  it('nunca afirma que se imprimió: dice que el comprobante fue enviado a impresión', async () => {
    const apiCall = vi.fn(async () => ({ tire, receiptNumber: '0001-00000283' }))
    const { result } = renderHook(() =>
      useTireAction({ apiCall, printBuilder: () => ({ receiptNumber: '0001-00000283' }), successMessage: 'Cubierta asignada' }),
    )
    await act(async () => {
      await result.current.execute({ tire, formData: {} })
    })

    expect(mensajes()).toMatch(/enviado a impresión/i)
    expect(mensajes()).not.toMatch(/\bimpres[oa]\b/i)
    expect(mensajes()).toContain('0001-00000283')
  })

  it('con autoPrint apagado avisa que el comprobante queda en el historial', async () => {
    company.autoPrint = false
    const apiCall = vi.fn(async () => ({ tire, receiptNumber: '0001-00000284' }))
    const { result } = renderHook(() =>
      useTireAction({ apiCall, printBuilder: () => ({ receiptNumber: '0001-00000284' }), successMessage: 'Cubierta asignada' }),
    )
    await act(async () => {
      await result.current.execute({ tire, formData: {} })
    })

    expect(printHtml).not.toHaveBeenCalled()
    expect(mensajes()).toMatch(/historial/i)
    expect(mensajes()).toContain('0001-00000284')
  })

  it('si la impresión no se puede abrir, la acción sigue confirmada y ofrece reimprimir', async () => {
    printHtml.mockRejectedValue(new Error('No se pudo abrir la ventana de impresión'))
    const apiCall = vi.fn(async () => ({ tire, receiptNumber: '0001-00000285' }))
    const close = vi.fn()

    const { result } = renderHook(() =>
      useTireAction({ apiCall, printBuilder: () => ({ receiptNumber: '0001-00000285' }), successMessage: 'Cubierta asignada' }),
    )
    await act(async () => {
      await result.current.execute({ tire, formData: {}, close })
    })

    // La acción NO se revierte ni se aborta: ya está persistida en el backend.
    expect(close).toHaveBeenCalled()
    expect(mensajes()).toMatch(/reimprim/i)
    expect(mensajes()).toContain('0001-00000285')
  })
})

describe('useReprint: mensajes honestos', () => {
  it('dice que el comprobante fue enviado a impresión, no que se imprimió', async () => {
    const { result } = renderHook(() => useReprint())
    await act(async () => {
      await result.current.execute({ entry: { receiptNumber: '0001-00000290' }, tire })
    })

    expect(mensajes()).toMatch(/enviado a impresión/i)
    expect(mensajes()).not.toMatch(/cancelada/i)
    expect(mensajes()).not.toMatch(/reimpreso correctamente/i)
  })

  it('la reimpresión ignora autoPrint: es una acción explícita del usuario', async () => {
    company.autoPrint = false
    const { result } = renderHook(() => useReprint())
    await act(async () => {
      await result.current.execute({ entry: { receiptNumber: '0001-00000291' }, tire })
    })

    expect(printHtml).toHaveBeenCalledTimes(1)
  })
})
