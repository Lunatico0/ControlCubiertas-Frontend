import React, { useState, useContext } from 'react';
import TireList from './TireList.jsx';
import HelpNew from './utils/HelpNew.jsx';
import SearchFilter from './utils/SearchFilter.jsx';

const Home = () => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <>
      <HelpNew />
      <SearchFilter showFilters={showFilters} setShowFilters={setShowFilters} />
      <TireList />
    </>
  )
}

export default Home
