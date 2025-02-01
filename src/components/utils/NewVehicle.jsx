import React, { useContext, useEffect, useState } from "react";
import Swal from 'sweetalert2';
import { useForm } from "react-hook-form";
import ApiContext from "../../context/apiContext.jsx";

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

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(handleFormSubmit)}>
          <input {...register("brand")} type="text" placeholder="Marca" className="p-2 rounded" required />
          <input {...register("mobile")} type="text" placeholder="Movil" className="p-2 rounded" required />
          <input {...register("licensePlate")} type="text" placeholder="Patente" className="p-2 rounded" required />
          <input {...register("type")} type="text" placeholder="Tipo (Opcional)" className="p-2 rounded" />

          {/* Sección de asignación de cubiertas */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Asignación de cubiertas (opcional)</label>

            {selectedTires.map((tire, index) => (
              <div
                key={index}
                className="flex items-center justify-between border p-2 rounded text-black bg-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-900"
              >
                <p>
                  <strong>{tire.brand}</strong> - {tire.size} - {tire.pattern} - Código: {tire.code}
                </p>
                <button
                  type="button"
                  onClick={() => handleRemoveTire(index)}
                  className="px-2 py-1 bg-red-500 text-white rounded"
                >
                  ✖
                </button>
              </div>
            ))}

            {!isSearchOpen && (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="p-2 bg-blue-500 text-white rounded flex justify-center items-center"
              >
                ➕ Agregar cubierta
              </button>
            )}

            {isSearchOpen && (
              <div className="relative toolbox">
                <input
                  type="text"
                  placeholder="Buscar cubierta..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="p-2 border rounded w-full"
                />

                <div className="absolute text-black bg-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-900 border rounded shadow-md max-h-52 overflow-auto mt-1 w-full z-20">
                  {filteredTireData.length > 0 ? (
                    filteredTireData.map((tire) => (
                      <div
                        key={tire._id}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer flex justify-between"
                        onClick={() => handleAddTire(tire)}
                      >
                        <span>{tire.code} - {tire.brand} - {tire.size}</span>
                        <button className="p-1 bg-green-500 text-white rounded">Seleccionar</button>
                      </div>
                    ))
                  ) : (
                    <p className="p-2 text-gray-400">No hay resultados</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-4 justify-evenly items-center">
            <button type="submit" className="bg-green-500 text-white p-2 rounded">
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setIsVehicleModalOpen(false)}
              className="bg-red-500 text-white p-2 rounded"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewVehicle;
