import React, { useState, useContext } from 'react';
import ApiContext from '../../../context/apiContext';
import { showToast } from '../../../utils/toast';

const DiscardTireModal = ({ tire, onClose, refreshTire }) => {
  const { updateTireStatus, replaceTireInList } = useContext(ApiContext);
  const [orderNumber, setOrderNumber] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!orderNumber) {
      showToast('error', 'N° de orden requerido');
      return;
    }

    try {
      const updated = await updateTireStatus(tire._id, {
        status: 'Descartada',
        orderNumber,
      });

      replaceTireInList(updated.tire);

      showToast('success', 'Cubierta descartada correctamente');
      refreshTire?.();
      onClose();
    } catch (error) {
      console.error(error);
      showToast('error', 'Error al descartar cubierta');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 text-black dark:text-white p-6 rounded-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-center">Descartar cubierta</h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="N° Orden"
            className="p-2 border rounded"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded">Descartar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiscardTireModal;
