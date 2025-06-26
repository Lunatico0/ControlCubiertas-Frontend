const yellowCorrection = "bg-yellow-200 dark:bg-yellow-900/60 font-semibold"

export const getRowStyle = (type, flag) => {
  const base = {
    Asignación: "bg-green-200 dark:bg-green-900/60",
    Desasignación: "bg-red-300 dark:bg-red-900/60",
    Estado: "bg-neutral-300 dark:bg-neutral-900/60",
    Alta: "bg-green-300 dark:bg-green-900/80",
    undo: "bg-red-400 dark:bg-red-900/40 italic",
  }

  const corrections = [
    "Corrección",
    "Corrección-Asignación",
    "Corrección-Desasignación",
    "Corrección-Estado",
  ]

  if (corrections.includes(type)) return yellowCorrection
  if (type === "Corrección" && flag) return yellowCorrection

  return base[type] || ""
}

export const getHistoryTypeLabel = (type) => {
  const map = {
    Asignación: "Asignación",
    Desasignación: "Desasignación",
    Estado: "Cambio de Estado",
    Corrección: "Corrección",
    "Corrección-Asignación": "Corrección de asignación",
    "Corrección-Desasignación": "Corrección de desasignación",
    "Corrección-Estado": "Corrección de Estado",
    Alta: "Alta",
    undo: "Deshacer",
  }
  return map[type] || type || "Desconocido"
}

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
  size: "Rodado",
  type: "Tipo",
  reason: "Razón",
  date: "Fecha",
  createdAt: "Fecha de alta",
  kilometers: "Kilómetros",
}
