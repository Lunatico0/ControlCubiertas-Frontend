import { colors, text } from "@utils/tokens"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"

const Modal = ({ children, title, onClose, maxWidth = "md", maxHeight = "90dvh" }) => {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    full: "max-w-full sm:max-w-lg",
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 p-4 flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`
          ${colors.surface} ${colors.shadow} text-gray-900 dark:text-gray-100
          rounded-xl p-6 w-full ${maxWidthClasses[maxWidth] || "max-w-md"}
          overflow-auto relative
        `}
        style={{ maxHeight }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className={`${text.heading} text-lg`}>{title}</h2>
            <button
              onClick={onClose}
              aria-label="Cerrar modal"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <CloseRoundedIcon fontSize="small" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

export default Modal
