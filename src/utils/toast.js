import Swal from "sweetalert2"

const toastColors = {
  success: { light: "#f0fdf4", dark: "#064e3b", textLight: "#065f46", textDark: "#d1fae5" },
  error: { light: "#fef2f2", dark: "#7f1d1d", textLight: "#991b1b", textDark: "#fee2e2" },
  warning: { light: "#fffbeb", dark: "#78350f", textLight: "#92400e", textDark: "#fef3c7" },
  info: { light: "#f0f9ff", dark: "#0c4a6e", textLight: "#0e7490", textDark: "#e0f2fe" },
}

export const showToast = (
  type = "success",
  message = "Operación realizada",
  { timer = 3000, progressBar = true } = {},
) => {
  const isDark = document.documentElement.classList.contains("dark")
  const colors = toastColors[type] || toastColors.success

  Swal.fire({
    toast: true,
    position: "top-end",
    icon: type,
    title: message,
    showConfirmButton: false,
    timer,
    timerProgressBar: progressBar,
    background: isDark ? colors.dark : colors.light,
    color: isDark ? colors.textDark : colors.textLight,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  })
}

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

export const showError = (title = "Error", text = "Ha ocurrido un error") =>
  Swal.fire({ icon: "error", title, text })
