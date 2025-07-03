import { useContext } from 'react'
import { SettingsContext } from '@context/SettingsContext'

const ALL_STATUSES = [
  "Nueva", "1er Recapado", "A recapar",  "2do Recapado", "Descartada", "3er Recapado"
]

const StockStatusSettings = () => {
  const { stockStatuses, setStockStatuses, resetStockStatuses } = useContext(SettingsContext)

  const toggleStatus = (status) => {
    if (stockStatuses.includes(status)) {
      setStockStatuses(stockStatuses.filter(s => s !== status))
    } else {
      setStockStatuses([...stockStatuses, status])
    }
  }

  return (
    <div className="flex flex-col gap-4 items-start">
      <h2 className="text-lg font-semibold">Estados considerados en Stock</h2>

      <div className="grid grid-cols-2 gap-2">
        {ALL_STATUSES.map((status) => (
          <label key={status} className="flex items-center text-nowrap gap-2">
            <input
              type="checkbox"
              checked={stockStatuses.includes(status)}
              onChange={() => toggleStatus(status)}
            />
            <span>{status}</span>
          </label>
        ))}
      </div>

      <button
        className="mt-2 text-sm px-3 py-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400/70 dark:hover:bg-gray-500/70 rounded"
        onClick={resetStockStatuses}
      >
        Reiniciar Estados por defecto
      </button>
    </div>
  )
}

export default StockStatusSettings
