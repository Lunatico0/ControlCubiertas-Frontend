import { colors, text } from "@utils/tokens"
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

const SelectedTiresList = ({ tires = [], onRemoveTire }) => (
  <div className="space-y-2 mb-4">
    {tires.length === 0 ? (
      <p className={`${text.placeholder} italic px-1`}>No hay cubiertas seleccionadas</p>
    ) : (
      tires.map((tire) => (
        <div
          key={tire._id}
          className={`flex items-center justify-between gap-2 p-3 rounded-md border bg-gray-100 dark:bg-gray-800 dark:border-gray-700`}
        >
          <p className="text-sm truncate">
            <span className="font-bold">{tire.code}</span>
            <span className={`ml-1 ${colors.muted}`}>/ {tire.brand} - {tire.pattern}</span>
          </p>
          <button
            type="button"
            onClick={() => onRemoveTire(tire)}
            className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
            aria-label={`Eliminar cubierta ${tire.code}`}
          >
            <CloseRoundedIcon fontSize="small"/>
          </button>
        </div>
      ))
    )}
  </div>
)

export default SelectedTiresList
