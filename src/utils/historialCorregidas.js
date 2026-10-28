// Entradas de historial corregidas o deshechas (S6 de la auditoría).
//
// Desde S6 el backend ya no reetiqueta "Corrección-*" la entrada original: conserva su tipo y
// queda marcada con flag + correctedAt. Qué entrada la corrige se sabe por el `corrects` de la
// entrada nueva. `flag` solo no sirve para distinguirlas: la entrada que corrige (y la que
// deshace) también lleva flag: true. El criterio es el mismo de recalculateTireState en el
// backend: una entrada queda fuera del estado vigente si OTRA entrada la `corrects`.

// Id de una ref que puede venir populada ({ _id }) o cruda (string). getById la popula.
const idDe = (ref) => (ref ? String(ref._id ?? ref) : null)

// Ids de las entradas que alguna otra entrada corrige.
export const idsCorregidos = (history = []) =>
  new Set(history.map((h) => idDe(h.corrects)).filter(Boolean))

export const fueCorregida = (entry, corregidos) => corregidos.has(idDe(entry?._id))

// Las entradas que cuentan para el estado vigente de la cubierta, en el mismo orden.
export const entradasVigentes = (history = []) => {
  const corregidos = idsCorregidos(history)
  return history.filter((h) => !fueCorregida(h, corregidos))
}

// Prefijo "Corrección-" de los tipos de las entradas que corrigen (y de datos previos a S6).
export const esTipoCorreccion = (type) => /^correcc/i.test(type || "")

// La original de un Deshacer queda con editedFields ["Deshacer entrada"] (undoHistoryEntry).
export const fueDeshecha = (entry) => (entry?.editedFields || []).includes("Deshacer entrada")
