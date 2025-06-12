const defaultVehicle = {
  mobile: "Sin asignar",
  licensePlate: "Sin asignar",
}

const buildBaseTire = (tire) => ({
  code: tire.code,
  serialNumber: tire.serialNumber,
  brand: tire.brand,
  pattern: tire.pattern,
})

const withReceipt = (data, receiptNumber) => ({
  ...data,
  receiptNumber: receiptNumber || "0000-00000000",
})

export const buildAssignPrintData = (tire, updated, formData, receiptNumber) =>
  withReceipt({
    tire: { ...buildBaseTire(tire), kilometers: updated.tire.kilometers, status: tire.status },
    vehicle: updated.tire.vehicle || defaultVehicle,
    orderNumber: formData.orderNumber,
    actionType: "Asignación",
    kmAlta: formData.kmAlta,
  }, receiptNumber)

export const buildUnassignPrintData = (tire, updated, formData, receiptNumber) =>
  withReceipt({
    tire: {
      ...buildBaseTire(tire),
      kmAlta: tire.kmAlta || 0,
      kilometers: updated.tire.kilometers,
      status: tire.status,
    },
    vehicle: updated.tire.vehicle || defaultVehicle,
    orderNumber: formData.orderNumber,
    actionType: "Desasignación",
    kmBaja: formData.kmBaja,
    kmRecorridos: updated.kmRecorridos,
  }, receiptNumber)

export const buildDiscardPrintData = (tire, updated, formData, receiptNumber) =>
  withReceipt({
    tire: {
      ...buildBaseTire(tire),
      kilometers: updated.tire.kilometers,
      status: updated.tire.status,
      prevStatus: tire.status,
      newStatus: formData.status,
    },
    vehicle: updated.tire.vehicle || defaultVehicle,
    orderNumber: formData.orderNumber,
    actionType: "Descarte",
  }, receiptNumber)

export const buildSendToRecapPrintData = (tire, updated, formData, receiptNumber) =>
  withReceipt({
    tire: {
      ...buildBaseTire(tire),
      kilometers: updated.tire.kilometers,
      prevStatus: tire.status,
      newStatus: updated.tire.status,
    },
    vehicle: updated.tire.vehicle || defaultVehicle,
    orderNumber: formData.orderNumber,
    actionType: "Envío a recapado",
  }, receiptNumber)

export const buildFinishRecapPrintData = (tire, updated, formData, receiptNumber) =>
  withReceipt({
    tire: {
      ...buildBaseTire(tire),
      kilometers: updated.tire.kilometers,
      prevStatus: tire.status,
      newStatus: updated.tire.status,
    },
    vehicle: updated.tire.vehicle || defaultVehicle,
    orderNumber: formData.orderNumber,
    actionType: "Recapado Completado",
  }, receiptNumber)

export const buildCorrectionPrintData = (tire, updated, formData, receiptNumber) => {
  const fields = formData.form || {}
  return withReceipt({
    tire: buildBaseTire(tire),
    correction: {
      date: new Date().toLocaleDateString("es-AR"),
      reason: fields.reason,
      orderNumber: fields.orderNumber,
      kmAlta: fields.kmAlta ?? "-",
      kmBaja: fields.kmBaja ?? "-",
      status: fields.status ?? tire.status,
      vehicle: updated.tire.vehicle || defaultVehicle,
      editedFields: Array.isArray(updated.editedFields)
        ? updated.editedFields.join(", ")
        : updated.editedFields,
    },
    actionType: "Corrección de historial",
  }, receiptNumber)
}

export const buildUndoPrintData = (tire, updated, formData, receiptNumber) =>
  withReceipt({
    tire: {
      ...buildBaseTire(tire),
      kilometers: updated.tire.kilometers,
      status: updated.tire.status,
      prevStatus: tire.status,
      newStatus: updated.tire.status,
    },
    vehicle: updated.vehicle || defaultVehicle,
    orderNumber: formData.orderNumber,
    actionType: "Deshacer entrada",
  }, receiptNumber)

export const buildReprintData = (entry, tire) =>
  withReceipt({
    tire: {
      ...buildBaseTire(tire),
      kilometers: entry.km,
      status: entry.status,
      prevStatus: entry.prevStatus,
      newStatus: entry.newStatus,
    },
    vehicle: entry.vehicle || defaultVehicle,
    orderNumber: entry.orderNumber,
    actionType: entry.type || "Reimpresión",
    kmAlta: entry.kmAlta,
    kmBaja: entry.kmBaja,
    kmRecorridos: entry.kmRecorridos,
    correction: entry.flag
      ? {
        reason: entry.reason || "",
        editedFields: Array.isArray(entry.editedFields)
          ? entry.editedFields.join(", ")
          : entry.editedFields || "",
      }
      : null,
  }, entry.receiptNumber)
