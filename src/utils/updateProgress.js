import Swal from "sweetalert2"

let progressModalOpen = false;

export const showInteractiveDownloadProgress = () => {
  if (progressModalOpen) return;
  progressModalOpen = true;

  Swal.fire({
    title: "Descargando actualización...",
    html: `
      <div id="progress-container" style="margin-top:10px;">
        <div id="progress-bar"
             style="width: 0%; background-color:#3085d6; height: 10px; transition: width 0.2s;"></div>
        <p id="progress-label" style="margin-top: 8px;">0%</p>
      </div>
    `,
    showConfirmButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    backdrop: true,
    didOpen: () => updateProgressBar(0),
  });
};

export const updateProgressBar = (percent) => {
  const bar = document.getElementById("progress-bar");
  const label = document.getElementById("progress-label");

  if (bar && label) {
    bar.style.width = `${percent}%`;
    label.innerText = `${percent.toFixed(1)}%`;

    // Si llegó al 100% mostramos botón "Instalar"
    if (percent >= 100) {
      Swal.update({
        title: "Actualización lista",
        html: `
          <p>La descarga ha finalizado. ¿Deseás instalar ahora?</p>
          <button id="install-now-btn" class="swal2-confirm swal2-styled" style="display:block; margin:10px auto 0">
            Instalar ahora
          </button>
        `,
        showConfirmButton: false,
      });

      // Atamos el botón para instalar
      setTimeout(() => {
        const btn = document.getElementById("install-now-btn");
        if (btn) {
          btn.onclick = () => {
            window.electronAPI.installUpdate();
            Swal.close();
            progressModalOpen = false;
          };
        }
      }, 50);
    }
  }
};

export const closeDownloadProgress = () => {
  if (progressModalOpen) {
    Swal.close();
    progressModalOpen = false;
  }
};
