import { useContext, useState, useEffect } from "react"
import ApiContext from "@context/apiContext"
import TireInfo from "./TireInfo"
import TireHistory from "./TireHistory"
import QuickActions from "@components/actions/QuickActions"
import EditHistoryModal from "@components/actions/modals/EditHistoryModal"
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { colors, text, button } from "@utils/tokens";

const TireDetails = ({ selectedLoading, selectedTire, onClose, onEdit, handlePasswordCheck }) => {
  const {
    tires
  } = useContext(ApiContext)

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

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

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
      await tires.loadById(selectedTire._id)
    }
  }

  if (selectedLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`${colors.surface} ${text.heading} rounded-xl p-6 w-full max-w-md shadow-xl`}>
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
        <div className={`${colors.surface} ${text.heading} rounded-xl p-6 w-full max-w-md shadow-xl`}>
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
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto p-4" onClick={onClose}>
        <div
          className={`${colors.surface} ${text.heading} w-full max-w-6xl mx-auto shadow-2xl sm:h-full min-h-[90vh] flex flex-col bg-white dark:bg-gray-900 rounded-xl overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header del modal - FIJO */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h2 className="text-xl font-bold">Detalles de la cubierta #{selectedTire.code}</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleEdit}
                className={`${button.primary} flex items-center gap-2`}
              >
                <span>Editar</span>
                <span><EditNoteRoundedIcon fontSize="small" /></span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <CloseRoundedIcon fontSize="small" />
              </button>
            </div>
          </div>

          {/* Contenido principal - FLEXIBLE */}
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
            {/* Información de la cubierta - FIJO */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <TireInfo tire={selectedTire} compact={true} />
            </div>

            {/* Historial - SCROLLABLE */}
            <div className="flex-1 min-h-0 pb-6 overflow-x-auto">
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
