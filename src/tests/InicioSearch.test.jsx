import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import ApiContext from '@context/apiContext'
import Inicio from '@components/Operativa/Inicio'

// El buscador del Inicio es el elemento más prominente de la pantalla y el primero que toca
// el operario. Tipeaba y NO pasaba nada: recién con Enter saltaba a Cubiertas ya filtrado.
// El de la pantalla Cubiertas, en cambio, filtra en vivo. Tipear y no ver nada se lee como
// "no anda", no como "falta apretar Enter" (t134 de la auditoría de QA del operario).
// Los datos ya están en memoria (ApiContext), así que filtrar en vivo no cuesta una request.

vi.mock('@context/AuthContext', () => ({ useAuth: () => ({ user: { name: 'Operario' } }) }))

const TIRES = [
  { _id: 't1', code: 1002, brand: 'Michelin', serialNumber: 'AC-1002-X', status: 'Nueva' },
  { _id: 't2', code: 1003, brand: 'Bridgestone', serialNumber: 'BR-9', status: 'Nueva' },
  { _id: 't3', code: 2050, brand: 'Pirelli', serialNumber: 'PZ-7', status: 'Nueva' },
]

const renderInicio = (onNavigate = vi.fn()) => {
  render(
    <ApiContext.Provider value={{ data: { tires: TIRES, vehicles: [], tireCodePrefix: '' } }}>
      <Inicio onNavigate={onNavigate} />
    </ApiContext.Provider>
  )
  return { input: screen.getByPlaceholderText(/Buscar por código/i), onNavigate }
}

describe('buscador del Inicio', () => {
  it('muestra resultados EN VIVO mientras se tipea, sin apretar Enter', () => {
    const { input } = renderInicio()

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument() // vacío: nada colgando

    fireEvent.change(input, { target: { value: 'miche' } })

    const lista = screen.getByRole('listbox')
    expect(lista).toBeInTheDocument()
    expect(screen.getByText(/Michelin/)).toBeInTheDocument()
    expect(screen.queryByText(/Bridgestone/)).not.toBeInTheDocument()
  })

  it('busca por código y por número de serie, no sólo por marca', () => {
    const { input } = renderInicio()

    fireEvent.change(input, { target: { value: '2050' } })
    expect(screen.getByText(/Pirelli/)).toBeInTheDocument()

    fireEvent.change(input, { target: { value: 'ac-1002' } })
    expect(screen.getByText(/Michelin/)).toBeInTheDocument()
  })

  it('dice que no hay resultados en vez de no mostrar nada', () => {
    const { input } = renderInicio()

    fireEvent.change(input, { target: { value: 'zzzzz' } })

    expect(screen.getByRole('listbox')).toHaveTextContent(/Sin resultados/i)
  })

  it('un clic en un resultado navega al inventario filtrado por esa cubierta', () => {
    const { input, onNavigate } = renderInicio()

    fireEvent.change(input, { target: { value: 'miche' } })
    fireEvent.click(screen.getByText(/Michelin/))

    expect(onNavigate).toHaveBeenCalledWith('cubiertas', { query: '1002' })
  })

  it('Enter sigue llevando al inventario con lo tipeado', () => {
    const { input, onNavigate } = renderInicio()

    fireEvent.change(input, { target: { value: 'miche' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onNavigate).toHaveBeenCalledWith('cubiertas', { query: 'miche' })
  })

  it('Escape cierra los resultados sin borrar lo tipeado', () => {
    const { input } = renderInicio()

    fireEvent.change(input, { target: { value: 'miche' } })
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(input).toHaveValue('miche')
  })
})
