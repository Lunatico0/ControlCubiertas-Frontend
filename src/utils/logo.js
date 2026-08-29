// Subida del logo del comprobante.
//
// El logo NO es un archivo estático: se persiste como dataURL en el control plane y viaja en
// CADA getCompany(), o sea en el arranque de cada operario y en el cacheo del splash del
// desktop. Una foto de 8 MB se convierte en ~11 MB de base64 que quedan ahí para siempre.
// Por eso el límite es chico y explícito, y el tipo se valida de verdad: el accept="image/*"
// del picker es una sugerencia, no una restricción.

export const LOGO_MAX_BYTES = 500 * 1024
export const LOGO_TIPOS = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"]

const enKB = (bytes) => `${Math.round(bytes / 1024)} KB`

// Devuelve null si el archivo sirve, o el mensaje de error listo para el toast.
export function validarLogo(file) {
  if (!file) return "No se seleccionó ningún archivo"
  if (!LOGO_TIPOS.includes(file.type)) {
    return "Formato no soportado. Usá PNG, JPG, WEBP o SVG."
  }
  if (file.size > LOGO_MAX_BYTES) {
    return `El logo pesa ${enKB(file.size)} y el límite es ${enKB(LOGO_MAX_BYTES)}. Reducilo antes de subirlo.`
  }
  return null
}

// Valida y lee el archivo como dataURL. Rechaza con un Error con mensaje para el usuario,
// tanto si la validación falla como si FileReader se cae (antes ese caso quedaba mudo).
export function leerLogoComoDataURL(file) {
  const error = validarLogo(file)
  if (error) return Promise.reject(new Error(error))

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error("No se pudo leer el archivo. Probá con otro."))
    reader.readAsDataURL(file)
  })
}
