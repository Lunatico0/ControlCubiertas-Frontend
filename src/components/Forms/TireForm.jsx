import { useState } from "react"
import { useForm } from "react-hook-form"
import TireField from "./fields/TireField"
import { formatOrderNumber } from "@utils/orderNumber"

/**
 * Formulario flexible para cubiertas
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onSubmit - Función para manejar el envío del formulario
 * @param {Object} props.defaultValues - Valores por defecto para los campos
 * @param {Object} props.showFields - Campos a mostrar
 * @param {Array} props.vehicles - Lista de vehículos disponibles
 * @param {string} props.submitLabel - Etiqueta del botón de envío
 * @param {string} props.cancelLabel - Etiqueta del botón de cancelar
 * @param {Function} props.onCancel - Función para manejar el cancelar
 * @param {boolean} props.isSubmitting - Indica si el formulario está enviándose
 * @param {Object} props.fieldOptions - Opciones adicionales para los campos
 * @param {Function} props.validateOrderNumber - Función para validar el número de orden
 */
const TireForm = ({
  onSubmit,
  defaultValues = {},
  showFields = {},
  vehicles = [],
  submitLabel = "Guardar",
  cancelLabel = "Cancelar",
  onCancel,
  isSubmitting = false,
  fieldOptions = {},
  validateOrderNumber,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues,
    mode: "onBlur",
  })

  const [vehicleSearchFocused, setVehicleSearchFocused] = useState(false)
  const searchVehicle = watch("searchVehicle") || ""

  const baseInputStyles =
    "w-full py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none";

  // Función para renderizar campos condicionales
  const renderIf = (name, element) => (showFields[name] ? element : null)

  // Función para obtener las reglas de validación de un campo
  const getFieldValidation = (fieldName) => {
    // Si el campo no se muestra, no debe tener validación
    if (!showFields[fieldName]) {
      return {}
    }

    const options = fieldOptions[fieldName] || {}
    const validation = {}

    // Solo agregar validación required si está explícitamente marcado como true
    if (options.required === true) {
      validation.required = options.requiredMessage || `${fieldName} es obligatorio`
    }

    // Validaciones personalizadas
    if (options.validate) {
      validation.validate = options.validate
    }

    // Otras validaciones específicas
    if (options.min !== undefined) {
      validation.min = {
        value: options.min,
        message: options.minMessage || `Valor mínimo: ${options.min}`,
      }
    }

    if (options.max !== undefined) {
      validation.max = {
        value: options.max,
        message: options.maxMessage || `Valor máximo: ${options.max}`,
      }
    }

    return validation
  }

  // Función para manejar el envío del formulario
  const handleFormSubmit = async (data) => {
    try {
      // Si hay orderNumber, formatearlo antes de enviar
      if (data.orderNumber) {
        data.orderNumber = formatOrderNumber(data.orderNumber)
      }
      await onSubmit(data)
    } catch (error) {
      console.error("Error en envío del formulario:", error)
    }
  }

  // Validación de número de orden
  const validateOrder = async (value) => {
    if (!value) return "El número de orden es obligatorio"

    const cleanValue = value.toString().trim()

    if (!/^\d+$/.test(cleanValue)) {
      return "Debe ser un número válido"
    }

    if (Number.parseInt(cleanValue) === 0) {
      return "El número de orden debe ser mayor a 0"
    }

    if (validateOrderNumber) {
      try {
        const result = await validateOrderNumber(cleanValue)
        return result === true ? true : result
      } catch (error) {
        console.error("Error en validación personalizada:", error)
        return "Error al validar número de orden"
      }
    }

    return true
  }

  return (
    <form className="flex flex-col gap-1" onSubmit={handleSubmit(handleFormSubmit)}>
      {renderIf(
        "status",
        <TireField label="Estado" error={errors.status?.message}>
          <select
            {...register("status", getFieldValidation("status"))}
            className={baseInputStyles}
            disabled={fieldOptions.status?.disabled}
          >
            <option value="Nueva">Nueva</option>
            <option value="1er Recapado">1er Recapado</option>
            <option value="2do Recapado">2do Recapado</option>
            <option value="3er Recapado">3er Recapado</option>
            <option value="A recapar">A recapar</option>
            <option value="Descartada">Descartada</option>
          </select>
        </TireField>,
      )}

      {renderIf(
        "code",
        <TireField label="Código interno" error={errors.code?.message}>
          <input
            {...register("code", getFieldValidation("code"))}
            type="number"
            placeholder={defaultValues.code || ""}
            className={baseInputStyles}
            disabled={fieldOptions.code?.disabled}
          />
        </TireField>,
      )}

      {renderIf(
        "orderNumber",
        <TireField label="N° de orden" error={errors.orderNumber?.message}>
          <input
            type="text"
            placeholder="N° Orden (ej: 123)"
            className={baseInputStyles}
            {...register("orderNumber", {
              ...getFieldValidation("orderNumber"),
              validate: fieldOptions.orderNumber?.required === true ? validateOrder : undefined,
            })}
            disabled={fieldOptions.orderNumber?.disabled}
          />
          <div className="text-xs text-gray-500 mt-1">Se formateará automáticamente como 2025-000123</div>
        </TireField>,
      )}

      {renderIf(
        "serialNumber",
        <TireField label="Número de serie" error={errors.serialNumber?.message}>
          <input
            {...register("serialNumber", getFieldValidation("serialNumber"))}
            type="text"
            placeholder=" "
            className={baseInputStyles}
            disabled={fieldOptions.serialNumber?.disabled}
          />
        </TireField>,
      )}

      {renderIf(
        "brand",
        <TireField label="Marca" error={errors.brand?.message}>
          <input
            {...register("brand", getFieldValidation("brand"))}
            type="text"
            placeholder=" "
            className={baseInputStyles}
            disabled={fieldOptions.brand?.disabled}
          />
        </TireField>,
      )}

      {renderIf(
        "pattern",
        <TireField label="Dibujo" error={errors.pattern?.message}>
          <input
            {...register("pattern", getFieldValidation("pattern"))}
            type="text"
            placeholder=" "
            className={baseInputStyles}
            disabled={fieldOptions.pattern?.disabled}
          />
        </TireField>,
      )}

      {renderIf(
        "kilometers",
        <TireField label="Km iniciales (opcional)" error={errors.kilometers?.message}>
          <input
            {...register("kilometers", getFieldValidation("kilometers"))}
            type="number"
            placeholder=" "
            className={baseInputStyles}
            disabled={fieldOptions.kilometers?.disabled}
          />
        </TireField>,
      )}

      {renderIf(
        "kmAlta",
        <TireField label="Kilometraje inicial" error={errors.kmAlta?.message}>
          <input
            {...register("kmAlta", getFieldValidation("kmAlta"))}
            type="number"
            placeholder="Kilometraje inicial"
            className={baseInputStyles}
            disabled={fieldOptions.kmAlta?.disabled}
          />
        </TireField>,
      )}

      {renderIf(
        "kmBaja",
        <TireField label="Kilometraje final" error={errors.kmBaja?.message}>
          <input
            {...register("kmBaja", getFieldValidation("kmBaja"))}
            type="number"
            placeholder="Kilometraje final"
            className={baseInputStyles}
            disabled={fieldOptions.kmBaja?.disabled}
          />
        </TireField>,
      )}

      {renderIf(
        "createdAt",
        <TireField label="Fecha de alta" error={errors.createdAt?.message}>
          <input
            {...register("createdAt", getFieldValidation("createdAt"))}
            type="date"
            defaultValue={new Date().toISOString().split("T")[0]}
            placeholder=" "
            className={baseInputStyles}
            disabled={fieldOptions.createdAt?.disabled}
          />
        </TireField>,
      )}

      {renderIf(
        "vehicle",
        <TireField label="Vehículo" error={errors.vehicle?.message}>
          <input
            {...register("searchVehicle", getFieldValidation("vehicle"))}
            type="text"
            placeholder="Buscar móvil..."
            className={baseInputStyles}
            onFocus={() => setVehicleSearchFocused(true)}
            onBlur={() => setTimeout(() => setVehicleSearchFocused(false), 150)}
            disabled={fieldOptions.vehicle?.disabled}
          />
          {vehicleSearchFocused && searchVehicle.length > 0 && (
            <div className="absolute z-50 w-full mt-1 text-black bg-gray-100 dark:bg-gray-800 dark:text-white border border-gray-300 dark:border-gray-700 rounded shadow-md max-h-[40dvh] overflow-auto">
              {vehicles
                .filter((v) => v.mobile.toLowerCase().includes(searchVehicle.toLowerCase()))
                .map((vehicle) => (
                  <div
                    key={vehicle._id}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer flex justify-between"
                    onMouseDown={() => {
                      setValue("vehicle", vehicle._id)
                      setValue("searchVehicle", vehicle.mobile)
                    }}
                  >
                    <span>
                      {vehicle.mobile} - {vehicle.licensePlate}
                    </span>
                    <button type="button" className="p-1 bg-green-500 text-white rounded">
                      Seleccionar
                    </button>
                  </div>
                ))}
              {vehicles.filter((v) => v.mobile.toLowerCase().includes(searchVehicle.toLowerCase())).length === 0 && (
                <div className="p-2 text-gray-500 italic text-sm">Sin coincidencias</div>
              )}
            </div>
          )}
        </TireField>,
      )}

      {renderIf(
        "reason",
        <TireField label="Motivo" error={errors.reason?.message}>
          <textarea
            {...register("reason", getFieldValidation("reason"))}
            className={baseInputStyles}
            placeholder={fieldOptions.reason?.placeholder || "Ingrese el motivo"}
            disabled={fieldOptions.reason?.disabled}
          />
        </TireField>,
      )}

      <div className="flex gap-4 justify-center mt-4">
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

export default TireForm
