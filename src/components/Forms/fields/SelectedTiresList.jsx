/**
 * Componente para mostrar una lista de cubiertas seleccionadas
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.tires - Lista de cubiertas seleccionadas
 * @param {Function} props.onRemoveTire - Función para eliminar una cubierta
 */
const SelectedTiresList = ({ tires = [], onRemoveTire }) => (
  <div className="space-y-2 mb-2">
    {tires.length === 0 ? (
      <p className="text-sm text-gray-500 italic">No hay cubiertas seleccionadas</p>
    ) : (
      tires.map((tire, index) => (
        <div
          key={index}
          className="flex items-center justify-between border p-2 rounded text-black dark:text-white bg-gray-100 dark:bg-gray-800 dark:border-gray-700"
        >
          <p>
            <strong>{tire.brand}</strong> - {tire.pattern} - Código: {tire.code}
          </p>
          <button
            type="button"
            onClick={() => onRemoveTire(index)}
            className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
            aria-label="Eliminar cubierta"
          >
            ✖
          </button>
        </div>
      ))
    )}
  </div>
)

export default SelectedTiresList
