import React, { useContext, useEffect, useRef, useState } from 'react';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ApiContext from '../../context/apiContext.jsx';

const SearchFilter = ({ showFilters, setShowFilters }) => {
  const modalRef = useRef(null);
  const {
    searchQuery, setSearchQuery, filters, setFilters, availableBrands, availableStatuses, vehiclesWTires, tireCount
  } = useContext(ApiContext);

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    }

    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilters]);

  const clearFilter = (key) => {
    setFilters((prevFilters) => ({ ...prevFilters, [key]: "" }));
  };

  const clearKilometers = () => {
    setFilters((prevFilters) => ({ ...prevFilters, kmFrom: "", kmTo: "" }));
  }

  const clearAllFilters = () => {
    setFilters({
      status: "",
      marca: "",
      vehicle: "",
      kmFrom: "",
      kmTo: "",
    });
  };

  return (
    <div className='flex flex-row gap-2 w-2/5 mx-auto relative'>
      <div className='relative w-full'>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar neumáticos..."
          className='pl-8 pr-2 py-1 rounded min-w-full dark:bg-gray-200 bg-gray-300 text-black'
        />
        <SearchOutlinedIcon className='absolute left-1 h-6 top-1 text-black' />
      </div>

      <div className='relative'>
        <button
          className='px-3 py-1 rounded dark:bg-slate-400 bg-slate-600 dark:text-black text-white'
          onClick={() => setShowFilters(!showFilters)}
        >
          Filtros
        </button>

        {showFilters && (
          <div ref={modalRef} className="absolute left-1/2 transform -translate-x-1/4 mt-2 w-96 bg-gray-200 dark:bg-gray-900 p-4 rounded-xl shadow-lg z-50 border border-gray-400">
            <div
              className="absolute top-0 left-1/4 transform -translate-x-1/2 -translate-y-full w-0 h-0
              border-l-[10px] border-l-transparent
              border-r-[10px] border-r-transparent
              border-b-[10px] border-b-gray-400">
            </div>
            <button
              className="absolute top-0 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowFilters(false)}
            >
              ✖
            </button>

            <div className="flex flex-col gap-2 pt-2">
              <div className="flex flex-row flex-nowrap justify-between gap-2 items-center">
                <h2>Estado:</h2>
                <select
                  className="rounded bg-gray-300 text-black flex-grow"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="" hidden></option>
                  {availableStatuses.map((status, index) => (
                    <option
                      key={index}
                      value={status}
                    >
                      {status}
                    </option>
                  ))}
                </select>
                <button onClick={() => clearFilter("status")}>✖</button>
              </div>

              <div className="flex flex-row flex-nowrap justify-between gap-2 items-center">
                <h2>Marca:</h2>
                <select
                  className="rounded bg-gray-300 text-black flex-grow"
                  value={filters.brand}
                  onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                >
                  <option value="" hidden></option>
                  {availableBrands.map((brand, index) => (
                    <option
                      key={index}
                      value={brand}
                    >
                      {brand}
                    </option>
                  ))}
                </select>
                <button onClick={() => clearFilter("brand")}>✖</button>
              </div>

              <div className="flex flex-row flex-nowrap justify-between gap-2 items-center">
                <h2>Vehículo:</h2>
                <select
                  className="rounded bg-gray-300 text-black flex-grow"
                  value={filters.vehicle}
                  onChange={(e) => setFilters({ ...filters, vehicle: e.target.value })}
                >
                  <option value="" hidden></option>
                  {vehiclesWTires.map((vehicle, index) => (
                    <option
                      key={index}
                      value={vehicle}
                    >
                      {vehicle}
                    </option>
                  ))}
                </select>
                <button onClick={() => clearFilter("vehicle")}>✖</button>
              </div>

              <div className="flex flex-row flex-nowrap justify-between gap-2 items-center text-nowrap">
                <h2>Kilómetros:</h2>
                <div className="flex flex-row gap-2 items-center">
                  <input
                    type="number"
                    placeholder="Desde"
                    className="w-20 rounded"
                    value={filters.kmFrom}
                    onChange={(e) => setFilters({ ...filters, kmFrom: e.target.value })}
                  />
                  <span>Km</span>
                  <input
                    type="number"
                    placeholder="Hasta"
                    className="w-20 rounded"
                    value={filters.kmTo}
                    onChange={(e) => setFilters({ ...filters, kmTo: e.target.value })}
                  />
                  <span>Km</span>
                  <button onClick={clearKilometers}>✖</button>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <h2>Cubiertas activas: {tireCount}</h2>
                <button
                  className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                  onClick={clearAllFilters}
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchFilter;
