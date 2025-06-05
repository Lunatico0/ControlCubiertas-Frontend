import { useForm } from "react-hook-form"
import VehicleField from "./fields/VehicleField"
import TireSearchBox from "./fields/TireSearchBox"
import SelectedTiresList from "./fields/SelectedTiresList"

/**
 * Formulario para vehículos
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onSubmit - Función para manejar el envío del formulario
 * @param {Object} props.defaultValues - Valores por defecto para los campos
 * @param {Object} props.showFields - Campos a mostrar
 * @param {Array} props.availableTires - Lista de cubiertas disponibles
 * @param {Array} props.selectedTires - Lista de cubiertas seleccionadas
 * @param {React.RefObject} props.modalRef - Referencia al modal
 * @param {Function} props.onAddTire - Función para añadir una cubierta
 * @param {Function} props.onRemoveTire - Función para eliminar una cubierta
 * @param {string} props.searchQuery - Consulta de búsqueda
 * @param {Function} props.setSearchQuery - Función para establecer la consulta de búsqueda
 * @param {boolean} props.isSearchOpen - Indica si la búsqueda está abierta
 * @param {Function} props.setIsSearchOpen - Función para establecer si la búsqueda está abierta
 * @param {string} props.submitLabel - Etiqueta del botón de envío
 * @param {string} props.cancelLabel - Etiqueta del botón de cancelar
 * @param {Function} props.onCancel - Función para manejar el cancelar
 * @param {boolean} props.isSubmitting - Indica si el formulario está enviándose
 * @param {Object} props.fieldOptions - Opciones adicionales para los campos
 */
const VehicleForm = ({
  onSubmit,
  defaultValues = {},
  showFields = {},
  availableTires = [],
  selectedTires = [],
  modalRef,
  onAddTire,
  onRemoveTire,
  searchQuery = "",
  setSearchQuery = () => {},
  isSearchOpen = false,
  setIsSearchOpen = () => {},
  submitLabel = "Guardar",
  cancelLabel = "Cancelar",
  onCancel,
  isSubmitting = false,
  fieldOptions = {},
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues, mode: "onBlur" })

  const baseInputStyles =
    "w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"

  const renderIf = (name, element) => (showFields[name] ? element : null)

  return (
    <form ref={modalRef} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {renderIf(
        "brand",
        <VehicleField label="Marca">
          <input
            {...register("brand", { required: fieldOptions.brand?.required !== false })}
            type="text"
            className={baseInputStyles}
            disabled={fieldOptions.brand?.disabled}
          />
          {errors.brand && <p className="text-sm text-red-500 mt-1">{errors.brand.message}</p>}
        </VehicleField>,
      )}

      {renderIf(
        "mobile",
        <VehicleField label="Móvil">
          <input
            {...register("mobile", { required: fieldOptions.mobile?.required !== false })}
            type="text"
            className={baseInputStyles}
            disabled={fieldOptions.mobile?.disabled}
          />
          {errors.mobile && <p className="text-sm text-red-500 mt-1">{errors.mobile.message}</p>}
        </VehicleField>,
      )}

      {renderIf(
        "licensePlate",
        <VehicleField label="Patente">
          <input
            {...register("licensePlate", { required: fieldOptions.licensePlate?.required !== false })}
            type="text"
            className={baseInputStyles}
            disabled={fieldOptions.licensePlate?.disabled}
          />
          {errors.licensePlate && <p className="text-sm text-red-500 mt-1">{errors.licensePlate.message}</p>}
        </VehicleField>,
      )}

      {renderIf(
        "type",
        <VehicleField label="Tipo (opcional)">
          <input {...register("type")} type="text" className={baseInputStyles} disabled={fieldOptions.type?.disabled} />
          {errors.type && <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>}
        </VehicleField>,
      )}

      {renderIf(
        "tires",
        <VehicleField label="Asignación de cubiertas (opcional)">
          <SelectedTiresList tires={selectedTires} onRemoveTire={onRemoveTire} />
          {!isSearchOpen && (
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex justify-center items-center mt-2"
            >
              ➕ Agregar cubierta
            </button>
          )}
          {isSearchOpen && (
            <TireSearchBox
              availableTires={availableTires}
              onAddTire={onAddTire}
              query={searchQuery}
              setQuery={setSearchQuery}
            />
          )}
        </VehicleField>,
      )}

      <div className="flex gap-4 mt-4 justify-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-6 py-2 rounded-md transition flex items-center gap-2"
        >
          {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 font-semibold px-6 py-2 rounded-md transition"
        >
          {cancelLabel}
        </button>
      </div>
    </form>
  )
}

export default VehicleForm
