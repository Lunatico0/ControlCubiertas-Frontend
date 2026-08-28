import SearchRoundedIcon from "@mui/icons-material/SearchRounded"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
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
const ScreenHeader = ({ title, search, primaryAction, secondaryAction, viewToggle, children }) => {
  const { value, onChange, placeholder, showShortcut = false, inputRef } = search || {}
  return (
    <div className="sticky top-0 z-5 px-7 pb-4 pt-5" style={{ background: "var(--bg)", borderBottom: "1px solid var(--bd-faint)" }}>
      <div className="flex items-center gap-4">
        <h1 className="text-[24px] font-bold tracking-[-.02em]" style={{ fontFamily: "var(--font-display)", color: "var(--tx)" }}>{title}</h1>
        <div className="relative ml-2 flex-1" style={{ maxWidth: SEARCH_MAX }}>
          <span className="absolute left-[15px] top-1/2 -translate-y-1/2" style={{ color: "var(--tx-7)" }}>
            <SearchRoundedIcon sx={{ fontSize: 18 }} />
          </span>
          <input
            ref={inputRef}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`h-[46px] w-full rounded-[var(--r-md)] pl-[42px] ${showShortcut ? "pr-[58px]" : "pr-4"} text-[14.5px] outline-none`}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "var(--ink-lime)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--bd)")}
          />
          {showShortcut && (
            <span className="absolute right-[13px] top-1/2 -translate-y-1/2 rounded-[var(--r-sm)] px-[7px] py-[3px] text-[11px]" style={{ fontFamily: "var(--font-mono)", color: "var(--tx-5)", border: "1px solid var(--bd-strong)" }}>
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
