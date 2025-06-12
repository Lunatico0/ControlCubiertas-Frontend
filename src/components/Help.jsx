import { useContext } from "react";
import ApiContext from "@context/apiContext";
import tireStatusInfo from "@utils/tireStatusInfo";
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import { colors } from "@utils/tokens"

const Help = () => {
  const { data } = useContext(ApiContext)

  return (
    <div className="relative group">
      <button
        className={`flex items-center gap-3 px-4 py-3 ${colors.muted} hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
        title="Ver información de estados`}
      >
        <span className="text-xl"><HelpOutlineRoundedIcon /></span>
        <span className="font-medium">Ayuda</span>
      </button>

      {/* Tooltip de ayuda mejorado */}
      <div className="absolute top-full left-0 mt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
        <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-6 w-96">
          {/* Flecha del tooltip */}
          <div className="absolute -top-2 left-6 w-4 h-4 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 rotate-45"></div>

          <div className="space-y-4">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">Estados de las cubiertas</h3>
              <p className={`text-sm ${colors.muted} mt-1`}>
                Información sobre los diferentes estados del sistema
              </p>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {data.availableStatuses.map((status) => {
                const info = tireStatusInfo[status]
                if (!info) return null

                return (
                  <div
                    key={status}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg"> <info.icon/> </span>
                        <div className={`w-3 h-3 rounded-full ${info.colorClass}`}></div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{status}</p>
                      <p className={`text-xs ${colors.muted} leading-relaxed mt-1`}>
                        {info.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className={`flex items-center gap-3 text-sm ${colors.muted}`}>
                <span>Haz clic en una cubierta para ver más detalles y realizar acciones</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Help
