import { useContext } from "react"
import ApiContext from "@context/apiContext"
import VehicleForm from "@components/Forms/VehicleForm"
import Modal from "@components/ui/Modal"
import { useTireSelection } from "@hooks/useTireSelection"

/**
 * Modal para crear o editar vehículos
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.vehicle - Vehículo a editar (null para crear)
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSuccess - Función a ejecutar después de guardar
 * @param {boolean} props.isEdit - Indica si es una edición
 */
const VehicleModal = ({ vehicle = null, onClose, onSuccess, isEdit = false }) => {
  const { tires, handleCreateVehicle, handleUpdateVehicle } = useContext(ApiContext)
  const isCreating = !isEdit

  // Filtrar cubiertas disponibles (no asignadas a otro vehículo)
  const availableTires = tires.filter((t) => !t.vehicle || (vehicle && t.vehicle._id === vehicle._id))

  // Cubiertas ya asignadas al vehículo
  const initialTires = vehicle ? tires.filter((t) => t.vehicle && t.vehicle._id === vehicle._id) : []

  const { selectedTires, searchQuery, setSearchQuery, isSearchOpen, setIsSearchOpen, handleAddTire, handleRemoveTire } =
    useTireSelection(initialTires)

  const handleSubmit = async (data) => {
    try {
      // Preparar datos con las cubiertas seleccionadas
      const vehicleData = {
        ...data,
        tires: selectedTires.map((t) => t._id),
      }

      if (isCreating) {
        await handleCreateVehicle(vehicleData)
      } else {
        await handleUpdateVehicle(vehicle._id, vehicleData)
      }

      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (error) {
      // Error ya manejado por el contexto
    }
  }

  return (
    <Modal title={isCreating ? "Crear vehículo" : "Editar vehículo"} onClose={onClose} maxWidth="lg">
      <VehicleForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        defaultValues={{
          brand: vehicle?.brand || "",
          mobile: vehicle?.mobile || "",
          licensePlate: vehicle?.licensePlate || "",
          type: vehicle?.type || "",
        }}
        showFields={{
          brand: true,
          mobile: true,
          licensePlate: true,
          type: true,
          tires: true,
        }}
        availableTires={availableTires.filter(
          (t) => t.code.toString().includes(searchQuery) || t.brand.toLowerCase().includes(searchQuery.toLowerCase()),
        )}
        selectedTires={selectedTires}
        onAddTire={handleAddTire}
        onRemoveTire={handleRemoveTire}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
        submitLabel={isCreating ? "Crear" : "Guardar"}
      />
    </Modal>
  )
}

export default VehicleModal
