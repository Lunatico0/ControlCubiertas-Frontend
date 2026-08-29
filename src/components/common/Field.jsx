import { useId } from "react"

// Campo de formulario del rediseño: label chico arriba + control (children) debajo.
// Unifica el <Field> que estaba repetido byte a byte en los drawers de la operativa
// (AltaDrawer, EditarVehiculo, TireDrawer).
//
// t153: el <label> no tenía htmlFor, o sea que no etiquetaba nada — visualmente parecía un
// campo rotulado y para un lector de pantalla el control estaba mudo. Se resuelve pasándole
// el id al hijo: si `children` es una función, recibe el id y lo pone donde corresponda; si
// es un nodo suelto (el caso de los call sites viejos), se renderiza igual que antes.
const Field = ({ label, children }) => {
  const id = useId()
  return (
    <div className="mb-3">
      <label htmlFor={id} className="mb-1.5 block text-[12.5px] font-medium" style={{ color: "var(--tx-3)" }}>{label}</label>
      {typeof children === "function" ? children(id) : children}
    </div>
  )
}

export default Field
