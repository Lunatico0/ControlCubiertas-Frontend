import { render, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import { vi } from 'vitest'
import { useModalEscape } from '@hooks/useModalStack.js'

// t66: useModalEscape hace push/pop de un Symbol en un efecto que depende de `onClose`, y TODOS
// los callers pasan un arrow inline. Identidad nueva en cada render → el efecto se vuelve a
// ejecutar → la capa de ABAJO se reinserta ARRIBA del stack y le roba el Escape a la de arriba.
// Que es exactamente el caso que el hook existía para resolver.
//
// El escenario REAL es el de VehicleDrawer: el <Drawer> se monta primero y EditarVehiculo, que es
// su HERMANO en el árbol, se monta después de forma condicional. Con hermanos escalonados el
// orden de montaje alcanza para saber quién está arriba. (Con capas ANIDADAS no alcanzaría: React
// corre los efectos del hijo antes que los del padre, así que el stack nacería invertido. Hoy la
// app no tiene overlays anidados en el árbol y este hook no pretende cubrir ese caso.)

const Capa = ({ onClose }) => {
  useModalEscape(() => onClose())
  return null
}

// Reproduce VehicleDrawer: capa de abajo siempre montada, capa de arriba condicional y hermana,
// y un botón que fuerza un re-render del padre (cualquier cambio de estado lo provoca en la app).
const DrawerConModal = ({ cerrarDrawer, cerrarModal, conModal }) => {
  const [tick, setTick] = useState(0)
  return (
    <>
      <Capa onClose={cerrarDrawer} />
      <button onClick={() => setTick((t) => t + 1)}>re-render {tick}</button>
      {conModal && <Capa onClose={cerrarModal} />}
    </>
  )
}

const escape = () => fireEvent.keyDown(document, { key: 'Escape' })

describe('stack de cierre por Escape', () => {
  it('Escape cierra SOLO la capa de arriba', () => {
    const drawer = vi.fn(); const modal = vi.fn()
    render(<DrawerConModal cerrarDrawer={drawer} cerrarModal={modal} conModal />)

    escape()

    expect(modal).toHaveBeenCalledTimes(1)
    expect(drawer).not.toHaveBeenCalled()
  })

  it('un re-render del padre NO le devuelve el Escape al drawer de abajo', () => {
    const drawer = vi.fn(); const modal = vi.fn()
    const { getByText } = render(<DrawerConModal cerrarDrawer={drawer} cerrarModal={modal} conModal />)

    fireEvent.click(getByText(/re-render/))
    escape()

    expect(modal).toHaveBeenCalledTimes(1)
    expect(drawer).not.toHaveBeenCalled()
  })

  // El caso que de verdad rompe: DialogHost vive en la raíz de la app, en un árbol SEPARADO del
  // drawer. Cuando el drawer re-renderiza por su cuenta (cualquier cambio de estado suyo), su
  // efecto es el ÚNICO que se re-ejecuta, se reinserta arriba del stack y le roba el Escape al
  // diálogo que está visualmente encima. Acá los dos árboles se renderizan por separado.
  it('un re-render SOLO del drawer no le roba el Escape al diálogo de otro árbol', () => {
    const drawer = vi.fn(); const dialogo = vi.fn()

    const Drawer = () => {
      const [tick, setTick] = useState(0)
      return (
        <>
          <Capa onClose={drawer} />
          <button onClick={() => setTick((t) => t + 1)}>re-render drawer {tick}</button>
        </>
      )
    }

    const { getByText } = render(<Drawer />)
    render(<Capa onClose={dialogo} />) // el diálogo aparece DESPUÉS, en su propio árbol

    fireEvent.click(getByText(/re-render drawer/))
    escape()

    expect(dialogo).toHaveBeenCalledTimes(1)
    expect(drawer).not.toHaveBeenCalled()
  })

  it('al cerrarse el modal, el Escape vuelve al drawer', () => {
    const drawer = vi.fn(); const modal = vi.fn()
    const { rerender } = render(<DrawerConModal cerrarDrawer={drawer} cerrarModal={modal} conModal />)

    rerender(<DrawerConModal cerrarDrawer={drawer} cerrarModal={modal} conModal={false} />)
    escape()

    expect(drawer).toHaveBeenCalledTimes(1)
    expect(modal).not.toHaveBeenCalled()
  })

  it('siempre llama al onClose vigente, no al de la primera vez', () => {
    const viejo = vi.fn(); const nuevo = vi.fn()
    const { rerender } = render(<Capa onClose={viejo} />)

    rerender(<Capa onClose={nuevo} />)
    escape()

    expect(nuevo).toHaveBeenCalledTimes(1)
    expect(viejo).not.toHaveBeenCalled()
  })
})
