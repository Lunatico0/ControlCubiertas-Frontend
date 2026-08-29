import { render, screen, act, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import DialogHost from '@components/dialog/DialogHost'
import { toast, dialog } from '@utils/dialog'
import { showConfirm, showDanger } from '@utils/toast'

// t136 y t103 de la auditoría.
//
// t136 — TODOS los toasts, éxito y error por igual, se autodestruían a los 2800 ms, sin botón
// de cerrar y sin forma de volver a leerlos. Medido: el toast sale abajo al centro (x 380-1070)
// mientras el formulario vive en el drawer de la derecha (x >= 990). El operario aprieta, mira
// la cubierta que tiene en la mano, vuelve a la pantalla y el error ya no está: le queda un
// "no pasó nada" sin ninguna pista de por qué. Un error es la única información que el sistema
// tiene para dar en ese momento; 2,8 segundos no alcanza para leerlo si no estabas mirando.
//
// t103 — el botón "Sí, desactivar" computaba background var(--ink-lime): el MISMO lima que
// "Crear usuario" y "Guardar cambios". ART-DIRECTION asigna el rojo a peligro/desactivar, y el
// botón que ABRE el diálogo ya usa --ink-red. Que la acción destructiva se pinte igual que la
// constructiva borra la señal justo en el momento en que más se necesita.

vi.mock('@context/ThemeContext', () => ({ useTheme: () => ({ isDarkMode: true }) }))

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
afterEach(() => vi.useRealTimers())

const avanzar = (ms) => act(() => { vi.advanceTimersByTime(ms) })

describe('t136 · el toast de error no se evapora', () => {
  it('un error sigue en pantalla mucho después de los 2,8s del toast de éxito', () => {
    render(<DialogHost />)

    act(() => { toast('No se pudo asignar la cubierta', { kind: 'danger' }) })
    expect(screen.getByText(/No se pudo asignar/)).toBeInTheDocument()

    avanzar(30000)

    expect(screen.getByText(/No se pudo asignar/)).toBeInTheDocument()
  })

  it('un aviso de advertencia tampoco se autodescarta', () => {
    render(<DialogHost />)

    act(() => { toast('Revisá el kilometraje', { kind: 'warn' }) })
    avanzar(30000)

    expect(screen.getByText(/Revisá el kilometraje/)).toBeInTheDocument()
  })

  it('un éxito sí se va solo: no hay nada que leer dos veces', () => {
    render(<DialogHost />)

    act(() => { toast('Cubierta asignada', { kind: 'ok' }) })
    expect(screen.getByText(/Cubierta asignada/)).toBeInTheDocument()

    avanzar(3000)

    expect(screen.queryByText(/Cubierta asignada/)).not.toBeInTheDocument()
  })

  it('todo toast se puede cerrar a mano', async () => {
    render(<DialogHost />)

    act(() => { toast('No se pudo asignar la cubierta', { kind: 'danger' }) })
    fireEvent.click(screen.getByRole('button', { name: /cerrar aviso/i }))

    await waitFor(() => expect(screen.queryByText(/No se pudo asignar/)).not.toBeInTheDocument())
  })

  it('un error se anuncia como alerta; un éxito, como estado', () => {
    const { unmount } = render(<DialogHost />)
    act(() => { toast('Falló', { kind: 'danger' }) })
    expect(screen.getByRole('alert')).toHaveTextContent(/Falló/)
    unmount()

    render(<DialogHost />)
    act(() => { toast('Listo', { kind: 'ok' }) })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/Listo/)
  })
})

describe('t103 · la confirmación destructiva se pinta de rojo', () => {
  it('el diálogo danger NO usa el lima de la acción constructiva', async () => {
    render(<DialogHost />)

    act(() => { dialog.danger({ title: '¿Desactivar usuario?', confirmLabel: 'Sí, desactivar' }) })

    const btn = await screen.findByRole('button', { name: /Sí, desactivar/i })
    expect(btn.getAttribute('style')).not.toMatch(/--ink-lime/)
    expect(btn.getAttribute('style')).toMatch(/rgb\(224, 68, 52\)|E04434|--ink-red|--st-red/) // jsdom normaliza el hex a rgb()
  })

  it('showDanger existe como puerta al diálogo destructivo, con la misma firma que showConfirm', async () => {
    render(<DialogHost />)

    let resultado
    act(() => { resultado = showDanger({ title: '¿Desactivar usuario?', confirmButtonText: 'Sí, desactivar' }) })

    const btn = await screen.findByRole('button', { name: /Sí, desactivar/i })
    fireEvent.click(btn)
    await expect(resultado).resolves.toBe(true)
  })

  it('showConfirm sigue siendo el camino de las acciones NO destructivas', async () => {
    render(<DialogHost />)

    act(() => { showConfirm({ title: '¿Activar usuario?', confirmButtonText: 'Sí, activar' }) })

    const btn = await screen.findByRole('button', { name: /Sí, activar/i })
    expect(btn.className).toContain('dlg-btn-primary')
  })
})
