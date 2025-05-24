import React, { useState, useContext } from 'react';
import ApiContext from '../../../context/apiContext';
import { showToast } from '../../../utils/toast';


const AssignTireModal = ({ tire, onClose, refreshTire }) => {
  const { vehicles, assignTireToVehicle, replaceTireInList } = useContext(ApiContext);
  const [kmAlta, setKmAlta] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [vehicle, setVehicle] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!vehicle || !kmAlta || !orderNumber) {
      showToast('error', 'Completa todos los campos');
      return;
    }

    try {
      const dataToAssign = {
        vehicle,
        kmAlta: Number(kmAlta),
        orderNumber
      };

      const updated = await assignTireToVehicle(tire._id, dataToAssign);

      replaceTireInList(updated.tire);
      showToast('success', 'Cubierta asignada con éxito');
      refreshTire?.();
      onClose();
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      showToast('error', `Error al asignar la cubierta: ${error.message || 'Error desconocido'}`);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 text-black dark:text-white rounded-xl p-6 w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-center">Asignar cubierta</h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <select
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
            className="p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleccionar vehículo</option>
            {vehicles.map((v) => (
              <option key={v._id} value={v._id}>
                {v.mobile} - {v.licensePlate}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Kilometraje actual del vehículo"
            className="p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500"
            value={kmAlta}
            onChange={(e) => setKmAlta(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="N° Orden"
            className="p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Asignar
            </button>
          </div>
        </form>
      </div >
    </div >
  );
};

export default AssignTireModal;
