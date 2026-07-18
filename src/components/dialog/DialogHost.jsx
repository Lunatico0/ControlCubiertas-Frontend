import { useState, useEffect, useRef, useCallback } from "react"
import { useTheme } from "@context/ThemeContext"
import { _registerDialog, _registerToast } from "@utils/dialog"
import DlgIcon from "./DialogIcons"

// Host único del sistema de diálogos. Se monta una vez (ContextProvider) y registra la
// API imperativa de @utils/dialog. Renderiza el backdrop + la variante activa + el toast.
// Overlay theme-aware (data-app-theme propio), foco atrapado, Esc y foco de vuelta al
// disparador al cerrar. Reemplaza SweetAlert2.

const NOTICE = {
  info: { icon: "info", color: "var(--ink-blue)", bg: "rgba(110,151,245,.14)" },
  success: { icon: "check", color: "var(--ink-lime)", bg: "rgba(196,237,43,.13)" },
  error: { icon: "err", color: "var(--ink-red)", bg: "rgba(240,86,74,.14)" },
}
const TOAST = {
  ok: { color: "var(--ink-lime)", bg: "rgba(196,237,43,.16)", icon: "check" },
  danger: { color: "var(--ink-red)", bg: "rgba(240,86,74,.16)", icon: "trash" },
  warn: { color: "var(--ink-orange)", bg: "rgba(240,133,31,.16)", icon: "warn" },
  info: { color: "var(--ink-blue)", bg: "rgba(110,151,245,.16)", icon: "info" },
}
const ANIM = {
  pop: "dlgPopIn .2s cubic-bezier(.22,1,.36,1)",
  slide: "dlgSlideIn .24s cubic-bezier(.22,1,.36,1)",
  fade: "dlgFadeIn .18s ease",
}

const neutralBtn = { height: 44, padding: "0 16px", border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx)", borderRadius: 9, fontSize: 14, fontWeight: 600, fontFamily: "'IBM Plex Sans'", cursor: "pointer" }
const primaryBtn = { height: 44, padding: "0 20px", border: "none", background: "#C4ED2B", color: "#0A0C0D", borderRadius: 9, fontSize: 14, fontWeight: 700, fontFamily: "'IBM Plex Sans'", cursor: "pointer" }
const cardBase = { width: "100%", background: "var(--card)", borderRadius: 14, boxShadow: "0 24px 64px rgba(0,0,0,.55)", outline: "none" }

