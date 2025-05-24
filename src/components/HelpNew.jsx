import React, { useState } from 'react';
import Help from './Help.jsx';
import New from './New/New.jsx';

const HelpNew = () => {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const handleNewButtonClicked = () => {
    setIsNewModalOpen(prev => !prev);
  }
  return (
    <div className={`flex flex-row justify-between`}>
      <Help />
      <button
        className='px-2 py-1 rounded dark:bg-slate-400 bg-slate-600 dark:text-black text-white'
        onClick={handleNewButtonClicked}
      >
        Agregar nuevo
      </button>
      {isNewModalOpen &&
        <New setIsNewModalOpen={setIsNewModalOpen} />
      }
    </div>
  )
}

export default HelpNew
