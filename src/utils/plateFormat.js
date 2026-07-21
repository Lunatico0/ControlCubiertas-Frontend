// Formateo de patente para DISPLAY. La patente se GUARDA normalizada (alfanumérica, sin
// separadores — clave para el dedup); el separador es solo visual y configurable por tenant.
// Funciones PURAS: el separador se pasa como argumento (viene del contexto React → reactivo).
const SAFE = /^[-_./·: ]$/

// Normaliza el separador recibido: vacío o UN carácter seguro; cualquier otra cosa → sin separador.
const safeSep = (sep) => (typeof sep === "string" && (sep === "" || SAFE.test(sep)) ? sep : "")

// Inserta el separador en los límites letra↔número. "EEQ541" + "-" → "EEQ-541";
// "AB123CD" → "AB-123-CD". Sin separador o patente vacía → la devuelve tal cual.
export const formatPlate = (plate, sep = "") => {
  const s = safeSep(sep)
  const p = String(plate ?? "")
  if (!s || !p) return p
  return p.replace(/([A-Za-z])(\d)/g, `$1${s}$2`).replace(/(\d)([A-Za-z])/g, `$1${s}$2`)
}

// Para inputs de patente: deja SOLO alfanumérico en MAYÚSCULAS (quita separadores y símbolos).
// Es lo que se guarda; el display se arma con formatPlate sobre este valor normalizado.
export const normalizePlate = (value) => String(value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "")
