import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded"
import NavigateBeforeRoundedIcon from "@mui/icons-material/NavigateBeforeRounded"

// Paginador de la operativa (design system de tokens var(--x)). El de TireList es del look
// legacy (bg-gray-*) y no se puede reusar tal cual acá.
//
// Muestra primera, última y una ventana alrededor de la actual, con "…" en los huecos. Las
// keys van con prefijo porque los puntos suspensivos usan el índice y las páginas el número:
// sin prefijo, el hueco en la posición 3 choca con la página 3 y React duplica u omite nodos.
const ventana = (currentPage, totalPages, delta = 1) => {
  const rango = []
  const desde = Math.max(2, currentPage - delta)
  const hasta = Math.min(totalPages - 1, currentPage + delta)
  for (let i = desde; i <= hasta; i++) rango.push(i)
  if (desde > 2) rango.unshift("…")
  if (hasta < totalPages - 1) rango.push("…")
  return [1, ...rango, ...(totalPages > 1 ? [totalPages] : [])]
}

const Paginador = ({ currentPage, totalPages, goToPage, nextPage, prevPage, total, mostrados }) => {
  if (totalPages <= 1) return null

  const btn = (activo) => ({
    minWidth: 34,
    height: 34,
    borderRadius: "var(--r-md)",
    border: `1px solid ${activo ? "var(--ink-lime)" : "var(--bd)"}`,
    background: activo ? "color-mix(in srgb, var(--ink-lime) 12%, transparent)" : "var(--card)",
    color: activo ? "var(--tx)" : "var(--tx-3)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  })

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
      {total != null && (
        <span className="mr-2 text-[12.5px]" style={{ color: "var(--tx-5)" }}>
          {mostrados} de {total}
        </span>
      )}

      <button onClick={prevPage} disabled={currentPage === 1} aria-label="Página anterior"
        className="inline-flex items-center justify-center px-2 disabled:opacity-40" style={btn(false)}>
        <NavigateBeforeRoundedIcon sx={{ fontSize: 18 }} />
      </button>

      {ventana(currentPage, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`hueco-${i}`} className="px-1 text-[13px]" style={{ color: "var(--tx-6)" }}>…</span>
        ) : (
          <button key={`pag-${p}`} onClick={() => goToPage(p)} aria-current={p === currentPage ? "page" : undefined}
            className="inline-flex items-center justify-center px-2" style={btn(p === currentPage)}>
            {p}
          </button>
        ),
      )}

      <button onClick={nextPage} disabled={currentPage === totalPages} aria-label="Página siguiente"
        className="inline-flex items-center justify-center px-2 disabled:opacity-40" style={btn(false)}>
        <NavigateNextRoundedIcon sx={{ fontSize: 18 }} />
      </button>
    </div>
  )
}

export default Paginador
