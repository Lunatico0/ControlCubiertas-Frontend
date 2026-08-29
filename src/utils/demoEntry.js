// ¿Este visitante viene a probar la DEMO?
//
// El recuadro con las credenciales de prueba tiene DOS llaves, y hacen falta las dos:
//
//   1. `VITE_DEMO_LOGIN=true` — este deploy tiene permitido mostrar cosas de demo. Es una
//      variable de BUILD, así que el instalador de escritorio nunca la tiene y ahí el
//      recuadro directamente no existe.
//   2. El visitante llegó por el botón "Probar la demo" de la landing, que apunta al login
//      con `?demo=1`.
//
// La segunda llave existe porque el deploy web es UNO SOLO y lo comparten la demo pública y
// los clientes que entran por navegador. Sin ella, prender la primera le pondría credenciales
// de prueba en la cara a un cliente real abriendo su propio login.
//
// Por qué NO se mira `document.referrer`, que sería lo obvio: viene vacío con muchas políticas
// de privacidad, con `Referrer-Policy`, y en navegación directa. Sería un recuadro que aparece
// y desaparece según el navegador del visitante, que es peor que no tenerlo.
//
// Esto NO es un control de seguridad y no pretende serlo: las credenciales de la demo son
// PÚBLICAS por diseño, están para que cualquiera pruebe. Es una decisión de presentación.

export const PARAM_DEMO = 'demo'
export const CLAVE_DEMO = 'tireops:demo-desde-landing'

// sessionStorage puede tirar en modo privado o con las cookies bloqueadas. Nada de esto es
// crítico: en el peor caso el recuadro no sobrevive al F5, que es una molestia y no un error.
const leerSesion = () => {
  try {
    return sessionStorage.getItem(CLAVE_DEMO) === '1'
  } catch {
    return false
  }
}
const marcarSesion = () => {
  try {
    sessionStorage.setItem(CLAVE_DEMO, '1')
  } catch { /* modo privado: se pierde al recargar, no importa */ }
}

// Saca el parámetro de la URL sin tocar los demás (utm_*, ref y compañía siguen ahí para
// quien los esté midiendo). Se limpia para que el link que el visitante podría marcar como
// favorito no arrastre la demo para siempre.
const consumirParametro = () => {
  try {
    const url = new URL(window.location.href)
    url.searchParams.delete(PARAM_DEMO)
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
  } catch { /* si el navegador no deja tocar el historial, el parámetro queda: inofensivo */ }
}

// Memoria de esta carga de página, además del sessionStorage.
//
// Hace falta porque la primera llamada CONSUME el parámetro de la URL: si el storage está
// bloqueado (modo privado), una segunda llamada ya no encontraría ni el parámetro ni la marca
// y devolvería false. Eso pasa de verdad con StrictMode en desarrollo, que invoca dos veces
// los inicializadores de estado: el recuadro parpadearía sin razón aparente.
let recordado = false

// Se llama al montar el login. Es idempotente: la primera llamada consume el parámetro y lo
// recuerda; las siguientes leen lo recordado.
export const entroPorLaDemo = () => {
  if (import.meta.env.VITE_DEMO_LOGIN !== 'true') return false
  if (recordado) return true

  // `has` y no `get`: al link de la landing le alcanza con traer el parámetro, sin importar
  // qué valor le pongan.
  const vieneEnLaUrl = new URLSearchParams(window.location.search).has(PARAM_DEMO)
  if (!vieneEnLaUrl) {
    recordado = leerSesion()
    return recordado
  }

  recordado = true
  marcarSesion()
  consumirParametro()
  return true
}

export default entroPorLaDemo
