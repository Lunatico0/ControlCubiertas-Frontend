/**
 * Obtiene el estilo CSS para una fila de historial según su tipo y flag
 * @param {string} type - Tipo de entrada de historial
 * @param {boolean} flag - Indicador de corrección
 * @returns {string} Clases CSS para aplicar a la fila
 */
export const getRowStyle = (type, flag) => {
  switch (type) {
    case "asignacion":
      return "bg-green-50 dark:bg-green-900/10"
    case "desasignacion":
      return "bg-red-50 dark:bg-red-900/10"
    case "estado":
      return "bg-blue-50 dark:bg-blue-900/10"
    case "correccion":
      return flag ? "bg-yellow-100 dark:bg-yellow-900/10 font-semibold" : ""
    case "correccion-asignacion":
      return "bg-yellow-100 dark:bg-yellow-900/10 font-semibold"
    case "correccion-desasignacion":
      return "bg-yellow-100 dark:bg-yellow-900/10 font-semibold"
    case "correccion-estado":
      return "bg-yellow-100 dark:bg-yellow-900/10 font-semibold"
    case "alta":
      return "bg-green-100 dark:bg-green-900/20"
    case "undo":
      return "bg-red-100 dark:bg-red-900/20 italic"
    default:
      return ""
  }
}

/**
 * Diccionario para traducir nombres de campos a etiquetas legibles
 */
export const dictionary = {
  kmAlta: "Km Alta",
  kmBaja: "Km Baja",
  status: "Estado",
  orderNumber: "N° Orden",
  vehicle: "Vehículo",
  code: "Código Interno",
  serialNumber: "N° Serie",
  pattern: "Dibujo",
  brand: "Marca",
  type: "Tipo",
  reason: "Razón",
  date: "Fecha",
  createdAt: "Fecha de alta",
  kilometers: "Kilómetros",
}

/**
 * Obtiene una descripción legible del tipo de entrada de historial
 * @param {string} type - Tipo de entrada de historial
 * @returns {string} Descripción legible
 */
export const getHistoryTypeLabel = (type) => {
  switch (type) {
    case "asignacion":
      return "Asignación"
    case "desasignacion":
      return "Desasignación"
    case "estado":
      return "Cambio de estado"
    case "correccion":
      return "Corrección"
    case "correccion-asignacion":
      return "Corrección de asignación"
    case "correccion-desasignacion":
      return "Corrección de desasignación"
    case "correccion-estado":
      return "Corrección de estado"
    case "alta":
      return "Alta"
    case "undo":
      return "Deshacer"
    default:
      return type || "Desconocido"
  }
}
