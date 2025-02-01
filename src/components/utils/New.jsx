import React, { useState } from 'react'
import NewVehicle from './NewVehicle.jsx'
import NewTire from './NewTire.jsx'

const New = ({ setIsNewModalOpen }) => {

  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false)
  const [isTireModalOpen, setIsTireModalOpen] = useState(false)

  const handleNewVehicle = () => {
    setIsVehicleModalOpen(prev => !prev)
  }

  const handleNewTire = () => {
    setIsTireModalOpen(prev => !prev)
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 w-full h-full"
      onClick={() => setIsNewModalOpen(false)}>
      <div
        className="bg-gray-200 text-black dark:bg-gray-900 dark:text-white w-1/2 max-w-screen-sm p-6 rounded-xl shadow-lg relative z-10"
        onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-1 right-2">
          <button
            onClick={() => setIsNewModalOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✖
          </button>
        </div>

        <h2 className="text-4xl font-bold mb-4 text-center">
          Agregar nuevo
        </h2>

        <div className="flex flex-col items-center gap-4">
          <button
            className="grid grid-flow-col-dense place-items-center w-full h-40 rounded-xl bg-vehiculo p-4"
            onClick={handleNewVehicle}
          >
            <img src="/Camion.png" alt="Camion" className="h-auto max-h-32" />
            <h2 className="text-3xl text-black">Nuevo vehículo</h2>
          </button>

          <button
            className="grid grid-flow-col-dense place-items-center w-full h-40 rounded-xl bg-cubierta p-4"
            onClick={handleNewTire}
          >
            <img src="/Cubierta.png" alt="Cubierta" className="h-auto max-h-28" />
            <h2 className="text-3xl text-black">Nueva cubierta</h2>
          </button>
        </div>
      </div>
      {isVehicleModalOpen && <NewVehicle setIsVehicleModalOpen={setIsVehicleModalOpen} />}
      {isTireModalOpen && <NewTire setIsTireModalOpen={setIsTireModalOpen} />}
    </div>
  )
}

export default New
