import { useModalEscape } from "@hooks/useModalStack.js"
import { useFocusTrap } from "@hooks/useFocusTrap"

// Shell común de los drawers laterales de la operativa (overlay + panel deslizante desde la
// derecha). Unifica el markup repetido de AltaDrawer / EditarVehiculo / TireDrawer /
// VehicleDrawer y centraliza el cierre por Escape en el hook stack-aware useModalEscape
// (solo cierra el drawer que está ARRIBA del stack, con stopImmediatePropagation).
//
// Props:
//   onClose    — cierra el drawer (backdrop + Escape). Cada caller decide la lógica: TireDrawer
//                pasa un cierre action-aware; VehicleDrawer uno guardado por !showReconfig.
//   background — color de fondo del panel (default var(--card); VehicleDrawer usa var(--elev)).
//   backdrop   — color del velo (default rgba(0,0,0,.45); VehicleDrawer usa rgba(4,5,6,.55)).
//   maxWidth   — ancho máximo del panel (default 460px; Editar 440px, Vehículo 480px).
//   onSubmit   — opcional: accion de envio. Con esto, Enter en un input del panel envia el
//                formulario. Los formularios de la operativa no son <form> (los campos viven en
//                divs), asi que sin esto Enter no hacia absolutamente nada y habia que ir al
//                boton con el mouse. Enter sobre un boton o dentro de un textarea no lo dispara.
//   z          — z-index del overlay (default 50; VehicleDrawer usa 40).
//   animation  — animación de entrada del panel (default opDrawerIn var(--t-fast) var(--t-ease)).
//   children   — contenido del panel (header + cuerpo; cada drawer arma el suyo).
const Drawer = ({
  onClose,
  onSubmit,
  background = "var(--card)",
  backdrop = "rgba(0,0,0,.45)",
  maxWidth = "460px",
  z = 50,
  animation = "opDrawerIn var(--t-fast) var(--t-ease)",
  children,
}) => {
  useModalEscape(onClose)
  // Atrapa el foco en el panel: autofocus al primer campo, Tab circular y devolucion del foco
  // al cerrar. Antes el foco quedaba en el disparador y habia que tabular por todo el fondo.
  const panelRef = useFocusTrap()

  const onKeyDown = (e) => {
    if (e.key !== "Enter" || !onSubmit) return
    if (e.target.tagName !== "INPUT") return // los botones ya responden a Enter y el textarea escribe
    e.preventDefault()
    onSubmit()
  }

  return (
    <div className="fixed inset-0 flex justify-end" style={{ zIndex: z, background: backdrop }} onClick={onClose}>
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
        className="flex h-full w-full flex-col"
        style={{ maxWidth, background, borderLeft: "1px solid var(--bd)", animation }}
      >
        {children}
      </aside>
    </div>
  )
}

export default Drawer
