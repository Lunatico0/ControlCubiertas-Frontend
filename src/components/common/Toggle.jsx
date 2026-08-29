// Interruptor on/off compartido. Vivía duplicado como componente local del editor de
// comprobante, sin `type`, sin rol y sin teclado: un <button> sin type dentro de un <form>
// es submit por defecto, así que reusar aquel dentro de la pantalla de Empresa habría guardado
// el formulario entero cada vez que alguien tocaba el interruptor.
const Toggle = ({ on, onChange, label, disabled = false, w = 38, knob = 16 }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    aria-label={label}
    disabled={disabled}
    onClick={() => !disabled && onChange?.(!on)}
    className="relative inline-flex flex-none disabled:cursor-not-allowed disabled:opacity-40"
    style={{
      width: w,
      height: knob + 6,
      borderRadius: "var(--r-pill)",
      border: "none",
      background: on ? "var(--ink-lime)" : "var(--bd-strong)",
      cursor: "pointer",
    }}
  >
    <span
      className="absolute rounded-full"
      style={{
        top: 3,
        left: on ? w - knob - 3 : 3,
        width: knob,
        height: knob,
        background: "#fff",
        boxShadow: "0 1px 2px rgba(0,0,0,.25)",
        transition: "left .15s",
      }}
    />
  </button>
)

export default Toggle
