import React from 'react';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';

const HelpNew = () => {
  return (
    <div className={`flex flex-row justify-between`}>
      <div className="relative group flex flex-col items-center">
        <HelpOutlineOutlinedIcon />
        <div className="absolute top-9 -left-5 -z-10 group-hover:z-10 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="relative bg-gray-100 text-gray-800 text-sm p-3 rounded-lg shadow-lg w-72 text-start">
            <p><span className="text-green-600 font-bold">Verde:</span> Cubierta buena o nueva y no ha sido reparada.</p>
            <p><span className="text-yellow-500 font-bold">Amarillo:</span> Ha sido reparada pero todavía es operativa.</p>
            <p><span className="text-red-500 font-bold">Roja:</span> Está para descarte o ya está descartada.</p>
            <p>🛞 Click sobre la rueda para más detalles.</p>
            <div className="absolute -top-1 left-6 w-3 h-3 bg-gray-100 rotate-45"></div>
          </div>
        </div>
      </div>
      <button
        className='px-2 py-1 rounded dark:bg-slate-400 bg-slate-600 dark:text-black text-white'
      >
        Agregar nuevo
      </button>
    </div>
  )
}

export default HelpNew