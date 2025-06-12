import { useState } from "react"
import { useForm } from "react-hook-form"
import TireField from "./fields/TireField"
import { formatOrderNumber } from "@utils/orderNumber"
import { input } from "@utils/tokens"
import Button from "@components/UI/Button"
import Spinner from "@components/UI/Spinner"

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
        <TireField label="Estado" id='status' error={errors.status?.message}>
          <select
            {...register("status", getFieldValidation("status"))}
            className={input.base}
            id="status"
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
        <TireField label="Código interno" id='code' error={errors.code?.message}>
          <input
            {...register("code", getFieldValidation("code"))}
            type="number"
            id='code'
            placeholder={defaultValues.code || " "}
            className={input.base}
            disabled={fieldOptions.code?.disabled}
          />
        </TireField>,
      )}

      {renderIf(
        "orderNumber",
        <TireField label="N° de orden" id='orderNumber' error={errors.orderNumber?.message}>
          <input
            type="text"
            placeholder=" "
            className={input.base}
            id='orderNumber'
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
        <TireField label="Número de serie" id='serialNumber' error={errors.serialNumber?.message}>
          <input
            {...register("serialNumber", getFieldValidation("serialNumber"))}
            type="text"
            placeholder=" "
            id='serialNumber'
            className={input.base}
            disabled={fieldOptions.serialNumber?.disabled}
          />
        </TireField>,
      )}

      {renderIf(
        "brand",
        <TireField label="Marca" id='brand' error={errors.brand?.message}>
          <input
            {...register("brand", getFieldValidation("brand"))}
            type="text"
            placeholder=" "
            id='brand'
            className={input.base}
            disabled={fieldOptions.brand?.disabled}
          />
        </TireField>,
      )}

      {renderIf(
        "pattern",
        <TireField label="Dibujo" id='pattern' error={errors.pattern?.message}>
          <input
            {...register("pattern", getFieldValidation("pattern"))}
            type="text"
            placeholder=" "
            id='pattern'
            className={input.base}
            disabled={fieldOptions.pattern?.disabled}
          />
        </TireField>,
      )}

      {renderIf(
        "kilometers",
        <TireField label="Km iniciales (opcional)" id='kilometers' error={errors.kilometers?.message}>
          <input
            {...register("kilometers", getFieldValidation("kilometers"))}
            type="number"
            placeholder=" "
            id='kilometers'
            className={input.base}
            disabled={fieldOptions.kilometers?.disabled}
          />
        </TireField>,
      )}

      {renderIf(
        "kmAlta",
        <TireField label="Kilometraje inicial" id='kmAlta' error={errors.kmAlta?.message}>
          <input
            {...register("kmAlta", getFieldValidation("kmAlta"))}
            type="number"
            placeholder="Kilometraje inicial"
            id='kmAlta'
            className={input.base}
            disabled={fieldOptions.kmAlta?.disabled}
          />
        </TireField>,
      )}

      {renderIf(
        "kmBaja",
        <TireField label="Kilometraje final" id='kmBaja' error={errors.kmBaja?.message}>
          <input
            {...register("kmBaja", getFieldValidation("kmBaja"))}
            type="number"
            id='kmBaja'
            placeholder="Kilometraje final"
            className={input.base}
            disabled={fieldOptions.kmBaja?.disabled}
          />
        </TireField>,
      )}

      {renderIf(
        "createdAt",
        <TireField label="Fecha de alta" id='createdAt' error={errors.createdAt?.message}>
          <input
            {...register("createdAt", getFieldValidation("createdAt"))}
            type="date"
            id='createdAt'
            defaultValue={new Date().toISOString().split("T")[0]}
            placeholder=" "
            className={input.base}
            disabled={fieldOptions.createdAt?.disabled}
          />
        </TireField>,
      )}

      {renderIf(
        "vehicle",
        <TireField label="Vehículo" id='searchVehicle' error={errors.vehicle?.message}>
          <input
            {...register("searchVehicle", getFieldValidation("vehicle"))}
            type="text"
            id='searchVehicle'
            placeholder="Buscar móvil..."
            className={input.base}
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
                    <Button type="button" className="p-1 bg-green-500 text-white rounded">
                      Seleccionar
                    </Button>
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
        <TireField label="Motivo" id='reason' error={errors.reason?.message}>
          <textarea
            {...register("reason", getFieldValidation("reason"))}
            className={input.base}
            id='reason'
            placeholder={fieldOptions.reason?.placeholder || "Ingrese el motivo"}
            disabled={fieldOptions.reason?.disabled}
          />
        </TireField>,
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

export default TireForm
