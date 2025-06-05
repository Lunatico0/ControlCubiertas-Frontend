import { statusStyles } from "@utils/statusStyle"

/**
 * Componente para mostrar la información básica de una cubierta
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.tire - Información de la cubierta
 * @param {Function} props.onEdit - Función para editar la cubierta
 * @param {boolean} props.compact - Si debe mostrar versión compacta
 */
const TireInfo = ({ tire, onEdit, compact = false }) => {
  const altaEntry = tire.history?.find((h) => h.type === "alta")
  const currentVehicle = tire.vehicle

  // Calcular estadísticas básicas
  const totalKm = tire.kilometers || 0
  const assignmentHistory = tire.history?.filter((h) => h.type === "asignacion") || []
  const totalAssignments = assignmentHistory.length

  if (compact) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
        {/* Indicador de estado compacto */}
        <div
          className={`flex items-center justify-center ${
            statusStyles[tire.status] || "bg-gray-100 dark:bg-gray-800"
          } p-4 rounded-xl shadow-sm`}
        >
          <div className="text-center">
            <div className="w-16 h-16 mb-2 flex items-center justify-center mx-auto">
              <img
                src="/Cubierta.png"
                alt="Cubierta"
                className="w-12 h-12 object-contain"
              />
            </div>
            <p className="text-sm font-bold uppercase tracking-wide">{tire.status}</p>
          </div>
        </div>

        {/* Información básica en 3 columnas */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columna 1: Identificación */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1">
              Identificación
            </h4>
            <InfoItem label="Código interno" value={tire.code} />
            <InfoItem label="Número de serie" value={tire.serialNumber} />
            <InfoItem label="Marca" value={tire.brand} />
            <InfoItem label="Dibujo" value={tire.pattern} />
          </div>

          {/* Columna 2: Estado y ubicación */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1">
              Estado actual
            </h4>
            <InfoItem
              label="Vehículo actual"
              value={currentVehicle ? `${currentVehicle.mobile} (${currentVehicle.licensePlate})` : "Sin asignar"}
              className={currentVehicle ? "text-green-600 dark:text-green-400" : "text-gray-500"}
            />
            <InfoItem
              label="Fecha de alta"
              value={altaEntry ? new Date(altaEntry.date).toLocaleDateString("es-AR") : "No registrada"}
            />
          </div>

          {/* Columna 3: Estadísticas */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1">
              Estadísticas
            </h4>
            <InfoItem label="Kilómetros totales" value={`${totalKm.toLocaleString()} km`} />
            <InfoItem label="Total asignaciones" value={totalAssignments} />
            {tire.history && tire.history.length > 0 && (
              <InfoItem
                label="Última actividad"
                value={new Date(tire.history[tire.history.length - 1]?.date).toLocaleDateString("es-AR")}
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  // Versión completa original
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sección visual del estado */}
      <div
        className={`flex flex-col items-center justify-center ${
          statusStyles[tire.status] || "bg-gray-100 dark:bg-gray-800"
        } p-6 rounded-xl shadow-sm`}
      >
        <div className="w-32 h-32 mb-4 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
          <img
            src="/Cubierta.png"
            alt="Cubierta"
            className="w-24 h-24 object-contain filter brightness-0 dark:invert"
          />
        </div>
        <p className="text-xl font-bold uppercase tracking-wide">{tire.status}</p>
        <p className="text-sm opacity-75 mt-1">Estado actual</p>
      </div>

      {/* Información detallada */}
      <div className="space-y-4 relative">
        {onEdit && (
          <button
            onClick={onEdit}
            className="absolute right-0 -top-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2"
          >
            <span>Editar</span>
            <span>✏️</span>
          </button>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <InfoItem label="Marca" value={tire.brand} />
          <InfoItem label="Dibujo" value={tire.pattern} />
          <InfoItem label="Código interno" value={tire.code} />
          <InfoItem label="Número de serie" value={tire.serialNumber} />
          <InfoItem
            label="Fecha de alta"
            value={altaEntry ? new Date(altaEntry.date).toLocaleDateString("es-AR") : "No registrada"}
          />
          <InfoItem label="Kilómetros totales" value={`${totalKm.toLocaleString()} km`} />
          <InfoItem
            label="Vehículo actual"
            value={currentVehicle ? `${currentVehicle.mobile} (${currentVehicle.licensePlate})` : "Sin asignar"}
            className={currentVehicle ? "text-green-600 dark:text-green-400" : "text-gray-500"}
          />
          <InfoItem label="Total asignaciones" value={totalAssignments} />
        </div>

        {/* Información adicional */}
        {tire.history && tire.history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-semibold mb-2">Resumen de actividad</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Última actividad:</span>
                <p className="font-medium">
                  {new Date(tire.history[tire.history.length - 1]?.date).toLocaleDateString("es-AR")}
                </p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Total de registros:</span>
                <p className="font-medium">{tire.history.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Componente auxiliar para mostrar información
 */
const InfoItem = ({ label, value, className = "" }) => (
  <div className="space-y-1">
    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}:</span>
    <p className={`font-semibold text-sm ${className}`}>{value}</p>
  </div>
)

export default TireInfo
