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

import { tintaSobre } from "./contrast"

// Escapa texto para interpolar seguro en el HTML (datos de empresa/movimiento).
// Incluye la comilla simple: algunos atributos del comprobante la usan.
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]))

// ─── Saneo del receiptDesign ────────────────────────────────────────────────────────────────
// `accent`, `font` y `logo` NO son texto: se interpolan dentro de atributos (`style="…"`,
// `src="…"`), donde escapar no alcanza — un valor como `red" onmouseover="…` cierra el atributo
// y agrega un handler. Y el receiptDesign lo escribe el tenant-admin pero lo renderizan TODOS
// los operarios al imprimir (con dangerouslySetInnerHTML), así que un admin podía ejecutar
// código en la sesión de cualquier operario de su empresa.
//
// Por eso cada uno se valida contra su forma esperada y, si no encaja, se cae al default.
// El escapado queda igual como segunda barrera.
// Rampa de grises del comprobante. Cuatro pasos, todos medidos contra BLANCO (el papel), todos
// por encima de 4.5:1. Antes había once grises literales y cuatro de ellos no llegaban a AA:
// "LOGO" 1.92:1, "CORTAR AQUÍ" 2.32:1, "COMPROBANTE N°" 3.30:1 y el pie 4.09:1. En pantalla se
// disimula subiendo el brillo; en papel simplemente no se lee.
const TINTA = {
  fuerte: "#16181A", //  16.8:1  datos y títulos
  media: "#4A4E52",  //   8.5:1  etiquetas de campo
  suave: "#5F6367",  //   6.2:1  texto secundario y el pie
  debil: "#6E7276",  //   5.1:1  el gris MÁS claro admitido para texto
}
// Líneas y bordes: son decoración, no texto, así que no les aplica el 4.5:1.
const LINEA = { punteada: "#C9C9C9", solida: "#DDDDDD", corte: "#9AA0A4" }

// Radios del PAPEL. Son más chicos que los de la app (--r-sm/md/lg = 6/10/14) a propósito: el
// comprobante se imprime a tamaño físico y un radio de 14px que en pantalla se lee "moderno",
// en papel se lee deformado. Lo que NO se admite es que sean ad-hoc, que era el caso: acá están
// declarados, son dos, y esta constante es el único lugar donde se tocan.
const RADIO = { chico: "3px", medio: "5px" }

const ACCENT_DEFAULT = "#1F7A43"
const FONT_DEFAULT = "'Space Grotesk', sans-serif"

