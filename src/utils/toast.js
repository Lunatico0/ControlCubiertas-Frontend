import { dialog, toast as pushToast } from "./dialog"

// Compatibilidad: la app usa showToast/showConfirm/showError en muchos lados. Se
// reimplementan sobre el sistema de diálogos propio (@utils/dialog + DialogHost),
// SIN SweetAlert2, manteniendo las mismas firmas para no tocar los call sites.

// type de SweetAlert (success|error|warning|info) → kind del toast (ok|danger|warn|info)
const TOAST_KIND = { success: "ok", error: "danger", warning: "warn", info: "info" }

export const showToast = (type = "success", message = "Operación realizada") => {
  pushToast(message, { kind: TOAST_KIND[type] || "ok" })
}

// Devuelve Promise<boolean> (antes result.isConfirmed). El diálogo propio deriva su estilo
// de la variante confirm; el `icon` de SweetAlert ya no existe y se ignora si llega.
export const showConfirm = ({
  title = "¿Estás seguro?",
  text = "Esta acción no se puede deshacer",
  confirmButtonText = "Sí, continuar",
  cancelButtonText = "Cancelar",
} = {}) => dialog.confirm({ title, text, confirmLabel: confirmButtonText, cancelLabel: cancelButtonText })

// Misma firma que showConfirm, pero por la variante DESTRUCTIVA del diálogo (t103).
//
// showConfirm pinta el botón de acción con el lima primario: el mismo de "Crear usuario" y
// "Guardar cambios". Para desactivar un usuario o dar de baja una cubierta eso borra la única
// señal que el operador tiene de que la acción no es reversible sola. ART-DIRECTION asigna el
// rojo a peligro/desactivar; `ack` agrega un checkbox de confirmación cuando hace falta más.
export const showDanger = ({
  title = "¿Confirmar la baja?",
  text = "Esta acción no se puede deshacer",
  confirmButtonText = "Sí, dar de baja",
  cancelButtonText = "Cancelar",
  ack = "",
} = {}) => dialog.danger({ title, text, confirmLabel: confirmButtonText, cancelLabel: cancelButtonText, ack })

export const showError = (title = "Error", text = "Ha ocurrido un error") =>
  dialog.notice("error", { title, text })
