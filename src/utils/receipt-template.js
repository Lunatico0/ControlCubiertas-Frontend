// Generador ÚNICO del HTML del comprobante. Fuente de verdad compartida por el editor
// (preview en vivo) y la impresión real → lo que se previsualiza es exactamente lo que
// se imprime. Parametrizado por el receiptDesign del tenant + sus datos de empresa.
// NO hay marca hardcodeada: sin logo configurado se muestra un placeholder, nunca una marca fija.

const FS = {
  S: { base: "10px", h1: "15px", h2: "14px", label: "8.5px", small: "8.5px" },
  M: { base: "11.5px", h1: "18px", h2: "16px", label: "9.5px", small: "9.5px" },
  L: { base: "13px", h1: "21px", h2: "18px", label: "10.5px", small: "10.5px" },
}
const LOGO_H = { S: "30px", M: "44px", L: "60px" }
const LOGO_W = { S: "80px", M: "110px", L: "150px" }
const DEFAULT_SECTIONS = [
  { key: "cubierta", label: "Datos de la cubierta", on: true },
  { key: "vehiculo", label: "Datos del vehículo", on: true },
  { key: "kilometraje", label: "Kilometraje", on: true },
  { key: "orden", label: "N° de orden", on: true },
]

// Escapa texto para interpolar seguro en el HTML (datos de empresa/movimiento).
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]))

// Devuelve el HTML de las "copias" del comprobante (original [+ duplicado]) — el mismo
// markup que el preview del editor. Envolver en un contenedor blanco para mostrar/imprimir.
// design: receiptDesign; company: {name,cuit,phone,address}; footer; meta:{numero,fecha,tipo}
// sectionData: { [key]: { heading, rows: [{k,v}] } }
export function renderComprobanteHTML({ design = {}, company = {}, footer = "", meta = {}, sectionData = {} }) {
  const accent = design.accent || "#1F7A43"
  const font = design.font || "'Space Grotesk', sans-serif"
  const fs = FS[design.textSize] || FS.M
  const align = design.align === "center" ? "center" : "left"
  const headerAlign = align === "center" ? "center" : "flex-start"
  const logoJustify = { left: "flex-start", center: "center", right: "flex-end" }[design.logoPos] || "flex-start"
  const logoH = LOGO_H[design.logoSize] || LOGO_H.M
  const logoW = LOGO_W[design.logoSize] || LOGO_W.M
  const showHeader = design.showHeader !== false
  const duplicado = design.duplicado !== false
  const sections = (design.sections && design.sections.length ? design.sections : DEFAULT_SECTIONS).filter((s) => s.on)

  // Con duplicado, las dos copias deben entrar en UNA hoja A4 → padding compacto.
  const copies = duplicado
    ? [{ label: "ORIGINAL", cut: false, padTop: "18px", labelTop: "12px" }, { label: "DUPLICADO", cut: true, padTop: "26px", labelTop: "26px" }]
    : [{ label: "ORIGINAL", cut: false, padTop: "22px", labelTop: "16px" }]

  const headerHTML = showHeader ? `
    <div style="display:flex;flex-direction:column;align-items:${headerAlign};gap:6px;margin-bottom:9px;width:100%">
      <div style="display:flex;width:100%;justify-content:${logoJustify}">
        ${design.logo
          ? `<img src="${design.logo}" alt="logo" style="height:${logoH};max-width:240px;object-fit:contain" />`
          : `<div style="height:${logoH};width:${logoW};border:1.5px dashed #CFCFCF;border-radius:5px;display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono';font-size:10px;color:#BBBBBB;letter-spacing:.1em">LOGO</div>`}
      </div>
      <div style="width:100%;text-align:${align}">
        <div style="font-size:${fs.h1};font-weight:700;color:#16181A;letter-spacing:-.01em">${esc(company.name) || "Tu empresa"}</div>
        <div style="font-size:${fs.small};color:#5C6066;line-height:1.5;margin-top:2px">CUIT ${esc(company.cuit) || "—"} · Tel ${esc(company.phone) || "—"}<br/>${esc(company.address) || "—"}</div>
      </div>
    </div>` : ""

  const sectionsHTML = sections.map((s) => {
    const sd = sectionData[s.key]
    if (!sd || !sd.rows || !sd.rows.length) return ""
    return `<div style="margin-bottom:9px">
      <div style="font-size:${fs.label};font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:${accent};margin-bottom:4px">${esc(sd.heading || s.label)}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 22px">
        ${sd.rows.map((r) => `<div style="display:flex;justify-content:space-between;gap:10px;font-size:${fs.base};border-bottom:1px dotted #D8D8D8;padding:2.5px 0"><span style="color:#6A6E72">${esc(r.k)}</span><span style="color:#16181A;font-weight:600;text-align:right">${esc(r.v)}</span></div>`).join("")}
      </div>
    </div>`
  }).join("")

  const copyHTML = (copy) => `
    <div style="position:relative;padding:${copy.padTop} 32px 16px 32px;font-family:${font};color:#16181A;break-inside:avoid;page-break-inside:avoid">
      ${copy.cut ? `<div style="position:absolute;top:0;left:0;right:0;display:flex;align-items:center;gap:9px;padding:0 16px;transform:translateY(-50%)"><div style="flex:1;border-top:1.5px dashed #BFBFBF"></div><span style="font-size:8.5px;font-family:'IBM Plex Mono';color:#AAAAAA;letter-spacing:.08em">CORTAR AQUÍ</span><div style="flex:1;border-top:1.5px dashed #BFBFBF"></div></div>` : ""}
      <div style="position:absolute;top:${copy.labelTop};right:32px;font-family:'IBM Plex Mono';font-size:8.5px;letter-spacing:.12em;color:${accent};border:1px solid ${accent};padding:2px 8px;border-radius:4px">${copy.label}</div>
      ${headerHTML}
      <div style="height:2.5px;background:${accent};border-radius:2px;margin-bottom:9px"></div>
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:10px">
        <div><div style="font-size:${fs.small};font-family:'IBM Plex Mono';color:#8A8E92;letter-spacing:.04em">COMPROBANTE N°</div><div style="font-size:${fs.h2};font-weight:700;color:#16181A;font-family:'IBM Plex Mono';margin-top:1px">${esc(meta.numero) || "0000-00000000"}</div></div>
        <div style="text-align:right"><div style="font-size:${fs.small};color:#8A8E92">Fecha: <span style="color:#16181A;font-weight:600">${esc(meta.fecha)}</span></div>${meta.tipo ? `<span style="display:inline-block;margin-top:5px;font-size:${fs.small};font-weight:700;color:#FFFFFF;background:${accent};padding:3px 11px;border-radius:5px;letter-spacing:.02em">${esc(meta.tipo)}</span>` : ""}</div>
      </div>
      ${sectionsHTML}
      <div style="margin-top:10px;padding-top:7px;border-top:1px solid #E4E4E4;font-size:${fs.small};color:#7A7E82;line-height:1.45;text-align:${align}">${esc(footer)}</div>
    </div>`

  return copies.map((c) => copyHTML(c)).join("")
}
