import { isValidPlate, PLATE_FORMATS_AR, describirFormatos } from '@utils/plateFormat'
import { normalizarTexto, sugerenciasDe } from '@utils/catalogoLibre'

// t137 y t138 de la auditoría de QA del operario, del lado del front.
//
// t137 — REPRODUCIDO: se cargó una cubierta con la marca en minúscula y el desplegable de
// filtro por marca pasó a listar "michelin" y "Michelin" como DOS marcas distintas. Con 2000
// cubiertas cargadas por varios operarios el catálogo se vuelve basura: MICHELIN, Michelín,
// "Michelin " con espacio al final. Lo mismo con rodado, que es un dato de COMPATIBILIDAD:
// dos formas del mismo rodado hacen que el operario no encuentre la cubierta que sí tiene.
//
// t138 — el front tiene que rechazar el formato ANTES de mandar la request. El backend valida
// igual (es la autoridad), pero un 400 de ida y vuelta para un error de tipeo es una espera
// que no hace falta, y el mensaje llega como toast en vez de al lado del campo.

describe('t137 · normalización de los campos de texto libre', () => {
  it('recorta los espacios de sobra, adentro y afuera', () => {
    expect(normalizarTexto('  Michelin  ')).toBe('Michelin')
    expect(normalizarTexto('Michelin   XZA')).toBe('Michelin XZA')
  })

  it('capitaliza cada palabra: "michelin" y "MICHELIN" convergen', () => {
    expect(normalizarTexto('michelin')).toBe('Michelin')
    expect(normalizarTexto('MICHELIN')).toBe('Michelin')
    expect(normalizarTexto('bridgestone r268')).toBe('Bridgestone R268')
  })

  it('respeta los acentos: "michelín" no se rompe', () => {
    expect(normalizarTexto('michelín')).toBe('Michelín')
  })

  it('no toca un valor que ya está normalizado (es idempotente)', () => {
    expect(normalizarTexto(normalizarTexto('  pirelli  '))).toBe('Pirelli')
  })

  it('deja pasar los rodados en su notación: no capitaliza dígitos ni separadores', () => {
    expect(normalizarTexto('295/80r22.5')).toBe('295/80R22.5')
    expect(normalizarTexto('11.00-20')).toBe('11.00-20')
  })

  it('tolera nulos y vacíos', () => {
    expect(normalizarTexto(null)).toBe('')
    expect(normalizarTexto('   ')).toBe('')
  })
})

describe('t137 · sugerencias a partir de lo ya cargado en el tenant', () => {
  const TIRES = [
    { brand: 'Michelin', size: '295/80R22.5', pattern: 'XZA' },
    { brand: 'michelin', size: '295/80R22.5', pattern: 'XDE' },
    { brand: 'Bridgestone', size: '11R22.5', pattern: null },
    { brand: '  ', size: '', pattern: 'XZA' },
  ]

  it('colapsa las variantes de un mismo valor en una sola sugerencia', () => {
    expect(sugerenciasDe(TIRES, 'brand')).toEqual(['Bridgestone', 'Michelin'])
  })

  it('descarta los vacíos y los nulos', () => {
    expect(sugerenciasDe(TIRES, 'pattern')).toEqual(['XDE', 'XZA'])
  })

  it('ordena en castellano para que la lista sea recorrible', () => {
    const lista = sugerenciasDe([{ brand: 'Ñandú' }, { brand: 'Zeta' }, { brand: 'Alfa' }], 'brand')
    expect(lista).toEqual(['Alfa', 'Ñandú', 'Zeta'])
  })

  it('sin cubiertas devuelve una lista vacía, no explota', () => {
    expect(sugerenciasDe(undefined, 'brand')).toEqual([])
  })
})

describe('t138 · validación de patente en el front', () => {
  it('acepta las cuatro chapas argentinas vigentes', () => {
    expect(isValidPlate('ABC301', PLATE_FORMATS_AR)).toBe(true)
    expect(isValidPlate('AB123CD', PLATE_FORMATS_AR)).toBe(true)
    expect(isValidPlate('A123BCD', PLATE_FORMATS_AR)).toBe(true)
    expect(isValidPlate('123ABC', PLATE_FORMATS_AR)).toBe(true)
  })

  it('rechaza la patente del hallazgo antes de mandar la request', () => {
    expect(isValidPlate('ABC1234XYZ', PLATE_FORMATS_AR)).toBe(false)
  })

  it('valida sobre la forma canónica: el separador de display no cuenta', () => {
    expect(isValidPlate('abc-301', PLATE_FORMATS_AR)).toBe(true)
  })

  it('sin formatos configurados no valida: el tenant extranjero no queda bloqueado', () => {
    expect(isValidPlate('ABC1234XYZ', [])).toBe(true)
    expect(isValidPlate('ABC1234XYZ', undefined)).toBe(true)
  })

  it('describe los formatos con el separador del tenant, para el mensaje de error', () => {
    expect(describirFormatos(['AAA000'], '-')).toBe('AAA-000')
    expect(describirFormatos(['AAA000', 'AA000AA'], '')).toBe('AAA000, AA000AA')
  })

  it('sin formatos no hay nada que describir', () => {
    expect(describirFormatos([], '-')).toBe('')
  })
})
