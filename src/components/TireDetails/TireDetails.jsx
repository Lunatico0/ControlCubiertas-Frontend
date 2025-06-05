import { useContext, useState, useEffect } from "react"
import ApiContext from "@context/apiContext"
import TireInfo from "./TireInfo"
import TireHistory from "./TireHistory"
import QuickActions from "../actions/QuickActions"
import EditHistoryModal from "../actions/modals/EditHistoryModal"

/**
 * Componente principal para mostrar los detalles de una cubierta
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.selectedLoading - Indica si está cargando
 * @param {Object} props.selectedTire - Cubierta seleccionada
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onEdit - Función para editar la cubierta
 * @param {Function} props.handlePasswordCheck - Función para verificar contraseña
 */
const TireDetails = ({ selectedLoading, selectedTire, onClose, onEdit, handlePasswordCheck }) => {
  const { loadTireById } = useContext(ApiContext)
  const [entryToEdit, setEntryToEdit] = useState(null)

  // Manejar tecla ESC
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscKey)
    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [onClose])

  const handleEdit = async () => {
    if (handlePasswordCheck) {
      const confirmed = await handlePasswordCheck()
      if (confirmed && onEdit) {
        onEdit(selectedTire._id)
      }
    } else if (onEdit) {
      onEdit(selectedTire._id)
    }
  }

  const handleRefreshTire = async () => {
    if (selectedTire?._id) {
      await loadTireById(selectedTire._id)
    }
  }

  if (selectedLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-900 text-black dark:text-white rounded-xl p-6 w-full max-w-md shadow-xl">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Cargando detalles de la cubierta...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!selectedTire) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-900 text-black dark:text-white rounded-xl p-6 w-full max-w-md shadow-xl">
          <div className="text-center py-4">
            <p className="text-red-500">No se pudo cargar la información de la cubierta</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Modal con backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div
          className="bg-white dark:bg-gray-900 text-black dark:text-white rounded-xl w-full max-w-6xl shadow-2xl h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header del modal - FIJO */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h2 className="text-xl font-bold">Detalles de la cubierta #{selectedTire.code}</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <span>Editar</span>
                <span>✏️</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                ✖
              </button>
            </div>
          </div>

          {/* Contenido principal - FLEXIBLE */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Información de la cubierta - FIJO */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <TireInfo tire={selectedTire} compact={true} />
            </div>

            {/* Historial - SCROLLABLE */}
            <div className="flex-1 min-h-0">
              <TireHistory
                history={selectedTire.history || []}
                code={selectedTire.code}
                serialNumber={selectedTire.serialNumber}
                tire={selectedTire}
                onEditEntry={setEntryToEdit}
              />
            </div>

            {/* Acciones rápidas - FIJO */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
              <h3 className="font-semibold mb-4 text-center">Acciones rápidas</h3>
              <QuickActions tire={selectedTire} refreshTire={handleRefreshTire} />
            </div>
          </div>
        </div>
      </div>

      {entryToEdit && (
        <EditHistoryModal
          tire={selectedTire}
          entry={entryToEdit}
          onClose={() => setEntryToEdit(null)}
          refreshTire={handleRefreshTire}
        />
      )}
    </>
  )
}

export default TireDetails
