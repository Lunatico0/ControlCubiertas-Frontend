import { useState, useContext } from "react"
import ApiContext from "@context/apiContext"
import AssignTireModal from "./modals/AssignTireModal"
import UnassignTireModal from "./modals/UnassignTireModal"
import SendToRecapModal from "./modals/SendToRecapModal"
import FinishRecapModal from "./modals/FinishRecapModal"
import DiscardTireModal from "./modals/ConfirmDiscardModal"
import UndoHistoryEntryModal from "./modals/UndoHistoryEntryModal"
import EditHistoryModal from "./modals/EditHistoryModal"

const QuickActions = ({ tire, refreshTire, historyEntry = null }) => {
  const [activeModal, setActiveModal] = useState(null)
  const { loadTireById } = useContext(ApiContext)

  const closeModal = () => {
    setActiveModal(null)
  }

  const handleRefresh = async () => {
    if (refreshTire) {
      await refreshTire()
    } else if (tire?._id) {
      await loadTireById(tire._id)
    }
  }

  const canAssign = !tire?.vehicle && tire?.status !== "Descartada" && tire?.status !== "A recapar"
  const canUnassign = !!tire?.vehicle
  const canSendToRecap =
    tire?.status !== "A recapar" && tire?.status !== "Descartada" && (!tire?.vehicle || !!tire?.vehicle)
  const canFinishRecap = tire?.status === "A recapar"
  const canDiscard = tire?.status !== "Descartada"
  const canEditHistory = !!historyEntry && !historyEntry.type.startsWith("correccion")
  const canUndoHistory = !!historyEntry && !historyEntry.flag

  return (
    <>
      <div className="flex flex-wrap gap-2 justify-center">
        {canAssign && (
          <button
            onClick={() => setActiveModal("assign")}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Asignar
          </button>
        )}

        {canUnassign && (
          <button
            onClick={() => setActiveModal("unassign")}
            className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
          >
            Desasignar
          </button>
        )}

        {canSendToRecap && (
          <button
            onClick={() => setActiveModal("sendToRecap")}
            className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
          >
            Enviar a recapar
          </button>
        )}

        {canFinishRecap && (
          <button
            onClick={() => setActiveModal("finishRecap")}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Recapado listo
          </button>
        )}

        {canDiscard && (
          <button
            onClick={() => setActiveModal("discard")}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Descartar
          </button>
        )}

        {canEditHistory && (
          <button
            onClick={() => setActiveModal("editHistory")}
            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            Editar
          </button>
        )}

        {canUndoHistory && (
          <button
            onClick={() => setActiveModal("undoHistory")}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Deshacer
          </button>
        )}
      </div>

      {/* Modales */}
      {activeModal === "assign" && <AssignTireModal tire={tire} onClose={closeModal} refreshTire={handleRefresh} />}

      {activeModal === "unassign" && <UnassignTireModal tire={tire} onClose={closeModal} refreshTire={handleRefresh} />}

      {activeModal === "sendToRecap" && (
        <SendToRecapModal tire={tire} onClose={closeModal} refreshTire={handleRefresh} />
      )}

      {activeModal === "finishRecap" && (
        <FinishRecapModal tire={tire} onClose={closeModal} refreshTire={handleRefresh} />
      )}

      {activeModal === "discard" && <DiscardTireModal tire={tire} onClose={closeModal} refreshTire={handleRefresh} />}

      {activeModal === "editHistory" && historyEntry && (
        <EditHistoryModal tire={tire} entry={historyEntry} onClose={closeModal} refreshTire={handleRefresh} />
      )}

      {activeModal === "undoHistory" && historyEntry && (
        <UndoHistoryEntryModal tire={tire} entry={historyEntry} onClose={closeModal} refreshTire={handleRefresh} />
      )}
    </>
  )
}

export default QuickActions
