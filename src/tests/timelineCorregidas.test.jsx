import { render, screen, within, waitFor } from '@testing-library/react'
import ApiContext from '@context/apiContext'
import TireDrawer from '@components/Operativa/TireDrawer'
import { setStatusCatalog, buildStatusMeta } from '@components/Operativa/status'
import { fetchTireById } from '@api/tires'

// S6 de la auditoría: contrato nuevo de History.
//
// Antes, al corregir o deshacer un movimiento, el backend reetiquetaba la entrada ORIGINAL como
// "Corrección-*" y el timeline decidía todo por ese prefijo. Ahora la original CONSERVA su tipo
// ("Asignación", "Desasignación", ...) y queda marcada con flag + correctedAt; qué entrada la
// corrige se sabe por el `corrects` de la entrada nueva. Sin adaptar el drawer, una asignación
// corregida se veía como válida ("Montada en X", en azul, con Corregir y Deshacer) y se tomaba
// como el montaje vigente. La entrada que corrige TAMBIÉN lleva flag: true, así que flag solo no
// distingue la original de la corrección. El criterio es el del backend (recalculateTireState):
// una entrada está corregida si OTRA entrada la `corrects`.

vi.mock('@api/tires', () => ({ fetchTireById: vi.fn() }))
vi.mock('@api/vehicles', () => ({ fetchVehiclePositions: vi.fn(() => Promise.resolve({ positions: [] })) }))
vi.mock('@hooks/useTireAction', () => ({ useTireAction: () => ({ execute: vi.fn(), isSubmitting: false }) }))
vi.mock('@hooks/useReprint', () => ({ useReprint: () => ({ execute: vi.fn(), isPrinting: false }) }))
vi.mock('@utils/toast', () => ({ showToast: vi.fn() }))

const ESTADOS = [
  { name: 'Nueva', role: 'initial' },
  { name: '1er Recapado', role: 'stock' },
  { name: '2do Recapado', role: 'stock' },
  { name: 'A recapar', role: 'recap' },
  { name: 'Descartada', role: 'discard' },
]

const M101 = { _id: 'v1', mobile: 'M-101' }
const M202 = { _id: 'v2', mobile: 'M-202' }
const F = (mes) => new Date(Date.UTC(2026, mes - 1, 10)).toISOString()
const entrada = (id, type, mes, extra = {}) => ({ _id: id, type, date: F(mes), status: 'Nueva', flag: false, receiptNumber: `0001-0000000${id.slice(-1)}`, ...extra })

const montar = async (tire, props = {}) => {
  fetchTireById.mockResolvedValue(tire)
  const value = {
    tires: {},
    orders: {},
    data: {
      vehicles: [M101, M202],
      statuses: ESTADOS,
      stockScale: ['Nueva', '1er Recapado', '2do Recapado'],
      discardStatus: 'Descartada',
      recapStatus: 'A recapar',
    },
  }
  render(
    <ApiContext.Provider value={value}>
      <TireDrawer tireId={tire._id} onClose={() => {}} {...props} />
    </ApiContext.Provider>,
  )
  await waitFor(() => expect(screen.queryByText('Cargando…')).toBeNull())
}

// Bloque de una entrada del timeline a partir de su texto descriptivo.
const bloqueDe = (texto) => screen.getByText(texto).parentElement
const tituloDe = (bloque) => bloque.querySelector('span')

beforeEach(() => setStatusCatalog(buildStatusMeta(ESTADOS)))

// Asignación a M-101 con el odómetro mal cargado, corregida después a M-202 con 120.000.
const asignacionCorregida = (corrects) => ({
  _id: 't1',
  code: 7,
  serialNumber: 'SN-1',
  status: 'Nueva',
  vehicle: M202,
  createdAt: F(1),
  history: [
    entrada('h1', 'Alta', 1),
    entrada('h2', 'Asignación', 2, { vehicle: M101, kmAlta: 100000, flag: true, correctedAt: F(3), reason: 'Corregido en la orden N°9' }),
    entrada('h3', 'Corrección-Asignación', 3, { vehicle: M202, kmAlta: 120000, flag: true, corrects }),
  ],
})

