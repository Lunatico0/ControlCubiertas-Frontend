import { useContext } from "react"
import ApiContext from "@context/apiContext"
import { useTireAction } from "@hooks/useTireAction"
import { buildUndoPrintData } from "@utils/print-data"
import TireForm from "../../Forms/TireForm"
import Modal from "../../ui/Modal"
import { useOrderValidation } from "@hooks/useOrderValidation"

const UndoHistoryEntryModal = ({ tire, entry, onClose, refreshTire }) => {
  const { handleUndoHistoryEntry, getReceiptNumber, loadTireById } = useContext(ApiContext)
  const { validateOrderNumber } = useOrderValidation()

  const { execute, isSubmitting } = useTireAction({
    printBuilder: buildUndoPrintData,
    apiCall: (tireId, formData) => handleUndoHistoryEntry(tireId, entry._id, formData),
    successMessage: "Entrada deshecha correctamente",
  })

  const handleSubmit = async (data) => {
    await execute({
      tire,
      formData: {
        orderNumber: data.orderNumber,
        getReceiptNumber,
      },
      refresh: loadTireById,
      close: onClose,
    })
  }

  return (
    <Modal title="Deshacer entrada" onClose={onClose}>
      <TireForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        isSubmitting={isSubmitting}
        showFields={{
          orderNumber: true,
        }}
        fieldOptions={{
          orderNumber: {
            required: true,
            requiredMessage: "El número de orden es obligatorio",
          },
        }}
        validateOrderNumber={validateOrderNumber}
        submitLabel="Deshacer"
      />
    </Modal>
  )
}

export default UndoHistoryEntryModal
