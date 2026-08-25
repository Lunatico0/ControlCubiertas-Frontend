import { invalidateCompanyCache } from "./company"
import { invalidateWearCache } from "./admin"
import { setStatusCatalog } from "../components/Operativa/status"

// Varias caches viven a nivel MÓDULO para no re-fetchear datos que cambian poco (empresa,
// desgaste por vehículo, catálogo de estados). Todas son datos DEL TENANT, y el módulo
// sobrevive al logout porque cerrar sesión no recarga la página: es una navegación del
// router. Sin esto, el siguiente usuario que entra en la misma pestaña —otra empresa en una
// terminal compartida de taller— hereda la empresa anterior y sus comprobantes salen
// impresos con el nombre, el logo y el prefijo del cliente anterior.
//
// Se llama al CERRAR y al ABRIR sesión: cerrar cubre la salida limpia, abrir cubre el caso
// en que la sesión anterior terminó de cualquier otra forma.
export const resetClientCaches = () => {
  invalidateCompanyCache()
  invalidateWearCache()
  setStatusCatalog(null)
  // El catálogo de estados también se persiste para pintar la UI antes del primer fetch;
  // es del tenant, así que se va con la sesión.
  try {
    localStorage.removeItem("stockStatuses")
  } catch {
    /* storage bloqueado: la cache en memoria ya se limpió, que es lo que importa */
  }
}
