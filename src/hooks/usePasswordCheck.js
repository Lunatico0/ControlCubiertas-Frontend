import { useState, useCallback } from "react"
import Swal from "sweetalert2"

/**
 * Hook para manejar la verificación de contraseña
 * @param {Object} options - Opciones de configuración
 * @param {string} options.password - Contraseña a verificar (default: "1234")
 * @param {string} options.title - Título del modal (default: "Verificación requerida")
 * @returns {Object} Funciones y estados para verificación de contraseña
 */
export const usePasswordCheck = ({ password = "1234", title = "Verificación requerida" } = {}) => {
  const [isChecking, setIsChecking] = useState(false)
  const [lastResult, setLastResult] = useState(null)

  const checkPassword = useCallback(
    async (customTitle) => {
      if (isChecking) return false

      setIsChecking(true)

      try {
        const result = await Swal.fire({
          title: customTitle || title,
          text: "Ingresa la contraseña para continuar",
          input: "password",
          inputPlaceholder: "Contraseña",
          inputAttributes: {
            autocapitalize: "off",
            autocorrect: "off",
          },
          showCancelButton: true,
          confirmButtonText: "Verificar",
          cancelButtonText: "Cancelar",
          confirmButtonColor: "#3b82f6",
          cancelButtonColor: "#6b7280",
          showLoaderOnConfirm: true,
          backdrop: true,
          allowOutsideClick: false,
          customClass: {
            popup: "rounded-xl",
            title: "text-lg font-semibold",
            input: "rounded-lg",
          },
          inputValidator: (value) => {
            return new Promise((resolve) => {
              if (!value) {
                resolve("Por favor ingresa la contraseña")
              } else if (value === password) {
                resolve()
              } else {
                resolve("Contraseña incorrecta")
              }
            })
          },
        })

        setLastResult(result.isConfirmed)
        return result.isConfirmed
      } catch (error) {
        console.error("Error en verificación de contraseña:", error)
        return false
      } finally {
        setIsChecking(false)
      }
    },
    [isChecking, title, password],
  )

  return {
    checkPassword,
    isChecking,
    lastResult,
  }
}

export default usePasswordCheck
