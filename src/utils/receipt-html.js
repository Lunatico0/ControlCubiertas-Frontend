/**
 * Genera el HTML para un recibo imprimible
 * @param {Object} data - Datos del recibo
 * @returns {string} HTML del recibo
 */
export const generateReceiptHTML = (data) => {
  // Estilos CSS para el recibo
  const styles = `
    <style>
      .receipt-section {
        width: 100%;
        height: 148mm;
        border-bottom: 1px solid #000;
        padding: 1.5rem;
        position: relative;
        display: flex;
        flex-direction: column;
        page-break-inside: avoid;
      }
      .watermark {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        opacity: 0.1;
        z-index: 0;
      }
      .watermark-image {
        width: 50%;
      }
      .content {
        position: relative;
        z-index: 1;
        flex-grow: 1;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.5rem;
      }
      .company-info, .receipt-info {
        font-size: 0.75rem;
      }
      .title {
        text-align: center;
        font-weight: bold;
        text-decoration: underline;
        margin: 0.5rem 0;
      }
      .details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        font-size: 0.75rem;
      }
      .footer {
        position: relative;
        z-index: 1;
        margin-top: auto;
      }
      .signatures {
        display: flex;
        justify-content: space-between;
        margin-top: 1.5rem;
        font-size: 0.75rem;
      }
      .note {
        margin-top: 2rem;
        border-top: 1px solid #ccc;
        padding-top: 0.25rem;
        font-size: 0.75rem;
      }
      @media print {
        body { margin: 0; padding: 0; }
        @page { size: auto; margin: 10mm; }
      }
    </style>
  `

  // Generar secciones (original y duplicado)
  const sections = ["ORIGINAL", "DUPLICADO"]
    .map(
      (type) => `
      <div class="receipt-section">
        <div class="watermark">
          <img
            src="TMBC.png"
            alt="Marca de agua TMBC"
            class="watermark-image"
          />
        </div>

        <div class="content">
          <div class="header">
            <div class="company-info">
              <p>TMBC</p>
              <p>Ruta Nac. Nº 12 Km 1, Nogoyá</p>
              <p>Tel: 03435 - 423694</p>
            </div>
            <div class="receipt-info">
              <p><strong>${type}</strong></p>
              <p>Recibo Nº: ${data?.receiptNumber || "0000-00000000"}</p>
              <p>Fecha: ${new Date().toLocaleDateString("es-AR")}</p>
            </div>
          </div>

          <p class="title">COMPROBANTE</p>

          <div class="details">
            <div>
              <p><strong>Cubierta:</strong> #${data?.tire?.code || ""}</p>
              <p><strong>N° Serie:</strong> ${data?.tire?.serialNumber || ""}</p>
              <p><strong>Marca:</strong> ${data?.tire?.brand || ""}</p>
              <p><strong>Dibujo:</strong> ${data?.tire?.pattern || ""}</p>

              ${data?.tire?.status ? `<p><strong>Estado:</strong> ${data?.tire?.status}</p>` : ""}

              ${data?.tire?.kilometers !== undefined
          ? `<p><strong>Km recorridos totales:</strong> ${data?.tire?.kilometers.toLocaleString() || "0"}</p>`
          : ""
        }
            </div>
            <div>
              <p><strong>Orden:</strong> ${data?.orderNumber || data?.correction?.orderNumber || ""}</p>
              <p><strong>Acción:</strong> ${data?.actionType || ""}</p>

              ${renderStatusChanges(data)}
              ${renderKmInfo(data)}
            </div>
            <div>
              <p><strong>Vehículo:</strong> ${data?.vehicle?.mobile || "Sin asignar"}</p>
              <p><strong>Patente:</strong> ${data?.vehicle?.licensePlate || "Sin asignar"}</p>
            </div>
          </div>

          ${renderCorrectionInfo(data)}
        </div>

        <div class="footer">
          <div class="signatures">
            <p>Firma Responsable: ___________________________</p>
            <p>Firma Chofer: ___________________________</p>
          </div>
          <p class="note">
            <strong>Nota:</strong> Este comprobante se emite automáticamente por el sistema.
          </p>
        </div>
      </div>`,)
    .join("")

  return `${styles}${sections}`
}

/**
 * Renderiza información de cambios de estado
 * @param {Object} data - Datos del recibo
 * @returns {string} HTML con información de cambios de estado
 */
const renderStatusChanges = (data) => {
  const status = data?.tire?.status || "Sin estado"
  const prev = data?.tire?.prevStatus
  const next = data?.tire?.newStatus

  if (prev && next) {
    return `
      <p><strong>Estado anterior:</strong> ${prev}</p>
      <p><strong>Estado actual:</strong> ${next}</p>
    `
  }

  if (prev && !next) {
    return `<p><strong>Estado anterior:</strong> ${prev}</p>`
  }

  return ""
}

/**
 * Renderiza información de kilometraje
 * @param {Object} data - Datos del recibo
 * @returns {string} HTML con información de kilometraje
 */
const renderKmInfo = (data) => {
  if (data?.kmAlta) {
    return `<p class="km-recorridos"><strong>Km Alta:</strong> ${data.kmAlta.toLocaleString()} km</p>`
  }

  if (data?.kmBaja) {
    return `
      <p class="km-recorridos"><strong>Km Baja:</strong> ${data.kmBaja.toLocaleString()} km</p>
      ${data.kmRecorridos !== undefined
        ? `<p class="km-recorridos"><strong>Km en este viaje:</strong> ${data.kmRecorridos.toLocaleString()} km</p>`
        : ""
      }
    `
  }

  return ""
}

/**
 * Renderiza información de corrección
 * @param {Object} data - Datos del recibo
 * @returns {string} HTML con información de corrección
 */
const renderCorrectionInfo = (data) => {
  if (!data?.correction) return ""

  return `
    <div style="margin-top: 0.5rem; padding: 0.5rem; border: 1px solid #ccc; border-radius: 0.25rem; font-size: 0.75rem;">
      <p style="font-weight: bold;">Detalles de la corrección:</p>
      <p><strong>Motivo:</strong> ${data.correction.reason || ""}</p>
      ${data.correction.editedFields ? `<p><strong>Campos editados:</strong> ${data.correction.editedFields}</p>` : ""}
    </div>
  `
}
