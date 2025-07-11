import { useState } from "react"
import NewVehicle from "./NewVehicle"
import NewTire from "./NewTire"
import Modal from "@components/UI/Modal"

const New = ({ onClose }) => {
  const [activeModal, setActiveModal] = useState(null)

  const handleOpenVehicleModal = () => {
    setActiveModal("vehicle")
  }

  const handleOpenTireModal = () => {
    setActiveModal("tire")
  }

  const handleCloseModal = () => {
    setActiveModal(null)
  }

  const handleCloseAll = () => {
    setActiveModal(null)
    onClose()
  }

  return (
    <>
      <Modal title="Agregar nuevo" onClose={onClose} maxWidth="lg">
        <div className="flex flex-col items-center gap-6">
          <button
            className="group relative w-full h-40 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 p-6 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            onClick={handleOpenVehicleModal}
          >
            <div className="flex items-center justify-center gap-6 h-full">
              <div className="flex-shrink-0">
                <img
                  src="Camion.png"
                  alt="Vehículo"
                  className="h-24 w-full max-w-24 object-contain transform
                  group-hover:-translate-x-4 group-hover:scale-125 transition-all duration-500"
                />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white mb-2">Nuevo vehículo</h3>
                <p className="text-blue-100 text-sm">Registrar un nuevo vehículo en el sistema</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300"></div>
          </button>

          <button
            className="group relative w-full h-40 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 p-6 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            onClick={handleOpenTireModal}
          >
            <div className="flex items-center justify-center gap-6 h-full">
              <div className="flex-shrink-0">
                <img
                  src="Cubierta.png"
                  alt="Cubierta"
                  className="h-20 w-auto object-contain transform group-hover:scale-125 transition-all duration-500"
                />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white mb-2">Nueva cubierta</h3>
                <p className="text-green-100 text-sm">Registrar una nueva cubierta en el inventario</p>
              </div>
            </div>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300"></div>
          </button>
        </div>
      </Modal>

      {/* Modales secundarios */}
      {activeModal === "vehicle" && <NewVehicle onClose={handleCloseModal} onSuccess={handleCloseAll} />}
      {activeModal === "tire" && <NewTire onClose={handleCloseModal} onSuccess={handleCloseAll} />}
    </>
  )
}

export default New
