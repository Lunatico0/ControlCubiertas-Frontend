import { renderHook, act } from '@testing-library/react'
import { createRef } from 'react'
import useContextMenu from '@hooks/useContextMenu'

// t67: `const menuRef = customRef || useRef(null)`. Si customRef llega con valor, useRef NO se
// llama: es un hook condicional. Hoy nadie pasa customRef, así que el orden de hooks es estable
// por CASUALIDAD; el primer caller que lo pase de forma condicional le corrompe el orden de hooks
// al componente entero, y React empieza a devolver el estado de un hook en lugar de otro.

describe('useContextMenu', () => {
  it('mantiene el orden de hooks cuando customRef aparece entre renders', () => {
    const propio = createRef()
    const { result, rerender } = renderHook(({ ref }) => useContextMenu(ref), {
      initialProps: { ref: null },
    })

    act(() => result.current.openMenu(2, { preventDefault() {}, stopPropagation() {}, clientX: 10, clientY: 10 }))
    expect(result.current.openIndex).toBe(2)

    // Sin el fix, este render llama un hook menos y React tira el error de orden de hooks.
    expect(() => rerender({ ref: propio })).not.toThrow()
    expect(result.current.openIndex).toBe(2) // el estado sigue siendo el mismo, no se corrió
  })

  it('usa la ref que le pasan cuando le pasan una', () => {
    const propio = createRef()
    const { result } = renderHook(() => useContextMenu(propio))

    expect(result.current.menuRef).toBe(propio)
  })

  it('sin ref propia devuelve una suya, estable entre renders', () => {
    const { result, rerender } = renderHook(() => useContextMenu())
    const primera = result.current.menuRef

    rerender()

    expect(result.current.menuRef).toBe(primera)
    expect(primera).toHaveProperty('current')
  })
})
