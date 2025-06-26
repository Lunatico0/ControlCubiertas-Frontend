import Swal from "sweetalert2";

let progressToastOpen = false;

export const showInteractiveDownloadProgress = () => {
  if (progressToastOpen) return;
  progressToastOpen = true;

  Swal.fire({
    toast: true,
    position: "top-end",
    title: "Descargando actualización...",
    html: `
      <div style="width: 250px; margin-top:5px">
        <div id="progress-bar" style="width:0%; height:10px; background:#3085d6; transition:width 0.2s;"></div>
        <p id="progress-label" style="margin: 5px 0 0; font-size: 12px;">0%</p>
      </div>
    `,
    showConfirmButton: false,
    showCloseButton: false,
    timer: undefined,
    didOpen: () => updateProgressBar(0),
  });
};

export const updateProgressBar = (percent) => {
  const bar = document.getElementById("progress-bar");
  const label = document.getElementById("progress-label");

  if (bar && label) {
    bar.style.width = `${percent}%`;
    label.innerText = `${percent.toFixed(1)}%`;

    if (percent >= 100) {
      progressToastOpen = false;
      Swal.close();

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Descarga completa",
        html: `<button id="install-btn" class="swal2-confirm swal2-styled" style="margin-top:10px">Instalar ahora</button>`,
        showConfirmButton: false,
        showCloseButton: true,
        timer: undefined,
        didOpen: () => {
          const btn = document.getElementById("install-btn");
          if (btn) {
            btn.onclick = () => {
              window.electronAPI.installUpdate();
              Swal.close();
            };
          }
        },
      });
    }
  }
};
