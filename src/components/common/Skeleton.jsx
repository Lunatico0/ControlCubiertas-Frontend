// Skeletons de carga del rediseño (t143 de la auditoría de QA del operario).
//
// El estado de carga anterior era un renglón de 13px en var(--tx-5) arriba a la izquierda de
// una pantalla en blanco. A distancia de brazo, en un taller con luz de más, eso se lee como
// "no cargó", no como "está cargando". Un skeleton con la SILUETA del contenido real dice dos
// cosas de un vistazo: que la app está viva y qué va a aparecer.
//
// Accesibilidad: los bloques son decorativos (aria-hidden). El contenedor es UN solo
// role="status" aria-busy con el texto real, así el lector de pantalla anuncia "Cargando
// cubiertas…" una vez y no cuarenta rectángulos.
//
// Nada de gray-200/dark:gray-700 acá: eso es TireList/LoadingGrid.jsx, del sistema legacy,
// que no es theme-aware con los tokens del rediseño.

// La animación vive en index.css (@keyframes skelPulse) para respetar prefers-reduced-motion
// sin duplicar la media query en JS.
const BLOQUE = {
  background: "var(--bd-soft)",
  borderRadius: "var(--r-sm)",
  animation: "skelPulse 1.4s var(--t-ease, ease-in-out) infinite",
}

// Un bloque suelto. `className` maneja el tamaño con las utilidades de Tailwind del proyecto.
const Skeleton = ({ className = "", style }) => (
  <div aria-hidden="true" className={className} style={{ ...BLOQUE, ...style }} />
)

// Envoltorio accesible común a las dos variantes: un único anuncio para todo el bloque.
const Region = ({ label, children, className = "", style }) => (
  <div role="status" aria-busy="true" aria-live="polite" className={className} style={style}>
    <span className="sr-only">{label}</span>
    {children}
  </div>
)

// Silueta de la vista de tarjetas (Cubiertas en grid, Vehículos en grid).
export const SkeletonCards = ({ count = 8, label = "Cargando…", minWidth = 260 }) => (
  <Region
    label={label}
    className="grid gap-[14px]"
    style={{ gridTemplateColumns: `repeat(auto-fill,minmax(${minWidth}px,1fr))` }}
  >
    {Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        data-skeleton-card
        className="flex flex-col gap-[13px] rounded-[var(--r-lg)] p-4"
        style={{ border: "1px solid var(--bd)", background: "var(--card)" }}
      >
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-[11px] w-[72px]" />
            <Skeleton className="h-[22px] w-[92px]" />
          </div>
          <Skeleton className="h-[22px] w-[76px]" style={{ borderRadius: "var(--r-pill)" }} />
        </div>
        <Skeleton className="h-[13px] w-[120px]" />
        <div className="flex flex-col gap-[7px]">
          {Array.from({ length: 4 }, (_, r) => (
            <div key={r} className="flex items-center justify-between gap-4">
              <Skeleton className="h-[11px] w-[64px]" />
              <Skeleton className="h-[11px] flex-1" style={{ maxWidth: 110 }} />
            </div>
          ))}
        </div>
        <div className="flex gap-2 border-t pt-[11px]" style={{ borderColor: "var(--bd-soft)" }}>
          <Skeleton className="h-[34px] flex-1" style={{ borderRadius: "var(--r-md)" }} />
          <Skeleton className="h-[34px] w-[34px]" style={{ borderRadius: "var(--r-md)" }} />
        </div>
      </div>
    ))}
  </Region>
)

// Silueta de la vista de tabla. `cols` replica la cantidad de columnas para que el ancho de
// las celdas fantasma no cambie de golpe cuando entra el contenido real.
export const SkeletonRows = ({ count = 8, cols = 5, label = "Cargando…" }) => (
  <Region
    label={label}
    className="overflow-hidden rounded-[var(--r-lg)]"
    style={{ border: "1px solid var(--bd)", background: "var(--card)" }}
  >
    <div className="px-[18px] py-3" style={{ background: "var(--elev)", borderBottom: "1px solid var(--bd)" }}>
      <Skeleton className="h-[11px] w-[180px]" />
    </div>
    {Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        data-skeleton-row
        className="grid items-center gap-3 px-[18px] py-[15px]"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, borderBottom: "1px solid var(--bd-faint)" }}
      >
        {Array.from({ length: cols }, (_, c) => (
          <Skeleton key={c} className="h-[13px]" style={{ width: c === 0 ? "72%" : "54%" }} />
        ))}
      </div>
    ))}
  </Region>
)

// Silueta de una lista simple de filas con ícono (el bloque PARA HOY del Inicio).
export const SkeletonList = ({ count = 3, label = "Cargando…" }) => (
  <Region
    label={label}
    className="overflow-hidden rounded-[var(--r-lg)]"
    style={{ border: "1px solid var(--bd)", background: "var(--card)" }}
  >
    {Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        data-skeleton-row
        className="flex items-center gap-[13px] px-[18px] py-[14px]"
        style={{ borderBottom: i < count - 1 ? "1px solid var(--bd-faint)" : "none" }}
      >
        <Skeleton className="h-[38px] w-[38px] flex-none" style={{ borderRadius: "var(--r-md)" }} />
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-[13px] w-[42%]" />
          <Skeleton className="h-[11px] w-[26%]" />
        </div>
        <Skeleton className="h-[30px] w-[86px] flex-none" style={{ borderRadius: "var(--r-md)" }} />
      </div>
    ))}
  </Region>
)

export default Skeleton
