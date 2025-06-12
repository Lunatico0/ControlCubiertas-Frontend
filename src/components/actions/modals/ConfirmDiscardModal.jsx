import { useContext } from "react"
import ApiContext from "@context/apiContext"
import { useTireAction } from "@hooks/useTireAction"
import { buildDiscardPrintData } from "@utils/print-data"
import TireForm from "@components/Forms/TireForm"
import Modal from "@components/UI/Modal"
import { useOrderValidation } from "@hooks/useOrderValidation"

const DiscardTireModal = ({ tire, onClose, refreshTire }) => {
  const {
    tires,
    orders
  } = useContext(ApiContext)

  const { validateOrderNumber } = useOrderValidation()

  const { execute, isSubmitting } = useTireAction({
    printBuilder: buildDiscardPrintData,
    apiCall: tires.updateStatus,
    successMessage: "Cubierta descartada correctamente",
  })

  const handleSubmit = async (data) => {
    await execute({
      tire,
      formData: {
        status: "Descartada",
        orderNumber: data.orderNumber,
        getReceiptNumber: orders.getNextReceipt
      },
      refresh: tires.loadById,
      close: onClose,
    })
  }

  return (
    <Modal title="Descartar cubierta" onClose={onClose}>
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
        submitLabel="Descartar"
      />
    </Modal>
  )
}

export default DiscardTireModal
