import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import Drawer from '@components/UI/Drawer'

// MEDIDO en la auditoría de QA del operario (t133): al abrir "Alta de cubierta" el foco quedaba
// en el botón que lo abrió y hacían falta 109 tabulaciones hasta el primer input, porque las
// tarjetas de atrás seguían siendo focusables. Sin focus trap y sin autofocus, cargar una cubierta
// con guantes obligaba a levantar el mouse en cada campo. Y con el foco ya en un campo, Enter no
// hacía nada: los formularios de la operativa no son <form> ni tenían onKeyDown.
//
// Las dos cosas van en el <Drawer> común, que es el shell de los cinco drawers de la operativa.

const Contenido = () => (
  <>
    <button>Cerrar</button>
    <input placeholder="Código" />
    <input placeholder="Marca" />
    <button>Guardar</button>
  </>
)

describe('focus trap del Drawer', () => {
  it('al abrir, el foco salta al primer CAMPO, no al primer botón', () => {
    render(<Drawer onClose={vi.fn()}><Contenido /></Drawer>)

    expect(document.activeElement).toBe(screen.getByPlaceholderText('Código'))
  })

  it('Tab desde el último focusable vuelve al primero: el foco no se escapa al fondo', () => {
    render(<Drawer onClose={vi.fn()}><Contenido /></Drawer>)

    const guardar = screen.getByText('Guardar')
    guardar.focus()
    fireEvent.keyDown(guardar, { key: 'Tab' })

    expect(document.activeElement).toBe(screen.getByText('Cerrar'))
  })

  it('Shift+Tab desde el primero salta al último', () => {
    render(<Drawer onClose={vi.fn()}><Contenido /></Drawer>)

    const cerrar = screen.getByText('Cerrar')
    cerrar.focus()
    fireEvent.keyDown(cerrar, { key: 'Tab', shiftKey: true })

    expect(document.activeElement).toBe(screen.getByText('Guardar'))
  })

  it('al cerrarse devuelve el foco al elemento que lo abrió', () => {
    const disparador = document.createElement('button')
    document.body.appendChild(disparador)
    disparador.focus()

    const { unmount } = render(<Drawer onClose={vi.fn()}><Contenido /></Drawer>)
    expect(document.activeElement).not.toBe(disparador)

    unmount()
    expect(document.activeElement).toBe(disparador)

    disparador.remove()
  })

  it('un drawer sin campos enfoca el panel, no deja el foco atrás', () => {
    const disparador = document.createElement('button')
    document.body.appendChild(disparador)
    disparador.focus()

    render(<Drawer onClose={vi.fn()}><p>Solo texto</p></Drawer>)

    expect(document.activeElement).not.toBe(disparador)
    expect(document.activeElement.tagName).toBe('ASIDE')

    disparador.remove()
  })
})

describe('Enter envía desde el Drawer', () => {
  it('Enter en un input dispara onSubmit', () => {
    const onSubmit = vi.fn()
    render(<Drawer onClose={vi.fn()} onSubmit={onSubmit}><Contenido /></Drawer>)

    fireEvent.keyDown(screen.getByPlaceholderText('Marca'), { key: 'Enter' })

    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('Enter sobre un botón NO dispara onSubmit: el botón ya se activa solo', () => {
    const onSubmit = vi.fn()
    render(<Drawer onClose={vi.fn()} onSubmit={onSubmit}><Contenido /></Drawer>)

    fireEvent.keyDown(screen.getByText('Cerrar'), { key: 'Enter' })

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('Enter en un textarea escribe un salto de línea, no envía', () => {
    const onSubmit = vi.fn()
    render(
      <Drawer onClose={vi.fn()} onSubmit={onSubmit}>
        <textarea placeholder="Notas" />
      </Drawer>
    )

    fireEvent.keyDown(screen.getByPlaceholderText('Notas'), { key: 'Enter' })

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('sin onSubmit, Enter no rompe nada', () => {
    render(<Drawer onClose={vi.fn()}><Contenido /></Drawer>)

    expect(() => fireEvent.keyDown(screen.getByPlaceholderText('Marca'), { key: 'Enter' })).not.toThrow()
  })
})
