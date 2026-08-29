import { renderComprobanteHTML } from '@utils/receipt-template'

// t123 de la auditoría visual.
//
// Con CUIT, teléfono y dirección vacíos, la cabecera renderizaba "CUIT — · Tel ——", con el
// guión de la dirección pegado al del teléfono porque venían en líneas que se juntaban. Es la
// cabecera de una pieza que el CLIENTE recibe en la mano: tres guiones sueltos se leen como un
// error de impresión, no como "sin dato".
//
// El criterio: un campo vacío no se rellena, se OMITE. Y si no queda ningún campo, la línea
// entera desaparece en vez de dejar un renglón de separadores.

const render = (company) => renderComprobanteHTML({ company, meta: { numero: '0001-00000001' } })

describe('t123 · la cabecera del comprobante no rellena con guiones', () => {
  it('sin ningún dato de contacto no queda ni un guión suelto', () => {
    const html = render({ name: 'Transporte Andes' })

    expect(html).not.toMatch(/CUIT\s*—/)
    expect(html).not.toMatch(/Tel\s*—/)
    expect(html).not.toMatch(/——/)
  })

  it('con solo el CUIT, muestra el CUIT y nada más', () => {
    const html = render({ name: 'Transporte Andes', cuit: '30-12345678-9' })

    expect(html).toMatch(/CUIT 30-12345678-9/)
    expect(html).not.toMatch(/Tel/)
  })

  it('con CUIT y teléfono los separa, sin dejar el separador colgando', () => {
    const html = render({ name: 'X', cuit: '30-1-9', phone: '11 5555-5555' })

    expect(html).toMatch(/CUIT 30-1-9 · Tel 11 5555-5555/)
  })

  it('con solo la dirección, no antepone separadores vacíos', () => {
    const html = render({ name: 'X', address: 'Ruta 7 km 12' })

    expect(html).toMatch(/Ruta 7 km 12/)
    expect(html).not.toMatch(/·\s*Ruta 7/)
  })

  it('con los tres datos los muestra todos', () => {
    const html = render({ name: 'X', cuit: '30-1-9', phone: '11 5555', address: 'Ruta 7' })

    expect(html).toMatch(/CUIT 30-1-9/)
    expect(html).toMatch(/Tel 11 5555/)
    expect(html).toMatch(/Ruta 7/)
  })

  it('sigue escapando el HTML de los datos de la empresa', () => {
    const html = render({ name: 'X', cuit: '<script>alert(1)</script>' })

    expect(html).not.toMatch(/<script>alert/)
  })

  it('el nombre de la empresa se sigue mostrando aunque no haya contacto', () => {
    expect(render({ name: 'Transporte Andes' })).toMatch(/Transporte Andes/)
  })
})
