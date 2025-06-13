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

    const handleUpdateAvailable = (_, info) => {
      window.electronAPI.log?.info?.(`🔔 Update available: v${info.version}`)
    }

    const handleUpdateProgress = (_, progress) => {
      window.electronAPI.log?.info?.(`📦 Progreso: ${progress.percent.toFixed(2)}%`)
      updateProgressBar(progress.percent)
    }

    const handleUpdateDownloaded = (_, info) => {
      closeDownloadProgress()
      window.electronAPI.log?.info?.(`✅ Descarga completada: v${info.version}`)

      Swal.fire({
        title: "Actualización lista",
        text: "La nueva versión se descargó correctamente. ¿Deseas reiniciar para instalarla?",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Instalar ahora",
        cancelButtonText: "Después",
      }).then((result) => {
        if (result.isConfirmed) {
          window.electronAPI.log?.info?.("🔁 Reinicio iniciado para instalar update")
          window.electronAPI.installUpdate()
        } else {
          showToast("info", "Puedes instalarla cuando cierres y abras la app.")
          window.electronAPI.log?.info?.("⏸️ Instalación postergada por el usuario")
        }
      })
    }

    window.electronAPI.onUpdateAvailable(handleUpdateAvailable)
    window.electronAPI.onUpdateProgress(handleUpdateProgress)
    window.electronAPI.onUpdateDownloaded(handleUpdateDownloaded)

    return () => {
      window.electronAPI.removeListener("onUpdateAvailable", handleUpdateAvailable)
      window.electronAPI.removeListener("onUpdateProgress", handleUpdateProgress)
      window.electronAPI.removeListener("onUpdateDownloaded", handleUpdateDownloaded)
    }
  }, [])
}
