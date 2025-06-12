import { useForm } from "react-hook-form"
import VehicleField from "./fields/VehicleField"
import TireSearchBox from "./fields/TireSearchBox"
import SelectedTiresList from "./fields/SelectedTiresList"
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import Button from '@components/UI/button'
import { button } from '@utils/tokens'

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
  setSearchQuery = () => { },
  isSearchOpen = false,
  setIsSearchOpen = () => { },
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
            <Button
              type="submit"
              variant='secondary'
              onClick={() => setIsSearchOpen(true)}
              className={`${button.secondary}`}
            >
              <AddCircleRoundedIcon fontSize="small" /> Agregar cubierta
            </Button>
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

      <div className="flex gap-4 justify-center mt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-6 py-2 rounded-md transition flex items-center gap-2"
        >
          {isSubmitting && <Spinner size={4} />}
          {submitLabel}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          variant="secondary"
        >
          {cancelLabel}
        </Button>
      </div>
    </form>
  )
}

export default VehicleForm
