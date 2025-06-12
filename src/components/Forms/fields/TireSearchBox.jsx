import { input, colors } from "@utils/tokens"

const TireSearchBox = ({ availableTires = [], onAddTire = () => { }, query = "", setQuery = () => { } }) => (
  <div className="relative">
    <input
      type="text"
      placeholder="Buscar cubierta..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className={input.base}
    />
    <div className="absolute z-20 mt-1 w-full border rounded shadow-md max-h-52 overflow-auto bg-white dark:bg-gray-800 dark:text-white">
      {availableTires.length > 0 ? (
        availableTires.map((tire) => (
          <div
            key={tire._id}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer flex justify-between"
            onClick={() => onAddTire(tire)}
          >
            <span>{tire.code} - {tire.brand}</span>
            <button className="p-1 bg-green-500 text-white rounded text-xs">Seleccionar</button>
          </div>
        ))
      ) : (
        <p className="p-2 text-gray-400 italic text-sm">No hay resultados</p>
      )}
    </div>
  </div>
)

export default TireSearchBox
