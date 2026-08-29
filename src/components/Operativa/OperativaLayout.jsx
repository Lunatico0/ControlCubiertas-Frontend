import { useState } from "react"
import { etiquetaDeRol } from "@utils/roles"
import { useNavigate, useLocation, Outlet } from "react-router-dom"
import { seccionDeRuta, rutaDeSeccion, rutaDeVehiculo, rutaDeCubierta, queryDesdeIntent } from "@utils/opRoutes"
import { useTheme } from "@context/ThemeContext"
import { useAuth } from "@context/AuthContext"
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined"
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined"
import TripOriginOutlinedIcon from "@mui/icons-material/TripOriginOutlined"
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined"
import { useCacheTenantLogo } from "@hooks/useCacheTenantLogo"
import { useUpdater } from "@hooks/useUpdater"
import AppSidebar from "@components/Layout/AppSidebar"
import BrandDeco from "@components/common/BrandDeco"
import OpTour from "./OpTour"

// Shell de la app operativa (rediseño Claude Design). Usa el design system de
// tokens (var(--x)) + data-app-theme para tema claro/oscuro. Las pantallas internas
// (inventario, drawer, etc.) llegan en los próximos hitos; por ahora placeholder.
const NAV = [
  { key: "inicio", label: "Inicio", icon: <HomeOutlinedIcon sx={{ fontSize: 20 }} /> },
  { key: "cubiertas", label: "Cubiertas", icon: <TripOriginOutlinedIcon sx={{ fontSize: 20 }} /> },
  { key: "vehiculos", label: "Vehículos", icon: <LocalShippingOutlinedIcon sx={{ fontSize: 20 }} /> },
]

// Pasos del tour de la operativa (screen = key de sección; sel = data-tour del elemento).
const OP_STEPS = [
  { screen: "inicio", sel: null, place: "center", title: "Bienvenido a TireOps", body: "Un recorrido de 30 segundos por lo esencial. Podés salir cuando quieras y volver a verlo desde el botón de ayuda." },
  { screen: "inicio", sel: "nav-cubiertas", place: "right", title: "Menú principal", body: "Todo se mueve desde acá: Inicio, Cubiertas (el inventario) y Vehículos." },
  { screen: "inicio", sel: "inicio-search", place: "bottom", title: "Buscá al instante", body: "Desde el Inicio buscás cualquier cubierta por código, marca o serie. Tip: apretá Ctrl + K para saltar a la búsqueda." },
  { screen: "cubiertas", sel: "cub-filters", place: "bottom", title: "Filtros rápidos", body: "Acotá el inventario por estado: en stock, en circulación o a recapar. El número te dice cuántas hay en cada grupo." },
  { screen: "cubiertas", sel: "cub-viewtoggle", place: "left", title: "Tarjetas o lista", body: "Cambiá entre vista de tarjetas (más visual) y lista (más densa) según lo que necesites." },
  { screen: "cubiertas", sel: "cub-alta", place: "bottom", title: "Dar de alta", body: "Registrás una cubierta nueva en el inventario. Cada movimiento genera su comprobante automáticamente." },
  { screen: "vehiculos", sel: "nav-vehiculos", place: "right", title: "Vehículos y ejes", body: "Cada vehículo muestra su esquema de ejes y las cubiertas montadas. Desde el detalle podés reconfigurar los ejes si hubo un error." },
  { screen: "vehiculos", sel: "help-btn", place: "top", title: "¿Perdido? Volvé acá", body: "Este botón de ayuda reproduce el tour cuando quieras y abre la guía de uso completa." },
]

