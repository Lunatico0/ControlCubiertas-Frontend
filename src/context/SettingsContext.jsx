import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
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

  const setReceiptLayout = useCallback((layout) => {
    setReceiptLayoutState(layout)
    localStorage.setItem("receiptLayout", layout)
  }, [])

  const setStockStatuses = useCallback((statuses) => {
    setStockStatusesState(statuses)
    localStorage.setItem("stockStatuses", JSON.stringify(statuses))
  }, [])

  const resetStockStatuses = useCallback(() => {
    setStockStatuses(DEFAULT_STOCK_STATUSES)
    showToast("success", "Estados de stock reiniciados a valores por defecto")
  }, [setStockStatuses])

  // t81: el value era un objeto literal nuevo en cada render (y el archivo importaba useMemo
  // sin usarlo). Los setters van con useCallback porque si no la memoización del value no
  // sirve de nada: cambiarían de identidad igual en cada render.
  const value = useMemo(
    () => ({ receiptLayout, setReceiptLayout, stockStatuses, setStockStatuses, resetStockStatuses }),
    [receiptLayout, setReceiptLayout, stockStatuses, setStockStatuses, resetStockStatuses],
  )

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}
