import { useEffect, useContext, useState } from "react"
import ApiContext from "@context/apiContext"
import TireForm from "@components/Forms/TireForm"
import Modal from "@components/UI/Modal"
import { useOrderValidation } from "@hooks/useOrderValidation"
import { showToast } from "@utils/toast"
import { colors } from "@utils/tokens"
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

const UpdateTire = ({ id, onClose, onSuccess }) => {
  const {
    tires,
    data,
    ui,
    orders
  } = useContext(ApiContext)

  const { validateOrderNumber } = useOrderValidation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (id) {
      tires.loadById(id)
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
          size: data.size,
          pattern: data.pattern,
          reason: data.reason || "Corrección manual de datos",
          orderNumber: data.orderNumber,
        },
        getReceiptNumber: orders.getNextReceipt
      }

      await tires.correct(id, correctionData)

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

  if (ui.selectedLoading) {
    return (
      <Modal title="Cargando..." onClose={onClose}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Cargando datos de la cubierta...</span>
        </div>
      </Modal>
    )
  }

  if (!data.selectedTire) {
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
          <div className="border rounded px-3 py-1">
            <span className={`${colors.muted} text-sm font-medium`}>Código actual:</span>
            <p className="font-semibold">{data.selectedTire.code}</p>
          </div>
          <div className="border rounded px-3 py-1">
            <span className={`${colors.muted}text-sm font-medium`}>Estado actual:</span>
            <p className="font-semibold">{data.selectedTire.status}</p>
          </div>
          <div className="border rounded px-3 py-1">
            <span className={`${colors.muted}text-sm font-medium`}>Vehículo actual:</span>
            <p className="font-semibold">
              {data.selectedTire.vehicle
                ? `${data.selectedTire.vehicle.mobile} (${data.selectedTire.vehicle.licensePlate})`
                : "Sin asignar"}
            </p>
          </div>
          <div className="border rounded px-3 py-1">
            <span className={`${colors.muted}text-sm font-medium`}>Kilómetros:</span>
            <p className="font-semibold">{(data.selectedTire.kilometers || 0).toLocaleString()} km</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start">
            <span className="text-yellow-600 dark:text-yellow-400 mr-2">
              <WarningAmberRoundedIcon />
            </span>
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
          serialNumber: data.selectedTire.serialNumber || "",
          code: data.selectedTire.code || "",
          brand: data.selectedTire.brand || "",
          size: data.selectedTire.size || "",
          pattern: data.selectedTire.pattern || "",
          reason: "",
          orderNumber: "",
        }}
        showFields={{
          serialNumber: true,
          code: true,
          brand: true,
          size: true,
          pattern: true,
          reason: true,
          orderNumber: true,
        }}
        fieldOptions={{
          serialNumber: { required: true },
          code: { required: true },
          brand: { required: true },
          size: { required: true },
          pattern: { required: true },
          reason: {
            required: true,
            requiredMessage: "Motivo de la corrección (ej: Error en el registro inicial)",
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
