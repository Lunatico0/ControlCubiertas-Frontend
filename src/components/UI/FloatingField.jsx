import { useId, forwardRef } from "react"

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
//   ...rest    — se spreadea al control (value/onChange, name/onBlur de register, disabled, etc.).
//
// Va envuelto en forwardRef A PROPÓSITO: react-hook-form registra el campo por REF, y `ref` no
// viaja dentro de props. Sin el forwardRef, un `{...register("x")}` sobre este componente pierde
// el ref, RHF no ve el input y el formulario queda mudo — ni lee lo tipeado ni lo puebla con
// reset(). Si alguien lo saca, se rompen en silencio ChangePassword, UserForm y CompanySettings.
//
// IMPORTANTE: el input/textarea llevan placeholder=" " (un espacio) para que :not(:placeholder-shown)
// detecte si hay valor. No pases un placeholder propio: el label ES el placeholder.
const ALWAYS_UP = new Set(["date", "time", "datetime-local", "month", "week", "color"])

//   suggestions — array de strings: rinde un <datalist> y lo conecta al input. Es autocompletado
//                 SIN cerrar el campo: el operario puede elegir de lo ya cargado o escribir algo
//                 nuevo. Es lo que evita que "michelin" y "Michelin" convivan (t137).
const FloatingField = forwardRef(({ label, as = "input", type = "text", required = false, error = false, className = "", children, id, rightAddon, suggestions, ...rest }, ref) => {
  const autoId = useId()
  const fieldId = id || autoId
  const isSelect = as === "select"
  const isTextarea = as === "textarea"
  const floatUp = isSelect || ALWAYS_UP.has(type)
  const errMsg = typeof error === "string" ? error : ""

  const cls = `ff-control ${className}`.trim()
  // t153: el borde rojo era la ÚNICA marca de error. El color no es información para todo el
  // mundo: sin aria-invalid, un lector de pantalla (y cualquier validación automatizada) ve un
  // campo perfectamente válido. Y el mensaje, cuando lo había, quedaba suelto en el DOM en vez
  // de colgar del campo.
  const errId = errMsg ? `${fieldId}-err` : undefined
  const a11y = {
    ...(error ? { "aria-invalid": "true" } : {}),
    ...(errId ? { "aria-describedby": errId } : {}),
  }
  const listId = Array.isArray(suggestions) && suggestions.length ? `${fieldId}-sug` : undefined
  const control = isSelect ? (
    <select ref={ref} id={fieldId} className={cls} {...a11y} {...rest}>{children}</select>
  ) : isTextarea ? (
    <textarea ref={ref} id={fieldId} className={cls} placeholder=" " {...a11y} {...rest} />
  ) : (
    <input ref={ref} id={fieldId} type={type} className={cls} placeholder=" " list={listId} {...a11y} {...rest} />
  )

  return (
    <div className="ff" data-error={error ? "true" : undefined} data-float-up={floatUp ? "true" : undefined}>
      {control}
      <label htmlFor={fieldId} className="ff-label">
        {label}{required && <span className="ff-req" aria-hidden="true">*</span>}
      </label>
      {listId && <datalist id={listId}>{suggestions.map((s) => <option key={s} value={s} />)}</datalist>}
      {rightAddon}
      {errMsg && <div id={errId} role="alert" className="ff-error-msg">{errMsg}</div>}
    </div>
  )
})

FloatingField.displayName = "FloatingField"

export default FloatingField
