import { useContext } from "react"
import { SettingsContext, DEFAULT_RECEIPT_LAYOUT } from "@context/SettingsContext"

// Acceso a los ajustes locales del puesto. Fuera del provider devuelve los defaults en vez
// de romper: hay hooks (usePrint, useReprint) que se usan desde árboles de test aislados.
const useSettings = () => useContext(SettingsContext) || {
  receiptLayout: DEFAULT_RECEIPT_LAYOUT,
  setReceiptLayout: () => {},
  stockStatuses: [],
  setStockStatuses: () => {},
  resetStockStatuses: () => {},
}

export default useSettings
