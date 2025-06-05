import { useContext } from "react"
import ApiContext from "@context/apiContext"
import VehicleForm from "@components/Forms/VehicleForm"
import Modal from "@components/ui/Modal"
import { useTireSelection } from "@hooks/useTireSelection"
import { useCreateEntity } from "@hooks/useCreateEntity"
import { showToast } from "@utils/toast"

/**
 * Modal para crear un nuevo vehículo
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSuccess - Función a ejecutar después de crear el vehículo
 */
const NewVehicle = ({ onClose, onSuccess }) => {
  const { tires, handleCreateVehicle } = useContext(ApiContext)

  // Filtrar solo cubiertas disponibles (sin asignar)
  const availableTires = tires.filter((tire) => !tire.vehicle || tire.vehicle === "sin asignar")

  const { selectedTires, searchQuery, setSearchQuery, isSearchOpen, setIsSearchOpen, handleAddTire, handleRemoveTire } =
    useTireSelection([])

  const { create, isSubmitting } = useCreateEntity(
    handleCreateVehicle,
    "Vehículo creado con éxito",
    "No se pudo crear el vehículo",
  )

  const handleSubmit = async (data) => {
    const newVehicle = {
      mobile: data.mobile,
      licensePlate: data.licensePlate,
      brand: data.brand,
      type: data.type || null,
      tires: selectedTires.map((tire) => tire._id),
    }

    try {
      await create(newVehicle, onSuccess || onClose)
    } catch (error) {
      // Manejar errores específicos
      if (error?.conflictingTires) {
        const tireCodes = error.conflictingTires.map((t) => t.code).join(", ")
        showToast("error", `Cubiertas ya asignadas: ${tireCodes}`)
      } else if (error.message?.includes("mobile")) {
        showToast("error", "Ya existe un vehículo con ese número de móvil")
      } else if (error.message?.includes("licensePlate")) {
        showToast("error", "Ya existe un vehículo con esa patente")
      }
    }
  }

  // Filtrar cubiertas según la búsqueda
  const filteredTires = availableTires.filter(
    (tire) =>
      tire.code.toString().includes(searchQuery) ||
      tire.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tire.pattern.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Modal title="Nuevo vehículo" onClose={onClose} maxWidth="lg">
      <VehicleForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        isSubmitting={isSubmitting}
        defaultValues={{
          mobile: "",
          licensePlate: "",
          brand: "",
          type: "",
        }}
        showFields={{
          brand: true,
          mobile: true,
          licensePlate: true,
          type: true,
          tires: true,
        }}
        fieldOptions={{
          brand: { required: true },
          mobile: { required: true },
          licensePlate: { required: true },
        }}
        availableTires={filteredTires}
        selectedTires={selectedTires}
        onAddTire={handleAddTire}
        onRemoveTire={handleRemoveTire}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
        submitLabel="Crear vehículo"
      />
    </Modal>
  )
}

export default NewVehicle
