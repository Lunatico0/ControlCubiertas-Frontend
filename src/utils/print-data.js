/**
 * Construye los datos para imprimir un comprobante de asignación
 * @param {Object} tire - Datos de la cubierta
 * @param {Object} updated - Datos actualizados
 * @param {Object} formData - Datos del formulario
 * @param {string} receiptNumber - Número de recibo
 * @returns {Object} Datos para imprimir
 */
export const buildAssignPrintData = (tire, updated, formData, receiptNumber) => ({
  tire: {
    code: tire.code,
    serialNumber: tire.serialNumber,
    brand: tire.brand,
    pattern: tire.pattern,
    kilometers: updated.tire.kilometers || 0,
    status: tire.status,
  },
  vehicle: {
    mobile: updated.tire.vehicle.mobile,
    licensePlate: updated.tire.vehicle.licensePlate,
  },
  orderNumber: formData.orderNumber,
  actionType: "Asignación",
  receiptNumber: receiptNumber || "0000-00000000",
  kmAlta: formData.kmAlta,
})

/**
 * Construye los datos para imprimir un comprobante de desasignación
 * @param {Object} tire - Datos de la cubierta
 * @param {Object} updated - Datos actualizados
 * @param {Object} formData - Datos del formulario
 * @param {string} receiptNumber - Número de recibo
 * @returns {Object} Datos para imprimir
 */
export const buildUnassignPrintData = (tire, updated, formData, receiptNumber) => {
  const kmBaja = formData.kmBaja
  const kmAlta = tire.kmAlta || 0

  return {
    tire: {
      code: tire.code,
      serialNumber: tire.serialNumber,
      brand: tire.brand,
      pattern: tire.pattern,
      kmAlta,
      kilometers: updated.tire.kilometers || 0,
      status: tire.status,
    },
    vehicle: updated.tire.vehicle
      ? {
          mobile: updated.tire.vehicle.mobile,
          licensePlate: updated.tire.vehicle.licensePlate,
        }
      : { mobile: "Sin asignar", licensePlate: "Sin asignar" },
    orderNumber: formData.orderNumber,
    actionType: "Desasignación",
    receiptNumber: receiptNumber || "0000-00000000",
    kmBaja,
    kmRecorridos: updated.kmRecorridos,
  }
}

/**
 * Construye los datos para imprimir un comprobante de descarte
 * @param {Object} tire - Datos de la cubierta
 * @param {Object} updated - Datos actualizados
 * @param {Object} formData - Datos del formulario
 * @param {string} receiptNumber - Número de recibo
 * @returns {Object} Datos para imprimir
 */
export const buildDiscardPrintData = (tire, updated, formData, receiptNumber) => ({
  tire: {
    code: tire.code,
    serialNumber: tire.serialNumber,
    brand: tire.brand,
    pattern: tire.pattern,
    kilometers: updated.tire.kilometers || 0,
    status: updated.tire.status,
    prevStatus: tire.status,
    newStatus: formData.status,
  },
  vehicle: updated?.tire?.vehicle
    ? {
        mobile: updated.tire.vehicle.mobile,
        licensePlate: updated.tire.vehicle.licensePlate,
      }
    : { mobile: "Sin asignar", licensePlate: "Sin asignar" },
  orderNumber: formData.orderNumber,
  actionType: "Descarte",
  receiptNumber: receiptNumber || "0000-00000000",
})

/**
 * Construye los datos para imprimir un comprobante de envío a recapado
 * @param {Object} tire - Datos de la cubierta
 * @param {Object} updated - Datos actualizados
 * @param {Object} formData - Datos del formulario
 * @param {string} receiptNumber - Número de recibo
 * @returns {Object} Datos para imprimir
 */
