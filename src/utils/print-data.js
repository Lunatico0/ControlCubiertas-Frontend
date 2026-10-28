const defaultVehicle = {
  mobile: "Sin asignar",
  licensePlate: "Sin asignar",
}

const buildBaseTire = (tire) => ({
  code: tire.code,
  serialNumber: tire.serialNumber,
  brand: tire.brand,
  size: tire.size,
  pattern: tire.pattern,
})

const SIN_COMPROBANTE = "0000-00000000"

const withReceipt = (data, receiptNumber) => ({
  ...data,
  receiptNumber: receiptNumber || SIN_COMPROBANTE,
})

// Título de la ventana de impresión = nombre que el diálogo propone al guardar como PDF.
// "Desasignación 0001-00000049". Sin los caracteres que Windows rechaza en un archivo.
export const nombreComprobante = (data) => {
  const numero = data?.receiptNumber && data.receiptNumber !== SIN_COMPROBANTE ? data.receiptNumber : ""
  return [data?.actionType || "Comprobante", numero]
    .join(" ")
    .replace(/[\\/:*?"<>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export const buildCreateTirePrintData = (tire, receiptNumber) =>
  withReceipt({
    tire: {
      ...buildBaseTire(tire),
      kilometers: tire.kilometers || 0,
      status: tire.status,
    },
    vehicle: tire.vehicle || defaultVehicle,
    orderNumber: tire.orderNumber,
    actionType: "Alta de cubierta",
  }, receiptNumber);

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

// Nombres legibles (es) de los campos corregidos, para no mostrar la clave cruda (ej. "status" -> "Estado").
const FIELD_LABELS = {
  status: "Estado",
  kilometers: "Kilómetros",
  brand: "Marca",
  size: "Rodado",
  pattern: "Dibujo",
  serialNumber: "N° de serie",
  code: "Código interno",
  orderNumber: "N° de orden",
  vehicle: "Vehículo",
  position: "Posición",
  createdAt: "Fecha de alta",
  date: "Fecha",
}
const labelEditedFields = (f) => {
  const keys = Array.isArray(f) ? f : f == null || f === "" ? [] : String(f).split(/,\s*/)
  return keys.map((k) => FIELD_LABELS[k] || k).join(", ")
}

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
      editedFields: labelEditedFields(updated.editedFields),
    },
    actionType: "Corrección de historial",
  }, receiptNumber)
}

// Corrección de los DATOS de la cubierta (serie, marca, rodado, dibujo, código), distinta de
// la corrección de una entrada del historial: acá no hay km ni vehículo que mostrar.
export const buildEditTirePrintData = (tire, updated, formData, receiptNumber) => {
  const fields = formData.form || {}
  return withReceipt({
    tire: buildBaseTire(updated?.tire || tire),
    correction: {
      date: new Date().toLocaleDateString("es-AR"),
      reason: fields.reason,
      orderNumber: fields.orderNumber,
      kmAlta: "-",
      kmBaja: "-",
      status: (updated?.tire || tire).status,
      vehicle: (updated?.tire || tire).vehicle || defaultVehicle,
      editedFields: labelEditedFields(updated?.editedFields),
    },
    actionType: "Corrección de datos",
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
        editedFields: labelEditedFields(entry.editedFields),
      }
      : null,
  }, entry.receiptNumber)
