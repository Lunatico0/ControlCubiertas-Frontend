/**
 * Componente base para modales
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Contenido del modal
 * @param {string} props.title - Título del modal
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {string} props.maxWidth - Ancho máximo del modal (md, lg, xl, 2xl, etc.)
 * @param {string} props.maxHeight - Altura máxima del modal
 */
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
    full: "max-w-full",
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className={`bg-white dark:bg-gray-900 text-black dark:text-white rounded-xl p-6 w-full ${
          maxWidthClasses[maxWidth] || "max-w-md"
        } shadow-xl overflow-auto`}
        style={{ maxHeight }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              ✖
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

export default Modal
