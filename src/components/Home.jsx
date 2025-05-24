import React, { useState, useContext } from 'react';
import TireList from './TireList/TireList.jsx';
import HelpNew from './HelpNew.jsx';
import SearchFilter from './SearchFilter.jsx';

const Home = () => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <>
      <HelpNew />
      <SearchFilter
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />
      <TireList />
    </>
  )
}

export default Home
