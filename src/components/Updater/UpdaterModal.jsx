import { useState } from "react"
import Modal from "@components/common/Modal"

// Modal del auto-updater. Usa el shell compartido <Modal/> (overlay + card + header + Escape).
// El contenido cambia según `phase`. La lista de releases es informativa (changelog);
// la descarga/instalación aparece SOLO en la fila de la última versión (última del array).

const LIME = "#C4ED2B"
const INK = "#0A0C0D"

// dd/mm/aaaa (es-AR) desde un ISO string.
const fmtDate = (iso) => {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  return `${dd}/${mm}/${d.getFullYear()}`
}

// bytes → "48,2 MB"
const fmtSize = (bytes) => (bytes ? `${(bytes / 1048576).toFixed(1).replace(".", ",")} MB` : "")

// notas (string markdown/plaintext) → bullets, sin viñetas duplicadas ni líneas vacías.
const parseNotes = (notes) =>
  (notes || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^[-*]\s+/, ""))

// Spinner autocontenido (Tailwind animate-spin + tokens).
const Spin = () => (
  <div
    className="animate-spin rounded-full"
    style={{ width: 34, height: 34, border: "3px solid var(--bd-strong)", borderTopColor: "var(--ink-lime)" }}
  />
)

const UpdaterModal = ({ current, phase, list, dl, installingV, onClose, onRecheck, onDownload, onInstallNow, onInstallLater }) => {
  const [infoVer, setInfoVer] = useState(null) // versión con las notas abiertas (toggle)

  const label = list.length === 1 ? "Hay 1 versión más nueva disponible:" : `Hay ${list.length} versiones más nuevas disponibles:`

  // Acción de descarga/instalación (solo se renderiza en la fila latest).
  const renderAction = (version) => {
    if (dl.st === "downloading") {
      return (
        <div className="w-full">
          <div className="mb-1.5 flex items-center justify-between text-[10.5px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-4)" }}>
            <span>Descargando…</span>
            <span>{Math.round(dl.pct)} %</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--bd-strong)" }}>
            <div className="h-full rounded-full" style={{ width: `${dl.pct}%`, background: "var(--ink-lime)", transition: "width .2s ease" }} />
          </div>
        </div>
      )
    }
    if (dl.st === "downloaded") {
      return (
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => onInstallNow(version)} className="rounded-[8px] px-3.5 py-2 text-[12.5px] font-bold" style={{ background: LIME, color: INK }}>
            Instalar y reiniciar
          </button>
          <button type="button" onClick={() => onInstallLater(version)} className="rounded-[8px] px-3.5 py-2 text-[12.5px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx)" }}>
            Instalar en el siguiente inicio
          </button>
        </div>
      )
    }
    if (dl.st === "scheduled") {
      return (
        <span className="text-[12.5px] font-medium" style={{ color: "var(--ink-teal)" }}>
          Se instalará al reiniciar
        </span>
      )
    }
    // idle
    return (
      <button type="button" onClick={onDownload} className="rounded-[8px] px-4 py-2 text-[12.5px] font-bold" style={{ background: LIME, color: INK }}>
        Descargar
      </button>
    )
  }

  return (
    <Modal title="Actualizaciones" onClose={onClose} maxWidth={460} bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}>
      {phase === "checking" && (
        <div className="flex flex-col items-center gap-3.5 py-8 text-center">
          <Spin />
          <div className="text-[13.5px]" style={{ color: "var(--tx-3)" }}>
            Buscando actualizaciones…
          </div>
        </div>
      )}

      {phase === "uptodate" && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="flex items-center justify-center rounded-full" style={{ width: 54, height: 54, background: "rgba(196,237,43,.10)", color: "var(--ink-lime)" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <div className="text-[16px] font-semibold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>
            Estás al día
          </div>
          <div className="text-[13px]" style={{ color: "var(--tx-4)" }}>
            Estás usando la versión más actual (v{current}).
          </div>
          <button type="button" onClick={onRecheck} className="mt-1 rounded-[9px] px-4 py-2.5 text-[13px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx)" }}>
            Buscar de nuevo
          </button>
        </div>
      )}

      {phase === "installing" && (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <Spin />
          <div className="text-[15px] font-semibold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>
            Instalando v{installingV}…
          </div>
          <div className="text-[13px]" style={{ color: "var(--tx-4)" }}>
            La app se reiniciará.
          </div>
        </div>
      )}

      {phase === "list" && (
        <div className="flex flex-col gap-3">
          <div className="text-[12.5px]" style={{ color: "var(--tx-4)" }}>
            {label}
          </div>

          {list.map((rel, i) => {
            const isLatest = i === list.length - 1
            const openInfo = infoVer === rel.version
            const notes = parseNotes(rel.notes)
            return (
              <div key={rel.version} className="rounded-[11px]" style={{ border: `1px solid ${isLatest ? "var(--bd-strong)" : "var(--bd)"}`, padding: 13 }}>
                {/* Encabezado de la fila */}
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>
                    v{rel.version}
                  </span>
                  {isLatest && (
                    <span className="rounded-full px-2 py-[3px] text-[9.5px] font-bold tracking-wide" style={{ fontFamily: "'IBM Plex Mono'", background: LIME, color: INK }}>
                      Última
                    </span>
                  )}
                  <span className="ml-auto flex items-center gap-2.5 text-[10.5px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>
                    {rel.date && <span>{fmtDate(rel.date)}</span>}
                    {rel.size ? <span>{fmtSize(rel.size)}</span> : null}
                  </span>
                </div>

                {/* Toggle de notas */}
                <div className="mt-2.5">
                  <button
                    type="button"
                    onClick={() => setInfoVer(openInfo ? null : rel.version)}
                    className="inline-flex items-center gap-1.5 rounded-[7px] px-2.5 py-[7px] text-[11.5px] font-medium"
                    style={{ border: "1px solid var(--bd)", background: "var(--elev)", color: "var(--tx-3)" }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 16v-4M12 8h.01" />
                    </svg>
                    {openInfo ? "Ocultar notas" : "Ver notas"}
                  </button>
                </div>

                {/* Notas (bullets) */}
                {openInfo && (
                  <div className="mt-2.5 rounded-[9px]" style={{ background: "var(--elev)", border: "1px solid var(--bd-soft)", padding: 12 }}>
                    {notes.length ? (
                      <ul className="flex flex-col gap-1.5">
                        {notes.map((n, k) => (
                          <li key={k} className="flex gap-2 text-[12px]" style={{ color: "var(--tx-3)", lineHeight: 1.45 }}>
                            <span className="flex-none" style={{ color: "var(--ink-lime)" }}>•</span>
                            <span>{n}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-[12px]" style={{ color: "var(--tx-5)" }}>
                        Sin notas para esta versión.
                      </div>
                    )}
                  </div>
                )}

                {/* Descarga/instalación: SOLO en la última versión */}
                {isLatest && (
                  <div className="mt-3 flex items-center pt-3" style={{ borderTop: "1px solid var(--bd-soft)" }}>
                    {renderAction(rel.version)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Modal>
  )
}

export default UpdaterModal
