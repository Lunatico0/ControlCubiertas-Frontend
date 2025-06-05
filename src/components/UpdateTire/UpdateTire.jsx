import { useEffect, useContext, useState } from "react"
import ApiContext from "@context/apiContext"
import TireForm from "@components/Forms/TireForm"
import Modal from "@components/UI/Modal"
import { useOrderValidation } from "@hooks/useOrderValidation"
import { showToast } from "@utils/toast"

/**
 * Modal para actualizar/corregir datos de una cubierta
 * @param {Object} props - Propiedades del componente
 * @param {string} props.id - ID de la cubierta a actualizar
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSuccess - Función a ejecutar después de actualizar
 */
const UpdateTire = ({ id, onClose, onSuccess }) => {
  const { loadTireById, selectedTire, selectedLoading, handleCorrectTire, getReceiptNumber } = useContext(ApiContext)
  const { validateOrderNumber } = useOrderValidation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (id) {
      loadTireById(id)
    }
  }, [id])

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true)

      const correctionData = {
        form: {
          serialNumber: data.serialNumber,
          code: Number(data.code),
          brand: data.brand,
          pattern: data.pattern,
          reason: data.reason || "Corrección manual de datos",
          orderNumber: data.orderNumber,
        },
        getReceiptNumber,
      }

      await handleCorrectTire(id, correctionData)

      showToast("success", "Datos de la cubierta corregidos correctamente")

      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (error) {
      console.error("Error al actualizar la cubierta:", error)
      showToast("error", "Error al corregir los datos de la cubierta")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (selectedLoading) {
    return (
      <Modal title="Cargando..." onClose={onClose}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Cargando datos de la cubierta...</span>
        </div>
      </Modal>
    )
  }

  if (!selectedTire) {
    return (
      <Modal title="Error" onClose={onClose}>
        <div className="text-center py-4">
          <p className="text-red-500">No se pudo cargar la información de la cubierta</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md transition"
          >
            Cerrar
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Corregir datos de la cubierta" onClose={onClose} maxWidth="lg">
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Código actual:</span>
            <p className="font-semibold">{selectedTire.code}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Estado actual:</span>
            <p className="font-semibold">{selectedTire.status}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Vehículo actual:</span>
            <p className="font-semibold">
              {selectedTire.vehicle
                ? `${selectedTire.vehicle.mobile} (${selectedTire.vehicle.licensePlate})`
                : "Sin asignar"}
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Kilómetros:</span>
            <p className="font-semibold">{(selectedTire.kilometers || 0).toLocaleString()} km</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start">
            <span className="text-yellow-600 dark:text-yellow-400 mr-2">⚠️</span>
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Importante:</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Esta acción creará una entrada de corrección en el historial. Los cambios quedarán registrados con el
                número de orden que proporciones.
              </p>
            </div>
          </div>
        </div>
      </div>

      <TireForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        isSubmitting={isSubmitting}
        defaultValues={{
          serialNumber: selectedTire.serialNumber || "",
          code: selectedTire.code || "",
          brand: selectedTire.brand || "",
          pattern: selectedTire.pattern || "",
          reason: "",
          orderNumber: "",
        }}
        showFields={{
          serialNumber: true,
          code: true,
          brand: true,
          pattern: true,
          reason: true,
          orderNumber: true,
        }}
        fieldOptions={{
          serialNumber: { required: true },
          code: { required: true },
          brand: { required: true },
          pattern: { required: true },
          reason: {
            required: true,
            placeholder: "Motivo de la corrección (ej: Error en el registro inicial)",
          },
          orderNumber: { required: true },
        }}
        validateOrderNumber={validateOrderNumber}
        submitLabel="Guardar corrección"
      />
    </Modal>
  )
}

export default UpdateTire
