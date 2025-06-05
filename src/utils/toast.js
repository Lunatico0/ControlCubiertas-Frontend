import Swal from "sweetalert2"

/**
 * Muestra una notificación toast
 * @param {string} type - Tipo de notificación (success, error, warning, info)
 * @param {string} message - Mensaje a mostrar
 * @param {Object} options - Opciones adicionales
 * @param {number} options.timer - Duración en ms (default: 3000)
 * @param {boolean} options.progressBar - Mostrar barra de progreso (default: true)
 */
export const showToast = (
  type = "success",
  message = "Operación realizada",
  { timer = 3000, progressBar = true } = {},
) => {
  // Detectar modo oscuro
  const isDark = document.documentElement.classList.contains("dark")

  // Configuración base
  const config = {
    toast: true,
    position: "top-end",
    icon: type,
    title: message,
    showConfirmButton: false,
    timer,
    timerProgressBar: progressBar,
    background: isDark ? "#1f2937" : "#ffffff",
    color: isDark ? "#f3f4f6" : "#1f2937",
  }

  // Ajustar colores según el tipo
  switch (type) {
    case "success":
      config.background = isDark ? "#064e3b" : "#f0fdf4"
      config.color = isDark ? "#d1fae5" : "#065f46"
      break
    case "error":
      config.background = isDark ? "#7f1d1d" : "#fef2f2"
      config.color = isDark ? "#fee2e2" : "#991b1b"
      break
    case "warning":
      config.background = isDark ? "#78350f" : "#fffbeb"
      config.color = isDark ? "#fef3c7" : "#92400e"
      break
    case "info":
      config.background = isDark ? "#0c4a6e" : "#f0f9ff"
      config.color = isDark ? "#e0f2fe" : "#0e7490"
      break
  }

  // Mostrar toast
  Swal.fire(config)
}

/**
 * Muestra un diálogo de confirmación
 * @param {Object} options - Opciones de configuración
 * @param {string} options.title - Título del diálogo
 * @param {string} options.text - Texto del diálogo
 * @param {string} options.icon - Icono (warning, error, success, info, question)
 * @param {string} options.confirmButtonText - Texto del botón de confirmación
 * @param {string} options.cancelButtonText - Texto del botón de cancelación
 * @returns {Promise<boolean>} True si se confirmó, false en caso contrario
 */
export const showConfirm = async ({
  title = "¿Estás seguro?",
  text = "Esta acción no se puede deshacer",
  icon = "warning",
  confirmButtonText = "Sí, continuar",
  cancelButtonText = "Cancelar",
} = {}) => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText,
    cancelButtonText,
  })

  return result.isConfirmed
}

/**
 * Muestra un diálogo de error
 * @param {string} title - Título del error
 * @param {string} text - Descripción del error
 */
export const showError = (title = "Error", text = "Ha ocurrido un error") => {
  Swal.fire({
    icon: "error",
    title,
    text,
  })
}
