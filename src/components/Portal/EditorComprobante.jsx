import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { getCompany, updateCompany } from "@api/admin"
import { showToast } from "@utils/toast"
import { tint } from "@components/Operativa/status"
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded"
import FileUploadRoundedIcon from "@mui/icons-material/FileUploadRounded"
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded"
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"

// Editor del comprobante impreso (Claude Design). Pantalla dedicada del portal admin:
// controles a la izquierda + preview A4 en vivo a la derecha. Persiste en el tenant
// (receiptDesign + datos de empresa) vía PATCH /api/admin/company. El diseño guardado
// se aplica a la impresión real en B3 (receipt-html.js).
const SECTION_DEFS = [
  { key: "cubierta", label: "Datos de la cubierta" },
  { key: "vehiculo", label: "Datos del vehículo" },
  { key: "kilometraje", label: "Kilometraje" },
  { key: "orden", label: "N° de orden" },
]
const DEFAULT_DESIGN = {
  logo: null, logoPos: "left", logoSize: "M", showHeader: true,
  accent: "#1F7A43", font: "'Space Grotesk', sans-serif", textSize: "M", align: "left", duplicado: true,
  sections: SECTION_DEFS.map((s) => ({ ...s, on: true })),
}
// Datos de ejemplo (solo para el preview). En la impresión real se reemplazan por los del movimiento.
const SAMPLE = {
  cubierta: { heading: "Datos de la cubierta", rows: [{ k: "Código", v: "#014" }, { k: "N° de serie", v: "PI-3320" }, { k: "Marca", v: "Pirelli" }, { k: "Rodado", v: "295/80 R22.5" }] },
  vehiculo: { heading: "Datos del vehículo", rows: [{ k: "Móvil", v: "Móvil 02" }, { k: "Patente", v: "AB123CD" }] },
  kilometraje: { heading: "Kilometraje", rows: [{ k: "Km al montar", v: "45.200 km" }] },
  orden: { heading: "N° de orden", rows: [{ k: "Orden", v: "2026-000101" }] },
}
const FONTS = [["Grotesk", "'Space Grotesk', sans-serif"], ["Plex Sans", "'IBM Plex Sans', sans-serif"], ["Plex Mono", "'IBM Plex Mono', monospace"], ["Serif", "Georgia, serif"]]
const ACCENTS = ["#1F7A43", "#2358C5", "#334155", "#C2410C", "#6D28D9"]
const FS = {
  S: { base: "10px", h1: "15px", h2: "14px", label: "8.5px", small: "8.5px" },
  M: { base: "11.5px", h1: "18px", h2: "16px", label: "9.5px", small: "9.5px" },
  L: { base: "13px", h1: "21px", h2: "18px", label: "10.5px", small: "10.5px" },
}
const LOGO_H = { S: "30px", M: "44px", L: "60px" }
const LOGO_W = { S: "80px", M: "110px", L: "150px" }

// Toggle on/off
const Toggle = ({ on, onClick, w = 38, knob = 16 }) => (
  <button onClick={onClick} className="relative inline-flex flex-none" style={{ width: w, height: knob + 6, borderRadius: 20, border: "none", background: on ? "var(--ink-lime)" : "var(--bd-strong)", cursor: "pointer" }}>
    <span className="absolute rounded-full" style={{ top: 3, left: on ? w - knob - 3 : 3, width: knob, height: knob, background: "#fff", transition: "left .15s" }} />
  </button>
)
// Control segmentado
const Segmented = ({ options, value, onChange }) => (
  <div className="flex gap-[5px] rounded-[9px] p-1" style={{ border: "1px solid var(--bd-strong)", background: "var(--input)" }}>
    {options.map((o) => {
      const on = value === o.value
      return <button key={o.value} onClick={() => onChange(o.value)} className="h-[34px] flex-1 rounded-[6px] text-[12.5px] font-semibold" style={{ border: "none", background: on ? "var(--ink-lime)" : "transparent", color: on ? "var(--bg)" : "var(--tx-3)" }}>{o.label}</button>
    })}
  </div>
)
const sectionLabelStyle = { fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }
const fieldLabelCls = "mb-[5px] block text-[11.5px] font-semibold"
const fieldStyle = { height: 40, background: "var(--input)", border: "1px solid var(--bd-strong)", color: "var(--tx)" }
const onFocusLime = (e) => (e.target.style.borderColor = "var(--ink-lime)")
const onBlurBd = (e) => (e.target.style.borderColor = "var(--bd-strong)")

