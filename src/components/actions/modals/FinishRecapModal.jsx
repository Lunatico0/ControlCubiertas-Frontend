import { useContext, useState } from "react"
import ApiContext from "@context/apiContext"
import { useTireAction } from "@hooks/useTireAction"
import { buildFinishRecapPrintData } from "@utils/print-data"
import TireForm from "@components/Forms/TireForm"
import Modal from "@components/UI/Modal"
import { useOrderValidation } from "@hooks/useOrderValidation"

const FinishRecapModal = ({ tire, onClose, refreshTire }) => {
  const { handleUpdateTireStatus, loadTireById, getReceiptNumber } = useContext(ApiContext)
  const { validateOrderNumber } = useOrderValidation()
  const [newStatus, setNewStatus] = useState("")

  const allowedStatuses = ["1er Recapado", "2do Recapado", "3er Recapado"]

  const { execute, isSubmitting } = useTireAction({
    printBuilder: buildFinishRecapPrintData,
    apiCall: handleUpdateTireStatus,
    successMessage: "Recapado completado correctamente",
  })

  const handleSubmit = async (data) => {
    try {
      const selectedStatus = newStatus || data.status

      if (!selectedStatus) {
        throw new Error("Debe seleccionar un nuevo estado")
      }

      const currentIndex = allowedStatuses.indexOf(tire.status)
      const newIndex = allowedStatuses.indexOf(selectedStatus)

      if (newIndex <= currentIndex) {
        throw new Error("No puedes retroceder de recapado")
      }

      await execute({
        tire,
        formData: {
          status: selectedStatus,
          orderNumber: data.orderNumber,
          getReceiptNumber,
        },
        refresh: loadTireById,
        close: onClose,
      })
    } catch (error) {
      console.error("❌ Error en FinishRecapModal:", error)
      // El error ya se maneja en useTireAction
    }
  }

  return (
    <Modal title="Registrar recapado completado" onClose={onClose}>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Seleccionar nuevo estado</label>
        <select
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          className="w-full p-2 border rounded bg-white dark:bg-gray-800"
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
      </div>

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
        submitLabel="Actualizar"
      />
    </Modal>
  )
}

export default FinishRecapModal
