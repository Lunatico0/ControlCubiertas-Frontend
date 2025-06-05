/**
 * Campo personalizado para formularios de vehículos
 * @param {Object} props - Propiedades del componente
 * @param {string} props.label - Etiqueta del campo
 * @param {React.ReactNode} props.children - Contenido del campo
 * @param {string} props.error - Mensaje de error
 */
const VehicleField = ({ label, children, error }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-semibold">{label}</label>}
    {children}
    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
  </div>
)

export default VehicleField