export const buildSendToRecapPrintData = (tire, updated, formData, receiptNumber) => ({
  tire: {
    code: tire.code,
    serialNumber: tire.serialNumber,
    brand: tire.brand,
    pattern: tire.pattern,
    kilometers: updated.tire.kilometers || 0,
    prevStatus: tire.status,
    newStatus: updated.tire.status,
  },
  vehicle: updated?.tire?.vehicle
    ? {
        mobile: updated.tire.vehicle.mobile,
        licensePlate: updated.tire.vehicle.licensePlate,
      }
    : { mobile: "Sin asignar", licensePlate: "Sin asignar" },
  orderNumber: formData.orderNumber,
  actionType: "Envío a recapado",
  receiptNumber: receiptNumber || "0000-00000000",
})

/**
 * Construye los datos para imprimir un comprobante de recapado completado
 * @param {Object} tire - Datos de la cubierta
 * @param {Object} updated - Datos actualizados
 * @param {Object} formData - Datos del formulario
 * @param {string} receiptNumber - Número de recibo
 * @returns {Object} Datos para imprimir
 */
export const buildFinishRecapPrintData = (tire, updated, formData, receiptNumber) => ({
  tire: {
    code: tire.code,
    serialNumber: tire.serialNumber,
    brand: tire.brand,
    pattern: tire.pattern,
    kilometers: updated.tire.kilometers || 0,
    prevStatus: tire.status,
    newStatus: updated.tire.status,
  },
  vehicle: updated?.tire?.vehicle
    ? {
        mobile: updated.tire.vehicle.mobile,
        licensePlate: updated.tire.vehicle.licensePlate,
      }
    : { mobile: "Sin asignar", licensePlate: "Sin asignar" },
  orderNumber: formData.orderNumber,
  actionType: "Recapado Completado",
  receiptNumber: receiptNumber || "0000-00000000",
})

/**
 * Construye los datos para imprimir un comprobante de corrección
 * @param {Object} tire - Datos de la cubierta
 * @param {Object} updated - Datos actualizados
 * @param {Object} formData - Datos del formulario
 * @param {string} receiptNumber - Número de recibo
 * @returns {Object} Datos para imprimir
 */
export const buildCorrectionPrintData = (tire, updated, formData, receiptNumber) => {
  const edited = updated.editedFields || []

  return {
    tire: {
      code: tire.code,
      serialNumber: tire.serialNumber,
      brand: tire.brand,
      pattern: tire.pattern,
    },
    correction: {
      date: new Date().toLocaleDateString("es-AR"),
      reason: formData.form.reason,
      orderNumber: formData.form.orderNumber,
      kmAlta: formData.form.kmAlta ?? "-",
      kmBaja: formData.form.kmBaja ?? "-",
      status: formData.form.status ?? tire.status,
      vehicle: updated.tire.vehicle
        ? {
            mobile: updated.tire.vehicle.mobile,
            licensePlate: updated.tire.vehicle.licensePlate,
          }
        : { mobile: "Sin asignar", licensePlate: "Sin asignar" },
      editedFields: Array.isArray(edited) ? edited.join(", ") : edited,
    },
    actionType: "Corrección de historial",
    receiptNumber: receiptNumber || "0000-00000000",
  }
}

/**
 * Construye los datos para imprimir un comprobante de deshacer entrada
 * @param {Object} tire - Datos de la cubierta
 * @param {Object} updated - Datos actualizados
 * @param {Object} formData - Datos del formulario
 * @param {string} receiptNumber - Número de recibo
 * @returns {Object} Datos para imprimir
 */
export const buildUndoPrintData = (tire, updated, formData, receiptNumber) => ({
  tire: {
    code: tire.code,
    serialNumber: tire.serialNumber,
    brand: tire.brand,
    pattern: tire.pattern,
    kilometers: updated.tire.kilometers,
    status: updated.tire.status,
    newStatus: updated.tire.status,
    prevStatus: tire.status,
  },
  vehicle: updated.vehicle
    ? {
        mobile: updated.vehicle.mobile,
        licensePlate: updated.vehicle.licensePlate,
      }
    : { mobile: "Sin asignar", licensePlate: "Sin asignar" },
  orderNumber: formData.orderNumber,
  actionType: "Deshacer entrada",
  receiptNumber: receiptNumber || "0000-00000000",
})
