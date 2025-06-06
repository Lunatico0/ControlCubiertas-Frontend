import Swal from "sweetalert2"

let progressModalOpen = false

export const showDownloadProgress = (initialPercent = 0) => {
  if (progressModalOpen) return

  progressModalOpen = true

  Swal.fire({
    title: "Descargando actualización...",
    html: `<div id="progress-container">
             <div id="progress-bar" style="width:${initialPercent}%; background-color:#3085d6; height:10px;"></div>
           </div>
           <p id="progress-label">${initialPercent.toFixed(1)}%</p>`,
    showConfirmButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    backdrop: true,
    didOpen: () => {
      updateProgressBar(initialPercent)
    }
  })
}

export const updateProgressBar = (percent) => {
  const bar = document.getElementById("progress-bar")
  const label = document.getElementById("progress-label")
  if (bar) bar.style.width = `${percent}%`
  if (label) label.innerText = `${percent.toFixed(1)}%`
}

export const closeDownloadProgress = () => {
  if (progressModalOpen) {
    Swal.close()
    progressModalOpen = false
  }
}
