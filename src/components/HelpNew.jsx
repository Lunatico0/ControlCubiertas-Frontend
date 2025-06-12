import { useState } from "react";
import Help from './Help';
import { New } from './New';
import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material'

const HelpNew = () => {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)

  const handleOpenNew = () => {
    setIsNewModalOpen(true)
  }

  const handleCloseNew = () => {
    setIsNewModalOpen(false)
  }

  return (
    <div className="flex items-center justify-between mb-8">
      {/* Sección izquierda con ayuda */}
      <div className="flex items-center">
        <Help />
      </div>

      {/* Sección derecha con botón agregar */}
      <div className="flex items-center">
        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-transform transform hover:scale-[1.02]"
        >
          <AddIcon fontSize="small" />
          <span className="uppercase text-sm">Agregar nuevo</span>
        </button>

      </div>

      {isNewModalOpen && <New onClose={handleCloseNew} />}
    </div>
  )
}

export default HelpNew
