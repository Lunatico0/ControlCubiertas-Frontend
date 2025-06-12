import { statusStyles } from "@utils/statusStyle";
import { colors, text, button } from "@utils/tokens";
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import InfoRow from "@components/UI/InfoRow.jsx";
import StatusBadge from '@components/UI/StatusBadge'

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
        relative group transition-all duration-300 transform hover:scale-105 ${colors.surface} ${colors.border} ${colors.shadow} rounded-xl overflow-hidden cursor-pointer h-full flex flex-col ${isLoading ? "opacity-50 pointer-events-none" : ""} ${isRecap || isDiscarded ? "opacity-80" : ""}
      `}
      onClick={handleCardClick}
      tabIndex="0"
    >
      {/* Indicador de estado en la esquina superior */}
      <div className="absolute top-3 left-3 z-10">
        <StatusBadge status={tire.status} />
      </div>

      {/* Botón de editar - Posicionado mejor para no tapar información */}
      <button
        onClick={handleEdit}
        disabled={isLoading}
        className={`
          absolute top-3 right-3 z-20
          ${button.primary}
          text-white rounded-lg
          transition-transform transform hover:scale-105
          opacity-0 group-hover:opacity-100
        `}
        title="Editar cubierta"
      >
        <EditNoteRoundedIcon />
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
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 group-hover:backdrop-blur-sm transition-all duration-300 flex items-center justify-center">
          <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Ver detalles
          </span>
        </div>
      </div>

      {/* Información de la cubierta - Altura fija para consistencia */}
      <div className="p-4 flex-1 flex flex-col justify-between min-h-[200px]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className={`${text.heading} text-lg`}>#{tire.code}</h3>
            <span className={`${colors.muted} text-sm truncate max-w-[100px]`}>{tire.serialNumber}</span>
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

export default TireCard
