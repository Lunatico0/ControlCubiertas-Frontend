import { useContext, useEffect, useState } from "react"
import ApiContext from "@context/apiContext"
import TireCard from "./Card"
import TireDetails from "../TireDetails/TireDetails"
import UpdateTire from "../UpdateTire/UpdateTire"
import { usePasswordCheck } from "@hooks/usePasswordCheck"
import LoadingGrid from "./LoadingGrid"
import EmptyState from "./EmptyState"

/**
 * Componente principal para mostrar la lista de cubiertas
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onTireSelect - Función para seleccionar una cubierta
 */
const TireList = ({ onTireSelect }) => {
  const {
    error,
    loading,
    tireCount,
    loadTires,
    refreshFlag,
    loadTireById,
    selectedTire,
    selectedLoading,
    filteredTireData,
  } = useContext(ApiContext)

  const [tireToUpdate, setTireToUpdate] = useState(null)
  const [isTireModalOpen, setIsTireModalOpen] = useState(false)
  const [isUpdateTireModalOpen, setIsUpdateTireModalOpen] = useState(false)
  const [loadingTireId, setLoadingTireId] = useState(null)

  const { checkPassword } = usePasswordCheck()

  const handleCardClick = async (id) => {
    try {
      setLoadingTireId(id)
      setIsTireModalOpen(true)
      await loadTireById(id)

      if (onTireSelect) {
        onTireSelect(id)
      }
    } catch (error) {
      console.error("Error al cargar cubierta:", error)
    } finally {
      setLoadingTireId(null)
    }
  }

  const handleEdit = async (id) => {
    const confirmed = await checkPassword()
    if (confirmed) {
      setTireToUpdate(id)
      setIsUpdateTireModalOpen(true)
    }
  }

  const handleCloseTireModal = () => {
    setIsTireModalOpen(false)
    setLoadingTireId(null)
  }

  const handleCloseUpdateModal = () => {
    setIsUpdateTireModalOpen(false)
    setTireToUpdate(null)
  }

  const handleEditFromDetails = async (id) => {
    const confirmed = await checkPassword()
    if (confirmed) {
      setTireToUpdate(id)
      setIsUpdateTireModalOpen(true)
      setIsTireModalOpen(false) // Cerrar el modal de detalles
    }
  }

  useEffect(() => {
    loadTires()
  }, [refreshFlag])

  // Estados de carga y error
  if (loading) {
    return <LoadingGrid />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error al cargar las cubiertas</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadTires}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (tireCount === 0) {
    return <EmptyState />
  }

  return (
    <div className="space-y-6">
      {/* Información del listado */}
      <div className="flex items-center justify-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Inventario de Cubiertas</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredTireData.length} de {tireCount} cubierta(s)
          </p>
        </div>
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {filteredTireData.map((tire) => (
          <TireCard
            key={tire._id}
            tire={tire}
            onCardClick={handleCardClick}
            onEdit={handleEdit}
            isLoading={loadingTireId === tire._id}
          />
        ))}
      </div>

      {/* Modales */}
      {isTireModalOpen && selectedTire && (
        <TireDetails
          selectedLoading={selectedLoading}
          selectedTire={selectedTire}
          onClose={handleCloseTireModal}
          onEdit={handleEditFromDetails}
          handlePasswordCheck={checkPassword}
        />
      )}

      {isUpdateTireModalOpen && tireToUpdate && <UpdateTire id={tireToUpdate} onClose={handleCloseUpdateModal} />}
    </div>
  )
}

export default TireList
