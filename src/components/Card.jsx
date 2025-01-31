import React from 'react';

const Card = ({ data, handleCardClick }) => {

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
              <img src="/Cubierta.png" alt="Cubierta" className='w-56 justify-center items-center cursor-pointer' onClick={() => handleCardClick(item._id)} />
            </div>
            <div className='p-4 pb-12 flex flex-col items-start w-60 bg-gray-200 text-black dark:bg-gray-900 dark:text-white'>
              <h2 className='font-semibold'>Marca: <span className='font-normal'>{item.brand}</span></h2>
              <h2 className='font-semibold'>Medidas: <span className='font-normal'>{item.size}</span></h2>
              <h2 className='font-semibold'>Dibujo: <span className='font-normal'>{item.pattern}</span></h2>
              <h2 className='font-semibold'>Estado: <span className='capitalize font-normal'>{item.status}</span></h2>
              <h2 className='font-semibold'>Vehiculo: <span className='font-normal'>{item.vehicle ? item.vehicle.mobile : 'Sin asignar'}</span></h2>
            </div>
            <button
              className='absolute px-2 py-1 bottom-2 right-2 rounded bg-slate-600 text-white'
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
