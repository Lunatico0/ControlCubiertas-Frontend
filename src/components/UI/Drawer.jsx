import { useModalEscape } from "@hooks/useModalStack.js"

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
//   z          — z-index del overlay (default 50; VehicleDrawer usa 40).
//   animation  — animación de entrada del panel (default opDrawerIn .18s ease).
//   children   — contenido del panel (header + cuerpo; cada drawer arma el suyo).
const Drawer = ({
  onClose,
  background = "var(--card)",
  backdrop = "rgba(0,0,0,.45)",
  maxWidth = "460px",
  z = 50,
  animation = "opDrawerIn .18s ease",
  children,
}) => {
  useModalEscape(onClose)

  return (
    <div className="fixed inset-0 flex justify-end" style={{ zIndex: z, background: backdrop }} onClick={onClose}>
      <aside
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full flex-col"
        style={{ maxWidth, background, borderLeft: "1px solid var(--bd)", animation }}
      >
        {children}
      </aside>
    </div>
  )
}

export default Drawer
