import { useContext } from "react"
import ApiContext from "@context/apiContext"
import { useTireAction } from "@hooks/useTireAction"
import { buildAssignPrintData } from "@utils/print-data"
import TireForm from "../../Forms/TireForm"
import Modal from "../../ui/Modal"
import { useOrderValidation } from "@hooks/useOrderValidation"

const AssignTireModal = ({ tire, onClose, refreshTire }) => {
  const { vehicles, handleAssignTire, loadTireById, getReceiptNumber } = useContext(ApiContext)
  const { validateOrderNumber } = useOrderValidation()

  const { execute, isSubmitting } = useTireAction({
    printBuilder: buildAssignPrintData,
    apiCall: handleAssignTire,
    successMessage: "Cubierta asignada con éxito",
  })

  const handleSubmit = async (data) => {
    console.log("🚀 AssignTireModal: Iniciando asignación con datos:", data)

    await execute({
      tire,
      formData: {
        vehicle: data.vehicle,
        kmAlta: Number(data.kmAlta),
        orderNumber: data.orderNumber,
        getReceiptNumber,
      },
      refresh: loadTireById,
      close: onClose,
    })
  }

  return (
    <Modal title="Asignar cubierta" onClose={onClose}>
      <TireForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        isSubmitting={isSubmitting}
        vehicles={vehicles}
        showFields={{
          vehicle: true,
          kmAlta: true,
          orderNumber: true,
        }}
        fieldOptions={{
          vehicle: {
            required: true,
            requiredMessage: "Debe seleccionar un vehículo",
          },
          kmAlta: {
            required: true,
            requiredMessage: "El kilometraje inicial es obligatorio",
            min: 0,
            minMessage: "El kilometraje no puede ser negativo",
          },
          orderNumber: {
            required: true,
            requiredMessage: "El número de orden es obligatorio",
          },
        }}
        validateOrderNumber={validateOrderNumber}
        submitLabel="Asignar"
      />
    </Modal>
  )
}

export default AssignTireModal
