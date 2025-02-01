import React, { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import ApiContext from "../../context/apiContext.jsx";

const NewTire = ({ setIsTireModalOpen }) => {
  const { fetchNewTire, availableVehicles, suggestedCode } = useContext(ApiContext);
  const { register, handleSubmit, reset, setValue } = useForm();
  const [searchVehicle, setSearchVehicle] = useState("");

  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  const handleFormSubmit = async (data) => {
    const newTire = {
      status: data.status,
      code: data.code || suggestedCode,
      brand: data.brand,
      size: data.size,
      pattern: data.pattern,
      kilometers: data.kilometers || 0,
      vehicle: data.vehicle || null,
    };

    try {
      await fetchNewTire(newTire);
      Swal.fire({
        title: "¡Éxito!",
        text: "Cubierta guardada con éxito",
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      reset();
      setIsTireModalOpen(false);
    } catch (error) {
      console.error("Error al guardar la cubierta:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "No se pudo guardar la cubierta",
        icon: "error",
        confirmButtonText: "Cerrar",
      });
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 w-full h-full"
      onClick={() => setIsTireModalOpen(false)}
    >
      <div
        className="bg-gray-200 text-black dark:bg-gray-900 dark:text-white w-1/2 max-w-screen-sm p-6 rounded-xl shadow-lg relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-1 right-2">
          <button onClick={() => setIsTireModalOpen(false)} className="text-gray-500 hover:text-gray-700">
            ✖
          </button>
        </div>

        <h2 className="text-4xl font-bold mb-4 text-center">Nueva cubierta</h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(handleFormSubmit)}>
          <select {...register("status")} className="p-2 rounded">
            <option value="Nueva">Nueva</option>
            <option value="1er Recapado">1er Recapado</option>
            <option value="2do Recapado">2do Recapado</option>
            <option value="3er Recapado">3er Recapado</option>
            <option value="Descartada">Descartada</option>
          </select>

          <input
            {...register("code")}
            type="text"
            placeholder={suggestedCode}
            className="p-2 rounded"
          />

          <input {...register("brand")} type="text" placeholder="Marca" className="p-2 rounded" required />
          <input {...register("size")} type="text" placeholder="Medidas" className="p-2 rounded"  />
          <input {...register("pattern")} type="text" placeholder="Dibujo" className="p-2 rounded" />
          <input {...register("kilometers")} type="number" placeholder="Km iniciales" className="p-2 rounded" />

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Asignación inicial (opcional)</label>
            <input
              type="text"
              placeholder="Buscar móvil..."
              value={searchVehicle}
              onChange={(e) => setSearchVehicle(e.target.value)}
              className="p-2 border rounded w-full"
              onFocus={() => setIsSearchOpen(true)}
            />

            {isSearchOpen && (
              <div className="relative">
                <div className="absolute text-black bg-gray-100 dark:bg-gray-800 dark:text-white border rounded shadow-md max-h-52 overflow-auto mt-1 w-full z-20">
                  {availableVehicles
                    .filter((v) => v.mobile.toLowerCase().includes(searchVehicle.toLowerCase()))
                    .map((vehicle) => (
                      <div
                        key={vehicle._id}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer flex justify-between"
                        onClick={() => {
                          setSearchVehicle(vehicle.mobile);
                          setValue("vehicle", vehicle._id);
                          setIsSearchOpen(false);
                        }}
                      >
                        <span>{vehicle.mobile} - {vehicle.licensePlate}</span>
                        <button className="p-1 bg-green-500 text-white rounded">Seleccionar</button>
                      </div>
                    ))}
                  {availableVehicles.length === 0 && (
                    <p className="p-2 text-gray-400">No hay móviles disponibles</p>
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
              onClick={() => setIsTireModalOpen(false)}
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

export default NewTire;
