import { useContext } from "react"
import ApiContext from "@context/apiContext"
import { useTireAction } from "@hooks/useTireAction"
import { buildUnassignPrintData } from "@utils/print-data"
import TireForm from "@components/Forms/TireForm"
import Modal from "@components/UI/Modal"
import { useOrderValidation } from "@hooks/useOrderValidation"

const UnassignTireModal = ({ tire, onClose, refreshTire }) => {
  const {
    tires,
    orders
  } = useContext(ApiContext)

  const { validateOrderNumber } = useOrderValidation()

  const { execute, isSubmitting } = useTireAction({
    printBuilder: buildUnassignPrintData,
    apiCall: tires.unassign,
    successMessage: "Cubierta desasignada con éxito",
  })

  const handleSubmit = async (data) => {
    await execute({
      tire,
      formData: {
        kmBaja: Number(data.kmBaja),
        orderNumber: data.orderNumber,
        getReceiptNumber: orders.getNextReceipt
      },
      refresh: tires.loadById,
      close: onClose,
    })
  }

  return (
    <Modal title="Desasignar cubierta" onClose={onClose}>
      <TireForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        isSubmitting={isSubmitting}
        showFields={{
          kmBaja: true,
          orderNumber: true,
        }}
        fieldOptions={{
          kmBaja: {
            required: true,
            requiredMessage: "El kilometraje final es obligatorio",
            min: 0,
            minMessage: "El kilometraje no puede ser negativo",
          },
          orderNumber: {
            required: true,
            requiredMessage: "El número de orden es obligatorio",
          },
        }}
        validateOrderNumber={validateOrderNumber}
        submitLabel="Desasignar"
      />
    </Modal>
  )
}

export default UnassignTireModal
