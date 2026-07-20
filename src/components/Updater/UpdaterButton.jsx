// Botón del sidebar que abre el modal de actualizaciones (solo desktop).
// Ceñido al diseño: mismo lenguaje que el toggle de tema del sidebar.
const UpdaterButton = ({ current, bip, onClick }) => (
  <button
    onClick={onClick}
    className="relative flex w-full items-center gap-[11px] rounded-[9px] px-3 py-[10px]"
    style={{ border: "1px solid var(--bd)", background: "var(--elev)", color: "var(--tx-3)" }}
  >
    <span className="relative inline-flex h-5 w-5 flex-none items-center" style={{ color: "var(--ink-lime)" }}>
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2" />
        <path d="M12 12v9" />
        <path d="m8.5 17.5 3.5 3.5 3.5-3.5" />
      </svg>
      {bip && (
        <span
          className="absolute"
          style={{ top: -2, right: -3, width: 9, height: 9, borderRadius: "50%", background: "var(--st-red)", border: "2px solid var(--elev)" }}
        />
      )}
    </span>
    <span className="text-[13px] font-medium" style={{ color: "var(--tx-2)" }}>
      Actualizar
    </span>
    <span className="ml-auto text-[10.5px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>
      v{current}
    </span>
  </button>
)

export default UpdaterButton
