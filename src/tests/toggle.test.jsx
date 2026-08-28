import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Toggle from '@components/common/Toggle'

// El interruptor on/off vivía como componente local dentro de EditorComprobante: sin type,
// sin rol y sin teclado. Sin `type` un <button> dentro de un <form> es submit por defecto, así
// que reusarlo en la pantalla de Empresa (que sí es un form) habría guardado el formulario cada
// vez que alguien tocaba el interruptor.

describe('Toggle común', () => {
  it('se anuncia como interruptor y expone su estado', () => {
    render(<Toggle on label="Impresión automática" onChange={() => {}} />)
    const sw = screen.getByRole('switch', { name: 'Impresión automática' })
    expect(sw).toHaveAttribute('aria-checked', 'true')
  })

  it('es type="button": dentro de un form no dispara el submit', async () => {
    const submit = vi.fn((e) => e.preventDefault())
    const onChange = vi.fn()
    render(
      <form onSubmit={submit}>
        <Toggle on={false} label="Impresión automática" onChange={onChange} />
      </form>,
    )

    await userEvent.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(true)
    expect(submit).not.toHaveBeenCalled()
  })

  it('se opera con el teclado', async () => {
    const onChange = vi.fn()
    render(<Toggle on={false} label="Impresión automática" onChange={onChange} />)

    await userEvent.tab()
    expect(screen.getByRole('switch')).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('deshabilitado no cambia de estado', async () => {
    const onChange = vi.fn()
    render(<Toggle on={false} label="Impresión automática" disabled onChange={onChange} />)
    await userEvent.click(screen.getByRole('switch'))
    expect(onChange).not.toHaveBeenCalled()
  })
})
