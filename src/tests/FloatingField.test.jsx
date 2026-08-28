import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import FloatingField from '@components/common/FloatingField'

// FloatingField se consume de dos maneras y las dos tienen que funcionar:
//   - controlado (value/onChange), que es como lo usan los drawers de la operativa
//   - por REF, que es lo que hace react-hook-form con {...register("x")}
//
// El segundo caso estuvo roto en producción: el componente no estaba envuelto en forwardRef,
// y como `ref` no viaja dentro de props en React 18, RHF nunca llegaba al input. Resultado:
// el campo quedaba mudo en los dos sentidos (no leía lo tipeado ni se poblaba con reset()).
// Se llevó puestos ChangePassword, UserForm y CompanySettings sin un solo error visible.
// Estos tests son la red para que no vuelva a pasar.

// Formulario mínimo de prueba: registra un campo y expone lo que recibió el submit.
const FormularioDePrueba = ({ onSubmit, defaultValues = {}, campoProps = {} }) => {
  const { register, handleSubmit } = useForm({ defaultValues })
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FloatingField label="Nombre" {...campoProps} {...register('nombre')} />
      <button type="submit">Enviar</button>
    </form>
  )
}

describe('FloatingField con react-hook-form (register por ref)', () => {
  it('entrega al submit lo que el usuario tipeó', async () => {
    const onSubmit = vi.fn()
    render(<FormularioDePrueba onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText(/nombre/i), 'Juan Pérez')
    await userEvent.click(screen.getByRole('button', { name: /enviar/i }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ nombre: 'Juan Pérez' })
  })

  it('muestra en pantalla el valor que viene de defaultValues', () => {
    render(<FormularioDePrueba onSubmit={vi.fn()} defaultValues={{ nombre: 'QA Alpha' }} />)

    // Sin el ref, RHF tiene el valor en su estado interno pero el input se ve VACÍO:
    // es exactamente lo que pasaba en la pantalla de Empresa.
    expect(screen.getByLabelText(/nombre/i)).toHaveValue('QA Alpha')
  })

  it('el ref llega también al textarea', async () => {
    const onSubmit = vi.fn()
    render(<FormularioDePrueba onSubmit={onSubmit} campoProps={{ as: 'textarea' }} />)

    await userEvent.type(screen.getByLabelText(/nombre/i), 'pie de comprobante')
    await userEvent.click(screen.getByRole('button', { name: /enviar/i }))

    expect(onSubmit.mock.calls[0][0]).toMatchObject({ nombre: 'pie de comprobante' })
  })

  it('el ref llega también al select', async () => {
    const onSubmit = vi.fn()
    render(
      <FormularioDePrueba
        onSubmit={onSubmit}
        campoProps={{ as: 'select', children: [<option key="" value="" />, <option key="op" value="operator">Operario</option>] }}
      />
    )

    await userEvent.selectOptions(screen.getByLabelText(/nombre/i), 'operator')
    await userEvent.click(screen.getByRole('button', { name: /enviar/i }))

    expect(onSubmit.mock.calls[0][0]).toMatchObject({ nombre: 'operator' })
  })
})

describe('FloatingField controlado (value/onChange)', () => {
  it('sigue funcionando sin ref, que es como lo usan los drawers', async () => {
    const onChange = vi.fn()
    render(<FloatingField label="Marca" value="" onChange={onChange} />)

    await userEvent.type(screen.getByLabelText(/marca/i), 'M')

    expect(onChange).toHaveBeenCalled()
  })

  it('marca el error y lo muestra debajo del campo', () => {
    render(<FloatingField label="Email" error="Ingresá el email" onChange={() => {}} value="" />)

    expect(screen.getByText('Ingresá el email')).toBeInTheDocument()
  })
})
