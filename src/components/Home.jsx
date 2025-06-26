import { useContext, useEffect, useState } from "react"
import { TireList } from "./TireList"
import HelpNew from "./HelpNew"
import SearchFilter from "./SearchFilter"
import ApiContext from "@context/apiContext.jsx"

const Home = () => {
  const [showFilters, setShowFilters] = useState(false);
  const { ui } = useContext(ApiContext)

  useEffect(() => {
    if (ui.presetVehicleFilter) {
      ui.setFilters((prev) => ({
        ...prev,
        vehicle: ui.presetVehicleFilter,
      }))
      ui.setPresetVehicleFilter(null) // limpiar para que no vuelva a aplicar
    }
  }, [ui.presetVehicleFilter])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header con ayuda y botón nuevo */}
        <HelpNew />

        {/* Búsqueda y filtros */}
        <SearchFilter showFilters={showFilters} setShowFilters={setShowFilters} />

        {/* Lista de cubiertas */}
        <TireList />
      </div>
    </div>
  )
}

export default Home
