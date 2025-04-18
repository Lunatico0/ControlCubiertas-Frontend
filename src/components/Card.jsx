import React from 'react';
import cubiertaIMG from '/Cubierta.png';

const Card = ({ data, handleCardClick, setTireToUpdate, setIsUpdateTireModalOpen, handlePasswordCheck }) => {

  const handleEdit = (id) => {
    setIsUpdateTireModalOpen(true);
    handlePasswordCheck()
    setTireToUpdate(id);
  }

  return (
    <>
      {data && data.map((item) =>
        <div key={item._id} >
          <div className={`flex flex-col items-center relative`}>
            <div className={`flex items-center justify-center w-60 h-72 relative
              ${item.status == "Nueva" && 'bg-nueva'}
              ${item.status == "1er Recapado" && 'bg-primer-recap'}
              ${item.status == "2do Recapado" && 'bg-segundo-recap'}
              ${item.status == "3er Recapado" && 'bg-tercer-recap'}
              ${item.status == "Descartada" && 'bg-descartada'}
            `}>
              <img src={cubiertaIMG} alt="Cubierta" className='w-56 justify-center items-center cursor-pointer' onClick={() => handleCardClick(item._id)} />
            </div>
            <div className='p-4 pb-12 flex flex-col items-start w-60 bg-gray-200 text-black dark:bg-gray-900 dark:text-white'>
              <h2 className='font-semibold'>Marca: <span className='font-normal'>{item.brand}</span></h2>
              <h2 className='font-semibold'>Codigo: <span className='font-normal'>{item.code}</span></h2>
              <h2 className='font-semibold'>Fecha: <span className='font-normal'>{new Date(item.history?.[0]?.date).toLocaleDateString('es-AR')}</span></h2>
              <h2 className='font-semibold'>Dibujo: <span className='font-normal'>{item.pattern}</span></h2>
              <h2 className='font-semibold'>Estado: <span className='capitalize font-normal'>{item.status}</span></h2>
              <h2 className='font-semibold'>Vehiculo: <span className='font-normal'>{item.vehicle ? item.vehicle.mobile : 'Sin asignar'}</span></h2>
            </div>
            <button
              className='absolute px-2 py-1 bottom-2 right-2 rounded bg-slate-600 text-white'
              onClick={() => handleEdit(item._id)}
            >
              Editar ✏️
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default Card;
