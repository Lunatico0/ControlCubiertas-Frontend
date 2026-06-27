import { useState, useEffect } from "react"
import { fetchTireById } from "@api/tires"
import { showToast } from "@utils/toast"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined"
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import { metaOf, tint, fmtKm, fmtDate, StateBadge, Pips } from "./status"

// Drawer lateral de detalle de una cubierta. Reemplaza los modales apilados:
// mantiene la lista visible detrás y no apila capas. Hito 3a: info + timeline
// (lectura). Las acciones (asignar/desasignar/recapar) se cablean en el hito 3b.
const InfoRow = ({ label, value, mono, color }) => (
  <div className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--bd-faint)" }}>
    <span className="text-[12.5px]" style={{ color: "var(--tx-5)" }}>{label}</span>
    <span className="text-[13px] font-medium" style={{ color: color || "var(--tx-2)", fontFamily: mono ? "'IBM Plex Mono'" : undefined }}>{value}</span>
  </div>
)

const TireDrawer = ({ tireId, onClose }) => {
  const [tire, setTire] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tireId) return
    let alive = true
    setLoading(true)
    fetchTireById(tireId)
      .then((t) => alive && setTire(t))
      .catch((e) => showToast("error", e.message || "No se pudo cargar la cubierta"))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [tireId])

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const soon = (m) => showToast("info", m || "Acción — próximo hito (3b)")
  const history = [...(tire?.history || [])].sort((a, b) => new Date(b.date) - new Date(a.date))
  const m = tire ? metaOf(tire.status) : null

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(0,0,0,.45)" }} onClick={onClose}>
      <aside
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-[460px] flex-col"
        style={{ background: "var(--card)", borderLeft: "1px solid var(--bd)", animation: "opDrawerIn .18s ease" }}
      >
        {loading || !tire ? (
          <div className="flex h-full items-center justify-center text-[13px]" style={{ color: "var(--tx-5)" }}>
            {loading ? "Cargando…" : "Sin datos"}
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 p-5" style={{ borderBottom: "1px solid var(--bd-soft)" }}>
              <div>
                <div className="text-[11px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>{tire.serialNumber || "—"}</div>
                <div className="flex items-center gap-3">
                  <span className="text-[26px] font-bold leading-none" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>#{tire.code}</span>
                  <StateBadge status={tire.status} />
                </div>
              </div>
              <button onClick={onClose} className="rounded-[7px] p-2" style={{ color: "var(--tx-5)" }} title="Cerrar">
                <CloseRoundedIcon sx={{ fontSize: 20 }} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-5">
              {/* Recapados */}
              <div className="mb-4 flex items-center gap-3">
                <span className="text-[10px] tracking-[.06em]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>RECAPADOS</span>
                <Pips level={m.level} />
              </div>

              {/* Info */}
              <div className="mb-5">
                <InfoRow label="Marca" value={tire.brand} />
                <InfoRow label="Rodado" value={tire.size} mono />
                <InfoRow label="Dibujo" value={tire.pattern || "—"} />
                <InfoRow label="Ubicación" value={tire.vehicle?.mobile || "En depósito"} color={tire.vehicle ? "var(--ink-blue)" : "var(--tx-2)"} />
                <InfoRow label="Kilómetros" value={fmtKm(tire.kilometers)} mono />
                <InfoRow label="Fecha de alta" value={fmtDate(tire.createdAt)} mono />
              </div>

              {/* Acciones (placeholder hasta el hito 3b) */}
              <div className="mb-6 flex flex-wrap gap-2">
                {!tire.vehicle && tire.status !== "Descartada" && (
                  <button onClick={() => soon("Asignar a vehículo — próximo hito (3b)")} className="inline-flex h-10 items-center gap-2 rounded-[9px] px-4 text-[13px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--ink-lime)" }}>
                    <LocalShippingOutlinedIcon sx={{ fontSize: 16 }} /> Asignar
                  </button>
                )}
                {tire.vehicle && (
                  <button onClick={() => soon("Desasignar — próximo hito (3b)")} className="inline-flex h-10 items-center gap-2 rounded-[9px] px-4 text-[13px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx-2)" }}>
                    <RemoveRoundedIcon sx={{ fontSize: 16 }} /> Desasignar
                  </button>
                )}
                {tire.status === "A recapar" && (
                  <button onClick={() => soon("Recapado listo — próximo hito (3b)")} className="inline-flex h-10 items-center gap-2 rounded-[9px] px-4 text-[13px] font-semibold" style={{ border: "1px solid " + tint("var(--ink-teal)", 40), background: tint("var(--ink-teal)", 10), color: "var(--ink-teal)" }}>
                    <CheckRoundedIcon sx={{ fontSize: 16 }} /> Recapado listo
                  </button>
                )}
              </div>

              {/* Timeline del historial */}
              <div className="mb-2 text-[10px] tracking-[.06em]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>HISTORIAL</div>
              {history.length === 0 ? (
                <p className="text-[13px]" style={{ color: "var(--tx-5)" }}>Esta cubierta todavía no tiene movimientos registrados.</p>
              ) : (
                <ol className="relative ml-1" style={{ borderLeft: "1.5px solid var(--bd)" }}>
                  {history.map((h, i) => {
                    const hm = metaOf(h.status)
                    return (
                      <li key={h._id || i} className="relative py-3 pl-5">
                        <span className="absolute left-0 top-[18px] -translate-x-1/2 rounded-full" style={{ width: 10, height: 10, background: hm.color, boxShadow: "0 0 0 3px var(--card)" }} />
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[13px] font-semibold" style={{ color: "var(--tx)" }}>{h.type || "Movimiento"}</span>
                          <span className="text-[11px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>{fmtDate(h.date)}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px]" style={{ color: "var(--tx-5)" }}>
                          {h.status && <span style={{ color: hm.color }}>{h.status}</span>}
                          {(h.km != null || h.kmAlta != null) && <span style={{ fontFamily: "'IBM Plex Mono'" }}>{fmtKm(h.km ?? h.kmAlta)}</span>}
                          {h.receiptNumber && <span style={{ fontFamily: "'IBM Plex Mono'" }}>Comp. {h.receiptNumber}</span>}
                        </div>
                      </li>
                    )
                  })}
                </ol>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  )
}

export default TireDrawer
