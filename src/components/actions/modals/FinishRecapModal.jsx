import { useContext, useState } from "react"
import ApiContext from "@context/apiContext"
import { useTireAction } from "@hooks/useTireAction"
import { buildFinishRecapPrintData } from "@utils/print-data"
import TireForm from "@components/Forms/TireForm"
import Modal from "@components/UI/Modal"
import { useOrderValidation } from "@hooks/useOrderValidation"
import { Label, input } from "@utils/tokens"

const FinishRecapModal = ({ tire, onClose, refreshTire }) => {
  const {
    tires,
    orders
  } = useContext(ApiContext)
  const { validateOrderNumber } = useOrderValidation()
  const [newStatus, setNewStatus] = useState("")

  const allowedStatuses = ["1er Recapado", "2do Recapado", "3er Recapado"]

  const { execute, isSubmitting } = useTireAction({
    printBuilder: buildFinishRecapPrintData,
    apiCall: tires.updateStatus,
    successMessage: "Recapado completado correctamente",
  })

  const handleSubmit = async (data) => {
    const selectedStatus = newStatus || data.status
    const currentIndex = allowedStatuses.indexOf(tire.status)
    const newIndex = allowedStatuses.indexOf(selectedStatus)

    if (!selectedStatus) throw new Error("Debe seleccionar un nuevo estado")
    if (newIndex <= currentIndex) throw new Error("No puedes retroceder de recapado")

    await execute({
      tire,
      formData: {
        status: selectedStatus,
        orderNumber: data.orderNumber,
        getReceiptNumber: orders.getNextReceipt
      },
      refresh: tires.loadById,
      close: onClose,
    })
  }

  return (
    <Modal title="Registrar recapado completado" onClose={onClose}>
      {/* Select custom con tokens */}
      <div className="relative w-full font-inter mb-6">
        <select
          id="recapado-status"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          className={input.base}
          required
        >
          <option value="">Seleccionar nuevo estado</option>
          {allowedStatuses.map((status) => (
            <option
              key={status}
              value={status}
              disabled={allowedStatuses.indexOf(status) <= allowedStatuses.indexOf(tire.status)}
            >
              {status}
            </option>
          ))}
        </select>

        <label htmlFor="recapado-status" className={`${Label.base} ${Label.light} ${Label.dark}`}>
          Nuevo estado
        </label>
      </div>

      {/* Formulario de orden */}
      <TireForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        isSubmitting={isSubmitting}
        showFields={{ orderNumber: true }}
        fieldOptions={{
          orderNumber: {
            required: true,
            requiredMessage: "El número de orden es obligatorio",
          },
        }}
        validateOrderNumber={validateOrderNumber}
        submitLabel="Actualizar"
      />
    </Modal>
  )
}

export default FinishRecapModal
