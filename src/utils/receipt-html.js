// Genera el HTML del comprobante para imprimir. Parametrizable por el diseño del tenant
// (receiptDesign) y sus datos de empresa (company). AMBOS opcionales: si no llegan, el
// comprobante sale IDÉNTICO al histórico de TMBC (defaults), así la impresión actual no
// cambia y la UI vieja no se entera. El layout A4 + línea de corte + firmas se mantiene.
export const generateReceiptHTML = (data, layoutMode, receiptDesign = null, company = null) => {
  const d = receiptDesign || {};
  const c = company || {};

  // Datos de empresa (default = TMBC histórico)
  const empresa = c.name || "TMBC";
  const direccion = c.address || "Ruta Nac. Nº 12 Km 1, Nogoyá";
  const telefono = c.phone || "03435 - 423694";
  const footer = c.receiptFooter || "Este comprobante se emite automáticamente por el sistema.";

  // Diseño (default = el de siempre). Si el tenant eligió fuente, aplica a cuerpo Y header;
  // si no, se mantiene el look actual (cuerpo Arial, header Times).
  const logoSrc = d.logo || "TMBC.png";
  const accent = d.accent || "#000000";
  const bodyFont = d.font || "Arial, sans-serif";
  const headerFont = d.font || "'Times New Roman', serif";
  const duplicado = d.duplicado !== false; // default true → ORIGINAL + DUPLICADO
  const copies = duplicado ? ["ORIGINAL", "DUPLICADO"] : ["ORIGINAL"];

  const styles = `
    <style>
      * { box-sizing: border-box; }
      body { font-family: ${bodyFont}; color: black; margin: 0; padding: 0; }
      .receipt-root { width: 100%; max-width: 210mm; margin: 0 auto; font-size: 13px; }
      .receipt-section {
        width: 100%; max-width: 180mm; min-height: 130mm; padding: 12px 16px; margin: 0 auto;
        border: 1px solid #000; display: flex; flex-direction: column; position: relative;
        background: white; page-break-inside: avoid; overflow: hidden;
      }
      .divider { border: none; border-top: 1px dashed black; width: 80%; }
      .vertical-divider { border: 1px solid black; }
      .watermark {
        position: absolute; top: 65%; left: 50%; transform: translate(-50%, -50%);
        opacity: 0.6; z-index: 0; width: 50%; text-align: center;
      }
      .watermark img { width: 100%; height: auto; }
      .content { position: relative; z-index: 10; flex-grow: 1; }
      .header { width: 100%; display: flex; justify-content: space-between; font-size: 12px; font-family: ${headerFont}; }
      .header-left { font-size: 18px; }
      .header-left p:first-child { font-size: 12px; font-weight: bold; font-family: ${headerFont}; }
      .header strong { font-family: ${headerFont}; font-size: 24px; letter-spacing: 1px; }
      .info-status strong { font-family: ${headerFont}; font-size: 18px; }
      .title { text-align: center; font-weight: bold; font-size: 15px; border-block: 2px solid ${accent}; color: ${accent}; padding: 4px 0; }
      .details { display: flex; justify-content: space-between; gap: 16px; font-size: 12px; flex-wrap: wrap; }
      .details>div { min-width: 120px; padding-block: 10px; }
      .details>div>p { padding-bottom: .5rem; margin: 0; }
      .correccion { border: 1px solid #ccc; font-size: 12px; padding-inline: 1rem; }
      .footer { font-size: 12px; margin-top: auto; border-top: 1px solid #000; padding-top: 10px; }
      .signatures { display: flex; justify-content: space-between; gap: 32px; }
      .note { font-size: 11px; }
      @media print { @page { size: A4; margin: 10mm; } }
    </style>
  `;

  const sections = copies.map(
    (type, index) => `
    <div class="receipt-section">
      <div class="watermark">
        <img src="${logoSrc}" alt="${empresa}" />
      </div>

      <div class="content">
        <div class="header">
          <div class="info">
            <p><strong>${empresa}</strong></p>
            <p>${direccion}</p>
            <p>Tel: ${telefono}</p>
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
            <p><strong>N° interno:</strong> ${data?.tire?.code || ""}</p>
            <p><strong>N° Serie:</strong> ${data?.tire?.serialNumber || ""}</p>
            <p><strong>Marca:</strong> ${data?.tire?.brand || ""}</p>
            <p><strong>Rodado:</strong> ${data?.tire?.size || ""}</p>
            <p><strong>Dibujo:</strong> ${data?.tire?.pattern || ""}</p>
            ${data?.tire?.status ? `<p><strong>Estado:</strong> ${data?.tire?.status}</p>` : `<p><strong>Estado:</strong> ${data.tire.newStatus}</p>`}
            ${data?.tire?.kilometers !== undefined ? `<p><strong>Km totales:</strong> ${data?.tire.kilometers.toLocaleString()}</p>` : ""}
          </div>
          <div>
            <p><strong>Orden:</strong> ${data?.orderNumber || data?.correction?.orderNumber || ""}</p>
            ${data?.tire.prevStatus ? `<p><strong>Estado anterior: </strong> ${data.tire.prevStatus}</p>` : ""}
            ${data?.tire.newStatus ? `<p><strong>Estado actual: </strong> ${data.tire.newStatus}</p>` : ""}
            ${data?.kmAlta ? `<p><strong>Km Alta:</strong> ${data.kmAlta.toLocaleString()} km</p>` : ""}
            ${data?.kmBaja ? `<p><strong>Km Baja:</strong> ${data.kmBaja.toLocaleString()} km</p>` : ""}
            ${data?.kmRecorridos !== undefined ? `<p><strong>Km en este viaje:</strong> ${data.kmRecorridos.toLocaleString()} km</p>` : ""}
          </div>

          ${layoutMode === "fixed" || data?.vehicle?.mobile !== 'Sin asignar' ? (`
            <div>
              <p><strong>Vehículo:</strong> ${data?.vehicle?.mobile || "Sin asignar"}</p>
              <p><strong>Marca:</strong> ${data?.vehicle?.brand || "Sin asignar"}</p>
              <p><strong>Patente:</strong> ${data?.vehicle?.licensePlate || "Sin asignar"}</p>
              <p><strong>Tipo:</strong> ${data?.vehicle?.type || "Sin asignar"}</p>
            </div>
          `) : ''}

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
        <p class="note"><strong>Nota:</strong> ${footer}</p>
      </div>
    </div>
    ${index === 0 && copies.length > 1 ? '<hr class="divider" />' : ""}
  `).join("");

  return `${styles}<div class="receipt-root">${sections}</div>`;
}
