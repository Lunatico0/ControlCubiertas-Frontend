import { render, screen, act } from '@testing-library/react'
import { StateBadge, Pips, setStatusCatalog, metaOf, buildStatusMeta } from '@components/Operativa/status'

// El catálogo de estados es CONFIGURABLE POR TENANT y llega por una request aparte
// (getCompanyCached), en paralelo con la de cubiertas. Vivía en un `let` a nivel módulo que se
// mutaba desde un efecto async sin avisarle a React.
//
// Consecuencia real cuando las cubiertas ganaban la carrera: metaOf() devolvía el FALLBACK y
// quedaban todos los badges grises, el contador de "a recapar" en cero y el stepper del drawer
// vacío, hasta que cualquier otro cambio forzara un render. El código lo admitía en un
// comentario y lo tapaba con reintentos y setTimeout.

const CATALOGO = buildStatusMeta([
  { name: 'Nueva', role: 'initial' },
  { name: '1er Recapado', role: 'stock' },
  { name: '2do Recapado', role: 'stock' },
  { name: 'A recapar', role: 'recap' },
  { name: 'Descartada', role: 'discard' },
])

beforeEach(() => {
  setStatusCatalog(null) // arrancar siempre sin catálogo, como en el primer render real
})

describe('catálogo de estados y re-render', () => {
  it('el badge se repinta solo cuando el catálogo llega DESPUÉS del primer render', () => {
    render(<StateBadge status="A recapar" />)
    const badge = screen.getByText('A recapar').closest('span[style]')
    const colorSinCatalogo = badge.style.color

    act(() => setStatusCatalog(CATALOGO))

    const despues = screen.getByText('A recapar').closest('span[style]')
    expect(despues.style.color).not.toBe(colorSinCatalogo)
    expect(despues.style.color).toContain('--st-orange') // color fijo del rol recap
  })

  it('los pips aparecen cuando llega el catálogo, sin desmontar el componente', () => {
    const { container } = render(<Pips level={2} />)
    expect(container.querySelectorAll('span').length).toBe(0) // sin catálogo no hay escalera

    act(() => setStatusCatalog(CATALOGO))

    // Dos estados de rol stock → dos pips.
    expect(container.querySelectorAll('span').length).toBe(2)
  })

  it('un cambio de configuración del tenant se refleja sin recargar', () => {
    render(<StateBadge status="Recapado A" />)
    act(() => setStatusCatalog(CATALOGO))
    const gris = screen.getByText('Recapado A').closest('span[style]').style.color

    // El admin renombra los estados: el mismo nombre ahora sí existe en el catálogo.
    act(() =>
      setStatusCatalog(
        buildStatusMeta([
          { name: 'Nueva', role: 'initial' },
          { name: 'Recapado A', role: 'stock' },
        ])
      )
    )

    expect(screen.getByText('Recapado A').closest('span[style]').style.color).not.toBe(gris)
  })

  it('metaOf sigue sirviendo fuera de React, para los cálculos que no renderizan', () => {
    setStatusCatalog(CATALOGO)
    expect(metaOf('A recapar').role).toBe('recap')
    expect(metaOf('Nueva').level).toBe(0)
    expect(metaOf('inexistente').role).toBe('stock') // fallback
  })
})
