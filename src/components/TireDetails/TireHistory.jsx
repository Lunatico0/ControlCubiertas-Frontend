import { useContext, useState } from "react"
import { getRowStyle, dictionary } from "@utils/historyStyles"
import useContextMenu from "@hooks/useContextMenu"
import useTooltip from "@hooks/useTooltip"
import UndoHistoryEntryModal from "../actions/modals/UndoHistoryEntryModal"
import ApiContext from "@context/apiContext"

/**
 * Componente para mostrar el historial de una cubierta
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.history - Historial de la cubierta
 * @param {string} props.code - Código de la cubierta
 * @param {string} props.serialNumber - Número de serie de la cubierta
 * @param {Object} props.tire - Objeto completo de la cubierta
 * @param {Function} props.onEditEntry - Función para editar una entrada
 */
const TireHistory = ({ history = [], code, serialNumber, tire, onEditEntry }) => {
  const { loadTireById } = useContext(ApiContext)
  const [undoEntry, setUndoEntry] = useState(null)
  const reversedHistory = [...history].reverse()

  const { tooltip, showTooltip, hideTooltip } = useTooltip()
  const { openIndex: openMenuIndex, setOpenIndex, position: menuPosition, openMenu, menuRef } = useContextMenu()

  const handleRefreshTire = async () => {
    if (tire?._id) {
      await loadTireById(tire._id)
    }
  }

  const handleEditEntry = (entry) => {
    setOpenIndex(null)
    onEditEntry(entry)
  }

  const handleUndoEntry = (entry) => {
    setOpenIndex(null)
    setUndoEntry(entry)
  }

  if (!history || history.length === 0) {
    return (
      <div className="p-6">
        <h3 className="font-semibold mb-4">Historial</h3>
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500">No hay registros en el historial</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header del historial */}
      <div className="flex items-center justify-between p-6 pb-4">
        <h3 className="font-semibold">Historial</h3>
        <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
          {history.length} registro(s)
        </span>
      </div>

      {/* Tabla con scroll independiente */}
      <div className="flex-1 overflow-hidden px-6">
        <div className="border rounded-lg shadow-sm h-full flex flex-col">
          <div className="flex-1 overflow-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
                <tr>
                  <th className="p-3 font-medium text-xs">Fecha</th>
                  <th className="p-3 font-medium text-xs">N° Orden</th>
                  <th className="p-3 font-medium text-xs">Móvil</th>
                  <th className="p-3 font-medium text-xs">Patente</th>
                  <th className="p-3 font-medium text-xs">Km Alta</th>
                  <th className="p-3 font-medium text-xs">Km Baja</th>
                  <th className="p-3 font-medium text-xs">Km Total</th>
                  <th className="p-3 font-medium text-xs">Estado</th>
                  <th className="p-3 font-medium text-xs">N° Int</th>
                  <th className="p-3 font-medium text-xs">N° Serie</th>
                  <th className="p-3 font-medium text-xs text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reversedHistory.map((record, i) => (
                  <HistoryRow
                    key={`${record._id || i}-${record.date}`}
                    record={record}
                    index={i}
                    code={code}
                    serialNumber={serialNumber}
                    onShowTooltip={showTooltip}
                    onHideTooltip={hideTooltip}
                    onOpenMenu={openMenu}
                    openMenuIndex={openMenuIndex}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tooltip para correcciones */}
      {tooltip.visible && (
        <div
          className="fixed z-50 bg-gray-800 text-white text-xs p-3 rounded-lg shadow-lg max-w-xs"
          style={{ top: tooltip.y, left: tooltip.x }}
        >
          <div className="space-y-1">
            <div>
              <strong>Tipo:</strong> {tooltip.content.tipo}
            </div>
            <div>
              <strong>Campos editados:</strong> {tooltip.content.campos}
            </div>
            <div>
              <strong>Razón:</strong> {tooltip.content.reason}
            </div>
          </div>
        </div>
      )}

      {/* Menú contextual */}
      {openMenuIndex !== null && (
        <div
          ref={menuRef}
          className="fixed z-50 w-40 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden"
          style={{
            top: `${menuPosition.y}px`,
            left: `${menuPosition.x - 160}px`,
          }}
        >
          <button
            className="w-full px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-left transition-colors"
            onClick={() => handleEditEntry(reversedHistory[openMenuIndex])}
          >
            ✏️ Editar entrada
          </button>
          <button
            className="w-full px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-left transition-colors border-t border-gray-200 dark:border-gray-600"
            onClick={() => handleUndoEntry(reversedHistory[openMenuIndex])}
          >
            ↶ Deshacer entrada
          </button>
        </div>
      )}

      {/* Modal para deshacer entrada */}
      {undoEntry && (
        <UndoHistoryEntryModal
          tire={tire}
          entry={undoEntry}
          onClose={() => setUndoEntry(null)}
          refreshTire={handleRefreshTire}
        />
      )}
    </div>
  )
}

/**
 * Componente para una fila del historial
 */
const HistoryRow = ({ record, index, code, serialNumber, onShowTooltip, onHideTooltip, onOpenMenu, openMenuIndex }) => {
  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString("es-AR")
    } catch {
      return "Fecha inválida"
    }
  }

  const formatKm = (km) => {
    if (km === null || km === undefined) return "-"
    return typeof km === "number" ? km.toLocaleString() : km
  }

  return (
    <tr
      className={`border-b border-gray-200 dark:border-gray-700 ${getRowStyle(record.type, record.flag)} hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors`}
    >
      <td className="p-3 text-xs">{formatDate(record.date)}</td>
      <td className="p-3 text-center text-xs">{record.orderNumber || "-"}</td>
      <td className="p-3 text-center text-xs">{record.vehicle?.mobile || "-"}</td>
      <td className="p-3 text-center text-xs">{record.vehicle?.licensePlate || "-"}</td>
      <td className="p-3 text-center text-xs">{formatKm(record.kmAlta)}</td>
      <td className="p-3 text-center text-xs">{formatKm(record.kmBaja)}</td>
      <td className="p-3 text-center text-xs">{formatKm(record.km)}</td>
      <td className="p-3 text-center text-xs">{record.status || "-"}</td>
      <td className="p-3 text-center text-xs">{code}</td>
      <td className="p-3 text-center text-xs">{serialNumber}</td>
      <td className="p-3 text-center">
        <div className="flex items-center justify-center gap-2">
          {record.flag && (
            <span
              className="cursor-pointer text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors text-sm"
              onMouseEnter={(e) =>
                onShowTooltip(e, {
                  tipo: "Corrección",
                  campos: Array.isArray(record.editedFields)
                    ? record.editedFields.map((f) => dictionary[f] || f).join(", ")
                    : dictionary[record.editedFields] || record.editedFields || "No especificado",
                  reason: record.reason || "No especificada",
                })
              }
              onMouseLeave={onHideTooltip}
              title="Ver detalles de la corrección"
            >
              🛈
            </span>
          )}
          <button
            onClick={(e) => onOpenMenu(index, e)}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-1 text-sm"
            title="Más opciones"
          >
            ⋮
          </button>
        </div>
      </td>
    </tr>
  )
}

export default TireHistory
