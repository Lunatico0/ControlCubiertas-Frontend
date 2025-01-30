import React, { useState, useContext } from 'react';
import TireList from './TireList.jsx';
import HelpNew from './utils/HelpNew.jsx';
import SearchFilter from './utils/SearchFilter.jsx';

const Home = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = async (id) => {
    await fetchTireById(id); // Obtén los datos específicos de la rueda
    setIsModalOpen(true); // Abre el modal
  };

  return (
    <>
      <HelpNew />
      <SearchFilter showFilters={showFilters} setShowFilters={setShowFilters} />
      <TireList />
    </>
  )
}

export default Home