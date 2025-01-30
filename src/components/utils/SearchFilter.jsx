import React from 'react';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';

const SearchFilter = ({ showFilters, setShowFilters }) => {
  return (
    <div className='flex flex-row gap-2 w-2/5 mx-auto'>
      <div className='relative w-full'>
        <input
          type="search"
          name="tire-search"
          id="tire-search"
          className='pl-8 pr-2 py-1 rounded min-w-full 
  dark:bg-gray-200 bg-gray-300 text-black dark:text-white'

        />
        <SearchOutlinedIcon className='absolute left-1 h-6 top-1 text-black' />
      </div>
      <div className='relative'>
        <button
          className='px-2 py-1 rounded dark:bg-slate-400 bg-slate-600 dark:text-black text-white'
          onClick={() => setShowFilters(!showFilters)}
        >
          Filtros
        </button>
        {showFilters && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"

            // absolute z-10 flex flex-col gap-2 rounded bg-gray-200 dark:bg-gray-900 p-2 mx-auto mt-4
            onClick={() => setShowFilters(false)}
          >
            <div
              className="bg-gray-200 dark:bg-gray-900 p-4 rounded-xl shadow-lg relative w-96"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowFilters(false)}
              >
                ✖
              </button>
              <div className="absolute z-10 flex flex-col gap-2 rounded bg-gray-200 dark:bg-gray-900 p-2 mx-auto mt-4">
                <div className="flex flex-row gap-2 items-center">
                  <h2>Estado:</h2>
                  <button className="px-2 py-1 bg-green-500 rounded">Nueva</button>
                  <button className="px-2 py-1 bg-yellow-500 rounded">Reparada</button>
                  <button className="px-2 py-1 bg-red-500 rounded">Descartada</button>
                  <button className="px-2 py-1 bg-cyan-500 rounded">Sin asignar</button>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <h2>Marca:</h2>
                  <select
                    name="brand"
                    id="brandId"
                    className="rounded w-3/4 bg-gray-300 mx-auto text-black"
                  >
                    <option value="goodYear">GoodYear</option>
                    <option value="firestone">Firestone</option>
                    <option value="bridgestone">Bridgestone</option>
                    <option value="michelin">Michelin</option>
                  </select>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <h2>Vehículo:</h2>
                  <select
                    name="truck"
                    id="truckId"
                    className="rounded w-3/4 bg-gray-300 mx-auto text-black"
                  >
                    <option value="mobil-2">Mobil 2</option>
                    <option value="mobil-3">Mobil 3</option>
                    <option value="mobil-4">Mobil 4</option>
                    <option value="mobil-5">Mobil 5</option>
                  </select>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <h2 className="text-nowrap">Rango de kilómetros:</h2>
                  <div className="flex flex-row gap-2 items-center">
                    <input
                      type="number"
                      name="min-km"
                      id="min-km"
                      placeholder="Min"
                      className="w-20 rounded"
                    />
                    <span>Km</span>
                    <input
                      type="number"
                      name="max-km"
                      id="max-km"
                      placeholder="Max"
                      className="w-20 rounded"
                    />
                    <span>Km</span>
                  </div>
                </div>
                <div className="pt-2">
                  <h2>Cubiertas activas: 287</h2>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchFilter