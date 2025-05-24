import React from "react";
import { useForm } from "react-hook-form";

const VehicleForm = ({
  onSubmit,
  defaultValues = {},
  showFields = {
    brand: true,
    mobile: true,
    licensePlate: true,
    type: true,
    tires: true,
  },
  availableTires = [],
  selectedTires = [],
  onAddTire,
  onRemoveTire,
  searchQuery = '',
  setSearchQuery = () => {},
  isSearchOpen = false,
  setIsSearchOpen = () => {},
  submitLabel = "Guardar",
  cancelLabel = "Cancelar",
  onCancel
}) => {
  const { register, handleSubmit } = useForm({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {showFields.brand && (
        <input {...register("brand")} type="text" placeholder="Marca" className="p-2 rounded" required />
      )}

      {showFields.mobile && (
        <input {...register("mobile")} type="text" placeholder="Movil" className="p-2 rounded" required />
      )}

      {showFields.licensePlate && (
        <input {...register("licensePlate")} type="text" placeholder="Patente" className="p-2 rounded" required />
      )}

      {showFields.type && (
        <input {...register("type")} type="text" placeholder="Tipo (Opcional)" className="p-2 rounded" />
      )}

      {showFields.tires && (
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium">Asignación de cubiertas (opcional)</label>

          {selectedTires.map((tire, index) => (
            <div
              key={index}
              className="flex items-center justify-between border p-2 rounded text-black bg-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-900"
            >
              <p><strong>{tire.brand}</strong> - {tire.pattern} - Código: {tire.code}</p>
              <button
                type="button"
                onClick={() => onRemoveTire(index)}
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
                {availableTires.length > 0 ? (
                  availableTires.map((tire) => (
                    <div
                      key={tire._id}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer flex justify-between"
                      onClick={() => onAddTire(tire)}
                    >
                      <span>{tire.code} - {tire.brand}</span>
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
      )}

      <div className="flex gap-4 mt-4 justify-evenly items-center">
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="bg-red-500 text-white p-2 rounded">
          {cancelLabel}
        </button>
      </div>
    </form>
  );
};

export default VehicleForm;
