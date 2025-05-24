import React, { useContext } from 'react';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import ApiContext from '../context/apiContext';
import tireStatusInfo from '../utils/tireStatusInfo';

const Help = () => {
  const { availableStatuses } = useContext(ApiContext);

  return (
    <div className="relative group flex flex-col items-center">
      <HelpOutlineOutlinedIcon />
      <div className="absolute top-9 -left-5 -z-10 group-hover:z-10 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="relative bg-gray-100 text-gray-800 text-sm p-3 rounded-lg shadow-lg w-72 text-start">

          {/* Generación dinámica de estados */}
          {availableStatuses.map(status => {
            const info = tireStatusInfo[status];
            if (!info) return null; // por si hay uno no definido
            return (
              <p key={status} className="text-left items-center">
                <span className={`${info.colorClass} text-2xl font-extrabold`}>●</span>
                : {info.description}
              </p>
            );
          })}

          <p className='text-left items-center pt-2'><span>🛞</span> Click sobre la rueda para más detalles.</p>
          <div className="absolute -top-1 left-6 w-3 h-3 bg-gray-100 rotate-45"></div>
        </div>
      </div>
    </div>
  );
};

export default Help;
