import React, { useEffect, useState } from 'react'
import { getUpdateRules } from '@constants/settingsRules'
import { showToast } from '@utils/toast'

const UpdateSettings = () => {
  const [autoCheck, setAutoCheck] = useState(false)

  useEffect(() => {
    const rules = getUpdateRules()
    setAutoCheck(rules.autoCheckForUpdates)
  }, [])

  const toggleAutoCheck = (enabled) => {
    setAutoCheck(enabled)
    localStorage.setItem("autoCheckForUpdates", enabled ? "true" : "false")
    showToast("success", "Preferencia guardada")
  }

  return (
    <div className="flex flex-col gap-2 items-start">
      <h2>Configuración de Actualizaciones</h2>
      <label className='flex items-center gap-2'>
        <input
          type="checkbox"
          checked={autoCheck}
          onChange={(e) => toggleAutoCheck(e.target.checked)}
        />
        Habilitar verificación automática de actualizaciones
      </label>
    </div>
  )
}

export default UpdateSettings
