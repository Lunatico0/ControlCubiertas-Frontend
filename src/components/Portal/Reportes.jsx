import { useState, useEffect, useCallback } from "react"
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded"
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded"
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded"
import StyleRoundedIcon from "@mui/icons-material/StyleRounded"
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded"
import InfoRoundedIcon from "@mui/icons-material/InfoRounded"
import { getReports } from "@api/admin"
import { showToast } from "@utils/toast"

const RANGES = [
  { label: "12 meses", value: "12m" },
  { label: "6 meses", value: "6m" },
  { label: "Todo", value: "all" },
]

// Columnas de la tabla de ranking (mismo criterio de grid que Comprobantes.jsx).
const RANK_COLS = "24px 1.4fr 0.8fr 2fr 0.9fr 0.9fr"

// Paleta de dots para el ranking de marcas (se asigna por índice, no por marca fija).
const DOT_PALETTE = ["var(--ink-lime)", "var(--ink-teal)", "var(--ink-blue)", "var(--ink-purple)", "var(--ink-orange)", "var(--ink-red)"]

const tint = (c, pct = 14) => `color-mix(in srgb, ${c} ${pct}%, transparent)`
const fmtKm = (n) => `${Number(n || 0).toLocaleString("es-AR")} km`

const Reportes = () => {
  const [range, setRange] = useState("12m")
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const d = await getReports({ range })
      setData(d)
    } catch (err) {
      showToast("error", err.message || "No se pudieron cargar los reportes")
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => { load() }, [load])

  const exportCSV = () => {
    if (!data?.brands?.length) return
    try {
      const head = ["#", "Marca", "Cubiertas", "Vida útil promedio (km)", "Recapados promedio", "Descarte (%)"]
      const body = data.brands.map((b, i) => [i + 1, b.name, b.count, Math.round(b.life || 0), b.recaps, b.discardRate])
      const csv = [head, ...body].map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")
      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url; a.download = "reportes-marcas.csv"; a.click()
      URL.revokeObjectURL(url)
    } catch {
      showToast("error", "No se pudo exportar")
    }
  }

  const brands = data?.brands || []
  const stages = data?.stages || []
  const maxLife = Math.max(1, ...brands.map((b) => b.life || 0))
  const maxStageKm = Math.max(1, ...stages.map((s) => s.km || 0))
  const brandsWithDot = brands.map((b, i) => ({ ...b, dot: DOT_PALETTE[i % DOT_PALETTE.length] }))

  // Color por rol: initial/stock rotan lime→teal→blue→purple según orden de aparición;
  // cualquier etapa de recapado siempre queda en naranja (distinguible del resto).
  let nonRecapIdx = 0
  const STAGE_ROTATION = ["var(--st-lime)", "var(--st-teal)", "var(--st-blue)", "var(--st-purple)"]
  const stagesWithColor = stages.map((s) => ({
    ...s,
    color: s.role === "recap" ? "var(--st-orange)" : STAGE_ROTATION[nonRecapIdx++ % STAGE_ROTATION.length],
  }))

  return (
    <div style={{ maxWidth: 1120 }}>
      {/* Header */}
      <div className="mb-[22px] flex items-start gap-5">
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-[-.02em]" style={{ color: "var(--tx)", fontFamily: "'Space Grotesk'" }}>Reportes</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--tx-4)" }}>Trazabilidad y rendimiento de la flota · análisis por kilometraje</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex gap-[7px]">
            {RANGES.map((r) => {
              const on = range === r.value
              return (
                <button key={r.value} onClick={() => setRange(r.value)} className="h-[38px] rounded-[9px] px-[14px] text-[12.5px] font-semibold"
                  style={{ border: `1px solid ${on ? "var(--ink-lime)" : "var(--bd)"}`, background: on ? tint("var(--ink-lime)", 12) : "var(--elev)", color: on ? "var(--ink-lime)" : "var(--tx-4)" }}>
                  {r.label}
                </button>
              )
            })}
          </div>
          <button onClick={exportCSV} className="inline-flex items-center gap-2 rounded-[10px] px-[17px] py-[11px] text-sm font-semibold"
            style={{ background: "var(--elev)", border: "1px solid var(--bd-strong)", color: "var(--tx-2)" }}>
            <FileDownloadRoundedIcon sx={{ fontSize: 17 }} /> Exportar
          </button>
        </div>
      </div>

      {loading ? (
        <p className="py-10 text-sm" style={{ color: "var(--tx-5)" }}>Cargando reportes…</p>
      ) : !data || data.total === 0 ? (
        <p className="py-10 text-sm" style={{ color: "var(--tx-5)" }}>Todavía no hay datos de kilometraje. Los reportes se llenan a medida que las cubiertas acumulan kilómetros (desasignaciones).</p>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-4">
            <SummaryCard label="Marca líder por vida útil" tint="var(--ink-lime)" icon={<EmojiEventsRoundedIcon sx={{ fontSize: 17 }} />}
              value={data.leader?.name ?? "—"} sublabel={data.leader ? `${fmtKm(data.leader.life)} prom. de vida útil` : "Sin datos suficientes"} />
            <SummaryCard label="Vida útil promedio" tint="var(--ink-blue)" icon={<TimelineRoundedIcon sx={{ fontSize: 17 }} />}
              value={fmtKm(data.fleetLife)} sublabel="por cubierta, toda la flota" />
            <SummaryCard label="Tasa de descarte" tint="var(--ink-red)" icon={<DeleteOutlineRoundedIcon sx={{ fontSize: 17 }} />}
              value={`${data.discardRate}%`} sublabel="de las cubiertas dadas de baja" />
            <SummaryCard label="Cubiertas analizadas" tint="var(--ink-teal)" icon={<StyleRoundedIcon sx={{ fontSize: 17 }} />}
              value={data.total} sublabel="con historial de kilometraje" />
          </div>

          {/* Ranking de marcas */}
          <div className="mt-4 overflow-hidden rounded-[13px]" style={{ background: "var(--card)", border: "1px solid var(--bd)" }}>
            <div className="px-5 pb-4 pt-[18px]">
              <h2 className="font-display text-[17px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>Ranking de marcas</h2>
              <p className="mt-1 text-[12.5px]" style={{ color: "var(--tx-5)" }}>Ordenado por vida útil promedio. La base para decidir qué marca conviene comprar.</p>
            </div>
            <div className="grid gap-3 px-5 py-3 text-[10.5px] font-semibold uppercase tracking-wider" style={{ gridTemplateColumns: RANK_COLS, background: "var(--elev)", borderTop: "1px solid var(--bd)", borderBottom: "1px solid var(--bd)", fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>
              <div>#</div><div>Marca</div><div>Cubiertas</div><div>Vida útil promedio</div><div>Recap. prom</div><div>Descarte</div>
            </div>
            {brandsWithDot.map((b, i) => (
              <div key={b.name} className="grid items-center gap-3 px-5 py-3" style={{ gridTemplateColumns: RANK_COLS, borderBottom: "1px solid var(--bd-faint)" }}>
                <div className="font-display text-[13px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: i === 0 ? "var(--ink-lime)" : i === 1 ? "var(--ink-teal)" : i === 2 ? "var(--ink-blue)" : "var(--tx-4)" }}>{i + 1}</div>
                <div className="flex items-center gap-2 text-[13.5px] font-medium" style={{ color: "var(--tx)" }}>
                  <span className="flex-none rounded-full" style={{ width: 9, height: 9, background: b.dot }} />{b.name}
                </div>
                <div className="text-[12.5px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-3)" }}>{b.count}</div>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full" style={{ background: "var(--bd-strong)" }}>
                    <div className="h-full rounded-full" style={{ width: `${(b.life / maxLife) * 100}%`, background: b.dot }} />
                  </div>
                  <span className="text-[12px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-2)" }}>{fmtKm(b.life)}</span>
                </div>
                <div className="text-[12.5px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-3)" }}>{b.recaps}</div>
                <div className="text-[12.5px]" style={{ fontFamily: "'IBM Plex Mono'", color: b.discardRate > 15 ? "var(--ink-red)" : "var(--tx-3)" }}>{b.discardRate}%</div>
              </div>
            ))}
          </div>

          {/* Rendimiento por etapa / Vida útil por marca */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-[13px] p-5" style={{ background: "var(--card)", border: "1px solid var(--bd)" }}>
              <h2 className="font-display text-[15px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>Rendimiento por etapa</h2>
              <p className="mt-1 text-[12.5px]" style={{ color: "var(--tx-5)" }}>Km promedio que rinde una cubierta en cada etapa del ciclo. Ayuda a decidir cuándo recapar.</p>
              <div className="mt-4 space-y-3">
                {stagesWithColor.map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <span className="flex-none rounded-full" style={{ width: 9, height: 9, background: s.color }} />
                    <span className="flex-1 truncate text-[13px]" style={{ color: "var(--tx-3)" }}>{s.label}</span>
                    <div className="h-2 flex-none rounded-full" style={{ width: 100, background: "var(--bd-strong)" }}>
                      <div className="h-full rounded-full" style={{ width: `${(s.km / maxStageKm) * 100}%`, background: s.color }} />
                    </div>
                    <span className="w-[70px] flex-none text-right text-[12px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-2)" }}>{fmtKm(s.km)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[13px] p-5" style={{ background: "var(--card)", border: "1px solid var(--bd)" }}>
              <h2 className="font-display text-[15px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>Vida útil por marca</h2>
              <p className="mt-1 text-[12.5px]" style={{ color: "var(--tx-5)" }}>Km totales promedio antes del descarte, por marca.</p>
              <div className="mt-4 space-y-3">
                {brandsWithDot.map((b) => (
                  <div key={b.name}>
                    <div className="flex items-center justify-between text-[13px]">
                      <span style={{ color: "var(--tx-3)" }}>{b.name}</span>
                      <span style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-2)" }}>{fmtKm(b.life)}</span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full" style={{ background: "var(--bd-strong)" }}>
                      <div className="h-full rounded-full" style={{ width: `${(b.life / maxLife) * 100}%`, background: b.dot }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Nota: falta el costo de compra para calcular costo/km */}
          <div className="mt-4 flex items-start gap-3 rounded-xl p-4" style={{ border: "1px dashed var(--bd-strong)", background: "var(--elev)" }}>
            <InfoRoundedIcon sx={{ fontSize: 18 }} style={{ color: "var(--ink-blue)", flexShrink: 0, marginTop: 1 }} />
            <p className="text-[12.5px]" style={{ color: "var(--tx-5)" }}>Cuando registres el costo de compra de las cubiertas, acá vas a ver también el costo por kilómetro por marca — el indicador definitivo de qué conviene comprar.</p>
          </div>
        </>
      )}
    </div>
  )
}

const SummaryCard = ({ label, icon, tint: accent, value, sublabel }) => (
  <div className="flex flex-col justify-between rounded-[14px] p-[18px_20px]" style={{ background: "var(--card)", border: "1px solid var(--bd)", minHeight: 120 }}>
    <div className="flex items-start justify-between">
      <span className="text-[13px]" style={{ color: "var(--tx-4)" }}>{label}</span>
      <span className="flex flex-none items-center justify-center rounded-[9px]" style={{ width: 32, height: 32, background: tint(accent, 14), color: accent }}>{icon}</span>
    </div>
    <div>
      <div className="font-display text-[26px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>{value}</div>
      <div className="mt-0.5 text-[12px]" style={{ color: "var(--tx-6)" }}>{sublabel}</div>
    </div>
  </div>
)

export default Reportes
