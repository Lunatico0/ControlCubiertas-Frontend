import { useContext } from "react"
import ApiContext from "@context/apiContext"
import { useTireAction } from "@hooks/useTireAction"
import { buildSendToRecapPrintData } from "@utils/print-data"
import TireForm from "@components/Forms/TireForm"
import Modal from "@components/ui/Modal"
import { useOrderValidation } from "@hooks/useOrderValidation"

const SendToRecapModal = ({ tire, onClose, refreshTire }) => {
  const { handleUpdateTireStatus, loadTireById, getReceiptNumber } = useContext(ApiContext)
  const { validateOrderNumber } = useOrderValidation()

  const { execute, isSubmitting } = useTireAction({
    printBuilder: buildSendToRecapPrintData,
    apiCall: handleUpdateTireStatus,
    successMessage: "Cubierta enviada a recapado correctamente",
  })

  const handleSubmit = async (data) => {
    await execute({
      tire,
      formData: {
        status: "A recapar",
        orderNumber: data.orderNumber,
        getReceiptNumber,
      },
      refresh: loadTireById,
      close: onClose,
    })
  }

  return (
    <Modal title="Enviar a recapado" onClose={onClose}>
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
        submitLabel="Enviar"
      />
    </Modal>
  )
}

export default SendToRecapModal
