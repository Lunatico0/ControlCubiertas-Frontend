import { useContext } from "react"
import ApiContext from "@context/apiContext"
import TireForm from "@components/Forms/TireForm"
import Modal from "@components/UI/Modal"
import { useOrderValidation } from "@hooks/useOrderValidation"
import useCreateEntity from "@hooks/useCreateEntity"
import { buildCreateTirePrintData } from "@utils/print-data"
import usePrint from "@hooks/usePrint"

// Fecha de HOY en zona local. `new Date().toISOString()` ya está en el día siguiente después
// de las 21:00 en GMT-3, así que el formulario proponía MAÑANA como fecha de alta.
const todayLocal = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

const NewTire = ({ onClose, onSuccess }) => {
  const { tires, data, orders } = useContext(ApiContext)
  const { validateOrderNumber } = useOrderValidation()
  const { print } = usePrint()

  const { create, isSubmitting } = useCreateEntity(
    tires.create,
    "Cubierta creada con éxito",
    "No se pudo crear la cubierta",
  )

  const handleSubmit = async (formData) => {
    const newTire = {
      status: formData.status || data.initialStatus,
      code: formData.code || data.suggestedCode,
      orderNumber: formData.orderNumber,
      serialNumber: formData.serialNumber,
      size: formData.size,
      brand: formData.brand,
      createdAt: formData.createdAt || todayLocal(),
      pattern: formData.pattern,
      kilometers: formData.kilometers || 0,
      vehicle: formData.vehicle || null,
    }

    try {
      const created = await create(newTire)
      const receipt = await orders.getNextReceipt()
      const printData = buildCreateTirePrintData({...created, orderNumber: formData.orderNumber }, receipt)
      print(printData)

      onSuccess?.()
    } catch (err) {
      console.error("Error al crear e imprimir cubierta:", err)
    }
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
          status: data.initialStatus,
          createdAt: todayLocal(),
        }}
        showFields={{
          status: true,
          code: true,
          serialNumber: true,
          orderNumber: true,
          brand: true,
          pattern: true,
          size: true,
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
          size: {
            required: true,
            requiredMessage: "El rodado es obligatorio",
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
