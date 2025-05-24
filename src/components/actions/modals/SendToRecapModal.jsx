import React, { useState, useContext } from 'react';
import ApiContext from '../../../context/apiContext';
import { showToast } from '../../../utils/toast';

const SendToRecapModal = ({ tire, onClose, refreshTire }) => {
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
        status: "A recapar",
        orderNumber
      });

      replaceTireInList(updated.tire)
      showToast('success', 'Cubierta enviada a recapado');
      refreshTire();
      onClose();
    } catch (error) {
      console.error(error);
      showToast('error', 'Error al enviar a recapado');
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
        <h2 className="text-xl font-bold mb-4 text-center">Enviar a recapado</h2>

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
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded">
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendToRecapModal;
