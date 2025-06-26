import { useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { showToast } from "@utils/toast";
import { getUpdateRules } from '@constants/settingsRules'
import {
  showInteractiveDownloadProgress,
  updateProgressBar,
} from "@utils/updateProgress";

export const useUpdater = (setHasUpdate) => {
  const updateInfoRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!window.electronAPI || initializedRef.current) return;
    initializedRef.current = true;

    const rules = getUpdateRules();

    const onAvailable = (_, info) => {
      setHasUpdate(true);
      updateInfoRef.current = info;
    };

    const onProgress = (_, progress) => {
      showInteractiveDownloadProgress();
      updateProgressBar(progress.percent);
    };

    const onDownloaded = () => {
      // Barra muestra el botón "Instalar"
    };

    const onError = (_, err) => {
      showToast("error", "Error de actualización: " + err.message);
    };

    window.electronAPI.onUpdateAvailable(onAvailable);
    window.electronAPI.onUpdateProgress(onProgress);
    window.electronAPI.onUpdateDownloaded(onDownloaded);
    window.electronAPI.onUpdateError(onError);

    // ✅ Ejecutar check solo si el setting lo permite
    if (rules.autoCheckForUpdates) {
      window.electronAPI.checkForUpdates();
    }

    return () => {
      window.electronAPI.removeListener("update:available", onAvailable);
      window.electronAPI.removeListener("update:progress", onProgress);
      window.electronAPI.removeListener("update:downloaded", onDownloaded);
      window.electronAPI.removeListener("update:error", onError);
    };
  }, [setHasUpdate]);

  // 🔘 Esta función se llama desde tu botón
  return () => {
    if (!updateInfoRef.current) {
      window.electronAPI.checkForUpdates();
      showToast("info", "Buscando actualizaciones...");
      return;
    }

    const info = updateInfoRef.current;
    const releaseNotes = typeof info.releaseNotes === "string"
      ? info.releaseNotes
      : "";

    const cleanReleaseNotes = releaseNotes
      .replace(/…+/g, '')           // elimina todos los caracteres '…'
      .replace(/(\r\n|\n|\r)+/g, ' ') // une saltos de línea con espacio
      .replace(/\s+/g, ' ')         // limpia espacios dobles
      .trim();

    Swal.fire({
      title: `Actualización lista: v${info.version}`,
      html: `
        <div style="overflow-y:auto; overflow-x:hidden; white-space:pre-line; font-size:13px; padding:5px; background:#f9f9f9; border:1px solid #ccc; border-radius:4px; text-align:left; max-height:100px;">
          ${cleanReleaseNotes.length > 0 ? cleanReleaseNotes : "Sin notas disponibles"}
        </div>
        <hr/>
        <label style="display:block; margin-top:10px;">
          <input type="checkbox" id="noShowAgain" />
          No notificar actualizaciones automáticamente
        </label>
      `,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Actualizar",
      cancelButtonText: "Más tarde",
    }).then(res => {
      const checkbox = Swal.getPopup()?.querySelector("#noShowAgain");
      if (checkbox?.checked) {
        localStorage.setItem("skipUpdateCheck", "true");
      }

      if (res.isConfirmed) {
        window.electronAPI.downloadUpdate();
      } else {
        showToast("info", "Actualización pospuesta");
      }
    });
  };
};
