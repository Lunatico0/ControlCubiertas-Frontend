import React, { useContext, useState } from 'react';
import apiContext from '../context/apiContext.jsx';
import TireDetails from './utils/TireDetails.jsx';
import Card from './Card.jsx';

const CardList = () => {
  const {
    filteredData,
    loading,
    error,
    fetchTireById,
    selectedTire,
    selectedLoading
  } = useContext(apiContext);

  const [isTireModalOpen, setIsTireModalOpen] = useState(false);

  const handleCardClick = async (id) => {
    setIsTireModalOpen(true);
    await fetchTireById(id);
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 w-fit mx-auto mt-4 gap-2'>
        <Card
          data={filteredData}
          handleCardClick={handleCardClick}
        />
      </div>
      {isTireModalOpen && selectedTire && (
        <TireDetails
          selectedLoading={selectedLoading}
          selectedTire={selectedTire}
          setIsTireModalOpen={setIsTireModalOpen}
        />
      )}
    </div>
  )
}

export default CardList
