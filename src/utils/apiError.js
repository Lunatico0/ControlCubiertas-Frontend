// El mensaje que ve el OPERARIO cuando una petición falla.
//
// El contrato del backend (utils/httpError.js) es: un 4xx lleva un `message` de NEGOCIO,
// redactado para el usuario ("La cubierta ya está asignada a otro móvil"). Un 5xx no: ahí el
// message es el error interno, o directamente no existe y axios pone su propio texto
// ("Request failed with status code 500"). Mostrar eso al operario no le dice nada y, peor,
// filtra estructura interna (nombres de colección, la DB del tenant).
//
// Regla: el mensaje del backend se muestra SÓLO en 4xx. Para todo lo demás, un texto por
// status. El detalle técnico no se pierde: viaja a Sentry desde el interceptor.

const POR_STATUS = {
  400: "Los datos enviados no son válidos. Revisá el formulario.",
  401: "Tu sesión expiró. Volvé a iniciar sesión.",
  403: "No tenés permiso para hacer esto.",
  404: "No se encontró lo que estabas buscando.",
  409: "La acción choca con el estado actual. Actualizá la pantalla y probá de nuevo.",
  413: "El contenido es demasiado grande. Reducilo y probá de nuevo.",
  422: "Los datos enviados no son válidos. Revisá el formulario.",
  429: "Demasiados intentos seguidos. Esperá unos minutos.",
}

const SIN_CONEXION = "Sin conexión con el servidor. Revisá tu internet y probá de nuevo."
const ERROR_SERVIDOR = "Hubo un problema en el servidor. Probá de nuevo en un momento."

// `error` es lo que rebota el interceptor de @api/client: un Error con `status` y, a veces,
// `field`. `contexto` es la frase de la pantalla ("No se pudieron cargar las cubiertas").
export function mensajeDeError(error, contexto = "") {
  const status = error?.status
  let detalle

  if (!status) {
    detalle = SIN_CONEXION
  } else if (status >= 500) {
    detalle = ERROR_SERVIDOR
  } else {
    // 4xx: el mensaje del backend es de negocio. Si no vino, el genérico por status.
    detalle = error?.message?.trim() || POR_STATUS[status] || "No se pudo completar la acción."
    // Red de seguridad: si el backend devolvió un 4xx con el texto de axios (no debería),
    // no se lo mostramos al operario.
    if (/^Request failed with status code/.test(detalle)) {
      detalle = POR_STATUS[status] || "No se pudo completar la acción."
    }
  }

  if (!contexto) return detalle
  return `${contexto}: ${detalle}`
}

// Detalle técnico para el log / Sentry. Nunca va a la pantalla.
export function detalleTecnico(error) {
  return [error?.status && `HTTP ${error.status}`, error?.field && `campo ${error.field}`, error?.message]
    .filter(Boolean)
    .join(" · ")
}

export default mensajeDeError
