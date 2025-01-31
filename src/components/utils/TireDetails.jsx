import React from 'react'

const TireDetails = ({ selectedLoading, selectedTire, setIsTireModalOpen }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 w-full h-full"
      onClick={() => setIsTireModalOpen(false)}
    >
      <div
        className="bg-gray-200 text-black dark:bg-gray-900 dark:text-white w-1/2 max-w-screen-sm p-6 rounded-xl shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-1 right-2">
          <button
            onClick={() => setIsTireModalOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✖
          </button>
        </div>
        <h2 className="text-xl font-bold mb-4 text-center">
          Detalles de la cubierta
        </h2>
        {
          selectedLoading ? (
            <p>Cargando...</p>
          ) : (
            <div className="text-sm">
              <div className='flex items-center justify-evenly'>
                <div className={`flex items-center justify-center h-64 relative rounded-xl
            ${selectedTire.status == "Nueva" && 'bg-nueva'}
            ${selectedTire.status == "1er Recapado" && 'bg-primer-recap'}
            ${selectedTire.status == "2do Recapado" && 'bg-segundo-recap'}
            ${selectedTire.status == "3er Recapado" && 'bg-tercer-recap'}
            ${selectedTire.status == "Descartada" && 'bg-descartada'}
          `}>
                  <img src="/Cubierta.png" alt="Cubierta" className='w-56 justify-center items-center' />
                </div>
                <div className='border-l-2 border-gray-500 h-64'></div>
                <div className='flex flex-col h-64 justify-evenly relative'>
                  <button className='px-4 py-2 border border-gray-900 dark:border-gray-300 rounded w-fit absolute right-1 top-0'>Editar ✏️</button>
                  <div className='flex flex-col items-start mt-8 ml-6 text-lg'>
                    <h3 className="font-semibold">Marca: <span className='font-normal'>{selectedTire.brand}</span></h3>
                    <h3 className="font-semibold">Medidas: <span className='font-normal'>{selectedTire.size}</span></h3>
                    <h3 className="font-semibold">Dibujo: <span className='font-normal'>{selectedTire.pattern}</span></h3>
                    <h3 className="font-semibold">Estado: <span className='font-normal'>{selectedTire.status}</span></h3>
                    <h3 className="font-semibold">Codigo: <span className='font-normal'>{selectedTire.code}</span></h3>
                    <h3 className="font-semibold">Kilometros: <span className='font-normal'>{selectedTire.kilometers}</span></h3>
                    <h3 className="font-semibold">Vehículo: <span className='font-normal'>{selectedTire.vehicle ? selectedTire.vehicle.mobile : 'Sin asignar'}</span></h3>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Histórico:</h3>
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-gray-500">
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Mobil</th>
                      <th>Patente</th>
                      <th>Km</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTire.history.map((record, index) => (
                      <tr key={index} className="border-b border-gray-500">
                        <td>{new Date(record.date).toLocaleDateString('es-AR')}</td>
                        <td>{new Date(record.date).toLocaleTimeString('es-AR', {hour: '2-digit', minute:'2-digit', hour12: false})}</td>
                        <td>{record.vehicle && `${record.vehicle.mobile}`}</td>
                        <td>{record.vehicle && `${record.vehicle.licensePlate}`}</td>
                        <td>{record.km}</td>
                        <td>{record.state}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {
                selectedTire.status !== "Descartada" && (
                  <div className="flex justify-around mt-6 items-center">
                    <h2>Marcar como:</h2>
                    <button className={`
                      px-4 py-2 rounded
                      text-black
                      dark:text-white
                      ${selectedTire.status == "Nueva" && `bg-primer-recap`}
                      ${selectedTire.status == "1er Recapado" && `bg-segundo-recap`}
                      ${selectedTire.status == "2do Recapado" && `bg-tercer-recap`}
                      ${selectedTire.status == "3er Recapado" && `bg-descartada`}
                      ${selectedTire.status == "Descartada" && `bg-descartada`}
                    `}>
                      {
                        selectedTire.status == "Nueva" ? "1er Recapado" :
                        selectedTire.status == "1er Recapado" ? "2do Recapado" :
                        selectedTire.status == "2do Recapado" ? "3er Recapado" : "Descartar"
                      }
                    </button>
                    {
                      selectedTire.status !== "3er Recapado" && (
                        selectedTire.status !== "Descartada" && (
                          <button className="bg-red-500 px-4 py-2 rounded text-black dark:text-white">
                            Descartar
                          </button>
                        )
                      )
                    }
                  </div>
                )
              }

            </div>
          )
        }
      </div>
    </div >
  )
}

export default TireDetails
