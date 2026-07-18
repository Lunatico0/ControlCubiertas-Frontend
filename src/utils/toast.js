import { dialog, toast as pushToast } from "./dialog"

// Compatibilidad: la app usa showToast/showConfirm/showError en muchos lados. Se
// reimplementan sobre el sistema de diálogos propio (@utils/dialog + DialogHost),
// SIN SweetAlert2, manteniendo las mismas firmas para no tocar los call sites.

// type de SweetAlert (success|error|warning|info) → kind del toast (ok|danger|warn|info)
const TOAST_KIND = { success: "ok", error: "danger", warning: "warn", info: "info" }

export const showToast = (type = "success", message = "Operación realizada") => {
  pushToast(message, { kind: TOAST_KIND[type] || "ok" })
}

// Devuelve Promise<boolean> (antes result.isConfirmed). El icon queda por compatibilidad
// de firma; el diálogo propio deriva su estilo de la variante confirm.
export const showConfirm = ({
  title = "¿Estás seguro?",
  text = "Esta acción no se puede deshacer",
  icon,
  confirmButtonText = "Sí, continuar",
  cancelButtonText = "Cancelar",
} = {}) => dialog.confirm({ title, text, confirmLabel: confirmButtonText, cancelLabel: cancelButtonText })

export const showError = (title = "Error", text = "Ha ocurrido un error") =>
  dialog.notice("error", { title, text })
