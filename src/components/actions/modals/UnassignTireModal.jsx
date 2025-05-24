import React, { useState, useContext } from 'react';
import ApiContext from '../../../context/apiContext';
import { showToast } from '../../../utils/toast';

const UnassignTireModal = ({ tire, onClose, refreshTire }) => {
  const { unassignTireFromVehicle, replaceTireInList } = useContext(ApiContext);
  const [kmBaja, setKmBaja] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!kmBaja || !orderNumber) {
      showToast('error', 'Completa todos los campos');
      return;
    }

    try {
      const updated = await unassignTireFromVehicle(tire._id, {
        kmBaja: Number(kmBaja),
        orderNumber,
      });

      replaceTireInList(updated.tire);

      showToast('success', 'Cubierta desasignada');
      refreshTire?.();
      onClose();
    } catch (error) {
      console.error(error);
      showToast('error', `Error al desasignar la cubierta ${error.message}`);
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
        <h2 className="text-xl font-bold mb-4 text-center">Desasignar cubierta</h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="number"
            placeholder="Kilometraje actual del vehículo"
            className="p-2 border rounded"
            value={kmBaja}
            onChange={(e) => setKmBaja(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="N° Orden"
            className="p-2 border rounded"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-yellow-600 text-white rounded">
              Desasignar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnassignTireModal;
