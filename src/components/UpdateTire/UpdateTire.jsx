import React, { useEffect, useContext } from 'react';
import ApiContext from '../../context/apiContext';
import TireForm from '../Forms/TireForm.jsx';

const UpdateTire = ({ id, setIsUpdateTireModalOpen }) => {
  const { loadTireById, selectedTire, updateTireDataCorrection } = useContext(ApiContext);

  useEffect(() => {
    if (id) {
      loadTireById(id);
    }
  }, [id]);

  const handleSubmit = async (data) => {
    const updatedData = {
      serialNumber: data.serialNumber,
      code: Number(data.code),
      brand: data.brand,
      pattern: data.pattern,
      reason: data.reason || 'Corrección manual de datos',
      date: new Date().toISOString(),
    };

    try {
      await updateTireDataCorrection(id, updatedData);
      setIsUpdateTireModalOpen(false);
    } catch (error) {
      console.error("Error al actualizar la cubierta:", error);
    }
  };

  if (!selectedTire) return null; // Evita render antes de cargar datos

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 w-full h-full"
      onClick={() => setIsUpdateTireModalOpen(false)}
    >
      <div
        className="bg-gray-200 text-black dark:bg-gray-900 dark:text-white w-1/2 max-w-screen-sm p-6 rounded-xl shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-1 right-2">
          <button
            onClick={() => setIsUpdateTireModalOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✖
          </button>
        </div>

        <h2 className="text-xl font-bold mb-4 text-center">Corregir datos de la cubierta</h2>

        <TireForm
          onSubmit={handleSubmit}
          defaultValues={{
            serialNumber: selectedTire.serialNumber || '',
            code: selectedTire.code || '',
            brand: selectedTire.brand || '',
            pattern: selectedTire.pattern || '',
            reason: '',
          }}
          showFields={{
            serialNumber: true,
            code: true,
            brand: true,
            pattern: true,
            reason: true,
          }}
          onCancel={() => setIsUpdateTireModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default UpdateTire;
