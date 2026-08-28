import SearchRoundedIcon from "@mui/icons-material/SearchRounded"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import Button from "@components/UI/Button"
import ViewToggle from "@components/UI/ViewToggle"

// Atajo de teclado según plataforma (⌘K en Mac/iOS, Ctrl+K en el resto).
const IS_MAC = typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || "")
const SHORTCUT_LABEL = IS_MAC ? "⌘K" : "Ctrl K"

const inputStyle = { background: "var(--card)", border: "1.5px solid var(--bd)", color: "var(--tx)" }

// Header/toolbar superior común a las pantallas operativas (Cubiertas, Vehículos).
// Encapsula lo COMÚN — contenedor sticky, título, buscador con foco lima y la zona
// derecha (acción secundaria opcional + acción primaria lima + ViewToggle opcional) —
// y deja lo específico como slots:
//   - search: { value, onChange, placeholder, showShortcut, inputRef }
//   - primaryAction: { label, onClick, icon, tour } → <Button variant="lime"> (AddRounded por default)
//   - secondaryAction: nodo opcional, va a la IZQUIERDA del primario
//   - viewToggle: { value, onChange, options, tour } → <ViewToggle> (SIEMPRE en la fila 1, junto al primario)
//   - children: fila secundaria (tabs/filtros de Cubiertas, chips de Vehículos), con su propio espaciado
// El ancho del buscador (SEARCH_MAX) es FIJO para que el header se vea idéntico en todas las pantallas.
const SEARCH_MAX = 460
// `count` (t152): el conteo de resultados vivía SOLO adentro del panel de Filtros. Con el
// panel cerrado, buscando un código, no había ningún número que dijera cuántas quedaron.
// `onClear` (t148): la x del input, para no tener que borrar a mano lo tipeado.
const ScreenHeader = ({ title, count, search, primaryAction, secondaryAction, viewToggle, children }) => {
  const { value, onChange, placeholder, showShortcut = false, inputRef, onClear } = search || {}
  return (
    <div className="sticky top-0 z-5 px-7 pb-4 pt-5" style={{ background: "var(--bg)", borderBottom: "1px solid var(--bd-faint)" }}>
      <div className="flex items-center gap-4">
        <h1 className="text-[24px] font-bold tracking-[-.02em]" style={{ fontFamily: "var(--font-display)", color: "var(--tx)" }}>{title}</h1>
        {count != null && (
          <span className="flex-none text-[12.5px]" style={{ fontFamily: "var(--font-mono)", color: "var(--tx-5)" }}>
            {count} resultado{count === 1 ? "" : "s"}
          </span>
        )}
        <div className="relative ml-2 flex-1" style={{ maxWidth: SEARCH_MAX }}>
          <span className="absolute left-[15px] top-1/2 -translate-y-1/2" style={{ color: "var(--tx-7)" }}>
            <SearchRoundedIcon sx={{ fontSize: 18 }} />
          </span>
          <input
            ref={inputRef}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`h-[46px] w-full rounded-[var(--r-md)] pl-[42px] ${showShortcut ? "pr-4 lg:pr-[58px]" : "pr-4"} text-[14.5px] outline-none`}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "var(--ink-lime)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--bd)")}
          />
          {/* t148: la x del buscador. Con un filtro de estado y un texto activos a la vez, el
              operario no siempre entiende qué le está escondiendo las cubiertas; borrar lo
              tipeado tenía que ser un gesto, no un viaje al input a apretar backspace. */}
          {onClear && value && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Limpiar la búsqueda"
              title="Limpiar la búsqueda"
              className={`absolute top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-[var(--r-sm)] ${showShortcut ? "right-[13px] lg:right-[62px]" : "right-[13px]"}`}
              style={{ color: "var(--tx-5)", border: "none", background: "transparent" }}
            >
              <CloseRoundedIcon sx={{ fontSize: 16 }} />
            </button>
          )}
          {showShortcut && (
            // El badge del atajo se esconde por debajo de lg: ahí la barra ya está apretada
            // (título + buscador + acción + toggle) y los 58px que reserva dejan el placeholder
            // cortado justo contra él. El atajo sigue funcionando, sólo deja de anunciarse.
            <span className="absolute right-[13px] top-1/2 hidden -translate-y-1/2 rounded-[var(--r-sm)] px-[7px] py-[3px] text-[11px] lg:inline-block" style={{ fontFamily: "var(--font-mono)", color: "var(--tx-5)", border: "1px solid var(--bd-strong)" }}>
              {SHORTCUT_LABEL}
            </span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-4">
          {secondaryAction}
          {primaryAction && (
            <Button variant="lime" data-tour={primaryAction.tour} onClick={primaryAction.onClick} className="h-[46px] text-[14.5px]" style={{ background: "var(--brand)", color: "var(--brand-ink)" }}>
              {primaryAction.icon || <AddRoundedIcon sx={{ fontSize: 18 }} />} {primaryAction.label}
            </Button>
          )}
          {viewToggle && (
            <ViewToggle value={viewToggle.value} onChange={viewToggle.onChange} options={viewToggle.options} data-tour={viewToggle.tour} />
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

export default ScreenHeader
