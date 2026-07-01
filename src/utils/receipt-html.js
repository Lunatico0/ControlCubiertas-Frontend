import { renderComprobanteHTML } from "./receipt-template"

// Genera el HTML del comprobante para imprimir, usando el MISMO generador que el preview
// del editor (receipt-template) → lo impreso == lo previsualizado. Mapea el printData
// (datos del movimiento) a las secciones configurables del receiptDesign del tenant.
export const generateReceiptHTML = (data, layoutMode, receiptDesign = null, company = null) => {
  const tire = data?.tire || {}
  const veh = data?.vehicle || {}
  const estado = tire.status || tire.newStatus || ""
  const km = (n) => `${Number(n).toLocaleString("es-AR")} km`

  const sectionData = {
    cubierta: {
      heading: "Datos de la cubierta",
      rows: [
        { k: "N° interno", v: tire.code ?? "" },
        { k: "N° de serie", v: tire.serialNumber ?? "" },
        { k: "Marca", v: tire.brand ?? "" },
        { k: "Rodado", v: tire.size ?? "" },
        { k: "Dibujo", v: tire.pattern ?? "" },
        ...(estado ? [{ k: "Estado", v: estado }] : []),
        ...(tire.prevStatus ? [{ k: "Estado anterior", v: tire.prevStatus }] : []),
      ],
    },
    vehiculo: {
      heading: "Datos del vehículo",
      rows: veh.mobile && veh.mobile !== "Sin asignar"
        ? [
            { k: "Móvil", v: veh.mobile },
            { k: "Patente", v: veh.licensePlate ?? "—" },
            { k: "Marca", v: veh.brand ?? "—" },
            { k: "Tipo", v: veh.type ?? "—" },
          ]
        : [],
    },
    kilometraje: {
      heading: "Kilometraje",
      rows: [
        ...(data?.kmAlta != null ? [{ k: "Km al montar", v: km(data.kmAlta) }] : []),
        ...(data?.kmBaja != null ? [{ k: "Km al desmontar", v: km(data.kmBaja) }] : []),
        ...(data?.kmRecorridos != null ? [{ k: "Km recorridos", v: km(data.kmRecorridos) }] : []),
        ...(tire.kilometers != null ? [{ k: "Km totales", v: km(tire.kilometers) }] : []),
      ],
    },
    orden: {
      heading: "N° de orden",
      rows: data?.orderNumber || data?.correction?.orderNumber
        ? [{ k: "Orden", v: data.orderNumber || data.correction.orderNumber }]
        : [],
    },
  }

  // Corrección: agrega los datos al bloque de cubierta si el movimiento es una corrección.
  if (data?.correction) {
    sectionData.cubierta.rows.push({ k: "Motivo", v: data.correction.reason || "" })
    if (data.correction.editedFields) sectionData.cubierta.rows.push({ k: "Campos", v: data.correction.editedFields })
  }

  const meta = {
    numero: data?.receiptNumber || "0000-00000000",
    fecha: new Date().toLocaleDateString("es-AR"),
    tipo: data?.actionType || "",
  }
  const footer = company?.receiptFooter || "Comprobante interno de movimiento de cubiertas. Documento no válido como factura."

  const body = renderComprobanteHTML({ design: receiptDesign || {}, company: company || {}, footer, meta, sectionData })
  const styles = `<style>*{box-sizing:border-box}html,body{margin:0;padding:0}@media print{@page{size:A4;margin:12mm}}</style>`
  return `${styles}<div style="max-width:210mm;margin:0 auto;background:#ffffff">${body}</div>`
}
