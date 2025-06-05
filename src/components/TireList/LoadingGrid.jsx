/**
 * Componente para mostrar el estado de carga del grid
 */
const LoadingGrid = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center">
        <div className="space-y-2 flex flex-col items-center">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <LoadingCard key={index} />
        ))}
      </div>
    </div>
  )
}

/**
 * Componente para mostrar una tarjeta en estado de carga
 */
const LoadingCard = () => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-md">
    <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
    <div className="p-4 space-y-3">
      <div className="flex justify-between">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default LoadingGrid
