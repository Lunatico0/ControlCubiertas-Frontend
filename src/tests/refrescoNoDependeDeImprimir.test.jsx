import { renderHook, act, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

// Bug 1 de BUGS.md, reabierto como t1 de la auditoría.
//
// El síntoma reportado: después de Asignar, el detalle mostraba "Historial: 0 registros",
// "Fecha de alta: No registrada" y "Total asignaciones: 0". Los datos estaban INTACTOS en el
// backend; recargando la página volvían completos.
//
// El QA del flujo de operario intentó reproducirlo y NO lo consiguió, y por eso la tarjeta
// pedía cerrarlo o reabrirlo CON EVIDENCIA. La evidencia es esta: el refresco del detalle
// corría DESPUÉS del bloque de impresión, dentro del mismo flujo secuencial. Con la impresión
// resolviendo bien no pasa nada (de ahí que no se reprodujera). Pero si la promesa de
// impresión NO resuelve —que es exactamente el modo de falla documentado de usePrintEngine—
// el `await print(...)` no vuelve nunca y el refresh no llega a ejecutarse: el drawer se queda
// con la respuesta de la mutación, que viene sin el `history` populado.
//
// El fix es de orden, no de datos: el refresco es parte de la ACCIÓN y la impresión es un
// efecto posterior. Misma doctrina que el resto del flujo (la impresión no gatea nada).

const printSpy = vi.fn()
vi.mock('@hooks/usePrint', () => ({ usePrint: () => ({ print: printSpy }) }))
vi.mock('@utils/toast', () => ({ showToast: vi.fn() }))

const { useTireAction } = await import('@hooks/useTireAction')

const TIRE = { _id: 't1', code: 1001 }
const RESPUESTA = { tire: { _id: 't1' }, receiptNumber: '0001-00000001' }

beforeEach(() => {
  printSpy.mockReset()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => vi.restoreAllMocks())

describe('t1 · el refresco del detalle no depende de que la impresión termine', () => {
  it('con la impresión COLGADA, el refresco igual se ejecuta', async () => {
    // Una promesa que nunca resuelve: el modo de falla del diálogo de impresión.
    printSpy.mockReturnValue(new Promise(() => {}))
    const refresh = vi.fn().mockResolvedValue(undefined)
    const apiCall = vi.fn().mockResolvedValue(RESPUESTA)

    const { result } = renderHook(() => useTireAction({
      apiCall, successMessage: 'Cubierta asignada', printBuilder: () => ({ x: 1 }),
    }))

    act(() => { result.current.execute({ tire: TIRE, formData: {}, refresh }) })

    await waitFor(() => expect(refresh).toHaveBeenCalledWith('t1'))
  })

  it('el refresco ocurre ANTES de mandar a imprimir, no después', async () => {
    const orden = []
    printSpy.mockImplementation(async () => { orden.push('print') })
    const refresh = vi.fn(async () => { orden.push('refresh') })
    const apiCall = vi.fn().mockResolvedValue(RESPUESTA)

    const { result } = renderHook(() => useTireAction({
      apiCall, successMessage: 'ok', printBuilder: () => ({ x: 1 }),
    }))

    await act(async () => { await result.current.execute({ tire: TIRE, formData: {}, refresh }) })

    expect(orden).toEqual(['refresh', 'print'])
  })

  it('si la impresión FALLA, el detalle ya quedó refrescado', async () => {
    printSpy.mockRejectedValue(new Error('no hay impresora'))
    const refresh = vi.fn().mockResolvedValue(undefined)
    const apiCall = vi.fn().mockResolvedValue(RESPUESTA)

    const { result } = renderHook(() => useTireAction({
      apiCall, successMessage: 'ok', printBuilder: () => ({ x: 1 }),
    }))

    await act(async () => { await result.current.execute({ tire: TIRE, formData: {}, refresh }) })

    expect(refresh).toHaveBeenCalledWith('t1')
  })

  it('un fallo del refresco no tumba la acción, que ya está persistida', async () => {
    printSpy.mockResolvedValue({ dispatched: true })
    const refresh = vi.fn().mockRejectedValue(new Error('red caída'))
    const apiCall = vi.fn().mockResolvedValue(RESPUESTA)

    const { result } = renderHook(() => useTireAction({
      apiCall, successMessage: 'ok', printBuilder: () => ({ x: 1 }),
    }))

    let devuelto
    await act(async () => { devuelto = await result.current.execute({ tire: TIRE, formData: {}, refresh }) })

    expect(devuelto).toEqual(RESPUESTA)
    expect(printSpy).toHaveBeenCalled()
  })

  it('sin printBuilder, la acción refresca igual', async () => {
    const refresh = vi.fn().mockResolvedValue(undefined)
    const apiCall = vi.fn().mockResolvedValue(RESPUESTA)

    const { result } = renderHook(() => useTireAction({ apiCall, successMessage: 'ok' }))

    await act(async () => { await result.current.execute({ tire: TIRE, formData: {}, refresh }) })

    expect(refresh).toHaveBeenCalledWith('t1')
    expect(printSpy).not.toHaveBeenCalled()
  })
})