// Sólo un color hexadecimal. Los presets del editor son 5 hex; dejamos la forma abierta por si
// más adelante hay un selector libre, pero nada que no sea un hex entra.
const safeAccent = (v) => (/^#[0-9a-fA-F]{3,8}$/.test(String(v ?? "")) ? String(v) : ACCENT_DEFAULT)

// Una font-family es una lista de nombres: letras, dígitos, espacios, comas, guiones y comillas.
// Cualquier otra cosa (paréntesis, punto y coma, `<`, `>`) es un intento de salirse del atributo.
const safeFont = (v) => (/^[\w\s,'"-]{1,120}$/.test(String(v ?? "")) ? String(v) : FONT_DEFAULT)

// El logo se guarda como dataURL desde el editor. Se aceptan además URLs https por si en algún
// momento se migra a storage de assets. Todo lo demás se descarta (sin logo → placeholder).
const safeLogo = (v) => {
  const s = String(v ?? "").trim()
  if (!s) return null
  return /^data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=\s]+$/i.test(s) || /^https:\/\/[^\s"'<>]+$/i.test(s) ? s : null
}

// Devuelve el HTML de las "copias" del comprobante (original [+ duplicado]) — el mismo
// markup que el preview del editor. Envolver en un contenedor blanco para mostrar/imprimir.
// design: receiptDesign; company: {name,cuit,phone,address}; footer; meta:{numero,fecha,tipo}
// sectionData: { [key]: { heading, rows: [{k,v}] } }
export function renderComprobanteHTML({ design = {}, company = {}, footer = "", meta = {}, sectionData = {} }) {
  // t123: la cabecera rellenaba los campos vacíos con un guión, y sin ningún dato de contacto
  // quedaba "CUIT — · Tel ——" en la pieza que el cliente recibe en la mano: tres guiones
  // sueltos se leen como un error de impresión, no como "sin dato". Un campo vacío se OMITE, y
  // si no queda ninguno, la línea entera no se renderiza.
  const contacto = (() => {
    const inline = [
      company.cuit && `CUIT ${esc(company.cuit)}`,
      company.phone && `Tel ${esc(company.phone)}`,
    ].filter(Boolean).join(" · ")
    const dir = company.address ? esc(company.address) : ""
    return [inline, dir].filter(Boolean).join("<br/>")
  })()
  const accent = safeAccent(design.accent)
  const font = safeFont(design.font)
  const logo = safeLogo(design.logo)
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
        ${logo
          ? `<img src="${esc(logo)}" alt="logo" style="height:${logoH};max-width:240px;object-fit:contain" />`
          : `<div style="height:${logoH};width:${logoW};border:1.5px dashed ${LINEA.corte};border-radius:${RADIO.medio};display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono';font-size:10px;color:${TINTA.debil};letter-spacing:.1em">LOGO</div>`}
      </div>
      <div style="width:100%;text-align:${align}">
        <div style="font-size:${fs.h1};font-weight:700;color:${TINTA.fuerte};letter-spacing:-.01em">${esc(company.name) || "Tu empresa"}</div>
        ${contacto ? `<div style="font-size:${fs.small};color:${TINTA.media};line-height:1.5;margin-top:2px">${contacto}</div>` : ""}
      </div>
    </div>` : ""

  const sectionsHTML = sections.map((s) => {
    const sd = sectionData[s.key]
    if (!sd || !sd.rows || !sd.rows.length) return ""
    return `<div style="margin-bottom:9px">
      <div style="font-size:${fs.label};font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:${accent};margin-bottom:4px">${esc(sd.heading || s.label)}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 22px">
        ${sd.rows.map((r) => `<div style="display:flex;justify-content:space-between;gap:10px;font-size:${fs.base};border-bottom:1px dotted ${LINEA.punteada};padding:2.5px 0"><span style="color:${TINTA.media}">${esc(r.k)}</span><span style="color:${TINTA.fuerte};font-weight:600;text-align:right;font-family:'IBM Plex Mono';font-variant-numeric:tabular-nums">${esc(r.v)}</span></div>`).join("")}
      </div>
    </div>`
  }).join("")

  const copyHTML = (copy) => `
    <div style="position:relative;padding:${copy.padTop} 32px 16px 32px;font-family:${font};color:${TINTA.fuerte};break-inside:avoid;page-break-inside:avoid">
      ${copy.cut ? `<div style="position:absolute;top:0;left:0;right:0;display:flex;align-items:center;gap:9px;padding:0 16px;transform:translateY(-50%)"><div style="flex:1;border-top:1.5px dashed ${LINEA.corte}"></div><span style="font-size:8.5px;font-family:'IBM Plex Mono';color:${TINTA.suave};letter-spacing:.08em">CORTAR AQUÍ</span><div style="flex:1;border-top:1.5px dashed ${LINEA.corte}"></div></div>` : ""}
      <div style="position:absolute;top:${copy.labelTop};right:32px;font-family:'IBM Plex Mono';font-size:8.5px;letter-spacing:.12em;color:${accent};border:1px solid ${accent};padding:2px 8px;border-radius:${RADIO.chico}">${copy.label}</div>
      ${headerHTML}
      <div style="height:2.5px;background:${accent};border-radius:${RADIO.chico};margin-bottom:9px"></div>
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:10px">
        <div><div style="font-size:${fs.small};font-family:'IBM Plex Mono';color:${TINTA.suave};letter-spacing:.04em">COMPROBANTE N°</div><div style="font-size:${fs.h2};font-weight:700;color:${TINTA.fuerte};font-family:'IBM Plex Mono';margin-top:1px">${esc(meta.numero) || "0000-00000000"}</div></div>
        <div style="text-align:right"><div style="font-size:${fs.small};color:${TINTA.suave}">Fecha: <span style="color:${TINTA.fuerte};font-weight:600">${esc(meta.fecha)}</span></div>${meta.tipo ? `<span style="display:inline-block;margin-top:5px;font-size:${fs.small};font-weight:700;color:${tintaSobre(accent)};background:${accent};padding:3px 11px;border-radius:${RADIO.medio};letter-spacing:.02em">${esc(meta.tipo)}</span>` : ""}</div>
      </div>
      ${sectionsHTML}
      <div style="margin-top:10px;padding-top:7px;border-top:1px solid ${LINEA.solida};font-size:${fs.small};color:${TINTA.suave};line-height:1.45;text-align:${align}">${esc(footer)}</div>
    </div>`

  return copies.map((c) => copyHTML(c)).join("")
}
