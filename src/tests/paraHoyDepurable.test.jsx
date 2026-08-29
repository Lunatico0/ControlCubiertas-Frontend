import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom'
import ApiContext from '@context/apiContext'
import Inicio from '@components/Operativa/Inicio'

// t145 y t146 de la auditoría de QA del operario.
//
// t145 — "PARA HOY" lista todo vehículo sin cubiertas montadas, y no había forma de descartar,
// posponer ni marcar un ítem como no aplicable. Apenas se crearon dos vehículos de prueba, los
// dos quedaron ahí como "Sin cubiertas montadas · Montar". Un acoplado de temporada o un móvil
// parado queda clavado en la lista de tareas del día TODOS los días: la lista pierde
// credibilidad, el operario deja de mirarla, y con ella deja de ver lo que sí importa.
//
// El flag vive en el VEHÍCULO (data plane), no en el dispositivo: un acoplado parado lo está
// para todos los que abren la app, no solo para quien lo sacó de su pantalla.
//
// t146 — "Reconfigurar ejes" y "Editar datos" estaban después de la lista completa de
// posiciones: en un semirremolque de 12 había que scrollear las 12 filas para encontrarlos, sin
// una sola pista desde arriba de que existían.

vi.mock('@context/AuthContext', () => ({ useAuth: () => ({ user: { name: 'Operario' } }) }))
vi.mock('@components/Operativa/status', async (orig) => {
  const real = await orig()
  return { ...real, useStatusCatalog: () => [], metaOf: () => ({ role: 'stock', level: 0 }) }
})

const renderInicio = (vehicles) => {
  render(
    <ApiContext.Provider value={{ ui: { loading: false }, data: { tires: [], vehicles, tireCodePrefix: '' } }}>
      <MemoryRouter initialEntries={['/inicio']}>
        <Routes>
          <Route path="/" element={<Outlet context={{ onNavigate: vi.fn() }} />}>
            <Route path="inicio" element={<Inicio />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </ApiContext.Provider>
  )
}

describe('t145 · un vehículo parado sale de los pendientes del día', () => {
  it('un móvil sin cubiertas Y en servicio sigue siendo un pendiente', () => {
    renderInicio([{ _id: 'v1', mobile: 'Móvil 01' }])

    expect(screen.getByText('Móvil 01')).toBeInTheDocument()
    expect(screen.getByText(/1 pendiente para hoy/i)).toBeInTheDocument()
  })

  it('marcado fuera de servicio desaparece de PARA HOY', () => {
    renderInicio([{ _id: 'v1', mobile: 'Móvil 01', outOfService: true }])

    expect(screen.queryByText('Móvil 01')).not.toBeInTheDocument()
    expect(screen.getAllByText(/Todo en orden/i).length).toBeGreaterThan(0)
  })

  it('el contador del saludo cuenta lo MISMO que la lista', () => {
    renderInicio([
      { _id: 'v1', mobile: 'Móvil 01' },
      { _id: 'v2', mobile: 'Acoplado 07', outOfService: true },
      { _id: 'v3', mobile: 'Móvil 03' },
    ])

    expect(screen.getByText(/2 pendientes para hoy/i)).toBeInTheDocument()
    expect(screen.queryByText('Acoplado 07')).not.toBeInTheDocument()
  })
})

describe('t145/t146 · el vehículo se puede parar y sus acciones están a mano', () => {
  const raiz = resolve(__dirname, '../..')
  const drawer = readFileSync(resolve(raiz, 'src/components/Operativa/VehicleDrawer.jsx'), 'utf8')

  it('el drawer ofrece parar el vehículo y devolverlo al servicio', () => {
    expect(drawer).toMatch(/Marcar fuera de servicio/)
    expect(drawer).toMatch(/Volver al servicio/)
  })

  it('aclara que parar no es dar de baja: las cubiertas siguen montadas', () => {
    expect(drawer).toMatch(/cubiertas montadas siguen montadas/i)
  })

  it('el cambio se propaga a la lista, no se queda en el drawer', () => {
    expect(drawer).toMatch(/replaceVehicleInList/)
  })

  it('t146 · las acciones están en la CABECERA, no solo al fondo del scroll', () => {
    const cabecera = drawer.slice(0, drawer.indexOf('{/* Acciones'))
    expect(cabecera).toMatch(/aria-label="Reconfigurar ejes"/)
    expect(cabecera).toMatch(/aria-label="Editar datos del vehículo"/)
  })
})
