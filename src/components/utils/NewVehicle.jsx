import React from 'react'

const NewVehicle = ({ setIsVehicleModalOpen }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 w-full h-full"
      onClick={() => setIsVehicleModalOpen(false)}>
      <div
        className="bg-gray-200 text-black dark:bg-gray-900 dark:text-white w-1/2 max-w-screen-sm p-6 rounded-xl shadow-lg relative z-10"
        onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-1 right-2">
          <button
            onClick={() => setIsVehicleModalOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✖
          </button>
        </div>

        <h2 className="text-4xl font-bold mb-4 text-center">
          Nuevo vehículo
        </h2>

        <div className="flex flex-col items-center gap-4">
          <form className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Marca"
              className="p-2 rounded"
            />
            <input
              type="text"
              placeholder="Movil"
              className="p-2 rounded"
            />
            <input
              type="text"
              placeholder="Patente"
              className="p-2 rounded"
            />
            <input
              type="text"
              placeholder="Tipo"
              className="p-2 rounded"
            />
            <input
              type="text"
              placeholder="Incorporacion"
              className="p-2 rounded"
            />
          </form>
        </div>
        <div className='flex flex-col items-center gap-4'>
          <form>
            <h2>Asignacion inicial de cubiertas (opcional)</h2>
            <input
              type="search"
              placeholder="Buscar por codigo..."
              className="p-2 rounded"
            />
          </form>
          <div className='flex gap-4'>
            <button
              type="submit"
              className="bg-green-500 text-white p-2 rounded"
            >
              Guardar
            </button>
            <button
              type="submit"
              className="bg-red-500 text-white p-2 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewVehicle
