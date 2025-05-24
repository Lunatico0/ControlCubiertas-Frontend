import React, { useState, useContext } from 'react';
import ApiContext from '../../../context/apiContext';
import { showToast } from '../../../utils/toast';

const MarkRecapDoneModal = ({ tire, onClose, refreshTire }) => {
  const { updateTireStatus, replaceTireInList } = useContext(ApiContext);
  const [orderNumber, setOrderNumber] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const allowedStatuses = ['1er Recapado', '2do Recapado', '3er Recapado'];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!orderNumber || !newStatus) {
      showToast('error', 'Completa todos los campos');
      return;
    }

    const currentIndex = allowedStatuses.indexOf(tire.status);
    const newIndex = allowedStatuses.indexOf(newStatus);

    if (newIndex !== -1 && newIndex <= currentIndex) {
      showToast('error', 'No puedes retroceder de recapado');
      return;
    }

    try {
      const updated = await updateTireStatus(tire._id, { status: newStatus, orderNumber });
      replaceTireInList(updated.tire)
      showToast('success', `Estado actualizado a "${newStatus}"`);
      refreshTire?.();
      onClose();
    } catch (err) {
      console.error(err);
      showToast('error', 'Error al actualizar recapado');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 text-black dark:text-white p-6 rounded-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-center">Registrar recapado completado</h2>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="p-2 border rounded"
            required
          >
            <option value="">Seleccionar nuevo estado</option>
            {allowedStatuses.map((status) => (
              <option
                key={status}
                value={status}
                disabled={allowedStatuses.indexOf(status) <= allowedStatuses.indexOf(tire.status)}
              >
                {status}
              </option>
            ))}
          </select>

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
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Actualizar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarkRecapDoneModal;
