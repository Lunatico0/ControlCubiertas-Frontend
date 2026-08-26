import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { clickable } from '@utils/clickable'

// t64: divs con onClick sin acceso por teclado en los flujos principales. En la mayoría de los
// casos alcanza con cambiar el tag a <button>, y así se resolvieron el nav, el acceso al panel
// administrativo, la X del diálogo de impresión y los dos del login.
//
// Pero las cards de cubierta y las filas de vehículo NO pueden ser <button>: tienen botones de
// acción ADENTRO, y un button dentro de otro button es HTML inválido (el navegador desarma el
// árbol). Para esos va el patrón role="button" + tabIndex + Enter/Espacio, que es lo que este
// helper arma en un solo lugar en vez de repetirlo en cinco.

describe('clickable()', () => {
  const Fila = ({ onOpen, onAccion }) => (
    <div {...clickable(onOpen)} aria-label="Cubierta 1001">
      <span>#1001</span>
      <button onClick={(e) => { e.stopPropagation(); onAccion() }}>Asignar</button>
    </div>
  )

  it('entra en el orden de tabulación y se anuncia como control', () => {
    render(<Fila onOpen={vi.fn()} onAccion={vi.fn()} />)

    const fila = screen.getByRole('button', { name: 'Cubierta 1001' })
    expect(fila).toHaveAttribute('tabindex', '0')
  })

  it('Enter y Espacio la activan, igual que el clic', () => {
    const onOpen = vi.fn()
    render(<Fila onOpen={onOpen} onAccion={vi.fn()} />)
    const fila = screen.getByRole('button', { name: 'Cubierta 1001' })

    fireEvent.click(fila)
    fireEvent.keyDown(fila, { key: 'Enter' })
    fireEvent.keyDown(fila, { key: ' ' })

    expect(onOpen).toHaveBeenCalledTimes(3)
  })

  it('una tecla cualquiera no la activa', () => {
    const onOpen = vi.fn()
    render(<Fila onOpen={onOpen} onAccion={vi.fn()} />)

    fireEvent.keyDown(screen.getByRole('button', { name: 'Cubierta 1001' }), { key: 'a' })

    expect(onOpen).not.toHaveBeenCalled()
  })

  it('una tecla sobre un control de adentro no dispara la fila', () => {
    const onOpen = vi.fn()
    render(<Fila onOpen={onOpen} onAccion={vi.fn()} />)

    // El botón de adentro maneja Enter por su cuenta; el evento burbujea hasta la fila y la fila
    // no tiene que reaccionar, o cada acción abriría además el detalle.
    fireEvent.keyDown(screen.getByText('Asignar'), { key: 'Enter' })

    expect(onOpen).not.toHaveBeenCalled()
  })
})
