import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom'
import ApiContext from '@context/apiContext'
import Inicio from '@components/Operativa/Inicio'
import Skeleton, { SkeletonCards, SkeletonRows } from '@components/common/Skeleton'

// t142 + t143 de la auditoría de QA del operario.
//
// t142 es el grave: Inicio deriva TODO de data.tires sin mirar el flag `loading` que el
// ApiContext ya expone. Con las listas vacías durante la carga, pending da 0 y la pantalla
// AFIRMA "Todo en orden" y "No hay cubiertas ni posiciones pendientes de acción". En
// localhost la ventana es de milisegundos; con Vercel serverless y cold start de Atlas es
// perfectamente visible. Un operario puede abrir la app, leer que está todo bien y cerrarla
// teniendo tres cubiertas esperando recapado. No es una pantalla vacía: es una MENTIRA.
//
// t143 es el de forma: mientras carga, Cubiertas y Vehículos dejan un renglón gris chiquito
// arriba a la izquierda sobre una pantalla en blanco. A distancia de brazo, en un taller con
// luz de más, eso se lee como "no cargó". Van skeletons con la silueta del contenido real.

vi.mock('@context/AuthContext', () => ({ useAuth: () => ({ user: { name: 'Operario' } }) }))

const TIRE_RECAP = { _id: 't1', code: 1002, brand: 'Michelin', status: 'A recapar' }

// El catálogo de estados sale del tenant; el rol `recap` es lo que hace pendiente a la cubierta.
vi.mock('@components/Operativa/status', async (orig) => {
  const real = await orig()
  return { ...real, useStatusCatalog: () => [], metaOf: (s) => ({ role: s === 'A recapar' ? 'recap' : 'stock', level: 0 }) }
})

const renderInicio = (value) => {
  render(
    <ApiContext.Provider value={value}>
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

describe('t142 · el Inicio no afirma nada mientras está cargando', () => {
  it('NO dice "Todo en orden" con las listas todavía vacías por la carga', () => {
    renderInicio({ ui: { loading: true }, data: { tires: [], vehicles: [], tireCodePrefix: '' } })

    expect(screen.queryAllByText(/Todo en orden/i)).toHaveLength(0)
    expect(screen.queryByText(/No hay cubiertas ni posiciones pendientes/i)).not.toBeInTheDocument()
  })

  it('tampoco afirma "0 pendientes" en el saludo: dice que está cargando', () => {
    renderInicio({ ui: { loading: true }, data: { tires: [], vehicles: [], tireCodePrefix: '' } })

    expect(screen.queryByText(/\d+ pendientes? para hoy/i)).not.toBeInTheDocument()
    expect(screen.getByText(/Cargando tu día/i)).toBeInTheDocument()
  })

  it('expone la carga de forma accesible, no sólo visual', () => {
    renderInicio({ ui: { loading: true }, data: { tires: [], vehicles: [], tireCodePrefix: '' } })

    expect(screen.getAllByRole('status').length).toBeGreaterThan(0)
  })

  it('los contadores no muestran cero mientras carga', () => {
    renderInicio({ ui: { loading: true }, data: { tires: [], vehicles: [], tireCodePrefix: '' } })

    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('terminada la carga y sin pendientes reales, SÍ dice "Todo en orden"', () => {
    renderInicio({ ui: { loading: false }, data: { tires: [], vehicles: [], tireCodePrefix: '' } })

    expect(screen.getAllByText(/Todo en orden/i).length).toBeGreaterThan(0)
  })

  it('terminada la carga y con una cubierta a recapar, la cuenta como pendiente', () => {
    renderInicio({ ui: { loading: false }, data: { tires: [TIRE_RECAP], vehicles: [], tireCodePrefix: '' } })

    expect(screen.getByText(/1 pendiente para hoy/i)).toBeInTheDocument()
    expect(screen.queryAllByText(/Todo en orden/i)).toHaveLength(0)
  })
})

describe('t143 · skeletons con la silueta del contenido', () => {
  it('Skeleton es un bloque decorativo: no lo anuncia el lector de pantalla', () => {
    const { container } = render(<Skeleton className="h-4 w-20" />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('SkeletonCards rinde la cantidad pedida y se anuncia UNA sola vez', () => {
    render(<SkeletonCards count={4} label="Cargando cubiertas…" />)

    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-busy', 'true')
    expect(status).toHaveTextContent(/Cargando cubiertas/i)
    expect(status.querySelectorAll('[data-skeleton-card]')).toHaveLength(4)
  })

  it('SkeletonRows rinde filas para la vista de tabla', () => {
    render(<SkeletonRows count={5} cols={5} label="Cargando vehículos…" />)

    const status = screen.getByRole('status')
    expect(status.querySelectorAll('[data-skeleton-row]')).toHaveLength(5)
  })
})

describe('t143 · las pantallas de la operativa usan el skeleton, no un renglón gris', () => {
  const raiz = resolve(__dirname, '../..')
  const leer = (p) => readFileSync(resolve(raiz, p), 'utf8')

  it.each([
    ['src/components/Operativa/Cubiertas.jsx', 'cubiertas'],
    ['src/components/Operativa/Vehiculos.jsx', 'vehículos'],
  ])('%s ya no rinde el texto pelado de carga', (archivo) => {
    const src = leer(archivo)

    // El patrón viejo: <p ...>Cargando X…</p> como único estado de carga.
    expect(src).not.toMatch(/<p[^>]*>\s*Cargando/)
    expect(src).toMatch(/Skeleton(Cards|Rows)/)
  })
})
