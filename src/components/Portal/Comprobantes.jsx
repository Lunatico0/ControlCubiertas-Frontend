import { useState, useEffect, useCallback } from "react"
import PrintRoundedIcon from "@mui/icons-material/PrintRounded"
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded"
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded"
import SearchRoundedIcon from "@mui/icons-material/SearchRounded"
import { getReceipts } from "@api/admin"
import { getCompanyCached } from "@api/company"
import { generateReceiptHTML } from "@utils/receipt-html"
import { buildReprintData } from "@utils/print-data"
import { useReprint } from "@hooks/useReprint"
import { showToast } from "@utils/toast"
import { downloadCSV } from "@utils/csv"
import Pager from "./Pager"

const COLS = "1.15fr 0.85fr 0.75fr 1.35fr 0.9fr 0.75fr"
const LIMIT = 15
const FILTERS = [
  { label: "Todos", value: "" },
  { label: "Alta", value: "Alta" },
  { label: "Asignación", value: "Asignación" },
  { label: "Desasignación", value: "Desasignación" },
  // "Recapado" filtra los movimientos type "Estado" (un recapado es un cambio de estado).
  { label: "Recapado", value: "Estado" },
]

// Color por TIPO de movimiento (mismo criterio que el timeline del drawer: asignación y
// desasignación SIEMPRE se distinguen).
const typeColor = (t = "") => {
  if (/^correcc/i.test(t)) return "var(--ink-purple)"
  if (/^asign/i.test(t)) return "var(--ink-blue)"
  if (/^desasign/i.test(t)) return "var(--ink-orange)"
  if (/^alta/i.test(t)) return "var(--ink-lime)"
  return "var(--ink-teal)" // Estado y demás
}
const tint = (c, pct = 14) => `color-mix(in srgb, ${c} ${pct}%, transparent)`
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("es-AR") } catch { return "—" } }
const initialsOf = (u) => (u || "?").slice(0, 2).toUpperCase()

// Descripción legible del movimiento a partir de los datos del comprobante.
const detalle = (c) => {
  const parts = []
  if (c.movil) parts.push(`Móvil ${c.movil}`)
  if (c.patente) parts.push(c.patente)
  if (c.km != null) parts.push(`${Number(c.km).toLocaleString("es-AR")} km`)
  if (c.status) parts.push(c.status)
  return parts.join(" · ") || "—"
}

// item del endpoint → { entry, tire } que consume el motor de reimpresión (print-data).
const toTire = (c) => (c.cubierta ? { code: c.cubierta.code, serialNumber: c.cubierta.serialNumber, brand: c.cubierta.brand, size: c.cubierta.size, pattern: c.cubierta.pattern } : {})
const toEntry = (c) => ({
  receiptNumber: c.numero, type: c.tipo, km: c.km, kmAlta: c.kmAlta, kmBaja: c.kmBaja,
  status: c.status, orderNumber: c.orden,
  vehicle: c.patente || c.movil ? { mobile: c.movil, licensePlate: c.patente } : null,
  flag: c.flag, reason: c.reason, editedFields: c.editedFields,
})

