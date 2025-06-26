import { useContext } from "react"
import ApiContext from "@context/apiContext"
import { useTireAction } from "@hooks/useTireAction"
import { buildCorrectionPrintData } from "@utils/print-data"
import TireForm from "@components/Forms/TireForm"
import Modal from "@components/UI/Modal"
import { useOrderValidation } from "@hooks/useOrderValidation"
import { text, button, colors } from '@utils/tokens'

const EditHistoryModal = ({ tire, entry, onClose, refreshTire }) => {
  const {
    tires,
    data,
    orders,
  } = useContext(ApiContext)
  const { validateOrderNumber } = useOrderValidation()

  const currentVehicleId = entry.vehicle?._id || "";
  const type = entry.type || "estado";
  const isCorrection = type.startsWith("correccion");
  const baseType = type.replace("correccion-", "");
  const defaultVehicle = entry.vehicle
    ? { value: entry.vehicle._id, label: entry.vehicle.licensePlate }
    : null;

  const { execute, isSubmitting } = useTireAction({
    apiCall: tires.updateHistory,
    printBuilder: buildCorrectionPrintData,
    successMessage: "Entrada del historial actualizada correctamente",
  })

  const handleSubmit = async (data) => {
    await execute({
      tire,
      entry,
      formData: {
        form: {
          orderNumber: data.orderNumber,
          kmAlta: data.kmAlta,
          kmBaja: data.kmBaja,
          status: data.status,
          vehicle: data.vehicle,
          reason: data.reason,
        },
        getReceiptNumber: orders.getNextReceipt
      },
      refresh: tires.loadTireById,
      close: onClose,
    })
  }

  if (isCorrection) {
    return (
      <Modal title="Editar entrada de historial" onClose={onClose}>
        <p className={`${text.error} font-semibold text-center`}>
          Esta entrada ya es una corrección y no puede ser editada nuevamente.
        </p>
        <div className="flex justify-center mt-4">
          <button
            onClick={onClose}
            className={`${button.base} ${button.secondary}`}
          >
            Cerrar
          </button>
        </div>
      </Modal>
    )
  }

  // Determinar qué campos mostrar y cuáles son requeridos según el tipo
  const showFields = {
    orderNumber: true,
    status: true,
    reason: true,
    kmAlta: ["Asignación"].includes(baseType),
    kmBaja: ["Desasignación"].includes(baseType),
    vehicle: ["Asignación"].includes(baseType),
  }

  const fieldOptions = {
    orderNumber: {
      required: true,
      requiredMessage: "El número de orden es obligatorio",
    },
    status: {
      required: true,
      requiredMessage: "El estado es obligatorio",
    },
    reason: {
      required: true,
      requiredMessage: "El motivo de corrección es obligatorio",
    },
    kmAlta: {
      required: ["Asignación"].includes(baseType),
      requiredMessage: "El kilometraje inicial es obligatorio",
      disabled: !["Asignación"].includes(baseType),
    },
    kmBaja: {
      required: ["Desasignación"].includes(baseType),
      requiredMessage: "El kilometraje final es obligatorio",
      disabled: !["Desasignación"].includes(baseType),
    },
    vehicle: {
      required: ["Asignación"].includes(baseType),
      requiredMessage: "Debe seleccionar un vehículo",
      disabled: !["Asignación"].includes(baseType),
    },
  }

  return (
    <Modal title="Editar entrada de historial" onClose={onClose} maxWidth="lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className={`${colors.surface} border rounded p-3`}>
          <p className="font-semibold">Código: {tire.code}</p>
        </div>
        <div className={`${colors.surface} border rounded p-3`}>
          <p className="font-semibold">Serie: {tire.serialNumber}</p>
        </div>
        <div className={`${colors.surface} border rounded p-3`}>
          <p className="font-semibold">Marca: {tire.brand}</p>
        </div>
        <div className={`${colors.surface} border rounded p-3`}>
          <p className="font-semibold">Dibujo: {tire.pattern}</p>
        </div>
      </div>

      <TireForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        isSubmitting={isSubmitting}
        vehicles={data.vehicles}
        defaultValues={{
          orderNumber: "",
          kmAlta: entry.kmAlta || "",
          kmBaja: entry.kmBaja || "",
          status: entry.status || tire.status,
          vehicle: currentVehicleId,
          searchVehicle: entry.vehicle?.mobile || "",
          reason: `Corrección de Orden N°${entry.orderNumber}`,
        }}
        showFields={showFields}
        fieldOptions={fieldOptions}
        validateOrderNumber={validateOrderNumber}
        submitLabel="Guardar"
      />
    </Modal>
  )
}

export default EditHistoryModal
