/**
 * Información sobre los diferentes estados de cubiertas
 */

const tireStatusInfo = {
  Nueva: {
    colorClass: "text-blue-300",
    description: "Cubierta nueva sin uso previo",
    icon: "🆕",
    order: 1,
  },
  "1er Recapado": {
    colorClass: "text-green-600",
    description: "Cubierta con un recapado realizado",
    icon: "1️⃣",
    order: 2,
  },
  "2do Recapado": {
    colorClass: "text-yellow-600",
    description: "Cubierta con dos recapados realizados",
    icon: "2️⃣",
    order: 3,
  },
  "3er Recapado": {
    colorClass: "text-orange-600",
    description: "Cubierta con tres recapados realizados",
    icon: "3️⃣",
    order: 4,
  },
  "A recapar": {
    colorClass: "text-neutral-700",
    description: "Cubierta enviada a recapado, en espera",
    icon: "⏳",
    order: 5,
  },
  Descartada: {
    colorClass: "text-red-600",
    description: "Cubierta fuera de servicio, no utilizable",
    icon: "❌",
    order: 6,
  },
}

export default tireStatusInfo

/**
 * Obtiene la lista de estados ordenados
 * @returns {Array} Lista de estados ordenados
 */
export const getOrderedStatuses = () => {
  return Object.keys(tireStatusInfo).sort((a, b) => tireStatusInfo[a].order - tireStatusInfo[b].order)
}

/**
 * Verifica si un estado permite recapado
 * @param {string} status - Estado actual de la cubierta
 * @returns {boolean} True si el estado permite recapado
 */
export const canBeRecapped = (status) => {
  return ["Nueva", "1er Recapado", "2do Recapado"].includes(status)
}

/**
 * Obtiene el siguiente estado después de un recapado
 * @param {string} currentStatus - Estado actual de la cubierta
 * @returns {string|null} Siguiente estado o null si no es posible
 */
export const getNextRecapStatus = (currentStatus) => {
  const statusMap = {
    Nueva: "1er Recapado",
    "1er Recapado": "2do Recapado",
    "2do Recapado": "3er Recapado",
  }

  return statusMap[currentStatus] || null
}
