import { useEffect } from "react"
import Swal from "sweetalert2"
import { showToast } from "@utils/toast"
import {
  showDownloadProgress,
  updateProgressBar,
  closeDownloadProgress
} from "@utils/updateProgress"

export const useUpdater = () => {
  useEffect(() => {
    if (!window.electronAPI) return

    window.electronAPI.onUpdateAvailable((_, info) => {
      Swal.fire({
        title: "Actualización disponible",
        text: `Hay una nueva versión (${info.version}) disponible. ¿Deseas instalarla ahora?`,
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Actualizar",
        cancelButtonText: "Recordar más tarde",
      }).then((result) => {
        if (result.isConfirmed) {
          showDownloadProgress(0)
        }
      })
    })

    window.electronAPI.onUpdateProgress((_, progress) => {
      updateProgressBar(progress.percent)
    })

    window.electronAPI.onUpdateDownloaded((_, info) => {
      closeDownloadProgress()

      Swal.fire({
        title: "Actualización lista",
        text: "La nueva versión se descargó correctamente. ¿Deseas reiniciar para instalarla?",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Instalar ahora",
        cancelButtonText: "Después",
      }).then((result) => {
        if (result.isConfirmed) {
          window.electronAPI.installUpdate()
        } else {
          showToast("info", "Puedes instalarla cuando cierres y abras la app.")
        }
      })
    })
  }, [])
}
