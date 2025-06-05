/**
 * Campo personalizado para formularios de cubiertas
 * @param {Object} props - Propiedades del componente
 * @param {string} props.label - Etiqueta del campo
 * @param {React.ReactNode} props.children - Contenido del campo
 * @param {string} props.error - Mensaje de error
 */
const TireField = ({ label, children, error }) => (
  <div className="relative w-full font-inter mb-6">
    {children}
    <label className="absolute rounded-full left-3 -top-2.5 text-sm px-1 bg-gray-100 dark:bg-gray-800 backdrop-blur-sm text-gray-600 dark:text-gray-300 z-10">
      {label}
    </label>
    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
  </div>
)

export default TireField
