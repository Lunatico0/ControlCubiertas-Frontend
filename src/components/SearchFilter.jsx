import { useContext, useEffect, useRef } from "react";
import ApiContext from "@context/apiContext";
import { SettingsContext } from "@context/SettingsContext";
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { colors, text, input, button } from "@utils/tokens";

const SearchFilter = ({ showFilters, setShowFilters }) => {
  const modalRef = useRef(null);
  const { data, ui } = useContext(ApiContext);
  const { stockStatuses } = useContext(SettingsContext); // 👈


  const applyFilters = (overrides = {}) => {
    ui.setFilters({
      status: "",
      brand: "",
      vehicle: "",
      kmFrom: "",
      kmTo: "",
      sortBy: "",
      mode: "",
      stockStatuses: "",
      ...overrides,
    });
  };

  const applyFiltersPartial = (changes = {}) => {
    ui.setFilters((prev) => ({
      ...prev,
      ...changes,
    }));
  };

  const hasActiveFilters = Object.values(ui.filters).some((val) => val !== "") || ui.searchQuery !== "";

  const isStockActive = (() => {
    const f = ui.filters;
    const isInStockMode = f.mode === "stock";
    const isUnassigned = f.vehicle === "sin asignar";
    const hasValidStatuses = Array.isArray(f.stockStatuses) && f.stockStatuses.length > 0;
    const noOtherFilters = !f.status && !f.brand && !f.kmFrom && !f.kmTo && !f.sortBy;
    return isInStockMode && isUnassigned && hasValidStatuses && noOtherFilters;
  })();

  const isCirculationActive = (() => {
    const f = ui.filters;
    const isAssigned = f.vehicle === "con asignacion";
    const noOtherFilters =
      !f.status &&
      !f.brand &&
      !f.kmFrom &&
      !f.kmTo &&
      !f.sortBy &&
      !f.mode &&
      (!f.stockStatuses || f.stockStatuses.length === 0);
    return isAssigned && noOtherFilters;
  })();

  const clearAllFilters = () => {
    applyFilters();
    ui.setSearchQuery("");
  };

  const handleStockClick = () => {
    applyFilters({
      vehicle: "sin asignar",
      stockStatuses,
      mode: "stock",
    });
  };

  const handleActiveClick = () => {
    applyFilters({ vehicle: "con asignacion" });
  };

  const handleAllTires = () => {
    clearAllFilters();
  };

  // click fuera del panel
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowFilters(false);
      }
    };
    if (showFilters) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilters]);

  const getButtonStyle = (isActive) =>
    isActive
      ? "bg-blue-600 text-white"
      : `${colors.bgActive} ${colors.border} text-gray-700 dark:text-white hover:bg-gray-300/70 dark:hover:bg-gray-700`;

  const FilterRow = ({ label, value, onClear, children }) => (
    <div className="flex items-center gap-2 pt-3">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 w-24 flex-shrink-0">{label}:</label>
      {children}
      <button
        onClick={onClear}
        disabled={!value}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Limpiar filtro"
      >
        <CloseRoundedIcon />
      </button>
    </div>
  );

  return (
    <div className="flex flex-col">
      {/* Botones superiores */}
      <div className="relative flex items-center justify-around mb-4">
        <button onClick={handleStockClick} className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all shadow-sm hover:shadow-md ${getButtonStyle(isStockActive)}`}>
          <span>Cubiertas en Stock</span>
        </button>
        <button onClick={handleAllTires} className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all shadow-sm hover:shadow-md ${getButtonStyle(false)}`}>
          <span>Todas las cubiertas</span>
        </button>
        <button onClick={handleActiveClick} className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all shadow-sm hover:shadow-md ${getButtonStyle(isCirculationActive)}`}>
          <span>Cubiertas en Circulación</span>
        </button>
      </div>

      {/* Búsqueda y filtros */}
      <div className="flex flex-col w-full justify-center sm:flex-row gap-6 mb-8">
        <div className="relative flex-1 max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-gray-400 text-lg"><SearchRoundedIcon /></span>
          </div>
          <input
            type="search"
            value={ui.searchQuery}
            onChange={(e) => ui.setSearchQuery(e.target.value)}
            placeholder="Buscar por código, marca, serie..."
            className={`w-full pl-12 pr-12 py-5 rounded-xl dark:bg-gray-800 ${input.base} hover:shadow-md transition-shadow`}
          />
          {ui.searchQuery && (
            <button onClick={() => ui.setSearchQuery("")} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
              <CloseRoundedIcon />
            </button>
          )}
        </div>

        {/* Botón abrir panel */}
        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all shadow-sm hover:shadow-md ${hasActiveFilters ? button.primary : `${colors.surface} ${colors.border} text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700`}`}
          >
            <span className="text-lg"><TuneRoundedIcon /></span>
            <span>Filtros</span>
            {hasActiveFilters && (
              <span className="bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full font-semibold">
                {Object.values(ui.filters).filter((v) => v !== "").length + (ui.searchQuery ? 1 : 0)}
              </span>
            )}
          </button>

          {showFilters && (
            <div ref={modalRef} className="absolute right-0 mt-3 bg-white/80 dark:bg-gray-800/90 backdrop-blur-md border-gray-200 dark:border-gray-700 rounded-xl shadow-xl ring-1 ring-black/10 z-50 p-6">
              <div className="absolute -top-2 right-6 w-4 h-4 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 rotate-45"></div>

              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Filtros y ordenamiento</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <CloseRoundedIcon />
                </button>
              </div>

              {/* Panel de filtros */}
              <div className="space-y-3 divide-y divide-gray-200 dark:divide-gray-700">
                <FilterRow label="Ordenar por" value={ui.filters.sortBy} onClear={() => applyFiltersPartial({ sortBy: "" })}>
                  <select className={`flex-1 ${input.base}`} value={ui.filters.sortBy} onChange={(e) => applyFiltersPartial({ sortBy: e.target.value })}>
                    <option value="">Sin ordenar</option>
                    <option value="status">Estado</option>
                    <option value="codeAsc">Código (ascendente)</option>
                    <option value="codeDesc">Código (descendente)</option>
                    <option value="kmAsc">Kilómetros (ascendente)</option>
                    <option value="kmDesc">Kilómetros (descendente)</option>
                  </select>
                </FilterRow>

                <FilterRow label="Estado" value={ui.filters.status} onClear={() => applyFiltersPartial({ status: "" })}>
                  <select className={`flex-1 ${input.base}`} value={ui.filters.status} onChange={(e) => applyFiltersPartial({ status: e.target.value })}>
                    <option value="">Todos los estados</option>
                    {data.availableStatuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </FilterRow>

                <FilterRow label="Marca" value={ui.filters.brand} onClear={() => applyFiltersPartial({ brand: "" })}>
                  <select className={`flex-1 ${input.base}`} value={ui.filters.brand} onChange={(e) => applyFiltersPartial({ brand: e.target.value })}>
                    <option value="">Todas las marcas</option>
                    {data.availableBrands.map((brand) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </FilterRow>

                <FilterRow label="Vehículo" value={ui.filters.vehicle} onClear={() => applyFiltersPartial({ vehicle: "" })}>
                  <select className={`flex-1 ${input.base}`} value={ui.filters.vehicle} onChange={(e) => applyFiltersPartial({ vehicle: e.target.value })}>
                    <option value="">Todos los vehículos</option>
                    {data.vehiclesWTires.map((vehicle) => (
                      <option key={vehicle} value={vehicle}>{vehicle}</option>
                    ))}
                  </select>
                </FilterRow>

                <FilterRow label="Kilómetros" value={ui.filters.kmFrom || ui.filters.kmTo} onClear={() => applyFiltersPartial({ kmFrom: "", kmTo: "" })}>
                  <div className="flex items-center gap-3 flex-1">
                    <input type="number" placeholder="Desde" className="w-24 px-3 py-2" value={ui.filters.kmFrom} onChange={(e) => applyFiltersPartial({ kmFrom: e.target.value })} />
                    <span className="text-gray-500 text-sm font-medium">a</span>
                    <input type="number" placeholder="Hasta" className="w-24 px-3 py-2" value={ui.filters.kmTo} onChange={(e) => applyFiltersPartial({ kmTo: e.target.value })} />
                    <span className="text-gray-500 text-sm font-medium">km</span>
                  </div>
                </FilterRow>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                <div className={`text-sm ${colors.muted}`}>
                  Mostrando <span className="font-semibold">{data.filteredTireData.length}</span> de{" "}
                  <span className="font-semibold">{data.tireCount}</span> cubiertas
                </div>
                <button
                  onClick={clearAllFilters}
                  disabled={!hasActiveFilters}
                  className={`${button.danger} text-sm px-4 py-2 rounded-lg disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed`}
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchFilter
