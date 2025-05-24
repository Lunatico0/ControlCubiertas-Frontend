import React from 'react';
import cubiertaIMG from '/Cubierta.png';
import { statusStyles } from '../../utils/statusStyle.js';

const Card = ({ data, handleCardClick, setTireToUpdate, setIsUpdateTireModalOpen, handlePasswordCheck }) => {

  const handleEdit = (id) => {
    handlePasswordCheck().then((confirmed) => {
      if (confirmed) {
        setTireToUpdate(id);
        setIsUpdateTireModalOpen(true);
      }
    });
  };

  return (
    <>
      {data && data.map((item) =>
        <div key={item._id} className={`
        flex flex-col items-center relative group transition-shadow shadow-md hover:shadow-xl overflow-hidden rounded-lg p-4
        bg-gray-200 dark:bg-slate-900 border dark:border-gray-700`}>

          <div
            className={`flex items-center justify-center w-60 h-72 relative
            ${statusStyles[item.status] || ''}`}
          >
            <img
              src={cubiertaIMG}
              alt="Cubierta"
              className={`w-56 cursor-pointer transition-opacity duration-300 ${item.status === "A recapar" && "opacity-60"}`}
              onClick={() => handleCardClick(item._id)}
            />
          </div>

          <div className={`p-4 flex flex-col items-start w-60 ${item.status == "A recapar" && "opacity-70"} dark:text-white`}>

            <p className='font-bold'>Numero de Serie #
              <span className='font-normal'>{item.serialNumber}</span>
            </p>

            <h3 className='font-bold'>Cubierta #
              <span className='font-semibold'>{item.code}</span>
            </h3>

            <p className='font-semibold'>Marca: <span className='font-normal pr-2'>{item.brand}</span></p>

            <p className='font-semibold'>Estado: <span className='font-normal capitalize pr-1'>{item.status}</span> </p>

            <p className='font-semibold'>Dibujo: <span className='font-normal'>{item.pattern}</span></p>

            <p className='font-semibold'>Vehiculo: <span className='font-normal'>{item.vehicle?.mobile || 'Sin asignar'}</span></p>

            <p className='font-semibold'>Fecha: <span className='font-normal'>{new Date(item.history?.[0]?.date).toLocaleDateString('es-AR')}</span></p>

          </div>

          <button
            className='absolute bottom-2 right-2 px-3 py-1 text-sm bg-slate-600 hover:bg-slate-700 text-white rounded shadow-sm'
            onClick={() => handleEdit(item._id)}
          >
            Editar ✏️
          </button>
        </div>
      )}
    </>
  )
}

export default Card;
