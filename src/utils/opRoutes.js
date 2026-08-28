// Mapeo entre las secciones de la operativa y sus URLs.
//
// Antes toda la operativa vivía en UNA ruta ("/") con la sección en un useState. Eso rompía
// tres cosas que el usuario da por sentadas: el botón Atrás salía de la aplicación en vez de
// cerrar el drawer, no se podía compartir ni guardar el link de una cubierta, y un F5 devolvía
// al Inicio desde cero perdiendo el trabajo en pantalla.
//
// El mapeo vive acá y no repartido por el layout y las pantallas: si cada uno arma su URL a
// mano, vuelven a divergir.

export const SECCIONES = ["inicio", "cubiertas", "vehiculos"]

export const rutaDeSeccion = (seccion) =>
  SECCIONES.includes(seccion) ? `/${seccion}` : "/inicio"

// La raíz y cualquier ruta que no reconozcamos caen en el Inicio: la alternativa es devolver
// undefined y que el layout renderice una pantalla en blanco.
export function seccionDeRuta(pathname) {
  const primero = String(pathname || "").split("/").filter(Boolean)[0]
  return SECCIONES.includes(primero) ? primero : "inicio"
}

// El detalle de una cubierta se direcciona por su CÓDIGO y no por su _id: es lo que el
// operario lee en el flanco y lo que dice por teléfono, así que es el identificador que tiene
// sentido en un link compartido.
export const rutaDeCubierta = (code) =>
  code == null || code === "" ? "/cubiertas" : `/cubiertas/${code}`

// El vehículo va por _id: la patente y el móvil son editables, el id no.
export const rutaDeVehiculo = (id) =>
  id == null || id === "" ? "/vehiculos" : `/vehiculos/${id}`

// ─── Intent de navegación ───────────────────────────────────────────────────────────────────
// Búsqueda, pestaña, alta abierta y montaje dirigido. Viajaban en el state de react-router,
// que NO sobrevive a un refresh; van a la query para que la pantalla se pueda reconstruir
// entera desde la URL.

export function queryDesdeIntent(intent) {
  if (!intent) return ""
  const p = new URLSearchParams()
  if (intent.query) p.set("q", intent.query)
  if (intent.tab) p.set("tab", intent.tab)
  if (intent.alta) p.set("alta", "1")
  if (intent.assignTo?.vehicleId) {
    p.set("montarEn", intent.assignTo.vehicleId)
    if (intent.assignTo.position) p.set("pos", intent.assignTo.position)
    if (intent.assignTo.mobile) p.set("movil", intent.assignTo.mobile)
  }
  const s = p.toString()
  return s ? `?${s}` : ""
}

export function intentDesdeQuery(params) {
  const p = params instanceof URLSearchParams ? params : new URLSearchParams(params || "")
  const intent = {}
  const q = p.get("q")
  const tab = p.get("tab")
  const montarEn = p.get("montarEn")
  if (q) intent.query = q
  if (tab) intent.tab = tab
  if (p.get("alta") === "1") intent.alta = true
  if (montarEn) {
    intent.assignTo = { vehicleId: montarEn, position: p.get("pos") || null, mobile: p.get("movil") || null }
  }
  return Object.keys(intent).length ? intent : null
}
