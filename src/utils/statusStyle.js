/**
 * Estilos CSS para los diferentes estados de cubiertas
 */
export const statusStyles = {
  "Nueva": "bg-blue-300 dark:bg-blue-900/60",
  "1er Recapado": "bg-green-300 dark:bg-green-900/60",
  "2do Recapado": "bg-yellow-300 dark:bg-yellow-900/60",
  "3er Recapado": "bg-orange-400 dark:bg-orange-900/60",
  "A recapar": "bg-neutral-700 dark:bg-neutral-900/60",
  "Descartada": "bg-red-500 dark:bg-red-900/60",
}

/**
 * Obtiene el color de texto para un estado de cubierta
 * @param {string} status - Estado de la cubierta
 * @returns {string} Clase CSS para el color de texto
 */
export const getStatusTextColor = (status) => {
  switch (status) {
    case "Nueva":
      return "text-green-700 dark:text-green-400"
    case "1er Recapado":
      return "text-blue-700 dark:text-blue-400"
    case "2do Recapado":
      return "text-purple-700 dark:text-purple-400"
    case "3er Recapado":
      return "text-indigo-700 dark:text-indigo-400"
    case "A recapar":
      return "text-yellow-700 dark:text-yellow-400"
    case "Descartada":
      return "text-red-700 dark:text-red-400"
    default:
      return "text-gray-700 dark:text-gray-400"
  }
}

/**
 * Obtiene el color de borde para un estado de cubierta
 * @param {string} status - Estado de la cubierta
 * @returns {string} Clase CSS para el color de borde
 */
export const getStatusBorderColor = (status) => {
  switch (status) {
    case "Nueva":
      return "border-blue-300 dark:border-blue-700"
    case "1er Recapado":
      return "border-green-300 dark:border-green-700"
    case "2do Recapado":
      return "border-yellow-300 dark:border-yellow-700"
    case "3er Recapado":
      return "border-orange-400 dark:border-orange-700"
    case "A recapar":
      return "border-neutral-700 dark:border-neutral-700"
    case "Descartada":
      return "border-red-500 dark:border-red-900"
    default:
      return "border-gray-300 dark:border-gray-700"
  }
}
