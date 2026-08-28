import { render, screen } from '@testing-library/react'
import FloatingField from '@components/common/FloatingField'
import Field from '@components/common/Field'

// t153 de la auditoría de QA del operario.
//
// El hallazgo original decía tres cosas. Verificado hoy, una ya no aplica y dos siguen en pie:
//
//   ✔ "la etiqueta flotante es un span hermano, no un label for" — YA NO: FloatingField usa
//     <label htmlFor> contra el id del control desde el refactor de forwardRef. El accessible
//     name existe. Este test lo fija para que no se pierda de nuevo.
//   ✖ "los campos inválidos se marcan sólo con borde rojo" — cierto: sin aria-invalid, un
//     lector de pantalla y cualquier herramienta de validación ven un campo perfectamente
//     válido pintado de rojo. El color no es información para todo el mundo.
//   ✖ "sin aria-describedby" — cierto: el mensaje de error estaba en el DOM pero no colgaba
//     del campo, así que se leía suelto o no se leía.
//
// Y `common/Field`, que envuelve los controles que NO son FloatingField (el selector de
// posición, por ejemplo), tenía un <label> sin htmlFor: una etiqueta que no etiqueta nada.

describe('t153 · el campo tiene nombre accesible', () => {
  it('el label está asociado al control, no es un span suelto', () => {
    render(<FloatingField label="Kilometraje" value="" onChange={() => {}} />)

    expect(screen.getByLabelText(/Kilometraje/)).toBeInTheDocument()
  })

  it('el asterisco de obligatorio no se lee como parte del nombre', () => {
    render(<FloatingField label="Vehículo" required value="" onChange={() => {}} />)

    const control = screen.getByLabelText(/Vehículo/)
    expect(control).toBeInTheDocument()
    expect(control.getAttribute('aria-label')).toBeNull() // el nombre sale del <label>, no de un atributo
  })
})

describe('t153 · el error se anuncia, no solo se pinta', () => {
  it('un campo en error queda marcado como inválido para el lector de pantalla', () => {
    render(<FloatingField label="Kilometraje" error value="" onChange={() => {}} />)

    expect(screen.getByLabelText(/Kilometraje/)).toHaveAttribute('aria-invalid', 'true')
  })

  it('un campo válido NO queda marcado como inválido', () => {
    render(<FloatingField label="Kilometraje" value="" onChange={() => {}} />)

    expect(screen.getByLabelText(/Kilometraje/)).not.toHaveAttribute('aria-invalid', 'true')
  })

  it('el mensaje de error cuelga del campo por aria-describedby', () => {
    render(<FloatingField label="Patente" error="Formato inválido" value="" onChange={() => {}} />)

    const control = screen.getByLabelText(/Patente/)
    const id = control.getAttribute('aria-describedby')
    expect(id).toBeTruthy()
    expect(document.getElementById(id)).toHaveTextContent('Formato inválido')
  })

  it('sin mensaje no hay describedby colgando de la nada', () => {
    render(<FloatingField label="Patente" error value="" onChange={() => {}} />)

    expect(screen.getByLabelText(/Patente/)).not.toHaveAttribute('aria-describedby')
  })

  it('el mensaje de error se anuncia al aparecer', () => {
    render(<FloatingField label="Patente" error="Formato inválido" value="" onChange={() => {}} />)

    expect(screen.getByText('Formato inválido')).toHaveAttribute('role', 'alert')
  })
})

describe('t153 · common/Field también etiqueta de verdad', () => {
  it('asocia su label con el control que envuelve', () => {
    render(
      <Field label="Posición en el vehículo">
        {(id) => <input id={id} />}
      </Field>
    )

    expect(screen.getByLabelText('Posición en el vehículo')).toBeInTheDocument()
  })

  it('sigue aceptando children normales, sin romper los call sites viejos', () => {
    render(<Field label="Posición"><span>contenido</span></Field>)

    expect(screen.getByText('contenido')).toBeInTheDocument()
  })
})
