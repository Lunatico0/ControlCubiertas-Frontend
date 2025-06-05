/**
 * Componente para mostrar cuando no hay cubiertas
 */
const EmptyState = () => {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <img src="/Cubierta.png" alt="Sin cubiertas" className="w-16 h-16 opacity-50 filter grayscale" />
        </div>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No hay cubiertas registradas</h3>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Comienza agregando tu primera cubierta al inventario para empezar a gestionar tu flota.
        </p>

        <div className="space-y-3">
          <button className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Agregar primera cubierta
          </button>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            También puedes importar cubiertas desde un archivo CSV
          </p>
        </div>
      </div>
    </div>
  )
}

export default EmptyState
