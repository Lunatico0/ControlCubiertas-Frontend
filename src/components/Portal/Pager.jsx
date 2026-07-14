import KeyboardArrowLeftRoundedIcon from "@mui/icons-material/KeyboardArrowLeftRounded"
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded"
import KeyboardDoubleArrowLeftRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowLeftRounded"
import KeyboardDoubleArrowRightRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowRightRounded"

// Lista de páginas con elipsis: [1, …, current±delta, …, total]. Siempre muestra primera y última.
const pageList = (current, total, delta = 2) => {
  const range = []
  const start = Math.max(2, current - delta)
  const end = Math.min(total - 1, current + delta)
  for (let i = start; i <= end; i++) range.push(i)
  if (start > 2) range.unshift("…")
  if (end < total - 1) range.push("…")
  return [1, ...range, total]
}

// Pager numerado con saltos (primera/última), prev/next y elipsis. Página actual resaltada.
// Reutilizable para cualquier lista paginada del panel. onChange(page) recibe la página elegida.
const Pager = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null
  const go = (p) => { if (p >= 1 && p <= totalPages && p !== page) onChange(p) }
  const NavBtn = ({ disabled, onClick, title, children }) => (
    <button title={title} onClick={onClick} disabled={disabled}
      style={{ width: 32, height: 32, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid var(--bd)", background: "var(--card)", color: "var(--tx-4)", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1 }}>
      {children}
    </button>
  )
  return (
    <div className="flex items-center gap-1.5">
      <NavBtn disabled={page <= 1} onClick={() => go(1)} title="Primera"><KeyboardDoubleArrowLeftRoundedIcon sx={{ fontSize: 17 }} /></NavBtn>
      <NavBtn disabled={page <= 1} onClick={() => go(page - 1)} title="Anterior"><KeyboardArrowLeftRoundedIcon sx={{ fontSize: 18 }} /></NavBtn>
      {pageList(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} style={{ width: 22, textAlign: "center", color: "var(--tx-6)", fontFamily: "'IBM Plex Mono'", fontSize: 13 }}>…</span>
        ) : (
          <button key={p} onClick={() => go(p)}
            style={{ minWidth: 32, height: 32, padding: "0 8px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, fontFamily: "'IBM Plex Sans'", cursor: "pointer",
              border: `1px solid ${p === page ? "var(--tx)" : "var(--bd)"}`,
              background: p === page ? "var(--tx)" : "var(--card)",
              color: p === page ? "var(--bg)" : "var(--tx-3)" }}>{p}</button>
        ),
      )}
      <NavBtn disabled={page >= totalPages} onClick={() => go(page + 1)} title="Siguiente"><KeyboardArrowRightRoundedIcon sx={{ fontSize: 18 }} /></NavBtn>
      <NavBtn disabled={page >= totalPages} onClick={() => go(totalPages)} title="Última"><KeyboardDoubleArrowRightRoundedIcon sx={{ fontSize: 17 }} /></NavBtn>
    </div>
  )
}

export default Pager
