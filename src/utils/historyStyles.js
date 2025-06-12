const yellowCorrection = "bg-yellow-100 dark:bg-yellow-900/10 font-semibold"

export const getRowStyle = (type, flag) => {
  const base = {
    asignacion: "bg-green-50 dark:bg-green-900/10",
    desasignacion: "bg-red-50 dark:bg-red-900/10",
    estado: "bg-blue-50 dark:bg-blue-900/10",
    alta: "bg-green-100 dark:bg-green-900/20",
    undo: "bg-red-100 dark:bg-red-900/20 italic",
  }

  const corrections = [
    "correccion",
    "correccion-asignacion",
    "correccion-desasignacion",
    "correccion-estado",
  ]

  if (corrections.includes(type)) return yellowCorrection
  if (type === "correccion" && flag) return yellowCorrection

  return base[type] || ""
}

export const getHistoryTypeLabel = (type) => {
  const map = {
    asignacion: "Asignación",
    desasignacion: "Desasignación",
    estado: "Cambio de estado",
    correccion: "Corrección",
    "correccion-asignacion": "Corrección de asignación",
    "correccion-desasignacion": "Corrección de desasignación",
    "correccion-estado": "Corrección de estado",
    alta: "Alta",
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
  type: "Tipo",
  reason: "Razón",
  date: "Fecha",
  createdAt: "Fecha de alta",
  kilometers: "Kilómetros",
}
