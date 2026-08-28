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

// ---------------------------------------------------------------------------------------
// Validación de FORMATO (t138). El backend es la autoridad (utils/plate.js allá), pero el
// front valida igual para no gastar un round-trip en un error de tipeo y para mostrar el
// error AL LADO del campo en vez de como toast.
//
// Las máscaras se escriben con A (letra) y 0 (dígito) y se validan sobre la forma canónica,
// así que el separador de la máscara no importa. Configurables por tenant: la lista vacía
// apaga la validación (flotas con chapas extranjeras).
export const PLATE_FORMATS_AR = ["AAA000", "AA000AA", "A000AAA", "000AAA"]

const regexDeMascara = (mascara) => {
  const cuerpo = String(mascara || "")
    .toUpperCase()
    .split("")
    .map((c) => (c === "A" ? "[A-Z]" : c === "0" ? "[0-9]" : ""))
    .join("")
  return cuerpo ? new RegExp(`^${cuerpo}$`) : null
}

export const isValidPlate = (value, formatos) => {
  const lista = Array.isArray(formatos) ? formatos.map(regexDeMascara).filter(Boolean) : []
  if (!lista.length) return true
  const canonica = normalizePlate(value)
  return lista.some((re) => re.test(canonica))
}

// Los formatos escritos como los vería el operario, con el separador configurado del tenant.
// Es lo que va en el mensaje de error: "AAA-000, AA-000-AA" se entiende, "^[A-Z]{3}..." no.
export const describirFormatos = (formatos, sep = "") =>
  (Array.isArray(formatos) ? formatos : []).filter(Boolean).map((m) => formatPlate(m, sep)).join(", ")
