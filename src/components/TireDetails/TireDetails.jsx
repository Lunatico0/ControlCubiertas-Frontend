import { useContext, useState, useEffect } from "react"
import Modal from "@components/UI/Modal";
import ApiContext from "@context/apiContext"
import TireHistory from "./TireHistory"
import { TireInfoData } from './TireInfo'
import TireStatusSidebar from './TireStatusSidebar'
import QuickActions from "@components/Actions/QuickActions"
import EditHistoryModal from "@components/Actions/modals/EditHistoryModal"
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { colors, text, button } from "@utils/tokens"

const TireDetails = ({ selectedLoading, selectedTire, onClose, onEdit, handlePasswordCheck }) => {
  const { tires } = useContext(ApiContext)
  const [entryToEdit, setEntryToEdit] = useState(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleEdit = async () => {
    onEdit?.(selectedTire._id)
  }

  const handleRefreshTire = async () => {
    selectedTire?._id && await tires.loadById(selectedTire._id)
  }

  if (selectedLoading || !selectedTire) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`${colors.surface} ${text.heading} rounded-xl p-6 w-full max-w-md shadow-xl`}>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            <span className="ml-2">
              {selectedLoading ? "Cargando detalles de la cubierta..." : "No se pudo cargar la información de la cubierta"}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Modal padding='none' onClose={onClose} maxWidth="7xl" maxHeight='100dvh'>
        <div
          className="w-full max-w-7xl mx-auto shadow-2xl rounded-xl overflow-hidden flex flex-col lg:flex-row h-full max-h-[95vh] bg-white dark:bg-gray-900"
          onClick={(e) => e.stopPropagation()}
        >
          <TireStatusSidebar
            tire={selectedTire}
            onEdit={() => handleEdit(selectedTire._id)}
            onClose={onClose}
            refreshTire={handleRefreshTire}
          />

          <div className="flex-1 flex flex-col min-h-0">
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



            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <TireInfoData tire={selectedTire} />
              <TireHistory
                history={selectedTire.history || []}
                code={selectedTire.code}
                serialNumber={selectedTire.serialNumber}
                tire={selectedTire}
                onEditEntry={setEntryToEdit}
              />
            </div>
          </div>
        </div>
      </Modal>

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
