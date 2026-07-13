import { useState, useEffect, useCallback } from "react"

// Motor de tour interactivo (rediseño Claude Design "TOUR INTERACTIVO"). Genérico: recibe
// los `steps` (cada layout define los suyos) y recorre la app con un spotlight sobre
// elementos data-tour="...". Cada paso puede pedir una `screen` — el tour navega (onNavigate)
// y luego mide el elemento para posicionar el foco. Lo usan la operativa y el panel admin.
const PAD = 8, TIP_W = 320, TIP_H = 190, GAP = 16

const OpTour = ({ steps, active, onNavigate, onClose }) => {
  const [i, setI] = useState(0)
  const [pos, setPos] = useState(null)
  const step = steps[i]
  const last = i === steps.length - 1

  const next = useCallback(() => (last ? onClose() : setI((n) => n + 1)), [last, onClose])
  const prev = useCallback(() => setI((n) => Math.max(0, n - 1)), [])

  // Navega a la pantalla del paso (el padre cambia `active`).
  useEffect(() => {
    if (step.screen && step.screen !== active) onNavigate(step.screen)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i])

  // Mide el elemento objetivo cuando el paso o la pantalla cambian (espera al montaje).
  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth || 1280, vh = window.innerHeight || 860
      let rect = null
      if (step.sel) {
        try { const el = document.querySelector(`[data-tour="${step.sel}"]`); if (el) rect = el.getBoundingClientRect() } catch { /* noop */ }
      }
      let tipTop, tipLeft
      if (rect) {
        if (step.place === "right") { tipLeft = rect.right + GAP; tipTop = rect.top }
        else if (step.place === "left") { tipLeft = rect.left - TIP_W - GAP; tipTop = rect.top }
        else if (step.place === "top") { tipLeft = rect.left; tipTop = rect.top - TIP_H - GAP }
        else { tipLeft = rect.left; tipTop = rect.bottom + GAP }
        tipLeft = Math.max(16, Math.min(tipLeft, vw - TIP_W - 16))
        tipTop = Math.max(16, Math.min(tipTop, vh - TIP_H - 16))
      } else { tipLeft = (vw - TIP_W) / 2; tipTop = (vh - TIP_H) / 2 }
      setPos({ rect, tipTop, tipLeft })
    }
    const raf1 = requestAnimationFrame(() => requestAnimationFrame(measure))
    const t = setTimeout(measure, 130) // fallback si el montaje de la screen tarda
    window.addEventListener("resize", measure)
    return () => { cancelAnimationFrame(raf1); clearTimeout(t); window.removeEventListener("resize", measure) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, active])

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); else if (e.key === "ArrowRight") next(); else if (e.key === "ArrowLeft") prev() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose, next, prev])

  if (!pos) return null
  const r = pos.rect

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200 }}>
      {r ? (
        <div style={{ position: "absolute", top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2, borderRadius: 12, boxShadow: "0 0 0 9999px rgba(4,5,6,.74)", border: "2px solid var(--st-lime)", transition: "all .18s ease", pointerEvents: "none" }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: "rgba(4,5,6,.74)" }} />
      )}

      <div style={{ position: "absolute", top: pos.tipTop, left: pos.tipLeft, width: TIP_W, background: "var(--card)", border: "1px solid var(--bd-strong)", borderRadius: 14, boxShadow: "0 20px 56px rgba(0,0,0,.6)", padding: "19px 20px 16px", transition: "all .18s ease" }}>
        <div className="mb-[9px] flex items-center gap-2">
          <span className="rounded-full px-[9px] py-[2px] text-[10.5px] font-semibold" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--ink-lime)", background: "color-mix(in srgb, var(--ink-lime) 13%, transparent)" }}>{i + 1} / {steps.length}</span>
        </div>
        <div className="mb-1.5 text-[17px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>{step.title}</div>
        <div className="text-[13px]" style={{ color: "var(--tx-3)", lineHeight: 1.55 }}>{step.body}</div>
        <div className="mt-4 flex items-center gap-2.5">
          <button onClick={onClose} className="text-[12.5px] font-semibold" style={{ color: "var(--tx-5)", background: "none", border: "none", cursor: "pointer" }}>Saltar</button>
          <div className="ml-auto flex gap-2">
            {i > 0 && <button onClick={prev} className="h-[38px] rounded-[9px] px-3.5 text-[13px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx)" }}>Atrás</button>}
            <button onClick={next} className="h-[38px] rounded-[9px] px-[18px] text-[13px] font-bold" style={{ border: "none", background: "var(--ink-lime)", color: "var(--card)" }}>{last ? "Finalizar" : "Siguiente"}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OpTour
