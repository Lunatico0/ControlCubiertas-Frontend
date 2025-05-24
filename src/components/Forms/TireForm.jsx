import React from "react";
import { useForm } from "react-hook-form";

const TireForm = ({
  onSubmit,
  defaultValues = {},
  showFields = {
    status: true,
    code: true,
    serialNumber: true,
    orderNumber: false,
    brand: true,
    pattern: true,
    kilometers: true,
    createdAt: true,
    vehicle: true,
    reason: false,
  },
  availableVehicles = [],
  submitLabel = "Guardar",
  cancelLabel = "Cancelar",
  onCancel
}) => {
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues,
  });

  const searchVehicle = watch("searchVehicle") || "";

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      {showFields.status && (
        <select {...register("status")} className="p-2 rounded">
          <option value="Nueva">Nueva</option>
          <option value="1er Recapado">1er Recapado</option>
          <option value="2do Recapado">2do Recapado</option>
          <option value="3er Recapado">3er Recapado</option>
          <option value="A recapar">A recapar</option>
        </select>
      )}

      {showFields.code && (
        <input
          {...register("code", { required: true })}
          type="number"
          placeholder="Código interno"
          className="p-2 rounded"
        />
      )}

      {showFields.orderNumber && (
        <input
          {...register("orderNumber", { required: true })}
          type="text"
          placeholder="N° Orden"
          className="p-2 rounded"
        />
      )}

      {showFields.serialNumber && (
        <input
          {...register("serialNumber", { required: true })}
          type="text"
          placeholder="Número de serie"
          className="p-2 rounded"
        />
      )}

      {showFields.brand && (
        <input
          {...register("brand", { required: true })}
          type="text"
          placeholder="Marca"
          className="p-2 rounded"
        />
      )}

      {showFields.pattern && (
        <input
          {...register("pattern", { required: true })}
          type="text"
          placeholder="Dibujo"
          className="p-2 rounded"
        />
      )}

      {showFields.kilometers && (
        <input
          {...register("kilometers")}
          type="number"
          placeholder="Km iniciales (opcional)"
          className="p-2 rounded"
        />
      )}

      {showFields.createdAt && (
        <input
          {...register("createdAt")}
          type="date"
          defaultValue={new Date().toISOString().split("T")[0]}
          className="p-2 rounded"
        />
      )}

      {showFields.vehicle && (
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium">Asignación inicial (opcional)</label>
          <input
            {...register("searchVehicle")}
            type="text"
            placeholder="Buscar móvil..."
            className="p-2 border rounded w-full"
          />
          <div className="text-black bg-gray-100 dark:bg-gray-800 dark:text-white border rounded shadow-md max-h-52 overflow-auto">
            {availableVehicles
              .filter((v) =>
                v.mobile.toLowerCase().includes(searchVehicle.toLowerCase())
              )
              .map((vehicle) => (
                <div
                  key={vehicle._id}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer flex justify-between"
                  onClick={() => {
                    setValue("vehicle", vehicle._id);
                    setValue("searchVehicle", vehicle.mobile);
                  }}
                >
                  <span>
                    {vehicle.mobile} - {vehicle.licensePlate}
                  </span>
                  <button className="p-1 bg-green-500 text-white rounded">Seleccionar</button>
                </div>
              ))}
          </div>
        </div>
      )}

      {showFields.reason && (
        <textarea
          {...register("reason", { required: false })}
          placeholder="Motivo de la corrección"
          className="p-2 rounded"
        />
      )}

      <div className="flex gap-4 mt-4 justify-evenly items-center">
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-red-500 text-white p-2 rounded"
        >
          {cancelLabel}
        </button>
      </div>
    </form>
  );
};

export default TireForm;
