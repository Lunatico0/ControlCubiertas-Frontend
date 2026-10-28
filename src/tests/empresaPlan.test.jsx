import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CompanySettings from '@components/Portal/CompanySettings'
import { getCompany, updateCompany } from '@api/admin'

// Pantalla Empresa (auditoría 26/10):
//   A10    el bloque Plan mostraba el nombre interno de la base y "free"/"active" crudos.
//   A13-g  los formatos de patente decían "Auto, ..." / "Moto, ...", pero la máscara vale para
//          cualquier vehículo: el rótulo describe el formato, no el tipo de vehículo.
//   A13-j  los formatos son toggles y no exponían su estado (aria-pressed).
//   A1     desmarcar formatos y guardar tiene que mandar la lista que quedó marcada.

vi.mock('@utils/toast', () => ({ showToast: vi.fn() }))
vi.mock('@api/company', () => ({ invalidateCompanyCache: vi.fn() }))
vi.mock('@api/admin', () => ({
  getCompany: vi.fn(),
  updateCompany: vi.fn(),
  getSummary: vi.fn(async () => ({ cubiertas: { byStatus: {} } })),
}))

const STATUSES = [
  { name: 'Nueva', role: 'initial' },
  { name: 'A recapar', role: 'recap' },
  { name: 'Descartada', role: 'discard' },
]

const empresa = (over = {}) => ({
  name: 'Acme', cuit: '', phone: '', address: '', receiptPrefix: '0001', receiptFooter: '',
  plan: 'free', status: 'active', dbName: 'tenant_acme_interno',
  stockStatuses: STATUSES, plateSeparator: '', plateFormats: ['AAA000', 'AA000AA', 'A000AAA', '000AAA'],
  tireCodePrefix: '', autoPrint: true,
  ...over,
})

const renderPantalla = async (over) => {
  getCompany.mockResolvedValue(empresa(over))
  render(<CompanySettings />)
  await screen.findByRole('heading', { name: 'Empresa' })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Empresa > Plan (A10)', () => {
  it('traduce plan y estado: "free" se ve "Gratuito" y "active" se ve "Activa"', async () => {
    await renderPantalla()
    const plan = screen.getByRole('heading', { name: 'Plan' }).closest('section')

    expect(within(plan).getByText('Gratuito')).toBeInTheDocument()
    expect(within(plan).getByText('Activa')).toBeInTheDocument()
    expect(within(plan).queryByText('free')).not.toBeInTheDocument()
    expect(within(plan).queryByText('active')).not.toBeInTheDocument()
  })

  it('"suspended" se ve "Suspendida"', async () => {
    await renderPantalla({ status: 'suspended' })
    const plan = screen.getByRole('heading', { name: 'Plan' }).closest('section')

    expect(within(plan).getByText('Suspendida')).toBeInTheDocument()
  })

  it('no muestra el nombre interno de la base de datos', async () => {
    await renderPantalla()

    expect(screen.queryByText('tenant_acme_interno')).not.toBeInTheDocument()
    expect(screen.queryByText(/base de datos/i)).not.toBeInTheDocument()
  })
})

describe('Empresa > Patentes: formatos aceptados (A13-g, A13-j, A1)', () => {
  it('rotula cada formato por lo que es, no por tipo de vehículo', async () => {
    await renderPantalla()

    expect(screen.getByRole('button', { name: /Mercosur \(AB 123 CD\)/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Dominio viejo \(ABC 123\)/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Mercosur moto/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Moto viejo/ })).toBeInTheDocument()
    expect(screen.queryByText(/^Auto,/)).not.toBeInTheDocument()
    expect(screen.queryByText(/^Moto,/)).not.toBeInTheDocument()
  })

  it('cada formato expone si está marcado (aria-pressed) y cambia al tocarlo', async () => {
    await renderPantalla({ plateFormats: ['AA000AA'] })
    const mercosur = screen.getByRole('button', { name: /Mercosur \(AB 123 CD\)/ })
    const viejo = screen.getByRole('button', { name: /Dominio viejo/ })

    expect(mercosur).toHaveAttribute('aria-pressed', 'true')
    expect(viejo).toHaveAttribute('aria-pressed', 'false')

    await userEvent.click(viejo)
    expect(viejo).toHaveAttribute('aria-pressed', 'true')
  })

  it('el separador elegido también expone su estado (aria-pressed)', async () => {
    await renderPantalla({ plateSeparator: '-' })

    expect(screen.getByRole('button', { name: 'Guión' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Ninguno' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('desmarcar todos los formatos y guardar manda la lista vacía', async () => {
    await renderPantalla({ plateFormats: ['AA000AA'] })
    updateCompany.mockResolvedValue(empresa({ plateFormats: [] }))

    await userEvent.click(screen.getByRole('button', { name: /Mercosur \(AB 123 CD\)/ }))
    await userEvent.click(screen.getByRole('button', { name: /guardar cambios/i }))

    expect(updateCompany).toHaveBeenCalledTimes(1)
    expect(updateCompany.mock.calls[0][0].plateFormats).toEqual([])
  })
})
