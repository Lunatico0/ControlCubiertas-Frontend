import { useState, useEffect, useRef } from "react"
import { getCompany, updateCompany } from "@api/admin"
import { showToast } from "@utils/toast"
import { tint } from "@components/Operativa/status"
import FileUploadRoundedIcon from "@mui/icons-material/FileUploadRounded"
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded"
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { renderComprobanteHTML } from "@utils/receipt-template"

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

// Toggle on/off
const Toggle = ({ on, onClick, w = 38, knob = 16 }) => (
  <button onClick={onClick} className="relative inline-flex flex-none" style={{ width: w, height: knob + 6, borderRadius: 20, border: "none", background: on ? "var(--ink-lime)" : "var(--bd-strong)", cursor: "pointer" }}>
    <span className="absolute rounded-full" style={{ top: 3, left: on ? w - knob - 3 : 3, width: knob, height: knob, background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,.25)", transition: "left .15s" }} />
  </button>
)
// Control segmentado
const Segmented = ({ options, value, onChange }) => (
  <div className="flex gap-[5px] rounded-[9px] p-1" style={{ border: "1px solid var(--bd-strong)", background: "var(--input)" }}>
    {options.map((o) => {
      const on = value === o.value
      return <button key={o.value} onClick={() => onChange(o.value)} className="h-[34px] flex-1 rounded-md text-[12.5px] font-semibold" style={{ border: "none", background: on ? "var(--ink-lime)" : "transparent", color: on ? "var(--bg)" : "var(--tx-3)" }}>{o.label}</button>
    })}
  </div>
)
const sectionLabelStyle = { fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }
const fieldLabelCls = "mb-[5px] block text-[11.5px] font-semibold"
const fieldStyle = { height: 40, background: "var(--input)", border: "1px solid var(--bd-strong)", color: "var(--tx)" }
const onFocusLime = (e) => (e.target.style.borderColor = "var(--ink-lime)")
const onBlurBd = (e) => (e.target.style.borderColor = "var(--bd-strong)")

const EditorComprobante = () => {
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

  // El preview usa EXACTAMENTE el mismo generador que la impresión real (receipt-template),
  // con datos de ejemplo → lo que se ve acá es lo que sale impreso, sin divergencia posible.
  const previewHtml = renderComprobanteHTML({
    design: d,
    company: { name: empresa, cuit, phone: telefono, address: direccion },
    footer,
    meta: { numero: "0001-00000016", fecha: "27/06/2026", tipo: "Asignación" },
    sectionData: SAMPLE,
  })

  return (
    // Vive dentro del <Outlet/> del AdminLayout → hereda su tema (claro/oscuro), sin
    // data-app-theme propio, y el sidebar + top bar del portal quedan visibles. El margin
    // negativo anula el padding del área de contenido (28/30) y ocupa el alto bajo la top
    // bar (74px), tal como el diseño.
    <div className="flex flex-col overflow-hidden" style={{ margin: "-28px -30px", height: "calc(100vh - 74px)", background: "var(--bg)", color: "var(--tx)", fontFamily: "'IBM Plex Sans',system-ui,sans-serif" }}>
      {/* TOP BAR del editor */}
      <div className="flex h-[62px] flex-none items-center gap-3.5 px-6" style={{ background: "var(--sidebar)", borderBottom: "1px solid var(--bd-faint)" }}>
        <div style={{ lineHeight: 1.2 }}>
          <div className="text-[16px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>Editor de comprobante</div>
          <div className="text-[11.5px]" style={{ color: "var(--tx-5)", fontFamily: "'IBM Plex Mono'" }}>Diseño del comprobante impreso · A4</div>
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          <button onClick={reset} className="h-10 rounded-[9px] px-[15px] text-[13.5px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx)" }}>Restablecer</button>
          <button onClick={save} disabled={saving} className="h-10 rounded-[9px] px-[18px] text-[13.5px] font-bold" style={{ background: "#C4ED2B", color: "#0A0C0D", opacity: saving ? 0.6 : 1 }}>{saving ? "Guardando…" : "Guardar cambios"}</button>
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
              <label className="block"><span className={fieldLabelCls} style={{ color: "var(--tx-4)" }}>Nombre de la empresa</span><input value={empresa} onChange={(e) => setEmpresa(e.target.value)} className="w-full rounded-lg px-3 text-[13.5px] outline-none" style={fieldStyle} onFocus={onFocusLime} onBlur={onBlurBd} /></label>
              <div className="grid grid-cols-2 gap-[11px]">
                <label className="block"><span className={fieldLabelCls} style={{ color: "var(--tx-4)" }}>CUIT</span><input value={cuit} onChange={(e) => setCuit(e.target.value)} className="w-full rounded-lg px-3 text-[13.5px] outline-none" style={{ ...fieldStyle, fontFamily: "'IBM Plex Mono'" }} onFocus={onFocusLime} onBlur={onBlurBd} /></label>
                <label className="block"><span className={fieldLabelCls} style={{ color: "var(--tx-4)" }}>Teléfono</span><input value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full rounded-lg px-3 text-[13.5px] outline-none" style={{ ...fieldStyle, fontFamily: "'IBM Plex Mono'" }} onFocus={onFocusLime} onBlur={onBlurBd} /></label>
              </div>
              <label className="block"><span className={fieldLabelCls} style={{ color: "var(--tx-4)" }}>Dirección</span><input value={direccion} onChange={(e) => setDireccion(e.target.value)} className="w-full rounded-lg px-3 text-[13.5px] outline-none" style={fieldStyle} onFocus={onFocusLime} onBlur={onBlurBd} /></label>
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
                return <button key={label} onClick={() => setDesign({ font: ff })} className="h-[38px] rounded-lg text-[12.5px] font-semibold" style={{ border: `1px solid ${on ? "var(--ink-lime)" : "var(--bd-strong)"}`, background: on ? tint("var(--ink-lime)", 10) : "var(--input)", color: on ? "var(--ink-lime)" : "var(--tx-2)", fontFamily: ff }}>{label}</button>
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
                return <button key={c} onClick={() => setDesign({ accent: c })} title={c} className="h-[34px] w-[34px] rounded-full" style={{ background: c, border: `2px solid ${on ? "var(--ink-lime)" : "color-mix(in srgb, var(--tx) 12%, transparent)"}`, outline: `2px solid ${on ? c : "transparent"}`, outlineOffset: -5, cursor: "pointer" }} />
              })}
            </div>
          </div>

          {/* PIE */}
          <div className="px-[22px] py-5" style={{ borderBottom: "1px solid var(--bd-faint)" }}>
            <div className="mb-3 text-[10px] tracking-[.12em]" style={sectionLabelStyle}>PIE DE COMPROBANTE</div>
            <textarea value={footer} onChange={(e) => setFooter(e.target.value)} rows={3} className="w-full rounded-lg px-3 py-2.5 text-[13px] outline-none" style={{ background: "var(--input)", border: "1px solid var(--bd-strong)", color: "var(--tx)", resize: "vertical", lineHeight: 1.5, fontFamily: "'IBM Plex Sans'" }} onFocus={onFocusLime} onBlur={onBlurBd} />
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
            <div style={{ background: "#FFFFFF", borderRadius: 3, boxShadow: "0 12px 40px rgba(0,0,0,.45)", overflow: "hidden" }} dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditorComprobante
