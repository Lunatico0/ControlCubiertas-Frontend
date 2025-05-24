import React, { useContext } from 'react';
import ApiContext from '../../context/apiContext.jsx';
import TireInfo from './TireInfo.jsx';
import TireHistory from './TireHistory.jsx';
import { showToast } from '../../utils/toast.js';
import QuickActions from '../actions/QuickActions.jsx';

const TireDetails = ({ selectedLoading, selectedTire, setIsTireModalOpen, setTireToUpdate, setIsUpdateTireModalOpen, handlePasswordCheck }) => {
  const { loadTireById } = useContext(ApiContext);

  const handleEdit = (id) => {
    handlePasswordCheck().then((confirmed) => {
      if (confirmed) {
        setTireToUpdate(id);
        setIsUpdateTireModalOpen(true);
      }
    });
  };

  if (selectedLoading) return <p className="text-center">Cargando...</p>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 w-full h-full" onClick={() => setIsTireModalOpen(false)}>
      <div
        className="bg-gray-100 dark:bg-gray-900 text-black dark:text-white w-full max-w-4xl p-6 rounded-xl shadow-lg relative overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={() => setIsTireModalOpen(false)} className="absolute top-2 right-3 text-xl text-gray-500 hover:text-gray-800">✖</button>
        <h2 className="text-2xl text-blue-600 font-bold text-center mb-6">Detalles de la cubierta #{selectedTire.code}</h2>

        <TireInfo tire={selectedTire} onEdit={handleEdit} />
        <TireHistory history={selectedTire.history} code={selectedTire.code} serialNumber={selectedTire.serialNumber} tire={selectedTire} />

        <QuickActions
          tire={selectedTire}
          refreshTire={() => loadTireById(selectedTire._id)}
        />

      </div>
    </div>
  );
};

export default TireDetails;
