import { useEffect } from "react"
import isElectron from "@utils/isElectron"
import { getCompanyCached } from "@api/company"

// En la app instalable (Electron), cachea el logo del tenant (receiptDesign.logo, un dataURL)
// para que el splash del PRÓXIMO arranque lo muestre. El splash corre antes del login, así que
// depende de este cache: primer inicio o tenant sin logo → splash con la marca TireOps.
// En web es no-op (no existe window.electronAPI).
export const useCacheTenantLogo = () => {
  useEffect(() => {
    if (!isElectron() || !window.electronAPI?.cacheTenantLogo) return
    let cancelled = false
    getCompanyCached()
      .then((c) => {
        const logo = c?.receiptDesign?.logo
        if (!cancelled && typeof logo === "string" && logo.startsWith("data:image/")) {
          window.electronAPI.cacheTenantLogo(logo)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])
}

export default useCacheTenantLogo
