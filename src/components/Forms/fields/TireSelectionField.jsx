import { input, colors } from "@utils/tokens"
import SelectedTiresList from "./SelectedTiresList"
import TireField from '@components/Forms/fields'

const TireSelectionField = ({
  availableTires,
  selectedTires,
  onAddTire,
  onRemoveTire,
  searchQuery,
  setSearchQuery,
  isSearchOpen,
  setIsSearchOpen,
}) => {
  return (
    <div className="space-y-4">
      <SelectedTiresList tires={selectedTires} onRemoveTire={onRemoveTire} />

      <div className="relative">
        <TireField label="Cubiertas" id='tire'>
          <input
            type="text"
            value={searchQuery}
            id='tire'
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchOpen(true)}
            onBlur={() => setTimeout(() => setIsSearchOpen(false), 150)}
            placeholder=" "
            className={`${input.base} peer`}
          />
        </TireField>


        {isSearchOpen && (
          <div className="absolute z-10 w-full mt-1 text-black bg-white dark:bg-gray-800 dark:text-white border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
            {availableTires.length > 0 ? (
              availableTires.map((tire) => (
                <div
                  key={tire._id}
                  className="p-3 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer flex justify-between items-center"
                  onMouseDown={() => {
                    onAddTire(tire)
                    setIsSearchOpen(false)
                  }}
                >
                  <p>
                    <strong>{tire.code}</strong> - {tire.brand} - {tire.pattern}
                  </p>
                  <span className="text-xs px-2 py-1 bg-green-500 text-white rounded-full">Añadir</span>
                </div>
              ))
            ) : (
              <p className="p-3 text-sm text-gray-500 italic">No hay cubiertas disponibles que coincidan.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TireSelectionField
