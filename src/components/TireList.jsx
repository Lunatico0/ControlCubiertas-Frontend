import React, { useContext, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import apiContext from '../context/apiContext.jsx';

const CardList = () => {
  const { data, loading, error, fetchTireById, selectedTire, selectedLoading } = useContext(apiContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = async (id) => {
    setIsModalOpen(true);
    await fetchTireById(id);
  };

  const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 w-fit mx-auto mt-4 gap-2'>
        {data && data.map((item) =>
          <div key={item._id} >
            <div className={`flex flex-col items-center`}>
              <div className={`flex items-center justify-center w-60 h-72 relative 
              ${item.status == "Nueva" && 'bg-green-500'} 
              ${item.status == "1er Recapado" && 'bg-[#0080ff]'}
              ${item.status == "2do Recapado" && 'bg-[#ff00bf]'}
              ${item.status == "3er Recapado" && 'bg-[#bf00ff]'}
              ${item.status == "Descartada" && 'bg-red-500'}
            `}>
                <img src="/Cubierta.png" alt="Cubierta" className='w-56 justify-center items-center cursor-pointer' onClick={() => handleCardClick(item._id)} />
                <button
                  className='p-1 rounded bg-none border border-black hover:bg-gray-200 absolute right-1 top-1 dark:text-black text-white'
                >
                  <EditIcon className='' />
                </button>
              </div>
              <div className='p-4 pb-12 flex flex-col items-start w-60 bg-gray-200 text-black dark:bg-gray-900 dark:text-white'>
                <h2 className='font-semibold'>Marca: <span className='font-normal'>{item.brand}</span></h2>
                <h2 className='font-semibold'>Medidas: <span className='font-normal'>{item.size}</span></h2>
                <h2 className='font-semibold'>Dibujo: <span className='font-normal'>{item.pattern}</span></h2>
                <h2 className='font-semibold'>Estado: <span className='capitalize font-normal'>{item.status}</span></h2>
                <h2 className='font-semibold'>Codigo: <span className='font-normal'>{item.code}</span></h2>
                <h2 className='font-semibold'>Kilometros: <span className='font-normal'>{item.kilometers} Km</span></h2>
                {/* <h2 className='font-semibold'>Vehiculo: <span className='font-normal'>{item.vehicle ? item.vehicle : 'Sin asignar'}</span></h2> */}
              </div>
              <div className='relative'>
                <button
                  className='absolute px-3 py-1 bottom-2 left-6 rounded bg-red-500 text-white'
                >
                  {item.status == "Descartada" ? "Reparar" : "Descartar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {isModalOpen && selectedTire && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 w-full h-full"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-gray-200 text-black dark:bg-gray-900 dark:text-white w-1/2 p-6 rounded-xl shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-1 right-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✖
              </button>
            </div>
            <h2 className="text-xl font-bold mb-4 text-center">
              Detalles de la cubierta
            </h2>
            {
              selectedLoading ? (
                <p>Cargando...</p>
              ) : (
                <div className="text-sm">
                  <div className='flex items-center justify-evenly'>
                    <div className={`flex items-center justify-center h-64 relative rounded-xl
                  ${selectedTire.status == "Nueva" && 'bg-green-500'} 
                  ${selectedTire.status == "1er Recapado" && 'bg-[#0080ff]'}
                  ${selectedTire.status == "2do Recapado" && 'bg-[#ff00bf]'}
                  ${selectedTire.status == "3er Recapado" && 'bg-[#bf00ff]'}
                  ${selectedTire.status == "Descartada" && 'bg-red-500'}
                `}>
                      <img src="/Cubierta.png" alt="Cubierta" className='w-56 justify-center items-center' />
                    </div>
                    <div className='border-l-2 border-gray-500 h-64'></div>
                    <div className='flex flex-col h-64 justify-evenly relative'>
                      <button className='px-4 py-2 border rounded w-fit absolute right-1 top-1'>Editar ✏️</button>
                      <div className='ml-4 text-start text-lg'>
                        <h3 className="font-semibold">Marca: <span className='font-normal'>{selectedTire.brand}</span></h3>
                        <h3 className="font-semibold">Medidas: <span className='font-normal'>{selectedTire.size}</span></h3>
                        {/* <h3 className="font-semibold">Vehículo: <span className='font-normal'>{selectedTire.vehicle}</span></h3> */}
                        <h3 className="font-semibold">Dibujo: <span className='font-normal'>{selectedTire.pattern}</span></h3>
                        <h3 className="font-semibold">Estado: <span className='font-normal'>{selectedTire.status}</span></h3>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Histórico:</h3>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left">Fecha</th>
                          <th className="text-left">Vehículo</th>
                          <th className="text-left">Km</th>
                          <th className="text-left">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                    {selectedTire.history.map((record, index) => (
                      <tr key={index} className="border-b">
                        <td>{new Date (record.date).toLocaleDateString('es-AR')}</td>
                        {/* <td>{record.vehicle}</td> */}
                        <td>{record.km}</td>
                        <td>{record.state}</td>
                      </tr>
                    ))}
                  </tbody>
                    </table>
                  </div>
                  <div className="flex justify-around mt-6">
                    <button className="bg-yellow-500 px-4 py-2 rounded text-white">
                      Para reparar
                    </button>
                    <button className="bg-green-500 px-4 py-2 rounded text-white">
                      Reparada
                    </button>
                    <button className="bg-red-500 px-4 py-2 rounded text-white">
                      Descartar
                    </button>
                  </div>
                </div>
              )
            }
          </div>
        </div>
      )}
    </div>
  )
}

export default CardList