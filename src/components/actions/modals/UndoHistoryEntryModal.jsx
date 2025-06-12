import { useContext } from "react"
import ApiContext from "@context/apiContext"
import { useTireAction } from "@hooks/useTireAction"
import { buildUndoPrintData } from "@utils/print-data"
import TireForm from "@components/Forms/TireForm"
import Modal from "@components/UI/Modal"
import { useOrderValidation } from "@hooks/useOrderValidation"

const UndoHistoryEntryModal = ({ tire, entry, onClose, refreshTire }) => {
  const {
    orders,
    tires
  } = useContext(ApiContext)

  const { validateOrderNumber } = useOrderValidation()

  const { execute, isSubmitting } = useTireAction({
    printBuilder: buildUndoPrintData,
    apiCall: (tireId, formData) => tires.undoHistory(tireId, entry._id, formData),
    successMessage: "Entrada deshecha correctamente",
  })

  const handleSubmit = async (data) => {
    await execute({
      tire,
      formData: {
        orderNumber: data.orderNumber,
        getReceiptNumber: orders.getNextReceipt
      },
      refresh: tires.loadById,
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
