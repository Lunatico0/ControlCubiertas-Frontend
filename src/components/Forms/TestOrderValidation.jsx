import { useState } from "react"
import { formatOrderNumber } from "@utils/orderNumber"
import { useOrderValidation } from "@hooks/useOrderValidation"

const TestOrderValidation = () => {
  const [orderNumber, setOrderNumber] = useState("")
  const [formatted, setFormatted] = useState("")
  const { validateOrderNumber, isValidating, validationError } = useOrderValidation()
  const [validationResult, setValidationResult] = useState(null)

  const handleFormat = () => {
    try {
      const result = formatOrderNumber(orderNumber)
      setFormatted(result)
    } catch (err) {
      // Manejar error de formato
    }
  }

  const handleValidate = async () => {
    try {
      // Formatear primero
      const formattedNumber = formatOrderNumber(orderNumber)
      setFormatted(formattedNumber)

      // Validar
      const result = await validateOrderNumber(orderNumber)
      if (result === true) {
        setValidationResult({ exists: false, message: "Número disponible" })
      } else {
        setValidationResult({ exists: true, message: result })
      }
    } catch (err) {
      // Error ya manejado por el hook
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Test de Validación de Órdenes</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Número de Orden:</label>
        <input
          type="number"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-black dark:text-white"
          placeholder="Ingrese número"
        />
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={handleFormat} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Formatear
        </button>
        <button
          onClick={handleValidate}
          disabled={isValidating}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 flex items-center gap-2"
        >
          {isValidating && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          {isValidating ? "Validando..." : "Validar"}
        </button>
      </div>

      {formatted && (
        <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded">
          <p className="font-medium">Número formateado:</p>
          <p className="text-blue-600 dark:text-blue-400">{formatted}</p>
        </div>
      )}

      {validationResult && (
        <div
          className={`mb-4 p-2 rounded ${validationResult.exists ? "bg-red-100 dark:bg-red-900/30" : "bg-green-100 dark:bg-green-900/30"}`}
        >
          <p className="font-medium">Resultado:</p>
          <p
            className={
              validationResult.exists ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
            }
          >
            {validationResult.message}
          </p>
        </div>
      )}

      {validationError && (
        <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">
          <p className="font-medium">Error:</p>
          <p>{validationError}</p>
        </div>
      )}

      <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded">
        <p className="font-medium">Instrucciones:</p>
        <ol className="list-decimal pl-5 text-sm">
          <li>Ingrese un número (ej: 123)</li>
          <li>Haga clic en "Formatear" para ver cómo queda (ej: 2025-000123)</li>
          <li>Haga clic en "Validar" para verificar si existe</li>
        </ol>
      </div>
    </div>
  )
}

export default TestOrderValidation