describe('S6 · asignación corregida por otra entrada', () => {
  it.each([
    ['populado (getById hace populate)', { _id: 'h2', type: 'Asignación' }],
    ['id crudo', 'h2'],
  ])('se ve corregida con corrects %s', async (_, corrects) => {
    await montar(asignacionCorregida(corrects))

    const bloque = bloqueDe('Corregido: Montada en M-101')
    expect(tituloDe(bloque).style.color).toContain('--ink-purple')
    expect(within(bloque).queryByText('Corregir')).toBeNull()
    expect(within(bloque).queryByText('Deshacer')).toBeNull()
    // El comprobante existió: se puede reimprimir igual que hoy.
    expect(within(bloque).getByText('Reimprimir')).toBeInTheDocument()
    // Ninguna otra entrada sigue diciendo que está montada en M-101.
    expect(screen.queryByText('Montada en M-101')).toBeNull()
  })

  it('no es el montaje vigente: la cabecera de Desasignar usa el odómetro de la corrección', async () => {
    await montar(asignacionCorregida({ _id: 'h2' }), { initialAction: 'unassign' })

    const aviso = screen.getByText(/Se montó con el odómetro en/)
    expect(aviso.textContent).toMatch(/120\.000/)
    expect(aviso.textContent).not.toMatch(/100\.000/)
  })

  it('la corrección en sí se ve como hoy', async () => {
    await montar(asignacionCorregida({ _id: 'h2' }))

    const bloque = bloqueDe('Corrección de un movimiento anterior')
    expect(tituloDe(bloque).textContent).toBe('Corrección-Asignación')
    expect(tituloDe(bloque).style.color).toContain('--ink-purple')
    expect(within(bloque).queryByText('Corregir')).toBeNull()
    expect(within(bloque).queryByText('Deshacer')).toBeNull()
    expect(within(bloque).getByText('Reimprimir')).toBeInTheDocument()
  })
})

describe('S6 · asignación deshecha', () => {
  const deshecha = (mesOriginal, mesReversion) => ({
    _id: 't2',
    code: 8,
    status: 'Nueva',
    vehicle: null,
    createdAt: F(1),
    history: [
      entrada('h1', 'Alta', 1),
      entrada('h2', 'Asignación', mesOriginal, { vehicle: M101, kmAlta: 100000, flag: true, correctedAt: F(mesReversion), editedFields: ['Deshacer entrada'], reason: 'Deshecho en la orden N°7' }),
      entrada('h3', 'Desasignación', mesReversion, { km: 0, flag: true, editedFields: ['Deshacer asignación'], corrects: { _id: 'h2' } }),
    ],
  })

  it('la original dice que fue deshecha y no ofrece acciones; la reversión queda como hoy', async () => {
    await montar(deshecha(2, 3))

    const original = bloqueDe('Deshecho: Montada en M-101')
    expect(tituloDe(original).style.color).toContain('--ink-purple')
    expect(within(original).queryByText('Corregir')).toBeNull()
    expect(within(original).queryByText('Deshacer')).toBeNull()

    const reversion = bloqueDe('Desmontada del vehículo')
    expect(tituloDe(reversion).style.color).toContain('--ink-orange')
    expect(within(reversion).getByText('Corregir')).toBeInTheDocument()
    expect(within(reversion).getByText('Deshacer')).toBeInTheDocument()
  })

  it('una corregida con fecha posterior (dato sembrado a futuro) no le roba el Deshacer al último movimiento vigente', async () => {
    await montar(deshecha(5, 3))

    const reversion = bloqueDe('Desmontada del vehículo')
    expect(within(reversion).getByText('Deshacer')).toBeInTheDocument()
    expect(screen.getAllByText('Deshacer')).toHaveLength(1)
  })
})

