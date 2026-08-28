import { posicionesOcupadasSePierden, motivoPresetIncompatible } from '@components/Operativa/axleGuards'

// t139 de la auditoría de QA del operario.
//
// REPRODUCIDO: la pantalla de reconfigurar ejes avisa BIEN que los ejes con cubierta montada
// están bloqueados (no se pueden quitar ni cambiar de tipo a mano). Pero los PRESETS de arriba
// seguían activos: se cliqueó "Moto · 2 cubiertas" en un vehículo con 4 cubiertas montadas y
// el esquema pasó a 2 posiciones sin un solo aviso. El 409 del backend llegó recién al apretar
// "Guardar esquema".
//
// El dato está a salvo (el backend frena bien, y eso ya está cubierto por sus propios tests).
// Lo que se pierde es el TRABAJO del operario: rehizo toda la configuración para nada, y se
// llevó la sensación de que la app le mintió. El guard tiene que estar donde está el clic.
//
// El criterio es el MISMO que aplica el backend: una posición ocupada que desaparece del
// layout nuevo. No "menos ejes" ni "menos cubiertas": posiciones concretas que se pierden.

const OCUPADAS = ['E1-I', 'E2-IE', 'E2-II', 'E2-DE']

describe('t139 · qué preset rompe una posición ocupada', () => {
  it('un layout que borra el eje ocupado se detecta', () => {
    // Camión 4x2 (simple + dual) → moto (una rueda): E1-I y todo el eje 2 desaparecen.
    expect(posicionesOcupadasSePierden(OCUPADAS, [{ type: 'moto' }])).toEqual(
      expect.arrayContaining(['E1-I', 'E2-IE', 'E2-II', 'E2-DE']),
    )
  })

  it('bajar un eje de dual a simple pierde las posiciones externas', () => {
    expect(posicionesOcupadasSePierden(OCUPADAS, [{ type: 'simple' }, { type: 'simple' }]))
      .toEqual(['E2-IE', 'E2-II', 'E2-DE'])
  })

  it('el layout que ya tiene el vehículo no pierde nada', () => {
    expect(posicionesOcupadasSePierden(OCUPADAS, [{ type: 'simple' }, { type: 'dual' }])).toEqual([])
  })

  it('AGREGAR un eje no pierde nada: las posiciones viejas siguen existiendo', () => {
    expect(posicionesOcupadasSePierden(OCUPADAS, [{ type: 'simple' }, { type: 'dual' }, { type: 'dual' }])).toEqual([])
  })

  it('sin cubiertas montadas ningún layout rompe nada', () => {
    expect(posicionesOcupadasSePierden([], [{ type: 'moto' }])).toEqual([])
  })

  it('acepta el layout como array de strings además de [{type}]', () => {
    expect(posicionesOcupadasSePierden(OCUPADAS, ['simple', 'dual'])).toEqual([])
  })

  it('tolera entradas nulas', () => {
    expect(posicionesOcupadasSePierden(undefined, undefined)).toEqual([])
  })
})

describe('t139 · el motivo que se le muestra al operario', () => {
  it('nombra las posiciones concretas que habría que desasignar', () => {
    const motivo = motivoPresetIncompatible(OCUPADAS, [{ type: 'moto' }])

    expect(motivo).toMatch(/E1-I/)
    expect(motivo).toMatch(/desasign/i)
  })

  it('un preset compatible no tiene motivo: null', () => {
    expect(motivoPresetIncompatible(OCUPADAS, [{ type: 'simple' }, { type: 'dual' }])).toBeNull()
  })

  it('una cubierta montada SIN posición bloquea todo: no se puede verificar nada', () => {
    const motivo = motivoPresetIncompatible(OCUPADAS, [{ type: 'simple' }, { type: 'dual' }], { hayMontadaSinPosicion: true })

    expect(motivo).toMatch(/sin posición/i)
  })
})
