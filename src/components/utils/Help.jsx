import React from 'react'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';

const Help = () => {
  return (
    <div className="relative group flex flex-col items-center">
      <HelpOutlineOutlinedIcon />
      <div className="absolute top-9 -left-5 -z-10 group-hover:z-10 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="relative bg-gray-100 text-gray-800 text-sm p-3 rounded-lg shadow-lg w-72 text-start">
          <p className='text-left items-center'>
            <span className="text-nueva text-2xl font-extrabold">●</span>
            : Cubierta nueva y sin reparar.</p>
          <p className='text-left items-center'>
            <span className="text-primer-recap text-2xl font-extrabold">●</span>
            : Primer recapado.</p>
          <p className='text-left items-center'>
            <span className="text-segundo-recap text-2xl font-extrabold">●</span>
            : Segundo recapado.</p>
          <p className='text-left items-center'>
            <span className="text-tercer-recap text-2xl font-extrabold">●</span>
            : Tercer recapado.</p>
          <p className='text-left items-center'>
            <span className="text-descartada text-2xl font-extrabold">●</span>
            : Cubierta descartada.</p>
          <p className='text-left items-center pt-2'><span>🛞</span> Click sobre la rueda para más detalles.</p>
          <div className="absolute -top-1 left-6 w-3 h-3 bg-gray-100 rotate-45"></div>
        </div>
      </div>
    </div>

  )
}

export default Help
