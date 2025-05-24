import React, { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import ApiContext from "../../context/apiContext.jsx";
import TireForm from "../Forms/TireForm.jsx";

const NewTire = ({ setIsTireModalOpen }) => {
  const { handleCreateTire, vehicles, suggestedCode } = useContext(ApiContext);
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
      orderNumber: data.orderNumber,
      serialNumber: data.serialNumber,
      brand: data.brand,
      createdAt: data.createdAt,
      pattern: data.pattern,
      kilometers: data.kilometers || 0,
      vehicle: data.vehicle || null,
    };

    console.log(data)

    try {
      await handleCreateTire(newTire);
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

        <TireForm
          onSubmit={handleFormSubmit}
          vehicles={vehicles}
          defaultValues={{ code: suggestedCode }}
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
          onCancel={() => setIsTireModalOpen(false)}
        />

      </div>
    </div>
  );
};

export default NewTire;
