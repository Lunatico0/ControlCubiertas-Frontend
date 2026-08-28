import { createContext, useEffect, useState, useMemo } from 'react'
import { showToast } from '@utils/toast'

export const SettingsContext = createContext()
const DEFAULT_STOCK_STATUSES = ["Nueva", "1er Recapado", "2do Recapado", "3er Recapado"]

// Un único default para el layout del comprobante. Antes convivían dos ("fixed" acá,
// "dynamic" en usePrint/useReprint), así que el comprobante podía salir con un layout
// distinto al que mostraba la pantalla de Ajustes.
export const DEFAULT_RECEIPT_LAYOUT = "fixed"

const leerLocal = (clave, porDefecto) => {
  try {
    const guardado = localStorage.getItem(clave)
    return guardado == null ? porDefecto : guardado
  } catch {
    return porDefecto
  }
}

export const SettingsProvider = ({ children }) => {
  // Lectura SÍNCRONA en el initializer: hacerlo en un efecto dejaba una ventana en la que
  // imprimir usaba el default en vez de la preferencia guardada.
  const [receiptLayout, setReceiptLayoutState] = useState(
    () => leerLocal("receiptLayout", DEFAULT_RECEIPT_LAYOUT),
  )
  const [stockStatuses, setStockStatusesState] = useState(() => {
    try {
      const guardado = localStorage.getItem("stockStatuses")
      return guardado ? JSON.parse(guardado) : DEFAULT_STOCK_STATUSES
    } catch {
      return DEFAULT_STOCK_STATUSES
    }
  })

  // Persiste los defaults la primera vez, sin volver a tocar el estado.
  useEffect(() => {
    try {
      if (localStorage.getItem("receiptLayout") == null) {
        localStorage.setItem("receiptLayout", DEFAULT_RECEIPT_LAYOUT)
      }
      if (localStorage.getItem("stockStatuses") == null) {
        localStorage.setItem("stockStatuses", JSON.stringify(DEFAULT_STOCK_STATUSES))
      }
    } catch {
      // localStorage bloqueado (modo privado): los defaults en memoria alcanzan.
    }
  }, [])

  const setReceiptLayout = (layout) => {
    setReceiptLayoutState(layout)
    localStorage.setItem("receiptLayout", layout)
  }

  const setStockStatuses = (statuses) => {
    setStockStatusesState(statuses)
    localStorage.setItem("stockStatuses", JSON.stringify(statuses))
  }

  const resetStockStatuses = () => {
    setStockStatuses(DEFAULT_STOCK_STATUSES)
    showToast("success", "Estados de stock reiniciados a valores por defecto")
  }

  return (
    <SettingsContext.Provider value={{
      receiptLayout,
      setReceiptLayout,
      stockStatuses,
      setStockStatuses,
      resetStockStatuses
    }}>
      {children}
    </SettingsContext.Provider>
  )
}
