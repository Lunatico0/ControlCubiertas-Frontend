import { useContext, useEffect, useRef } from "react"
import ApiContext from "@context/apiContext"

/**
 * Componente para búsqueda y filtrado de cubiertas
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.showFilters - Indica si mostrar los filtros
 * @param {Function} props.setShowFilters - Función para mostrar/ocultar filtros
 */
const SearchFilter = ({ showFilters, setShowFilters }) => {
  const modalRef = useRef(null)
  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    availableBrands,
    availableStatuses,
    vehiclesWTires,
    tireCount,
    filteredTireData,
  } = useContext(ApiContext)

  // Cerrar filtros al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowFilters(false)
      }
    }

    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showFilters, setShowFilters])

  const clearFilter = (key) => {
    setFilters((prevFilters) => ({ ...prevFilters, [key]: "" }))
  }

  const clearKilometers = () => {
    setFilters((prevFilters) => ({ ...prevFilters, kmFrom: "", kmTo: "" }))
  }

  const clearAllFilters = () => {
    setFilters({
      status: "",
      brand: "",
      vehicle: "",
      kmFrom: "",
      kmTo: "",
      sortBy: "",
    })
    setSearchQuery("")
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== "") || searchQuery !== ""

  return (
    <div className="flex flex-col w-full justify-center sm:flex-row gap-6 mb-8">
      {/* Barra de búsqueda mejorada */}
      <div className="relative flex-1 max-w-lg">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="text-gray-400 text-lg">🔍</span>
        </div>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por código, marca, serie..."
          className="w-full pl-12 pr-12 py-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-shadow"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-lg">✖</span>
          </button>
        )}
      </div>

      {/* Botón de filtros mejorado */}
      <div className="relative">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md font-medium
            ${
              hasActiveFilters
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
            }
          `}
        >
          <span className="text-lg">🔧</span>
          <span>Filtros</span>
          {hasActiveFilters && (
            <span className="bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full font-semibold">
              {Object.values(filters).filter((v) => v !== "").length + (searchQuery ? 1 : 0)}
            </span>
          )}
        </button>

        {/* Panel de filtros */}
        {showFilters && (
          <div
            ref={modalRef}
            className="absolute right-0 mt-3 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 p-6"
          >
            {/* Flecha del dropdown */}
            <div className="absolute -top-2 right-6 w-4 h-4 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 rotate-45"></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Filtros y ordenamiento</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                ✖
              </button>
            </div>

            <div className="space-y-5">
              {/* Ordenamiento */}
              <FilterRow label="Ordenar por" value={filters.sortBy} onClear={() => clearFilter("sortBy")}>
                <select
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                >
                  <option value="">Sin ordenar</option>
                  <option value="status">Estado</option>
                  <option value="codeAsc">Código (ascendente)</option>
                  <option value="codeDesc">Código (descendente)</option>
                  <option value="kmAsc">Kilómetros (ascendente)</option>
                  <option value="kmDesc">Kilómetros (descendente)</option>
                </select>
              </FilterRow>

              {/* Estado */}
              <FilterRow label="Estado" value={filters.status} onClear={() => clearFilter("status")}>
                <select
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">Todos los estados</option>
                  {availableStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </FilterRow>

              {/* Marca */}
              <FilterRow label="Marca" value={filters.brand} onClear={() => clearFilter("brand")}>
                <select
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.brand}
                  onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                >
                  <option value="">Todas las marcas</option>
                  {availableBrands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </FilterRow>

              {/* Vehículo */}
              <FilterRow label="Vehículo" value={filters.vehicle} onClear={() => clearFilter("vehicle")}>
                <select
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.vehicle}
                  onChange={(e) => setFilters({ ...filters, vehicle: e.target.value })}
                >
                  <option value="">Todos los vehículos</option>
                  {vehiclesWTires.map((vehicle) => (
                    <option key={vehicle} value={vehicle}>
                      {vehicle}
                    </option>
                  ))}
                </select>
              </FilterRow>

              {/* Kilómetros */}
              <FilterRow label="Kilómetros" value={filters.kmFrom || filters.kmTo} onClear={clearKilometers}>
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="number"
                    placeholder="Desde"
                    className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.kmFrom}
                    onChange={(e) => setFilters({ ...filters, kmFrom: e.target.value })}
                  />
                  <span className="text-gray-500 text-sm font-medium">a</span>
                  <input
                    type="number"
                    placeholder="Hasta"
                    className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.kmTo}
                    onChange={(e) => setFilters({ ...filters, kmTo: e.target.value })}
                  />
                  <span className="text-gray-500 text-sm font-medium">km</span>
                </div>
              </FilterRow>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando <span className="font-semibold">{filteredTireData.length}</span> de{" "}
                <span className="font-semibold">{tireCount}</span> cubiertas
              </div>
              <button
                onClick={clearAllFilters}
                disabled={!hasActiveFilters}
                className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                Limpiar todo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Componente auxiliar para las filas de filtros
 */
const FilterRow = ({ label, value, onClear, children }) => (
  <div className="flex items-center gap-4">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-24 flex-shrink-0">{label}:</label>
    {children}
    <button
      onClick={onClear}
      disabled={!value}
      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      title="Limpiar filtro"
    >
      ✖
    </button>
  </div>
)

export default SearchFilter
