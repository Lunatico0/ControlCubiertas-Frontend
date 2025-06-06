import { statusStyles } from "@utils/statusStyle"

/**
 * Componente de tarjeta para mostrar información de una cubierta
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.tire - Datos de la cubierta
 * @param {Function} props.onCardClick - Función para manejar click en la tarjeta
 * @param {Function} props.onEdit - Función para editar la cubierta
 * @param {boolean} props.isLoading - Indica si está cargando
 */
const TireCard = ({ tire, onCardClick, onEdit, isLoading = false }) => {
  const isRecap = tire.status === "A recapar"
  const isDiscarded = tire.status === "Descartada"

  const handleCardClick = () => {
    if (!isLoading && onCardClick) {
      onCardClick(tire._id)
    }
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    if (!isLoading && onEdit) {
      onEdit(tire._id)
    }
  }

  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString("es-AR")
    } catch {
      return "Fecha inválida"
    }
  }

  return (
    <div
      className={`
        relative group transition-all duration-300 transform hover:scale-105 hover:shadow-xl
        bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
        rounded-xl overflow-hidden shadow-md cursor-pointer h-full flex flex-col
        ${isLoading ? "opacity-50 pointer-events-none" : ""}
        ${isRecap || isDiscarded ? "opacity-80" : ""}
      `}
      onClick={handleCardClick}
    >
      {/* Indicador de estado en la esquina superior */}
      <div className="absolute top-3 left-3 z-10">
        <StatusBadge status={tire.status} />
      </div>

      {/* Botón de editar - Posicionado mejor para no tapar información */}
      <button
        onClick={handleEdit}
        disabled={isLoading}
        className="
          absolute top-3 right-3 p-2 z-20
          bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400
          text-white rounded-lg shadow-sm
          transition-all duration-200 transform hover:scale-105
          opacity-0 group-hover:opacity-100
        "
        title="Editar cubierta"
      >
        ✏️
      </button>

      {/* Imagen de la cubierta */}
      <div
        className={`
          flex items-center justify-center h-48 relative overflow-hidden
          ${statusStyles[tire.status] || "bg-gray-100 dark:bg-gray-700"}
        `}
      >
        <img
          src="Cubierta.png"
          alt="Cubierta"
          className={`
            w-32 h-32 object-contain transition-all duration-300
            ${isRecap ? "opacity-60 grayscale" : ""}
            ${isDiscarded ? "opacity-40 grayscale" : ""}
            group-hover:scale-110
          `}
        />

        {/* Overlay con información rápida */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Ver detalles
          </span>
        </div>
      </div>

      {/* Información de la cubierta - Altura fija para consistencia */}
      <div className="p-4 flex-1 flex flex-col justify-between min-h-[200px]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">#{tire.code}</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[100px]">{tire.serialNumber}</span>
          </div>

          <div className="space-y-2 text-sm">
            <InfoRow label="Marca" value={tire.brand} />
            <InfoRow label="Dibujo" value={tire.pattern} />
            <InfoRow
              label="Vehículo"
              value={tire.vehicle?.mobile || "Sin asignar"}
              valueClass={tire.vehicle ? "text-green-600 dark:text-green-400" : "text-gray-500"}
            />
            <InfoRow label="Kilómetros" value={`${(tire.kilometers || 0).toLocaleString()} km`} />
            <InfoRow label="Fecha alta" value={formatDate(tire.createdAt)} />
          </div>
        </div>

        {/* Información del vehículo si está asignado - Siempre en la parte inferior */}
        <div className="mt-4">
          {tire.vehicle ? (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                Asignado a: {tire.vehicle.mobile} ({tire.vehicle.licensePlate})
              </p>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Sin asignar a vehículo</p>
            </div>
          )}
        </div>
      </div>

      {/* Indicador de carga */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 dark:bg-gray-800 dark:bg-opacity-75 flex items-center justify-center z-30">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  )
}

/**
 * Componente para mostrar una fila de información
 */
const InfoRow = ({ label, value, valueClass = "" }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-600 dark:text-gray-400 font-medium">{label}:</span>
    <span className={`font-semibold truncate max-w-[120px] ${valueClass}`} title={value}>
      {value}
    </span>
  </div>
)

/**
 * Componente para mostrar el badge de estado
 */
const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Nueva":
        return "bg-blue-600 dark:bg-blue-900"
      case "1er Recapado":
        return "bg-green-600 dark:bg-green-900"
      case "2do Recapado":
        return "bg-yellow-600 dark:bg-yellow-900"
      case "3er Recapado":
        return "bg-orange-600 dark:bg-orange-900"
      case "A recapar":
        return "bg-neutral-600 dark:bg-neutral-900"
      case "Descartada":
        return "bg-red-600 dark:bg-red-900"
      default:
        return "bg-gray-600 dark:bg-gray-700"
    }
  }

  return (
    <span
      className={`
        px-3 py-1 text-xs font-semibold text-white rounded-full shadow-sm
        ${getStatusColor(status)}
      `}
    >
      {status}
    </span>
  )
}

export default TireCard
