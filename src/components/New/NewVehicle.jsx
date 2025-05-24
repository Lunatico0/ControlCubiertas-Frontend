import React, { useContext, useEffect, useState } from "react";
import Swal from 'sweetalert2';
import { useForm } from "react-hook-form";
import ApiContext from "../../context/apiContext.jsx";
import VehicleForm from "../Forms/VehicleForm.jsx";

const NewVehicle = ({ setIsVehicleModalOpen }) => {
  const { searchQuery, setSearchQuery, filteredTireData, fetchNewVehicle } = useContext(ApiContext);
  const [selectedTires, setSelectedTires] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsSearchOpen(false);
    };

    const handleClickOutside = (e) => {
      if (!e.target.closest(".toolbox")) setIsSearchOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleAddTire = (tire) => {
    setSelectedTires([...selectedTires, tire]);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleRemoveTire = (index) => {
    setSelectedTires(selectedTires.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data) => {
    const newVehicle = {
      mobile: data.mobile,
      licensePlate: data.licensePlate,
      brand: data.brand,
      type: data.type || null,
      tires: selectedTires.length > 0 ? selectedTires.map((tire) => tire._id) : null,
    };

    try {
      const result = await fetchNewVehicle(newVehicle);

      Swal.fire({
        title: "¡Éxito!",
        text: "Vehículo guardado con éxito",
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      reset();
      setSelectedTires([]);
      setIsVehicleModalOpen(false);
    } catch (error) {
      console.error("Error en la respuesta del servidor:", error);

      if (error.conflictingTires) {
        const tireCodes = error.conflictingTires.map((t) => t.code).join(", ");

        Swal.fire({
          title: "Error",
          text: `Las siguientes cubiertas ya están asignadas a otros vehículos: ${tireCodes}`,
          icon: "warning",
          confirmButtonText: "Entendido",
        });
      } else {
        Swal.fire({
          title: "Error",
          text: error.message || "No se pudo guardar el vehículo",
          icon: "error",
          confirmButtonText: "Cerrar",
        });
      }
    }
  };


  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 w-full h-full"
      onClick={() => setIsVehicleModalOpen(false)}
    >
      <div
        className="bg-gray-200 text-black dark:bg-gray-900 dark:text-white w-1/2 max-w-screen-sm p-6 rounded-xl shadow-lg relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-1 right-2">
          <button
            onClick={() => setIsVehicleModalOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✖
          </button>
        </div>

        <h2 className="text-4xl font-bold mb-4 text-center">Nuevo vehículo</h2>

        <VehicleForm
          onSubmit={handleFormSubmit}
          selectedTires={selectedTires}
          onAddTire={handleAddTire}
          onRemoveTire={handleRemoveTire}
          availableTires={filteredTireData}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
          onCancel={() => setIsVehicleModalOpen(false)}
        />

      </div>
    </div>
  );
};

export default NewVehicle;