const Comprobantes = () => {
  const reprint = useReprint()
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState("")
  const [type, setType] = useState("")
  const [page, setPage] = useState(1)
  const [preview, setPreview] = useState(null) // html del comprobante para el modal "Ver"

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getReceipts({ q, type, page, limit: LIMIT })
      setRows(data.items || [])
      setTotal(data.total || 0)
    } catch (err) {
      showToast("error", err.message || "No se pudieron cargar los comprobantes")
    } finally {
      setLoading(false)
    }
  }, [q, type, page])

  // Debounce del buscador para no pegarle al endpoint en cada tecla.
  useEffect(() => {
    const id = setTimeout(load, 250)
    return () => clearTimeout(id)
  }, [load])

  const onFilter = (v) => { setType(v); setPage(1) }
  const onSearch = (v) => { setQ(v); setPage(1) }

  const openView = async (c) => {
    try {
      const company = await getCompanyCached()
      const layoutMode = localStorage.getItem("receiptLayout") || "dynamic"
      setPreview(generateReceiptHTML(buildReprintData(toEntry(c), toTire(c)), layoutMode, company?.receiptDesign, company))
    } catch {
      showToast("error", "No se pudo generar la vista previa")
    }
  }

  const exportCSV = async () => {
    try {
      const { items } = await getReceipts({ q, type, limit: 100000 })
      const head = ["N°", "Fecha", "Tipo", "Cubierta", "Detalle", "Usuario"]
      const body = items.map((c) => [c.numero, fmtDate(c.fecha), c.tipo, c.cubierta ? `#${c.cubierta.code}` : "", detalle(c), c.usuario || ""])
      downloadCSV("comprobantes.csv", head, body)
    } catch {
      showToast("error", "No se pudo exportar")
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))
  const desde = total === 0 ? 0 : (page - 1) * LIMIT + 1
  const hasta = Math.min(page * LIMIT, total)

  return (
    <div style={{ maxWidth: 1120 }}>
      {/* Header */}
      <div className="mb-[22px] flex items-start gap-5">
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-[-.02em]" style={{ color: "var(--tx)", fontFamily: "'Space Grotesk'" }}>Comprobantes</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--tx-4)" }}>Histórico de comprobantes emitidos por cada movimiento de cubierta</p>
        </div>
        <button onClick={exportCSV} className="ml-auto inline-flex items-center gap-2 rounded-[10px] px-[17px] py-[11px] text-sm font-semibold"
          style={{ background: "var(--elev)", border: "1px solid var(--bd-strong)", color: "var(--tx-2)" }}>
          <FileDownloadRoundedIcon sx={{ fontSize: 17 }} /> Exportar CSV
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-[340px] flex-1">
          <SearchRoundedIcon sx={{ fontSize: 17 }} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--tx-7)" }} />
          <input value={q} onChange={(e) => onSearch(e.target.value)} placeholder="Buscar N°, cubierta, patente…"
            className="h-[42px] w-full rounded-[10px] pl-[38px] pr-3 text-[13.5px] outline-none"
            style={{ background: "var(--input)", border: "1px solid var(--bd)", color: "var(--tx)" }}
            onFocus={(e) => (e.target.style.borderColor = "var(--ink-lime)")} onBlur={(e) => (e.target.style.borderColor = "var(--bd)")} />
        </div>
        <div className="flex flex-wrap gap-[7px]">
          {FILTERS.map((f) => {
            const on = type === f.value
            return (
              <button key={f.value} onClick={() => onFilter(f.value)} className="h-[38px] rounded-[9px] px-[14px] text-[12.5px] font-semibold"
                style={{ border: `1px solid ${on ? "var(--ink-lime)" : "var(--bd)"}`, background: on ? tint("var(--ink-lime)", 12) : "var(--elev)", color: on ? "var(--ink-lime)" : "var(--tx-4)" }}>
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-[13px]" style={{ background: "var(--card)", border: "1px solid var(--bd)" }}>
        <div className="grid gap-3 px-5 py-3 text-[10.5px] font-semibold uppercase tracking-wider" style={{ gridTemplateColumns: COLS, background: "var(--elev)", borderBottom: "1px solid var(--bd)", fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>
          <div>N° / Fecha</div><div>Tipo</div><div>Cubierta</div><div>Detalle</div><div>Usuario</div><div className="text-right">Acción</div>
        </div>

        {loading ? (
          <p className="px-5 py-8 text-sm" style={{ color: "var(--tx-5)" }}>Cargando comprobantes…</p>
        ) : rows.length === 0 ? (
          <p className="px-5 py-8 text-sm" style={{ color: "var(--tx-5)" }}>{q || type ? "No hay comprobantes que coincidan con el filtro." : "Todavía no hay comprobantes emitidos."}</p>
        ) : (
          rows.map((c) => {
            const col = typeColor(c.tipo)
            return (
              <div key={c.id} className="grid items-center gap-3 px-5 py-[13px]" style={{ gridTemplateColumns: COLS, borderBottom: "1px solid var(--bd-faint)" }}>
                <div>
                  <div className="text-[13px] font-semibold" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx)" }}>{c.numero}</div>
                  <div className="text-[11px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>{fmtDate(c.fecha)}</div>
                </div>
                <div>
                  <span className="inline-flex items-center gap-[6px] rounded-full px-[10px] py-[3px] text-[11.5px] font-semibold" style={{ color: col, background: tint(col, 14) }}>
                    <span className="rounded-full" style={{ width: 6, height: 6, background: col }} />{c.tipo}
                  </span>
                </div>
                <div className="font-display text-[14px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>{c.cubierta ? `#${c.cubierta.code}` : "—"}</div>
                <div className="truncate text-[12.5px]" style={{ color: "var(--tx-3)" }} title={detalle(c)}>{detalle(c)}</div>
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex flex-none items-center justify-center rounded-full text-[9.5px] font-bold" style={{ width: 24, height: 24, background: "var(--bd-strong)", color: "var(--tx-2)", fontFamily: "'Space Grotesk'" }}>{initialsOf(c.usuario)}</span>
                  <span className="truncate text-[12.5px]" style={{ color: "var(--tx-2)" }}>{c.usuario || "—"}</span>
                </div>
                <div className="flex items-center justify-end gap-1.5">
                  <button onClick={() => reprint.execute({ entry: toEntry(c), tire: toTire(c) })} disabled={reprint.isPrinting} title="Reimprimir"
                    className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-lg" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx-3)" }}>
                    <PrintRoundedIcon sx={{ fontSize: 15 }} />
                  </button>
                  <button onClick={() => openView(c)} title="Ver"
                    className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-lg" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx-3)" }}>
                    <VisibilityRoundedIcon sx={{ fontSize: 15 }} />
                  </button>
                </div>
              </div>
            )
          })
        )}

        {/* Footer / paginación */}
        {!loading && total > 0 && (
          <div className="flex items-center justify-between px-5 py-[13px]" style={{ background: "var(--elev)" }}>
            <span className="text-[12px]" style={{ color: "var(--tx-6)" }}>Mostrando {desde}–{hasta} de {total}</span>
            <Pager page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </div>

      {/* Modal Ver: preview del comprobante (mismo generador que la impresión) */}
      {preview && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,.55)", backdropFilter: "blur(2px)" }} onClick={() => setPreview(null)}>
          <div className="max-h-[90dvh] overflow-auto rounded-lg" style={{ maxWidth: 560, background: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,.5)" }} onClick={(e) => e.stopPropagation()} dangerouslySetInnerHTML={{ __html: preview }} />
        </div>
      )}
    </div>
  )
}

export default Comprobantes
