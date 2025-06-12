import { useContext } from "react"
import ApiContext from "@context/apiContext"
import { showToast } from "@utils/toast"

const useErrorHandler = () => {
  const { clearError } = useContext(ApiContext)

  const handleError = (error) => {
    clearError()

    const msg = error.message?.toLowerCase() || ""
    const patterns = [
      { match: "timeout", message: "El servidor tardó demasiado en responder." },
      { match: "orden", message: "Hubo un problema con el número de orden." },
      { match: "duplicado", message: "Ya existe un registro duplicado." },
    ]

    const found = patterns.find((p) => msg.includes(p.match))
    showToast("error", found?.message || error.message || "Ocurrió un error inesperado.")
  }

  return { handleError }
}

export default useErrorHandler
