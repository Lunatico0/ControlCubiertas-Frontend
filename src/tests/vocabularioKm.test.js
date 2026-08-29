import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// t140 y t141 de la auditoría de QA del operario.
//
// t140 — "Kilometraje inicial" y "Kilometraje final" son en realidad el ODÓMETRO DEL MÓVIL,
// pero la etiqueta no lo decía, y la palabra "Km" nombraba tres cosas distintas. Reproducido:
// se asignó con inicial 200.000 y se desasignó con final 250.000; el historial mostró
// "Km 50.000" y "Km baja 250.000" mientras la cubierta pasaba de 39.527 a 89.527. El operario
// tiene delante el odómetro del camión y el número grabado en la cubierta, y la app no le
// aclaraba cuál le estaba pidiendo. Un dato mal cargado acá arruina el cálculo de rendimiento.
//
// t141 — el formulario de desasignar era sólo "Kilometraje final" + "N° de orden": no decía
// de qué móvil ni de qué posición se bajaba la cubierta, ni contra qué odómetro se validaba.
//
// El texto de la UI no tiene comportamiento que probar: lo que hay que impedir es que el
// vocabulario viejo VUELVA. Este test lee el componente como texto, igual que elevacion.test.js.

const raiz = resolve(__dirname, '../..')
const drawer = readFileSync(resolve(raiz, 'src/components/Operativa/TireDrawer.jsx'), 'utf8')

describe('t140 · el vocabulario nombra qué se está midiendo', () => {
  it('los campos ya no dicen "Kilometraje inicial" ni "Kilometraje final"', () => {
    expect(drawer).not.toMatch(/label="Kilometraje (inicial|final)"/)
  })

  it('dicen que lo que se pide es el odómetro DEL MÓVIL', () => {
    expect(drawer).toMatch(/Odómetro del móvil al montar/)
    expect(drawer).toMatch(/Odómetro del móvil al desmontar/)
  })

  it('el historial distingue lo recorrido por la cubierta del odómetro del móvil', () => {
    expect(drawer).toMatch(/k: "Recorridos"/)
    expect(drawer).toMatch(/k: "Odóm\. al montar"/)
    expect(drawer).toMatch(/k: "Odóm\. al desmontar"/)
    // El "Km" y el "Km baja" viejos, que medían cosas distintas con la misma palabra.
    expect(drawer).not.toMatch(/k: "Km"/)
    expect(drawer).not.toMatch(/k: "Km baja"/)
  })
})

describe('t141 · desasignar dice de dónde sale la cubierta', () => {
  it('la cabecera nombra el móvil y la posición', () => {
    expect(drawer).toMatch(/Bajando de/)
    expect(drawer).toMatch(/tire\.position/)
  })

  it('adelanta el odómetro al montar, que es contra lo que se valida', () => {
    expect(drawer).toMatch(/odometroAlMontar/)
    expect(drawer).toMatch(/no puede ser menor/)
  })

  it('el odómetro se deriva del último montaje del historial, no de un valor suelto', () => {
    expect(drawer).toMatch(/montajeVigente\s*=\s*history\.find/)
  })
})
