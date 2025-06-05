import { useContext } from "react"
import ApiContext from "@context/apiContext"
import TireForm from "@components/Forms/TireForm"
import Modal from "@components/UI/Modal"
import { useOrderValidation } from "@hooks/useOrderValidation"
import { useCreateEntity } from "@hooks/useCreateEntity"

/**
 * Modal para crear una nueva cubierta
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSuccess - Función a ejecutar después de crear la cubierta
 */
const NewTire = ({ onClose, onSuccess }) => {
  const { handleCreateTire, vehicles, suggestedCode } = useContext(ApiContext)
  const { validateOrderNumber } = useOrderValidation()

  const { create, isSubmitting } = useCreateEntity(
    handleCreateTire,
    "Cubierta creada con éxito",
    "No se pudo crear la cubierta",
  )

  const handleSubmit = async (data) => {
    console.log("🚀 NewTire: Datos recibidos del formulario:", data)

    const newTire = {
      status: data.status || "Nueva",
      code: data.code || suggestedCode,
      orderNumber: data.orderNumber,
      serialNumber: data.serialNumber,
      brand: data.brand,
      createdAt: data.createdAt || new Date().toISOString().split("T")[0],
      pattern: data.pattern,
      kilometers: data.kilometers || 0,
      vehicle: data.vehicle || null,
    }

    console.log("📦 NewTire: Datos preparados para enviar:", newTire)
    await create(newTire, onSuccess || onClose)
  }

  return (
    <Modal title="Nueva cubierta" onClose={onClose} maxWidth="lg">
      <TireForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        isSubmitting={isSubmitting}
        vehicles={vehicles}
        defaultValues={{
          code: suggestedCode,
          status: "Nueva",
          createdAt: new Date().toISOString().split("T")[0],
        }}
        showFields={{
          status: true,
          code: true,
          serialNumber: true,
          orderNumber: true,
          brand: true,
          pattern: true,
          kilometers: true,
          createdAt: true,
          vehicle: true,
        }}
        fieldOptions={{
          // Solo estos campos son requeridos para crear una cubierta nueva
          status: {
            required: true,
            requiredMessage: "El estado es obligatorio",
          },
          code: {
            required: true,
            requiredMessage: "El código interno es obligatorio",
          },
          serialNumber: {
            required: true,
            requiredMessage: "El número de serie es obligatorio",
          },
          orderNumber: {
            required: true,
            requiredMessage: "El número de orden es obligatorio",
          },
          brand: {
            required: true,
            requiredMessage: "La marca es obligatoria",
          },
          pattern: {
            required: true,
            requiredMessage: "El dibujo es obligatorio",
          },
          // Estos campos son opcionales
          kilometers: {
            required: false,
          },
          createdAt: {
            required: false,
          },
          vehicle: {
            required: false,
          },
        }}
        validateOrderNumber={validateOrderNumber}
        submitLabel="Crear cubierta"
      />
    </Modal>
  )
}

export default NewTire
