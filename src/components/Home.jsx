import { useState } from "react"
import { TireList } from "./TireList"
import HelpNew from "./HelpNew"
import SearchFilter from "./SearchFilter"

/**
 * Componente principal de la página de inicio
 */
const Home = () => {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="container mx-auto px-4 py-6">
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
