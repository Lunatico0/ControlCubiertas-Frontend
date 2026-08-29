import { vi } from 'vitest'
import { PARAM_DEMO, CLAVE_DEMO } from '@utils/demoEntry'

// El recuadro de la demo tiene DOS llaves, y hacen falta las dos:
//
//   1. `VITE_DEMO_LOGIN=true` — este deploy tiene permitido mostrar cosas de demo. Es de
//      build, así que el instalador de escritorio nunca la tiene: ahí el recuadro no existe.
//   2. El visitante llegó por el botón "Probar la demo" de la landing (`?demo=1`).
//
// La segunda capa existe porque el deploy web es UNO SOLO y lo comparten la demo pública y
// los clientes que entran por navegador. Sin ella, prender la primera llave le pone
// credenciales de prueba en la cara a un cliente real que abrió su propio login.
//
// Detalle que importa: el parámetro se CONSUME. Se guarda en sessionStorage y se saca de la
// URL, así el link que el visitante podría marcar como favorito ya no lo trae. Pero mientras
// dure esa pestaña el recuadro sobrevive a un F5, que es lo que uno espera si está probando.
//
// Esto NO es un control de seguridad y no pretende serlo: las credenciales de la demo son
// públicas por diseño. Es para que un cliente real no vea ruido que no le corresponde.

const irA = (busqueda) => {
  window.history.replaceState({}, '', `/login${busqueda}`)
}

// El módulo recuerda la respuesta durante la carga de página (ver el comentario de
// `recordado`). Cada test simula una carga NUEVA, así que se reimporta limpio.
let entroPorLaDemo
beforeEach(async () => {
  sessionStorage.clear()
  irA('')
  vi.unstubAllEnvs()
  vi.resetModules()
  ;({ entroPorLaDemo } = await import('@utils/demoEntry'))
})

describe('sin el permiso del deploy, no hay demo en ningún caso', () => {
  it('aunque venga de la landing con el parámetro', () => {
    irA(`?${PARAM_DEMO}=1`)

    expect(entroPorLaDemo()).toBe(false)
  })

  it('aunque la sesión ya lo tenga marcado de antes', () => {
    sessionStorage.setItem(CLAVE_DEMO, '1')

    expect(entroPorLaDemo()).toBe(false)
  })
})

describe('con el permiso del deploy', () => {
  beforeEach(() => vi.stubEnv('VITE_DEMO_LOGIN', 'true'))

  it('entrar directo al login, sin pasar por la landing, NO muestra la demo', () => {
    expect(entroPorLaDemo()).toBe(false)
  })

  it('llegar con el parámetro de la landing SÍ la muestra', () => {
    irA(`?${PARAM_DEMO}=1`)

    expect(entroPorLaDemo()).toBe(true)
  })

  it('el parámetro se consume: la URL queda limpia para que no se marque como favorito', () => {
    irA(`?${PARAM_DEMO}=1`)

    entroPorLaDemo()

    expect(window.location.search).not.toContain(PARAM_DEMO)
  })

  it('no pisa otros parámetros de la URL al limpiar el suyo', () => {
    irA(`?utm_source=google&${PARAM_DEMO}=1&ref=abc`)

    entroPorLaDemo()

    expect(window.location.search).toContain('utm_source=google')
    expect(window.location.search).toContain('ref=abc')
    expect(window.location.search).not.toContain(PARAM_DEMO)
  })

  it('sobrevive a un F5: la pestaña recuerda que vino de la landing', () => {
    irA(`?${PARAM_DEMO}=1`)
    entroPorLaDemo() // primera visita: consume el parámetro
    irA('') // el "recargar" ya sin parámetro en la URL

    expect(entroPorLaDemo()).toBe(true)
  })

  it('una pestaña NUEVA sin parámetro no hereda nada', () => {
    sessionStorage.clear() // sessionStorage es por pestaña: una nueva arranca vacía

    expect(entroPorLaDemo()).toBe(false)
  })

  it('cualquier valor del parámetro sirve: el link de la landing es lo que importa', () => {
    irA(`?${PARAM_DEMO}`)

    expect(entroPorLaDemo()).toBe(true)
  })

  it('no explota si sessionStorage está bloqueado (modo privado)', () => {
    irA(`?${PARAM_DEMO}=1`)
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = () => { throw new Error('bloqueado') }

    // Aun sin poder recordar nada entre recargas, la visita que TRAE el parámetro funciona.
    expect(() => entroPorLaDemo()).not.toThrow()

    Storage.prototype.setItem = original
  })

  it('llamarlo dos veces en la misma carga da lo mismo, aunque el storage esté bloqueado', () => {
    // Pasa de verdad: StrictMode invoca dos veces los inicializadores de estado en desarrollo,
    // y la primera llamada ya consumió el parámetro de la URL. Sin memoria de proceso, el
    // recuadro parpadearía.
    irA(`?${PARAM_DEMO}=1`)
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = () => { throw new Error('bloqueado') }

    expect(entroPorLaDemo()).toBe(true)
    expect(entroPorLaDemo()).toBe(true)

    Storage.prototype.setItem = original
  })
})
