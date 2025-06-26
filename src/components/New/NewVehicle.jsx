import React, { useContext } from 'react';
import ApiContext from "@context/apiContext";
import VehicleForm from "@components/Forms/VehicleForm";
import Modal from "@components/UI/Modal";
import { useTireSelection } from "@hooks/useTireSelection";
import useCreateEntity from "@hooks/useCreateEntity";
import { showToast } from "@utils/toast";

const NewVehicle = ({ onClose, onSuccess, vehicleToEdit = null }) => {
  const isEditMode = !!vehicleToEdit
  const {
    data,
    vehicles,
  } = useContext(ApiContext)

  const defaultValues = vehicleToEdit
    ? {
      mobile: vehicleToEdit.mobile || "",
      licensePlate: vehicleToEdit.licensePlate || "",
      brand: vehicleToEdit.brand || "",
      type: vehicleToEdit.type || "",
    }
    : {
      mobile: "",
      licensePlate: "",
      brand: "",
      type: "",
    }

  const selectedTireIds = vehicleToEdit?.tires || [];

  // Filtrar solo cubiertas disponibles (sin asignar)
  const availableTires = data.tires.filter((tire) => !tire.vehicle || tire.vehicle === "sin asignar")

  const { selectedTires, searchQuery, setSearchQuery, isSearchOpen, setIsSearchOpen, handleAddTire, handleRemoveTire } =
    useTireSelection(
      data.tires.filter((t) => selectedTireIds.includes(t._id))
    )

  const { create, update, isSubmitting } = useCreateEntity(
    vehicles.create,
    "Vehículo creado con éxito",
    "No se pudo crear el vehículo",
    {
      updateFunction: vehicles.updateData,
      updateSuccessMessage: "Vehículo actualizado con éxito",
      updateErrorMessage: "No se pudo actualizar el vehículo",
    }
  )

  const normalizeMobile = (value) => {
    const cleaned = value.trim().toLowerCase()

    // Si ya contiene la palabra "movil" al inicio, solo formateamos la M
    if (cleaned.startsWith("movil ")) {
      const number = cleaned.slice(6).trim()
      return `Movil ${number}`
    }

    // Si solo es un número o algo sin "movil", lo anteponemos
    return `Movil ${value.trim()}`
  }

  const normalizePlate = (value) => {
    if (!value) return "";

    const cleaned = value
      .toUpperCase()
      .replace(/[^A-Z0-9]/gi, "") // quita todo lo que no sea letra o número

    // Detectar grupo de letras y números
    const match = cleaned.match(/^([A-Z]+)(\d+)([A-Z]*)$/)

    if (match) {
      const [, letters1, numbers, letters2] = match
      return [letters1, numbers, letters2].filter(Boolean).join("-")
    }

    return cleaned // fallback si no coincide con el patrón
  }

  const handleSubmit = async (data) => {
    const payload = {
      mobile: normalizeMobile(data.mobile),
      licensePlate: normalizePlate(data.licensePlate),
      brand: data.brand,
      type: data.type || null,
      tires: selectedTires.map((tire) => tire._id),
    }

    try {
      if (isEditMode) {
        await update(vehicleToEdit._id, payload)
        onSuccess?.()
      } else {
        await create(payload, onSuccess || onClose)
      }
    } catch (error) {
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
    <Modal title="Nuevo vehículo" onClose={onClose} maxWidth="full">
      <VehicleForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        isSubmitting={isSubmitting}
        defaultValues={defaultValues}
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
        submitLabel={isEditMode ? "Actualizar vehículo" : "Crear vehículo"}
      />
    </Modal>
  )
}

export default NewVehicle
