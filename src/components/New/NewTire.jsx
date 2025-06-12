import { useContext } from "react"
import ApiContext from "@context/apiContext"
import TireForm from "@components/Forms/TireForm"
import Modal from "@components/UI/Modal"
import { useOrderValidation } from "@hooks/useOrderValidation"
import useCreateEntity from "@hooks/useCreateEntity"

const NewTire = ({ onClose, onSuccess }) => {
  const {
    tires,
    data
  } = useContext(ApiContext)

  const { validateOrderNumber } = useOrderValidation()

  const { create, isSubmitting } = useCreateEntity(
    tires.create,
    "Cubierta creada con éxito",
    "No se pudo crear la cubierta",
  )

  const handleSubmit = async (formData) => {
    console.log("🚀 NewTire: Datos recibidos del formulario:", formData)

    const newTire = {
      status: formData.status || "Nueva",
      code: formData.code || data.suggestedCode,
      orderNumber: formData.orderNumber,
      serialNumber: formData.serialNumber,
      brand: formData.brand,
      createdAt: formData.createdAt || new Date().toISOString().split("T")[0],
      pattern: formData.pattern,
      kilometers: formData.kilometers || 0,
      vehicle: formData.vehicle || null,
    }

    console.log("📦 NewTire: Datos preparados para enviar:", newTire)
    await create(newTire, onSuccess || onClose)
  }

  return (
    <Modal title="Nueva cubierta" onClose={onClose} maxWidth="full">
      <TireForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        isSubmitting={isSubmitting}
        vehicles={data.vehicles}
        defaultValues={{
          code: data.suggestedCode,
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
