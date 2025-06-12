export const generateReceiptHTML = (data) => {
  const styles = `
    <style>
      * {
          box-sizing: border-box;
        }

        body {
          font-family: Arial, sans-serif;
          color: black;
          margin: 0;
          padding: 0;
        }

        .receipt-root {
          width: 100%;
          max-width: 210mm;
          margin: 0 auto;
          font-size: 13px;
        }

        .receipt-section {
          width: 100%;
          max-width: 180mm;
          min-height: 130mm;
          padding: 12px 16px;
          margin: 0 auto;
          border: 1px solid #000;
          display: flex;
          flex-direction: column;
          position: relative;
          background: white;
          page-break-inside: avoid;
          overflow: hidden;
        }

        .divider {
          border: none;
          border-top: 1px dashed black;
          width: 80%;
        }

        .vertical-divider {
          border: 1px solid black;
        }

        .watermark {
          position: absolute;
          top: 65%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.6;
          z-index: 0;
          width: 50%;
          text-align: center;
        }

        .watermark img {
          width: 100%;
          height: auto;
        }

        .content {
          position: relative;
          z-index: 10;
          flex-grow: 1;
        }

        .header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          font-family: serif;
        }

        .header-left {
          font-size: 18px;
        }

        .header-left p:first-child {
          font-size: 12px;
          font-weight: bold;
          font-family: "Times New Roman", serif;
        }

        .header strong {
          font-family: 'Times New Roman', serif;
          font-size: 24px;
          letter-spacing: 1px;
        }

        .info-status strong {
          font-family: 'Times New Roman', serif;
          font-size: 18px;
        }

        .title {
          text-align: center;
          font-weight: bold;
          font-size: 15px;
          border-block: 2px solid black;
          padding: 4px 0;
        }

        .details {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          font-size: 12px;
          flex-wrap: wrap;
        }

        .details>div {
          min-width: 120px;
          padding-block: 10px;
        }

        .details>div>p {
          padding-bottom: .5rem;
          margin: 0;
        }

        .correccion {
          border: 1px solid #ccc;
          font-size: 12px;
          padding-inline: 1rem;
        }

        .footer {
          font-size: 12px;
          margin-top: auto;
          border-top: 1px solid #000;
          padding-top: 10px;
        }

        .signatures {
          display: flex;
          justify-content: space-between;
          gap: 32px;
        }

        .note {
          font-size: 11px;
        }

        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
        }
    </style>
  `;

  const sections = ["ORIGINAL", "DUPLICADO"].map(
    (type, index) => `
    <div class="receipt-section">
      <div class="watermark">
        <img src="TMBC.png" alt="Marca de agua TMBC" />
      </div>

      <div class="content">
        <div class="header">
          <div class="info">
            <p><strong>TMBC</strong></p>
            <p>Ruta Nac. Nº 12 Km 1, Nogoyá</p>
            <p>Tel: 03435 - 423694</p>
          </div>
          <div class="vertical-divider"></div>
          <div class="info-status">
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
            ${data?.tire?.kilometers !== undefined ? `<p><strong>Km totales:</strong> ${data?.tire.kilometers.toLocaleString()}</p>` : ""}
          </div>
          <div>
            <p><strong>Orden:</strong> ${data?.orderNumber || data?.correction?.orderNumber || ""}</p>
            <p><strong>Acción:</strong> ${data?.actionType || ""}</p>
            ${data?.tire?.prevStatus ? `<p><strong>Estado anterior:</strong> ${data.tire.prevStatus}</p>` : ""}
            ${data?.tire?.newStatus ? `<p><strong>Estado actual:</strong> ${data.tire.newStatus}</p>` : ""}
            ${data?.kmAlta ? `<p><strong>Km Alta:</strong> ${data.kmAlta.toLocaleString()} km</p>` : ""}
            ${data?.kmBaja ? `<p><strong>Km Baja:</strong> ${data.kmBaja.toLocaleString()} km</p>` : ""}
            ${data?.kmRecorridos !== undefined ? `<p><strong>Km en este viaje:</strong> ${data.kmRecorridos.toLocaleString()} km</p>` : ""}
          </div>
          <div>
            <p><strong>Vehículo:</strong> ${data?.vehicle?.mobile || "Sin asignar"}</p>
            <p><strong>Patente:</strong> ${data?.vehicle?.licensePlate || "Sin asignar"}</p>
          </div>
        </div>

        ${data?.correction ? `
          <div class="correccion">
            <p><strong>Motivo:</strong> ${data.correction.reason || ""}</p>
            ${data.correction.editedFields ? `<p><strong>Campos editados:</strong> ${data.correction.editedFields}</p>` : ""}
          </div>` : ""}
      </div>

      <div class="footer">
        <div class="signatures">
          <p>Firma Responsable: ___________________________</p>
          <p>Firma Chofer: ___________________________</p>
        </div>
        <p class="note"><strong>Nota:</strong> Este comprobante se emite automáticamente por el sistema.</p>
      </div>
    </div>
    ${index === 0 ? '<hr class="divider" />' : ""}
  `).join("");

  return `${styles}<div class="receipt-root">${sections}</div>`;
}
