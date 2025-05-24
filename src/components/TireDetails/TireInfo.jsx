import React from 'react';
import cubiertaIMG from '/Cubierta.png';
import { statusStyles } from '../../utils/statusStyle.js';

const TireInfo = ({ tire, onEdit }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Imagen + Estado */}
      <div className={`flex flex-col items-center justify-center ${statusStyles[tire.status] || ''} p-4 rounded-xl`}>
        <img src={cubiertaIMG} alt="Cubierta" className="w-48 mb-4" />
        <p className="text-lg font-semibold uppercase">{tire.status}</p>
      </div>

      {/* Datos */}
      <div className="space-y-2 relative text-start my-auto">
        <button
          onClick={() => onEdit(tire._id)}
          className="absolute right-0 -top-10 px-4 py-2 hover:bg-blue-700 transition bg-blue-600 text-white rounded"
        >
          Editar ✏️
        </button>

        <p><span className="font-semibold">Marca:</span> {tire.brand}</p>
        <p><span className="font-semibold">Dibujo:</span> {tire.pattern}</p>
        <p><span className="font-semibold">Código:</span> {tire.code}</p>
        <p><span className="font-semibold">Fecha inicial:</span> {new Date(tire.history?.[0]?.date).toLocaleDateString('es-AR')}</p>
        <p><span className="font-semibold">Kilómetros:</span> {tire.kilometers}</p>
        <p><span className="font-semibold">Vehículo:</span> {tire.vehicle?.mobile || "Sin asignar"}</p>
      </div>
    </div>
  );
};

export default TireInfo;
