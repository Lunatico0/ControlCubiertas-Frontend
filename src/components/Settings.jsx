import React from 'react'
import { showToast } from '@utils/toast'
import { text } from '@utils/tokens'
import {
  getUpdateRules,
  DEFAULT_STOCK_STATUSES
} from '@constants/settingsRules';

const dictionary = {
  autoCheckForUpdates: "Verificación de actualizaciones",
  false: "Deshabilitado",
  true: "Habilitado",
  updateAvailable: "Actualización disponible",
  stockStatuses: "Estados de stock",
  resetStockStatuses: "Reiniciar estados de stock a valores por defecto",
  showUpdateRules: "Mostrar reglas de actualización",
}

const settings = () => {
  const showUpdateRules = () => {
    const rules = getUpdateRules();
    console.log(rules)
    showToast("info", `Reglas de actualización: ${dictionary['autoCheckForUpdates']}: ${dictionary[rules.autoCheckForUpdates] || "Desconocidas"}`);
  }

  const resetStockStatuses = () => {
    localStorage.setItem("stockStatuses", JSON.stringify(DEFAULT_STOCK_STATUSES));
    showToast("success", "Estados de stock reiniciados a valores por defecto");
  }

  const toggleAutoCheck = (enabled) => {
    localStorage.setItem("autoCheckForUpdates", enabled ? "true" : "false");
    showToast("success", "Preferencia guardada");
  };

  return (
    <div className={`items-start p-6 min-h-screen rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100`}>

      <h2>Configuración de la Aplicación</h2>
      <div className={`${text.label} max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8`}>
        <div className={`${text.label} flex flex-col gap-2 items-start`}>
          <h2>Configuración de Actualizaciones</h2>
          <p>
            <label className='flex items-center gap-2'>
              <input
                type="checkbox"
                checked={getUpdateRules().autoCheckForUpdates}
                onChange={(e) => toggleAutoCheck(e.target.checked)}
              />
              Habilitar verificación automática de actualizaciones
            </label>
          </p>
          <button onClick={showUpdateRules}>Mostrar Reglas de Actualización</button>
        </div>

        <div className={`${text.label} flex flex-col gap-2 items-start`}>
          <button onClick={resetStockStatuses}>Reiniciar Estados de Stock</button>
        </div>
      </div>
    </div>
  )
}

export default settings
