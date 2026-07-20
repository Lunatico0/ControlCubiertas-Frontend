import { createPortal } from "react-dom"
import { useTheme } from "@context/ThemeContext"
import { useModalEscape } from "@hooks/useModalStack.js"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"

// Shell de modal centrado del rediseño (unifica el overlay+card de UserForm y UpdaterModal).
// - overlay: fixed inset-0 z-50, backdrop rgba(4,5,6,.66), click afuera cierra, Escape stack-aware.
// - card: rounded-[14px] var(--card) + borde var(--bd-strong) + shadow; header opcional (título + X).
//
// Props:
//   title       — título del header (Space Grotesk). Si es null/undefined, no se renderiza header.
//   onClose     — cierra (backdrop, X y Escape).
//   maxWidth    — ancho máximo del card en px (default 448).
//   onSubmit    — si se pasa, el card es un <form onSubmit> noValidate (modales con submit).
//   portal      — si true, se renderiza en document.body y aplica su propio data-app-theme
//                 (para escapar stacking contexts que dejaban el backdrop por debajo de la barra).
//   footer      — nodo opcional renderizado como barra inferior (dentro del form si onSubmit).
//   bodyClassName / bodyStyle — clases/estilo del contenedor del cuerpo (padding, scroll).
const Modal = ({ title, onClose, maxWidth = 448, onSubmit, portal = false, footer, bodyClassName = "p-[22px]", bodyStyle, children }) => {
  const { isDarkMode } = useTheme()
  useModalEscape(onClose)

  const Card = onSubmit ? "form" : "div"
  const cardProps = onSubmit ? { onSubmit, noValidate: true } : {}

  const node = (
    <div
      onClick={onClose}
      data-app-theme={portal ? (isDarkMode ? "dark" : "light") : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(4,5,6,.66)" }}
      role="dialog"
      aria-modal="true"
    >
      <Card
        {...cardProps}
        onClick={(e) => e.stopPropagation()}
        className="w-full overflow-hidden rounded-[14px]"
        style={{ maxWidth, background: "var(--card)", border: "1px solid var(--bd-strong)", boxShadow: "0 24px 64px rgba(0,0,0,.6)" }}
      >
        {title != null && (
          <div className="flex items-center px-[22px] py-[19px]" style={{ borderBottom: "1px solid var(--bd-soft)" }}>
            <div className="text-[16px] font-semibold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>{title}</div>
            <button type="button" onClick={onClose} aria-label="Cerrar" className="ml-auto inline-flex rounded-[7px] p-1" style={{ color: "var(--tx-5)" }}>
              <CloseRoundedIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
        )}
        <div className={bodyClassName} style={bodyStyle}>{children}</div>
        {footer}
      </Card>
    </div>
  )

  return portal ? createPortal(node, document.body) : node
}

export default Modal
