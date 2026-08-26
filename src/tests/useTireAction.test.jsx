import { renderHook, act } from '@testing-library/react'
import { useTireAction } from '@hooks/useTireAction'

// El correlativo de comprobante se quemaba en los intentos fallidos: el hook pedía el número
// ANTES de llamar a la API, así que una acción rechazada por el backend (por ejemplo un km de
// baja menor al de alta) se llevaba puesto un número que después no figuraba en ningún papel.
// Reproducido en el QA de operario: los comprobantes 281 y 282 quedaron quemados por dos
// intentos rechazados y el tercero, válido, saltó al 283.
//
// El backend ahora reserva el número DENTRO de la mutación y lo devuelve, así que el hook no
// tiene que pedirlo por adelantado.

vi.mock('@utils/toast', () => ({ showToast: vi.fn() }))
vi.mock('@hooks/usePrint', () => ({ usePrint: () => ({ print: vi.fn().mockResolvedValue(true) }) }))

const tire = { _id: 't1', code: 1001 }

describe('useTireAction y el correlativo de comprobante', () => {
  it('NO pide un número de comprobante antes de llamar a la API', async () => {
    const getReceiptNumber = vi.fn().mockResolvedValue('0001-00000281')
    const apiCall = vi.fn().mockResolvedValue({ tire, receiptNumber: '0001-00000281' })

    const { result } = renderHook(() => useTireAction({ apiCall, successMessage: 'ok' }))
    await act(async () => {
      await result.current.execute({ tire, formData: { getReceiptNumber, kmBaja: 5000 } })
    })

    expect(getReceiptNumber).not.toHaveBeenCalled()
    expect(apiCall).toHaveBeenCalledTimes(1)
  })

  it('si la API rechaza la acción, no se consumió ningún número', async () => {
    const getReceiptNumber = vi.fn().mockResolvedValue('0001-00000281')
    const apiCall = vi.fn().mockRejectedValue(new Error('Kilometraje de baja no puede ser menor que el de alta'))

    const { result } = renderHook(() => useTireAction({ apiCall, successMessage: 'ok' }))
    await act(async () => {
      await result.current.execute({ tire, formData: { getReceiptNumber, kmBaja: 10 } }).catch(() => {})
    })

    expect(getReceiptNumber).not.toHaveBeenCalled()
  })

  it('imprime con el número que devolvió el backend, no con uno pedido de antemano', async () => {
    const apiCall = vi.fn().mockResolvedValue({ tire, receiptNumber: '0001-00000283' })
    const printBuilder = vi.fn().mockReturnValue({ algo: true })

    const { result } = renderHook(() => useTireAction({ apiCall, printBuilder, successMessage: 'ok' }))
    await act(async () => {
      await result.current.execute({ tire, formData: { kmBaja: 5000 } })
    })

    expect(printBuilder).toHaveBeenCalled()
    expect(printBuilder.mock.calls[0][3]).toBe('0001-00000283')
  })

  it('no manda receiptNumber en el body: es el backend el que lo reserva', async () => {
    const apiCall = vi.fn().mockResolvedValue({ tire, receiptNumber: '0001-00000284' })

    const { result } = renderHook(() => useTireAction({ apiCall, successMessage: 'ok' }))
    await act(async () => {
      await result.current.execute({ tire, formData: { kmBaja: 5000, orderNumber: 'O-1' } })
    })

    const body = apiCall.mock.calls[0][1]
    expect(body.receiptNumber).toBeUndefined()
    expect(body.orderNumber).toBe('O-1')
  })

  it('en la corrección de historial tampoco inyecta receiptNumber dentro de form', async () => {
    const apiCall = vi.fn().mockResolvedValue({ tire, receiptNumber: '0001-00000285' })

    const { result } = renderHook(() => useTireAction({ apiCall, successMessage: 'ok' }))
    await act(async () => {
      await result.current.execute({
        tire,
        entry: { _id: 'h1' },
        formData: { form: { orderNumber: 'O-2', reason: 'ajuste' } },
      })
    })

    const body = apiCall.mock.calls[0][1]
    expect(body.form.receiptNumber).toBeUndefined()
    expect(body.form.orderNumber).toBe('O-2')
  })
})
