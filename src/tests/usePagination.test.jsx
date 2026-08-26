import { renderHook, act } from '@testing-library/react'
import { usePagination } from '@hooks/usePagination'

// El hook ya existía pero solo lo usaba la UI legacy. Al llevarlo a la operativa aparece un
// problema que en legacy no se notaba: cuando el usuario filtra o busca, la lista se achica y
// la página actual puede quedar fuera de rango. Sin reset, la vista queda VACÍA con resultados
// que sí existen, que es peor que no paginar.

const lista = (n) => Array.from({ length: n }, (_, i) => ({ id: i + 1 }))

describe('usePagination', () => {
  it('corta la lista al tamaño de página', () => {
    const { result } = renderHook(() => usePagination(lista(58), 24))
    expect(result.current.currentItems).toHaveLength(24)
    expect(result.current.totalPages).toBe(3)
  })

  it('navega entre páginas y la última trae el resto', () => {
    const { result } = renderHook(() => usePagination(lista(58), 24))
    act(() => result.current.goToPage(3))
    expect(result.current.currentPage).toBe(3)
    expect(result.current.currentItems).toHaveLength(10)
  })

  it('no se pasa de la última página ni baja de la primera', () => {
    const { result } = renderHook(() => usePagination(lista(30), 24))
    act(() => result.current.prevPage())
    expect(result.current.currentPage).toBe(1)
    act(() => result.current.goToPage(99))
    expect(result.current.currentPage).toBe(1)
  })

  it('si la lista se achica y la página queda fuera de rango, vuelve a la primera', () => {
    const { result, rerender } = renderHook(({ items }) => usePagination(items, 24), {
      initialProps: { items: lista(58) },
    })
    act(() => result.current.goToPage(3))
    expect(result.current.currentPage).toBe(3)

    // El usuario escribe en el buscador y quedan 5 resultados: la página 3 ya no existe.
    rerender({ items: lista(5) })

    expect(result.current.currentPage).toBe(1)
    expect(result.current.currentItems).toHaveLength(5)
  })

  it('una lista vacía no rompe ni deja la página en cero', () => {
    const { result } = renderHook(() => usePagination([], 24))
    expect(result.current.currentPage).toBe(1)
    expect(result.current.currentItems).toEqual([])
    expect(result.current.totalPages).toBe(0)
  })
})
