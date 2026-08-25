import { useState, useContext } from "react"
import ApiContext from "@context/apiContext"
import AssignTireModal from "./modals/AssignTireModal"
import UnassignTireModal from "./modals/UnassignTireModal"
import SendToRecapModal from "./modals/SendToRecapModal"
import FinishRecapModal from "./modals/FinishRecapModal"
import DiscardTireModal from "./modals/ConfirmDiscardModal"
import UndoHistoryEntryModal from "./modals/UndoHistoryEntryModal"
import EditHistoryModal from "./modals/EditHistoryModal"
import { button } from "@utils/tokens"

const QuickActions = ({ tire, refreshTire, historyEntry = null }) => {
  const [activeModal, setActiveModal] = useState(null)
  const { tires, data } = useContext(ApiContext)

  const closeModal = () => {
    setActiveModal(null)
  }

  const handleRefresh = async () => {
    if (refreshTire) {
      await refreshTire()
    } else if (tire?._id) {
      await tires.loadById(tire._id)
    }
  }

  // Los estados son configurables por tenant: el gating va por ROL, nunca por nombre. Con los
  // nombres literales, una empresa que renombre "A recapar" a "Para reparar" veía las acciones
  // mal habilitadas (podía asignar una cubierta que estaba esperando recapado, y no le aparecía
  // "Recapado listo"). El rol se resuelve del catálogo del tenant.
  const roleOf = (status) => data?.statusMeta?.[status]?.role
  const rol = roleOf(tire?.status)
  const esDescarte = rol === "discard"
  const esParaRecapar = rol === "recap"

  const canAssign = !tire?.vehicle && !esDescarte && !esParaRecapar
  const canUnassign = !!tire?.vehicle
  // Antes decía `(!tire?.vehicle || !!tire?.vehicle)`, que es siempre true: no filtraba nada.
  const canSendToRecap = !esParaRecapar && !esDescarte
  const canFinishRecap = esParaRecapar
  const canDiscard = !esDescarte
  const canEditHistory = !!historyEntry && !historyEntry.type.startsWith("correccion")
  const canUndoHistory = !!historyEntry && !historyEntry.flag

  return (
    <>
      <div className="flex flex-wrap gap-2 justify-center">
        {canAssign && (
          <button
            onClick={() => setActiveModal("assign")}
            className={`${button.base} ${button.primary}`}
          >
            Asignar
          </button>
        )}

        {canUnassign && (
          <button
            onClick={() => setActiveModal("unassign")}
            className={`${button.base} ${button.warning}`}
          >
            Desasignar
          </button>
        )}

        {canSendToRecap && (
          <button
            onClick={() => setActiveModal("sendToRecap")}
            className={`${button.base} ${button.purple}`}
          >
            Enviar a recapar
          </button>
        )}

        {canFinishRecap && (
          <button
            onClick={() => setActiveModal("finishRecap")}
            className={`${button.base} ${button.success}`}
          >
            Recapado listo
          </button>
        )}

        {canDiscard && (
          <button
            onClick={() => setActiveModal("discard")}
            className={`${button.base} ${button.danger}`}
          >
            Descartar
          </button>
        )}

        {canEditHistory && (
          <button
            onClick={() => setActiveModal("editHistory")}
            className={`${button.base} ${button.indigo}`}
          >
            Editar
          </button>
        )}

        {canUndoHistory && (
          <button
            onClick={() => setActiveModal("undoHistory")}
            className={`${button.base} ${button.danger}`}
          >
            Deshacer
          </button>
        )}
      </div>

      {/* Modales */}
      {activeModal === "assign" && <AssignTireModal tire={tire} onClose={closeModal} refreshTire={handleRefresh} />}
      {activeModal === "unassign" && <UnassignTireModal tire={tire} onClose={closeModal} refreshTire={handleRefresh} />}
      {activeModal === "sendToRecap" && <SendToRecapModal tire={tire} onClose={closeModal} refreshTire={handleRefresh} />}
      {activeModal === "finishRecap" && <FinishRecapModal tire={tire} onClose={closeModal} refreshTire={handleRefresh} />}
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
