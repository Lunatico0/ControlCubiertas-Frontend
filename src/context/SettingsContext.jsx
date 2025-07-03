import { createContext, useEffect, useState, useMemo } from 'react'
import { showToast } from '@utils/toast'

export const SettingsContext = createContext()
const DEFAULT_STOCK_STATUSES = ["Nueva", "1er Recapado", "2do Recapado", "3er Recapado"]

export const SettingsProvider = ({ children }) => {
  const [receiptLayout, setReceiptLayoutState] = useState("fixed")
  const [stockStatuses, setStockStatusesState] = useState(DEFAULT_STOCK_STATUSES)

  useEffect(() => {
    const savedLayout = localStorage.getItem("receiptLayout")
    const savedStatuses = localStorage.getItem("stockStatuses")

    if (savedLayout) setReceiptLayoutState(savedLayout)
    else localStorage.setItem("receiptLayout", "fixed")

    if (savedStatuses) setStockStatusesState(JSON.parse(savedStatuses))
    else localStorage.setItem("stockStatuses", JSON.stringify(DEFAULT_STOCK_STATUSES))
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
