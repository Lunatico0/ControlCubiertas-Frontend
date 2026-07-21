// Separador de patente configurable por tenant (SOLO display: la patente se guarda normalizada,
// alfanumérica y sin separadores, para el dedup). Se setea desde ApiProvider al cargar la empresa;
// formatPlate lo lee del módulo (evita prop-drilling — mismo patrón que el catálogo de estados).
const SAFE = /^[-_.\/·: ]$/
let _sep = ""

export const setPlateSeparator = (sep) => {
  _sep = typeof sep === "string" && (sep === "" || SAFE.test(sep)) ? sep : ""
}

// Inserta el separador en los límites letra↔número. Ej: "EEQ541" + "-" → "EEQ-541";
// "AB123CD" → "AB-123-CD". Sin separador o patente vacía → la devuelve tal cual.
export const formatPlate = (plate) => {
  const p = String(plate ?? "")
  if (!_sep || !p) return p
  return p.replace(/([A-Za-z])(\d)/g, `$1${_sep}$2`).replace(/(\d)([A-Za-z])/g, `$1${_sep}$2`)
}