describe('S6 · nivel de recapado', () => {
  // Se cargó "2do Recapado" por error y se corrigió a "1er Recapado". El nivel alcanzado es 1:
  // el siguiente recapado posible es el 2do, no "ya recorrió toda la escalera".
  const recapCorregido = {
    _id: 't3',
    code: 9,
    status: 'A recapar',
    vehicle: null,
    createdAt: F(1),
    history: [
      entrada('h1', 'Alta', 1),
      entrada('h2', 'Estado', 2, { status: '2do Recapado', flag: true, correctedAt: F(3) }),
      entrada('h3', 'Corrección-Estado', 3, { status: '1er Recapado', flag: true, corrects: { _id: 'h2' } }),
      entrada('h4', 'Estado', 4, { status: 'A recapar' }),
    ],
  }

  it('un estado corregido no cuenta para el nivel alcanzado', async () => {
    await montar(recapCorregido, { initialAction: 'recap' })

    expect(screen.getByRole('option', { name: /^2do Recapado/ }).disabled).toBe(false)
    expect(screen.queryByText(/ya recorrió toda la escalera/)).toBeNull()
  })

  it('ni para el ciclo de vida', async () => {
    await montar(recapCorregido)

    // Nivel 1 alcanzado y la cubierta a recapar: el paso "1er Rec." en naranja, el "2do Rec." pendiente.
    expect(screen.getByText('1er Rec.').style.color).toContain('--ink-orange')
    expect(screen.getByText('2do Rec.').style.color).toContain('--tx-6')
  })
})

describe('S6 · lo que no cambia', () => {
  it('datos previos al fix (original reetiquetada "Corrección-*") se ven igual que hoy', async () => {
    await montar({
      _id: 't4',
      code: 10,
      status: 'Nueva',
      vehicle: M202,
      createdAt: F(1),
      history: [
        entrada('h1', 'Alta', 1),
        entrada('h2', 'Corrección-Asignación', 2, { vehicle: M101, kmAlta: 100000, flag: true, reason: 'Corregido en la orden N°5' }),
        entrada('h3', 'Corrección-Asignación', 3, { vehicle: M202, kmAlta: 120000, flag: true, corrects: { _id: 'h2' } }),
      ],
    })

    const bloques = screen.getAllByText('Corrección de un movimiento anterior').map((d) => d.parentElement)
    expect(bloques).toHaveLength(2)
    for (const b of bloques) {
      expect(tituloDe(b).textContent).toBe('Corrección-Asignación')
      expect(tituloDe(b).style.color).toContain('--ink-purple')
      expect(within(b).queryByText('Corregir')).toBeNull()
    }
    expect(screen.queryByText(/^Corregido:/)).toBeNull()
  })

  it('una asignación normal sigue montada, en azul, con Corregir y Deshacer', async () => {
    await montar({
      _id: 't5',
      code: 11,
      status: 'Nueva',
      vehicle: M101,
      createdAt: F(1),
      history: [
        entrada('h1', 'Alta', 1),
        entrada('h2', 'Asignación', 2, { vehicle: M101, kmAlta: 100000 }),
      ],
    })

    const bloque = bloqueDe('Montada en M-101')
    expect(tituloDe(bloque).style.color).toContain('--ink-blue')
    expect(within(bloque).getByText('Corregir')).toBeInTheDocument()
    expect(within(bloque).getByText('Deshacer')).toBeInTheDocument()
  })

  it('el montaje vigente de una asignación normal sigue siendo su odómetro', async () => {
    await montar({
      _id: 't6',
      code: 12,
      status: 'Nueva',
      vehicle: M101,
      createdAt: F(1),
      history: [entrada('h1', 'Alta', 1), entrada('h2', 'Asignación', 2, { vehicle: M101, kmAlta: 100000 })],
    }, { initialAction: 'unassign' })

    expect(screen.getByText(/Se montó con el odómetro en/).textContent).toMatch(/100\.000/)
  })
})