const EditorComprobante = () => {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [empresa, setEmpresa] = useState("")
  const [cuit, setCuit] = useState("")
  const [telefono, setTelefono] = useState("")
  const [direccion, setDireccion] = useState("")
  const [footer, setFooter] = useState("")
  const [d, setD] = useState(DEFAULT_DESIGN)
  const [saving, setSaving] = useState(false)
  const setDesign = (patch) => setD((prev) => ({ ...prev, ...patch }))

  useEffect(() => {
    getCompany()
      .then((c) => {
        setEmpresa(c?.name || "")
        setCuit(c?.cuit || "")
        setTelefono(c?.phone || "")
        setDireccion(c?.address || "")
        setFooter(c?.receiptFooter || "Comprobante interno de movimiento de cubiertas. Documento no válido como factura.")
        const rd = c?.receiptDesign
        if (rd && rd.sections?.length) {
          setD({ ...DEFAULT_DESIGN, ...rd, sections: rd.sections.map((s) => ({ ...s })) })
        }
      })
      .catch(() => {})
  }, [])

  const moveSection = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= d.sections.length) return
    const arr = d.sections.slice()
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    setDesign({ sections: arr })
  }
  const toggleSection = (key) => setDesign({ sections: d.sections.map((s) => (s.key === key ? { ...s, on: !s.on } : s)) })

  const pickLogo = () => fileRef.current?.click()
  const onLogoFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const r = new FileReader()
    r.onload = () => setDesign({ logo: r.result })
    r.readAsDataURL(f)
  }

  const reset = () => {
    setD({ ...DEFAULT_DESIGN, sections: SECTION_DEFS.map((s) => ({ ...s, on: true })) })
    showToast("info", "Diseño restablecido (recordá Guardar)")
  }
  const save = async () => {
    setSaving(true)
    try {
      await updateCompany({
        name: empresa, cuit, phone: telefono, address: direccion, receiptFooter: footer,
        receiptDesign: d,
      })
      showToast("success", "Diseño del comprobante guardado")
    } catch (e) {
      showToast("error", e.message || "No se pudo guardar")
    } finally {
      setSaving(false)
    }
  }

  const fs = FS[d.textSize]
  const accent = d.accent
  const headerAlign = d.align === "center" ? "center" : "flex-start"
  const logoJustify = { left: "flex-start", center: "center", right: "flex-end" }[d.logoPos]
  const docSections = d.sections.filter((s) => s.on).map((s) => SAMPLE[s.key]).filter(Boolean)
  const copies = d.duplicado
    ? [{ label: "ORIGINAL", cut: false, padTop: "30px", labelTop: "18px" }, { label: "DUPLICADO", cut: true, padTop: "40px", labelTop: "40px" }]
    : [{ label: "ORIGINAL", cut: false, padTop: "30px", labelTop: "18px" }]

  return (
    <div data-app-theme="dark" className="fixed inset-0 z-[60] flex flex-col" style={{ background: "var(--bg)", color: "var(--tx)", fontFamily: "'IBM Plex Sans',system-ui,sans-serif" }}>
      {/* TOP BAR */}
      <div className="flex h-[66px] flex-none items-center gap-3.5 px-6" style={{ background: "var(--sidebar)", borderBottom: "1px solid var(--bd-faint)" }}>
        <button onClick={() => navigate("/admin")} title="Volver al panel" className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-[9px]" style={{ border: "1px solid var(--bd)", background: "var(--elev)", color: "var(--tx-3)" }}>
          <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
        </button>
        <div style={{ lineHeight: 1.2 }}>
          <div className="text-[16px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>Editor de comprobante</div>
          <div className="text-[11.5px]" style={{ color: "var(--tx-5)", fontFamily: "'IBM Plex Mono'" }}>Empresa · Diseño del comprobante impreso</div>
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          <button onClick={reset} className="h-10 rounded-[9px] px-[15px] text-[13.5px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx)" }}>Restablecer</button>
          <button onClick={save} disabled={saving} className="h-10 rounded-[9px] px-[18px] text-[13.5px] font-bold" style={{ background: "var(--ink-lime)", color: "var(--bg)", opacity: saving ? 0.6 : 1 }}>{saving ? "Guardando…" : "Guardar cambios"}</button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* CONTROLS */}
        <aside className="w-[384px] flex-none overflow-y-auto" style={{ background: "var(--elev)", borderRight: "1px solid var(--bd)" }}>
          <input type="file" accept="image/*" ref={fileRef} onChange={onLogoFile} style={{ display: "none" }} />

          {/* ENCABEZADO */}
          <div className="px-[22px] py-5" style={{ borderBottom: "1px solid var(--bd-faint)" }}>
            <div className="mb-[15px] flex items-center">
              <div className="text-[10px] tracking-[.12em]" style={sectionLabelStyle}>ENCABEZADO</div>
              <div className="ml-auto"><Toggle on={d.showHeader} onClick={() => setDesign({ showHeader: !d.showHeader })} w={42} knob={18} /></div>
            </div>
            <div className="flex flex-col gap-[11px]">
              <label className="block"><span className={fieldLabelCls} style={{ color: "var(--tx-4)" }}>Nombre de la empresa</span><input value={empresa} onChange={(e) => setEmpresa(e.target.value)} className="w-full rounded-[8px] px-3 text-[13.5px] outline-none" style={fieldStyle} onFocus={onFocusLime} onBlur={onBlurBd} /></label>
              <div className="grid grid-cols-2 gap-[11px]">
                <label className="block"><span className={fieldLabelCls} style={{ color: "var(--tx-4)" }}>CUIT</span><input value={cuit} onChange={(e) => setCuit(e.target.value)} className="w-full rounded-[8px] px-3 text-[13.5px] outline-none" style={{ ...fieldStyle, fontFamily: "'IBM Plex Mono'" }} onFocus={onFocusLime} onBlur={onBlurBd} /></label>
                <label className="block"><span className={fieldLabelCls} style={{ color: "var(--tx-4)" }}>Teléfono</span><input value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full rounded-[8px] px-3 text-[13.5px] outline-none" style={{ ...fieldStyle, fontFamily: "'IBM Plex Mono'" }} onFocus={onFocusLime} onBlur={onBlurBd} /></label>
              </div>
              <label className="block"><span className={fieldLabelCls} style={{ color: "var(--tx-4)" }}>Dirección</span><input value={direccion} onChange={(e) => setDireccion(e.target.value)} className="w-full rounded-[8px] px-3 text-[13.5px] outline-none" style={fieldStyle} onFocus={onFocusLime} onBlur={onBlurBd} /></label>
            </div>
          </div>

          {/* LOGO */}
          <div className="px-[22px] py-5" style={{ borderBottom: "1px solid var(--bd-faint)" }}>
            <div className="mb-[15px] text-[10px] tracking-[.12em]" style={sectionLabelStyle}>LOGO</div>
            <div className="mb-3.5 flex gap-2.5">
              <button onClick={pickLogo} className="inline-flex h-[42px] flex-1 items-center justify-center gap-2 rounded-[9px] text-[13px] font-semibold" style={{ border: "1px dashed var(--bd-hover)", background: "var(--input)", color: "var(--ink-lime)" }}>
                <FileUploadRoundedIcon sx={{ fontSize: 16 }} /> {d.logo ? "Cambiar logo" : "Subir logo"}
              </button>
              {d.logo && <button onClick={() => setDesign({ logo: null })} title="Quitar logo" className="inline-flex h-[42px] w-[42px] flex-none items-center justify-center rounded-[9px]" style={{ border: "1px solid var(--bd-strong)", background: "var(--input)", color: "var(--ink-red)" }}><DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} /></button>}
            </div>
            <span className={fieldLabelCls} style={{ color: "var(--tx-4)" }}>Posición</span>
            <div className="mb-3"><Segmented value={d.logoPos} onChange={(v) => setDesign({ logoPos: v })} options={[{ value: "left", label: "Izq." }, { value: "center", label: "Centro" }, { value: "right", label: "Der." }]} /></div>
            <span className={fieldLabelCls} style={{ color: "var(--tx-4)" }}>Tamaño</span>
            <Segmented value={d.logoSize} onChange={(v) => setDesign({ logoSize: v })} options={[{ value: "S", label: "S" }, { value: "M", label: "M" }, { value: "L", label: "L" }]} />
          </div>

          {/* SECCIONES */}
          <div className="px-[22px] py-5" style={{ borderBottom: "1px solid var(--bd-faint)" }}>
            <div className="mb-1.5 text-[10px] tracking-[.12em]" style={sectionLabelStyle}>SECCIONES</div>
            <div className="mb-3 text-[11.5px]" style={{ color: "var(--tx-6)" }}>Mostrá, ocultá y reordená cada bloque.</div>
            <div className="flex flex-col gap-2">
              {d.sections.map((s, i) => (
                <div key={s.key} className="flex items-center gap-2.5 rounded-[9px] px-3 py-2.5" style={{ border: "1px solid var(--bd)", background: "var(--input)" }}>
                  <div className="flex flex-col">
                    <button onClick={() => moveSection(i, -1)} className="inline-flex h-4 w-[22px] items-center justify-center p-0" style={{ border: "none", background: "transparent", color: i === 0 ? "var(--bd-hover)" : "var(--tx-3)", cursor: i === 0 ? "default" : "pointer" }}><KeyboardArrowUpRoundedIcon sx={{ fontSize: 16 }} /></button>
                    <button onClick={() => moveSection(i, 1)} className="inline-flex h-4 w-[22px] items-center justify-center p-0" style={{ border: "none", background: "transparent", color: i === d.sections.length - 1 ? "var(--bd-hover)" : "var(--tx-3)", cursor: i === d.sections.length - 1 ? "default" : "pointer" }}><KeyboardArrowDownRoundedIcon sx={{ fontSize: 16 }} /></button>
                  </div>
                  <span className="flex-1 text-[13px] font-medium" style={{ color: s.on ? "var(--tx)" : "var(--tx-6)" }}>{s.label}</span>
                  <Toggle on={s.on} onClick={() => toggleSection(s.key)} />
                </div>
              ))}
            </div>
          </div>

          {/* TEXTO */}
          <div className="px-[22px] py-5" style={{ borderBottom: "1px solid var(--bd-faint)" }}>
            <div className="mb-[15px] text-[10px] tracking-[.12em]" style={sectionLabelStyle}>TEXTO</div>
            <span className={fieldLabelCls} style={{ color: "var(--tx-4)" }}>Tipografía</span>
            <div className="mb-3.5 grid grid-cols-2 gap-1.5">
              {FONTS.map(([label, ff]) => {
                const on = d.font === ff
                return <button key={label} onClick={() => setDesign({ font: ff })} className="h-[38px] rounded-[8px] text-[12.5px] font-semibold" style={{ border: `1px solid ${on ? "var(--ink-lime)" : "var(--bd-strong)"}`, background: on ? tint("var(--ink-lime)", 10) : "var(--input)", color: on ? "var(--ink-lime)" : "var(--tx-2)", fontFamily: ff }}>{label}</button>
              })}
            </div>
            <span className={fieldLabelCls} style={{ color: "var(--tx-4)" }}>Tamaño de texto</span>
            <div className="mb-3.5"><Segmented value={d.textSize} onChange={(v) => setDesign({ textSize: v })} options={[{ value: "S", label: "S" }, { value: "M", label: "M" }, { value: "L", label: "L" }]} /></div>
            <span className={fieldLabelCls} style={{ color: "var(--tx-4)" }}>Alineación del encabezado</span>
            <Segmented value={d.align} onChange={(v) => setDesign({ align: v })} options={[{ value: "left", label: "Izquierda" }, { value: "center", label: "Centro" }]} />
          </div>

          {/* COLOR */}
          <div className="px-[22px] py-5" style={{ borderBottom: "1px solid var(--bd-faint)" }}>
            <div className="mb-3.5 text-[10px] tracking-[.12em]" style={sectionLabelStyle}>COLOR DE ACENTO</div>
            <div className="flex gap-[11px]">
              {ACCENTS.map((c) => {
                const on = d.accent === c
                return <button key={c} onClick={() => setDesign({ accent: c })} title={c} className="h-[34px] w-[34px] rounded-full" style={{ background: c, border: `2px solid ${on ? "var(--ink-lime)" : "rgba(255,255,255,.10)"}`, outline: `2px solid ${on ? c : "transparent"}`, outlineOffset: -5, cursor: "pointer" }} />
              })}
            </div>
          </div>

          {/* PIE */}
          <div className="px-[22px] py-5" style={{ borderBottom: "1px solid var(--bd-faint)" }}>
            <div className="mb-3 text-[10px] tracking-[.12em]" style={sectionLabelStyle}>PIE DE COMPROBANTE</div>
            <textarea value={footer} onChange={(e) => setFooter(e.target.value)} rows={3} className="w-full rounded-[8px] px-3 py-2.5 text-[13px] outline-none" style={{ background: "var(--input)", border: "1px solid var(--bd-strong)", color: "var(--tx)", resize: "vertical", lineHeight: 1.5, fontFamily: "'IBM Plex Sans'" }} onFocus={onFocusLime} onBlur={onBlurBd} />
          </div>

          {/* IMPRESIÓN */}
          <div className="px-[22px] pb-7 pt-5">
            <div className="mb-3 text-[10px] tracking-[.12em]" style={sectionLabelStyle}>IMPRESIÓN</div>
            <div className="flex items-center gap-3 rounded-[10px] px-3.5 py-3.5" style={{ border: "1px solid var(--bd)", background: "var(--input)" }}>
              <div className="flex-1">
                <div className="text-[13.5px] font-semibold" style={{ color: "var(--tx)" }}>Imprimir duplicado</div>
                <div className="mt-0.5 text-[11.5px]" style={{ color: "var(--tx-5)" }}>Original + duplicado en la misma A4, con línea de corte.</div>
              </div>
              <Toggle on={d.duplicado} onClick={() => setDesign({ duplicado: !d.duplicado })} w={46} knob={20} />
            </div>
          </div>
        </aside>

        {/* PREVIEW */}
        <div className="flex-1 overflow-y-auto px-6 py-[34px]" style={{ background: "var(--hover)" }}>
          <div className="mx-auto" style={{ maxWidth: 520 }}>
            <div className="mb-3.5 flex items-center gap-2 text-[11px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-5)" }}>
              <span className="h-[7px] w-[7px] rounded-full" style={{ background: "var(--ink-lime)" }} />VISTA PREVIA · HOJA A4 · {d.duplicado ? "Original + Duplicado" : "Solo original"}
            </div>
            <div style={{ background: "#FFFFFF", borderRadius: 3, boxShadow: "0 12px 40px rgba(0,0,0,.45)", overflow: "hidden" }}>
              {copies.map((copy, ci) => (
                <div key={ci} style={{ position: "relative", padding: `${copy.padTop} 32px 26px 32px`, minHeight: 340, fontFamily: d.font }}>
                  {copy.cut && (
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", alignItems: "center", gap: 9, padding: "0 16px", transform: "translateY(-50%)" }}>
                      <div style={{ flex: 1, borderTop: "1.5px dashed #BFBFBF" }} />
                      <span style={{ fontSize: "8.5px", fontFamily: "'IBM Plex Mono'", color: "#AAAAAA", letterSpacing: ".08em" }}>✂ CORTAR AQUÍ</span>
                      <div style={{ flex: 1, borderTop: "1.5px dashed #BFBFBF" }} />
                    </div>
                  )}
                  <div style={{ position: "absolute", top: copy.labelTop, right: 32, fontFamily: "'IBM Plex Mono'", fontSize: "8.5px", letterSpacing: ".12em", color: accent, border: `1px solid ${accent}`, padding: "2px 8px", borderRadius: 4 }}>{copy.label}</div>

                  {d.showHeader && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: headerAlign, gap: 9, marginBottom: 13, width: "100%" }}>
                      <div style={{ display: "flex", width: "100%", justifyContent: logoJustify }}>
                        {d.logo
                          ? <img src={d.logo} alt="logo" style={{ height: LOGO_H[d.logoSize], maxWidth: 240, objectFit: "contain" }} />
                          : <div style={{ height: LOGO_H[d.logoSize], width: LOGO_W[d.logoSize], border: "1.5px dashed #CFCFCF", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Mono'", fontSize: 10, color: "#BBBBBB", letterSpacing: ".1em" }}>LOGO</div>}
                      </div>
                      <div style={{ width: "100%", textAlign: d.align }}>
                        <div style={{ fontSize: fs.h1, fontWeight: 700, color: "#16181A", letterSpacing: "-.01em" }}>{empresa || "Tu empresa"}</div>
                        <div style={{ fontSize: fs.small, color: "#5C6066", lineHeight: 1.6, marginTop: 2 }}>CUIT {cuit || "—"} · Tel {telefono || "—"}<br />{direccion || "—"}</div>
                      </div>
                    </div>
                  )}

                  <div style={{ height: "2.5px", background: accent, borderRadius: 2, marginBottom: 13 }} />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, marginBottom: 15 }}>
                    <div><div style={{ fontSize: fs.small, fontFamily: "'IBM Plex Mono'", color: "#8A8E92", letterSpacing: ".04em" }}>COMPROBANTE N°</div><div style={{ fontSize: fs.h2, fontWeight: 700, color: "#16181A", fontFamily: "'IBM Plex Mono'", marginTop: 1 }}>0001-00000016</div></div>
                    <div style={{ textAlign: "right" }}><div style={{ fontSize: fs.small, color: "#8A8E92" }}>Fecha: <span style={{ color: "#16181A", fontWeight: 600 }}>27/06/2026</span></div><span style={{ display: "inline-block", marginTop: 5, fontSize: fs.small, fontWeight: 700, color: "#FFFFFF", background: accent, padding: "3px 11px", borderRadius: 5, letterSpacing: ".02em" }}>Asignación</span></div>
                  </div>

                  {docSections.map((sec) => (
                    <div key={sec.heading} style={{ marginBottom: 13 }}>
                      <div style={{ fontSize: fs.label, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: accent, marginBottom: 5 }}>{sec.heading}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 22px" }}>
                        {sec.rows.map((r) => (
                          <div key={r.k} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: fs.base, borderBottom: "1px dotted #D8D8D8", padding: "3px 0" }}><span style={{ color: "#6A6E72" }}>{r.k}</span><span style={{ color: "#16181A", fontWeight: 600, textAlign: "right" }}>{r.v}</span></div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div style={{ marginTop: 14, paddingTop: 9, borderTop: "1px solid #E4E4E4", fontSize: fs.small, color: "#7A7E82", lineHeight: 1.5, textAlign: d.align }}>{footer}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditorComprobante
