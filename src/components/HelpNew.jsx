import { useState } from "react"
import Help from './Help'
import { New } from './New'

/**
 * Componente que combina la ayuda y el botón para agregar nuevos elementos
 */
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
          className="flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
        >
          <span className="text-xl">➕</span>
          <span>Agregar nuevo</span>
        </button>
      </div>

      {isNewModalOpen && <New onClose={handleCloseNew} />}
    </div>
  )
}

export default HelpNew