const OperativaLayout = () => {
  const { isDarkMode } = useTheme()
  const { user, logout, isAdmin } = useAuth()
  const upd = useUpdater() // auto-updater (solo desktop): botón sidebar + modal
  useCacheTenantLogo() // cachea el logo del tenant para el splash del desktop (no-op en web)
  const goToRoute = useNavigate()
  const { pathname } = useLocation()
  // La sección sale de la URL, no de un useState: así el botón Atrás, el refresh y un link
  // compartido llevan al mismo lugar. Ver @utils/opRoutes.
  const active = seccionDeRuta(pathname)
  const [tourOpen, setTourOpen] = useState(false) // guía interactiva (tour con spotlight)

  // El "intent" (búsqueda, pestaña, alta, montaje dirigido) viaja en la QUERY y no en el state
  // de react-router: el state no sobrevive a un F5, así que la pantalla no se podía reconstruir.
  const navigate = (section, intentData = null) => {
    // Un intent que apunta a un elemento concreto va a SU ruta: así el link es compartible y
    // el botón Atrás cierra el detalle en vez de salir de la app.
    if (intentData?.openVehicle) return goToRoute(rutaDeVehiculo(intentData.openVehicle))
    if (intentData?.openTire) return goToRoute(rutaDeCubierta(intentData.openTire))
    goToRoute(`${rutaDeSeccion(section)}${queryDesdeIntent(intentData)}`)
  }

  const displayName = user?.name || user?.email?.split("@")[0] || "Operario"
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div
      data-app-theme={isDarkMode ? "dark" : "light"}
      className="flex h-full w-full overflow-hidden text-left"
      style={{ background: "var(--bg)", color: "var(--tx)", fontFamily: "var(--font-sans)" }}
    >
      {/* ============ SIDEBAR ============ */}
      <AppSidebar
        nav={NAV.map((item) => ({
          key: item.key,
          label: item.label,
          icon: item.icon,
          active: active === item.key,
          onClick: () => navigate(item.key),
          dataTour: item.key === "cubiertas" ? "nav-cubiertas" : item.key === "vehiculos" ? "nav-vehiculos" : undefined,
        }))}
        belowNav={
          isAdmin ? (
            <>
              <div className="mx-1 my-2 h-px" style={{ background: "var(--bd-faint)" }} />
              {/* <button> y no <div>: es un control real, tiene que entrar en el orden de
                  tabulacion y responder a Enter/Espacio como el resto del nav. */}
              <button
                type="button"
                onClick={() => goToRoute("/admin")}
                title="Ir al panel administrativo"
                className="flex w-full cursor-pointer items-center gap-[13px] rounded-[var(--r-md)] px-[13px] py-3 text-left text-[14.5px] font-semibold transition-colors"
                style={{ border: "1px solid color-mix(in srgb, var(--ink-lime) 45%, transparent)", background: "color-mix(in srgb, var(--ink-lime) 8%, transparent)", color: "var(--ink-lime)" }}
              >
                <span className="inline-flex h-[21px] w-[21px] flex-none items-center"><AdminPanelSettingsOutlinedIcon sx={{ fontSize: 20 }} /></span>
                <span>Panel administrativo</span>
              </button>
            </>
          ) : null
        }
        upd={upd}
        user={{ name: displayName, roleLabel: etiquetaDeRol(user?.role), initials, avatarBg: "#18B89E", avatarColor: "#04201B" }}
        help={{ dataTour: "help-btn", onStartTour: () => { navigate("inicio"); setTourOpen(true) }, guideHref: "/guia", guideLabel: "Guía de uso completa", guideSubtitle: "Manual detallado · pestaña nueva" }}
        onLogout={logout}
      />

      {/* ============ MAIN ============ */}
      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Deco de marca: dos logos TireOps muy tenues, solo en Inicio (detrás del contenido). */}
        {active === "inicio" && (
          <>
            <BrandDeco variant="icon" />
            <BrandDeco variant="full" />
          </>
        )}
        <div className="relative z-[1] flex-1 overflow-auto">
          {/* Cada sección es una ruta anidada (ver App.jsx). `onNavigate` sigue existiendo
              porque las pantallas se navegan entre sí (montar una cubierta vuelve al vehículo). */}
          <Outlet context={{ onNavigate: navigate }} />
        </div>
      </main>

      {tourOpen && <OpTour steps={OP_STEPS} active={active} onNavigate={(s) => navigate(s)} onClose={() => setTourOpen(false)} />}
    </div>
  )
}

export default OperativaLayout
