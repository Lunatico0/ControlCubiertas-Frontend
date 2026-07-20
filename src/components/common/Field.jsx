// Campo de formulario del rediseño: label chico arriba + control (children) debajo.
// Unifica el <Field> que estaba repetido byte a byte en los drawers de la operativa
// (AltaDrawer, EditarVehiculo, TireDrawer).
const Field = ({ label, children }) => (
  <div className="mb-3">
    <label className="mb-1.5 block text-[12.5px] font-medium" style={{ color: "var(--tx-3)" }}>{label}</label>
    {children}
  </div>
)

export default Field
