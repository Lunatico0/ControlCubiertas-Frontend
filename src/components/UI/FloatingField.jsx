import { useId } from "react"

// Campo con label FLOTANTE (patrón del login, pero theme-aware con los tokens del tema y CSS puro
// en index.css → funciona igual controlado (value/onChange) o con react-hook-form (spread de register).
// El label hace de placeholder y flota al enfocar o cuando hay valor.
//
// Props:
//   label      — texto del label (obligatorio para el efecto).
//   as         — "input" (default) | "textarea" | "select".
//   type       — para input (text/email/password/number/date...). date/time fuerzan el label arriba.
//   required   — muestra un asterisco rojo en el label.
//   error      — bool | string. Marca el borde y el label en rojo; si es string, lo muestra debajo.
//   rightAddon — nodo posicionado a la derecha (ej. el ojo de "mostrar contraseña").
//   children   — <option>s cuando as="select".
//   ...rest    — se spreadea al control (value/onChange, name/ref/onBlur de register, disabled, etc.).
//
// IMPORTANTE: el input/textarea llevan placeholder=" " (un espacio) para que :not(:placeholder-shown)
// detecte si hay valor. No pases un placeholder propio: el label ES el placeholder.
const ALWAYS_UP = new Set(["date", "time", "datetime-local", "month", "week", "color"])

const FloatingField = ({ label, as = "input", type = "text", required = false, error = false, className = "", children, id, rightAddon, ...rest }) => {
  const autoId = useId()
  const fieldId = id || autoId
  const isSelect = as === "select"
  const isTextarea = as === "textarea"
  const floatUp = isSelect || ALWAYS_UP.has(type)
  const errMsg = typeof error === "string" ? error : ""

  const cls = `ff-control ${className}`.trim()
  const control = isSelect ? (
    <select id={fieldId} className={cls} {...rest}>{children}</select>
  ) : isTextarea ? (
    <textarea id={fieldId} className={cls} placeholder=" " {...rest} />
  ) : (
    <input id={fieldId} type={type} className={cls} placeholder=" " {...rest} />
  )

  return (
    <div className="ff" data-error={error ? "true" : undefined} data-float-up={floatUp ? "true" : undefined}>
      {control}
      <label htmlFor={fieldId} className="ff-label">
        {label}{required && <span className="ff-req" aria-hidden="true">*</span>}
      </label>
      {rightAddon}
      {errMsg && <div className="ff-error-msg">{errMsg}</div>}
    </div>
  )
}

export default FloatingField
