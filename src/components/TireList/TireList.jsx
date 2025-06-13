import { useContext, useEffect, useState } from "react"
import ApiContext from "@context/apiContext"
import TireCard from "./TireCard"
import TireDetails from "@components/TireDetails/TireDetails"
import UpdateTire from "@components/UpdateTire/UpdateTire"
import { usePasswordCheck } from "@hooks/usePasswordCheck"
import LoadingGrid from "./LoadingGrid"
import EmptyState from "./EmptyState"
import { colors } from "@utils/tokens"
import { usePagination } from "@hooks/usePagination.js"
import PaginationControls from "@components/TireList/PaginationControls.jsx"
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

const TireList = ({ onTireSelect }) => {
  const {
    data,
    ui,
    tires,
    state
  } = useContext(ApiContext)

  const {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
    itemsPerPage,
    setItemsPerPage,
  } = usePagination(data.filteredTireData, 12)

  const [tireToUpdate, setTireToUpdate] = useState(null)
  const [isTireModalOpen, setIsTireModalOpen] = useState(false)
  const [isUpdateTireModalOpen, setIsUpdateTireModalOpen] = useState(false)
  const [loadingTireId, setLoadingTireId] = useState(null)

  const { checkPassword } = usePasswordCheck()

  const handleCardClick = async (id) => {
    try {
      setLoadingTireId(id)
      setIsTireModalOpen(true)
      await tires.loadById(id)

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
    tires.load()
  }, [state.refreshTrigger])

  // Estados de carga y error
  if (ui.loading) {
    return <LoadingGrid />
  }

  if (ui.error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">
            <WarningAmberRoundedIcon/>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error al cargar las cubiertas</h3>
          <p className={`${colors.muted} mb-4`}>{ui.error}</p>
          <button
            onClick={tires.load}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (data.tireCount === 0) {
    return <EmptyState />
  }

  return (
    <div>
      {/* Información del listado */}
      <div className="flex items-center justify-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white mb-1">Inventario de Cubiertas</h2>
          <p className={`${colors.muted} text-sm`}>
            {currentItems.length} de {data.tireCount} cubierta(s)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end">
        <label htmlFor="itemsPerPage" className={`${colors.muted} text-sm`}>
          Por página:
        </label>
        <select
          id="itemsPerPage"
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          className="flex py-1 px-2 w-20 text-center border rounded bg-white dark:bg-gray-900 dark:text-white"
        >
          {[12, 24, 48].map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-8">
        {currentItems.map((tire) => (
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
      {isTireModalOpen && data.selectedTire && (
        <TireDetails
          selectedLoading={ui.selectedLoading}
          selectedTire={data.selectedTire}
          onClose={handleCloseTireModal}
          onEdit={handleEditFromDetails}
          handlePasswordCheck={checkPassword}
        />
      )}

      {isUpdateTireModalOpen && tireToUpdate && <UpdateTire id={tireToUpdate} onClose={handleCloseUpdateModal} />}

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        goToPage={goToPage}
        nextPage={nextPage}
        prevPage={prevPage}
      />
    </div>
  )
}

export default TireList
