import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import ModalComun from '@components/common/Modal'
import ModalUI from '@components/UI/Modal'

// t65: los tres shells (UI/Modal, common/Modal, UI/Drawer) ponían role="dialog" aria-modal="true"
// en el BACKDROP, que además es el que tiene el onClick de cerrar, en vez de en la card. Con
// aria-modal el lector de pantalla oculta el resto de la página, pero el foco seguía en el fondo
// inaccesible: ninguno hacía focus trap, foco inicial ni devolución del foco al disparador, y
// faltaba aria-labelledby.
//
// El Drawer ya se resolvió con useFocusTrap al cerrar t133. Acá van los dos modales.

vi.mock('@context/ThemeContext', () => ({ useTheme: () => ({ isDarkMode: true }) }))

const Contenido = () => (
  <>
    <button>Cancelar</button>
    <input placeholder="Nombre" />
    <button>Guardar</button>
  </>
)

describe.each([
  ['common/Modal', ModalComun],
  ['UI/Modal', ModalUI],
])('%s accesible', (_nombre, Modal) => {
  it('el role va en la card, no en el backdrop que cierra al hacer clic', () => {
    const onClose = vi.fn()
    const { container } = render(<Modal title="Nuevo usuario" onClose={onClose}><Contenido /></Modal>)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).not.toBe(container.firstChild) // el backdrop es el padre, no el diálogo

    fireEvent.click(dialog)
    expect(onClose).not.toHaveBeenCalled() // el clic dentro de la card no cierra
  })

  it('el diálogo se nombra con su propio título', () => {
    render(<Modal title="Nuevo usuario" onClose={vi.fn()}><Contenido /></Modal>)

    expect(screen.getByRole('dialog', { name: 'Nuevo usuario' })).toBeInTheDocument()
  })

  it('al abrir, el foco entra en el modal y cae en el primer campo', () => {
    render(<Modal title="Nuevo usuario" onClose={vi.fn()}><Contenido /></Modal>)

    expect(document.activeElement).toBe(screen.getByPlaceholderText('Nombre'))
  })

  it('Tab no se escapa al fondo', () => {
    render(<Modal title="Nuevo usuario" onClose={vi.fn()}><Contenido /></Modal>)

    const guardar = screen.getByText('Guardar')
    guardar.focus()
    fireEvent.keyDown(guardar, { key: 'Tab' })

    expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true)
  })

  it('al cerrarse devuelve el foco al elemento que lo abrió', () => {
    const disparador = document.createElement('button')
    document.body.appendChild(disparador)
    disparador.focus()

    const { unmount } = render(<Modal title="Nuevo usuario" onClose={vi.fn()}><Contenido /></Modal>)
    unmount()

    expect(document.activeElement).toBe(disparador)
    disparador.remove()
  })
})