const DialogHost = () => {
  const { isDarkMode } = useTheme()
  const [active, setActive] = useState(null) // { type, opts, resolve }
  const [ack, setAck] = useState(false)
  const [toast, setToast] = useState(null)
  const dlgRef = useRef(null)
  const lastTrigger = useRef(null)
  const toastTimer = useRef(null)

  useEffect(() => {
    _registerDialog((type, opts) => {
      lastTrigger.current = document.activeElement
      setAck(false)
      return new Promise((resolve) => setActive({ type, opts, resolve }))
    })
    _registerToast((t) => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
      setToast(t)
      toastTimer.current = setTimeout(() => setToast(null), 2800)
    })
    return () => {
      _registerDialog(null)
      _registerToast(null)
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  const close = useCallback((result) => {
    setActive((cur) => {
      if (cur) cur.resolve(result)
      return null
    })
    const t = lastTrigger.current
    if (t && t.focus) setTimeout(() => { try { t.focus() } catch { /* noop */ } }, 10)
  }, [])

  // Foco al abrir + Esc (cierra cualquier variante, incluida print).
  useEffect(() => {
    if (!active) return
    const id = setTimeout(() => { try { dlgRef.current && dlgRef.current.focus() } catch { /* noop */ } }, 30)
    const onKey = (e) => { if (e.key === "Escape") close(false) }
    window.addEventListener("keydown", onKey)
    return () => { clearTimeout(id); window.removeEventListener("keydown", onKey) }
  }, [active, close])

  // Foco atrapado (Tab cicla dentro del diálogo).
  const onTrap = (e) => {
    if (e.key !== "Tab") return
    const root = dlgRef.current
    if (!root) return
    const f = [...root.querySelectorAll('button,input,[tabindex="0"],a[href]')].filter((el) => !el.disabled && el.offsetParent !== null)
    if (!f.length) return
    const first = f[0], last = f[f.length - 1]
    if (e.shiftKey && (document.activeElement === first || document.activeElement === root)) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }

  if (!active && !toast) return null

  const o = active?.opts || {}
  const anim = ANIM[o.anim] || ANIM.pop
  const backdropFilter = o.blur ? "blur(4px)" : "none"
  const onBackdrop = () => { if (active && active.type !== "print") close(false) }
  const stop = (e) => e.stopPropagation()
  const dlgProps = { ref: dlgRef, tabIndex: -1, onClick: stop, onKeyDown: onTrap, style: null }

  return (
    <div data-app-theme={isDarkMode ? "dark" : "light"} style={{ fontFamily: "'IBM Plex Sans',system-ui,sans-serif" }}>
      {active && (
        <div onClick={onBackdrop} style={{ position: "fixed", inset: 0, background: "rgba(4,5,6,.62)", backdropFilter, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, animation: "dlgBackdropIn .16s ease" }}>

          {/* Confirmación simple */}
          {active.type === "confirm" && (
            <div {...dlgProps} role="dialog" aria-modal="true" style={{ ...cardBase, maxWidth: 420, border: "1px solid var(--bd-strong)", animation: anim }}>
              <div style={{ padding: "22px 22px 0 22px", display: "flex", gap: 14 }}>
                <span style={{ width: 42, height: 42, borderRadius: 11, background: "rgba(110,151,245,.14)", color: "var(--ink-blue)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><DlgIcon kind="ask" size={21} /></span>
                <div style={{ minWidth: 0, paddingTop: 2 }}>
                  <div style={{ fontFamily: "'Space Grotesk'", fontSize: 17, fontWeight: 600, color: "var(--tx)" }}>{o.title || "¿Confirmar la acción?"}</div>
                  {o.text && <div style={{ fontSize: 13, color: "var(--tx-4)", marginTop: 6, lineHeight: 1.55 }}>{o.text}</div>}
                </div>
              </div>
              <div style={{ padding: "20px 22px 18px 22px", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button className="dlg-btn-neutral" onClick={() => close(false)} style={neutralBtn}>{o.cancelLabel || "Cancelar"}</button>
                <button className="dlg-btn-primary" onClick={() => close(true)} style={primaryBtn}>{o.confirmLabel || "Confirmar"}</button>
              </div>
            </div>
          )}

          {/* Confirmación destructiva */}
          {active.type === "danger" && (
            <div {...dlgProps} role="dialog" aria-modal="true" style={{ ...cardBase, maxWidth: 440, border: "1px solid rgba(240,86,74,.38)", boxShadow: "0 24px 64px rgba(0,0,0,.55),0 0 0 4px rgba(240,86,74,.07)", animation: anim }}>
              <div style={{ padding: "22px 22px 0 22px", display: "flex", gap: 14 }}>
                <span style={{ width: 42, height: 42, borderRadius: 11, background: "rgba(240,90,75,.14)", color: "var(--ink-red)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><DlgIcon kind="trash" size={20} /></span>
                <div style={{ minWidth: 0, paddingTop: 2 }}>
                  <div style={{ fontFamily: "'Space Grotesk'", fontSize: 17, fontWeight: 600, color: "var(--tx)" }}>{o.title || "¿Confirmar la baja?"}</div>
                  {o.text && <div style={{ fontSize: 13, color: "var(--tx-4)", marginTop: 6, lineHeight: 1.55 }}>{o.text}</div>}
                </div>
              </div>
              {o.ack && (
                <label style={{ display: "flex", alignItems: "flex-start", gap: 10, margin: "16px 22px 0 22px", padding: "12px 13px", border: "1px solid var(--bd-strong)", borderRadius: 10, background: "var(--elev)", cursor: "pointer", userSelect: "none" }}>
                  <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} style={{ width: 16, height: 16, margin: "1px 0 0 0", accentColor: "var(--st-red)", cursor: "pointer" }} />
                  <span style={{ fontSize: 12.5, color: "var(--tx-3)", lineHeight: 1.5 }}>{o.ack}</span>
                </label>
              )}
              <div style={{ padding: "18px 22px", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button className="dlg-btn-neutral" onClick={() => close(false)} style={neutralBtn}>{o.cancelLabel || "Cancelar"}</button>
                <button
                  onClick={() => { if (!o.ack || ack) close(true) }}
                  disabled={o.ack && !ack}
                  style={{ height: 44, padding: "0 20px", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 700, fontFamily: "'IBM Plex Sans'", background: !o.ack || ack ? "#E04434" : "var(--elev)", color: !o.ack || ack ? "#fff" : "var(--tx-6)", cursor: !o.ack || ack ? "pointer" : "not-allowed" }}
                >{o.confirmLabel || "Sí, dar de baja"}</button>
              </div>
            </div>
          )}

          {/* Aviso info / éxito / error */}
          {active.type === "notice" && (() => {
            const nv = NOTICE[o.kind] || NOTICE.info
            return (
              <div {...dlgProps} role="alertdialog" aria-modal="true" style={{ ...cardBase, maxWidth: 400, border: "1px solid var(--bd-strong)", textAlign: "center", padding: "28px 26px 22px 26px", animation: anim }}>
                <span style={{ width: 54, height: 54, borderRadius: 15, background: nv.bg, color: nv.color, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><DlgIcon kind={nv.icon} size={24} /></span>
                <div style={{ fontFamily: "'Space Grotesk'", fontSize: 17, fontWeight: 600, color: "var(--tx)", marginTop: 15 }}>{o.title || ""}</div>
                {o.text && <div style={{ fontSize: 13, color: "var(--tx-4)", marginTop: 7, lineHeight: 1.55 }}>{o.text}</div>}
                <button className="dlg-btn-primary" onClick={() => close(true)} style={{ ...primaryBtn, marginTop: 20, width: "100%" }}>{o.confirmLabel || "Entendido"}</button>
              </div>
            )
          })()}

          {/* Imprimir y confirmar */}
          {active.type === "print" && (
            <div {...dlgProps} role="dialog" aria-modal="true" style={{ ...cardBase, maxWidth: 460, border: "1px solid var(--bd-strong)", display: "flex", flexDirection: "column", maxHeight: "92vh", animation: anim }}>
              <div style={{ flex: "none", padding: "18px 22px", borderBottom: "1px solid var(--bd-soft)", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(196,237,43,.13)", color: "var(--ink-lime)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><DlgIcon kind="printer" size={19} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Space Grotesk'", fontSize: 16, fontWeight: 600, color: "var(--tx)" }}>{o.title || "Comprobante"}</div>
                  <div style={{ fontSize: 12, color: "var(--tx-5)", marginTop: 1 }}>{o.subtitle || "Revisalo antes de confirmar el movimiento"}</div>
                </div>
                <div className="dlg-x" onClick={() => close(false)} style={{ color: "var(--tx-5)", cursor: "pointer", display: "inline-flex", padding: 5, borderRadius: 7 }}><DlgIcon kind="x" size={18} /></div>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px", background: "var(--elev)" }}>
                {o.receipt
                  ? o.receipt
                  : o.receiptHtml
                    ? <div style={{ maxWidth: 340, margin: "0 auto" }} dangerouslySetInnerHTML={{ __html: o.receiptHtml }} />
                    : <div style={{ textAlign: "center", color: "var(--tx-6)", fontSize: 12.5, padding: "30px 0", fontFamily: "'IBM Plex Mono'" }}>Vista previa del comprobante</div>}
              </div>
              <div style={{ flex: "none", padding: "15px 22px", borderTop: "1px solid var(--bd-soft)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button className="dlg-btn-neutral" onClick={() => close(false)} style={neutralBtn}>{o.cancelLabel || "Cancelar"}</button>
                <button className="dlg-btn-primary" onClick={() => close(true)} style={{ ...primaryBtn, padding: "0 18px", display: "inline-flex", alignItems: "center", gap: 9 }}><DlgIcon kind="printer" size={16} />{o.confirmLabel || "Imprimir y confirmar"}</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toast (abajo-centro) */}
      {toast && (() => {
        const tv = TOAST[toast.kind] || TOAST.ok
        return (
          <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 60, animation: "dlgToastIn .2s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--toast)", border: "1px solid var(--bd-strong)", borderRadius: 12, padding: "12px 16px", boxShadow: "0 16px 40px rgba(0,0,0,.45)", minWidth: 280 }}>
              <span style={{ width: 30, height: 30, borderRadius: 8, background: tv.bg, color: tv.color, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><DlgIcon kind={tv.icon} size={17} /></span>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--tx)" }}>{toast.title}</div>
                {toast.sub && <div style={{ fontSize: 11.5, color: "var(--tx-5)", fontFamily: "'IBM Plex Mono'" }}>{toast.sub}</div>}
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default DialogHost
