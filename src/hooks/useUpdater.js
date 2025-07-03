import { useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { showToast } from "@utils/toast";
import { getUpdateRules } from '@constants/settingsRules';
import { formatReleaseNotes } from '@utils/formatReleaseNotes'
import {
  showInteractiveDownloadProgress,
  updateProgressBar,
} from "@utils/updateProgress";

export const useUpdater = (setHasUpdate) => {
  const updateInfoRef = useRef(null);
  const initializedRef = useRef(false);
  const checkingRef = useRef(false);

  useEffect(() => {
    if (!window.electronAPI || initializedRef.current) return;
    initializedRef.current = true;

    const rules = getUpdateRules();
    const skip = localStorage.getItem("skipUpdateCheck") === "true";

    const onAvailable = (_, info) => {
      checkingRef.current = false;
      setHasUpdate(true);
      updateInfoRef.current = info;
    };

    const onProgress = (_, progress) => {
      showInteractiveDownloadProgress();
      updateProgressBar(progress.percent);
    };

    const onDownloaded = () => {
      // barra muestra botón "Instalar"
    };

    const onError = (_, err) => {
      checkingRef.current = false;
      const msg = typeof err === "string" ? err : err?.message || "Error desconocido";
      showToast("error", `Error de actualización: ${msg}`);
    };

    window.electronAPI.onUpdateAvailable(onAvailable);
    window.electronAPI.onUpdateProgress(onProgress);
    window.electronAPI.onUpdateDownloaded(onDownloaded);
    window.electronAPI.onUpdateError(onError);

    if (rules.autoCheckForUpdates && !skip) {
      checkingRef.current = true;
      window.electronAPI.checkForUpdates();
    }

    return () => {
      window.electronAPI.removeListener("update:available", onAvailable);
      window.electronAPI.removeListener("update:progress", onProgress);
      window.electronAPI.removeListener("update:downloaded", onDownloaded);
      window.electronAPI.removeListener("update:error", onError);
    };
  }, [setHasUpdate]);

  // Función que se ejecuta manualmente
  return () => {
    if (!updateInfoRef.current) {
      if (checkingRef.current) return;
      checkingRef.current = true;

      window.electronAPI.checkForUpdates();
      showToast("info", "Buscando actualizaciones...");
      return;
    }

    const info = updateInfoRef.current;

    Swal.fire({
      title: `Actualización lista: v${info.version}`,
      html: `
        <div style="overflow-y:auto; overflow-x:hidden; white-space:pre-line; font-size:13px; padding:5px; background:#f9f9f9; border:1px solid #ccc; border-radius:4px; text-align:left; max-height:120px;">
          ${formatReleaseNotes(info.releaseNotes)}
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
