import { createContext, useState, useEffect, useCallback, useMemo } from "react"
import { getSuggestedCode } from "@utils/suggestedCode"

// Importar todas las funciones API
import {
  createTire,
  fetchAllTires,
  fetchTireById,
  updateTireStatus,
  undoHistoryEntry,
  getReceiptNumber,
  assignTireToVehicle,
  updateTireHistoryEntry,
  unassignTireFromVehicle,
  updateTireDataCorrection,
} from "../api/tires"

import { fetchAllVehicles, fetchVehicleById, createVehicle, updateVehicle } from "../api/vehicles"

import { checkOrderNumber } from "../api/orders"

const ApiContext = createContext()

// Estados iniciales
const initialFilters = {
  status: "",
  brand: "",
  vehicle: "",
  kmFrom: "",
  kmTo: "",
  sortBy: "",
}

// Constantes que no cambian
const STATE_ORDER = ["Nueva", "1er Recapado", "2do Recapado", "3er Recapado", "A recapar", "Descartada"]

export const ApiProvider = ({ children }) => {
  // Estados principales
  const [tires, setTires] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [selectedTire, setSelectedTire] = useState(null)
  const [selectedVehicle, setSelectedVehicle] = useState(null)

  // Estados de UI
  const [filteredTireData, setFilteredTireData] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState(initialFilters)

  // Estados de carga y errores
  const [loading, setLoading] = useState(true)
  const [selectedLoading, setSelectedLoading] = useState(false)
  const [error, setError] = useState(null)

  // Estados derivados
  const [availableBrands, setAvailableBrands] = useState([])
  const [availableStatuses, setAvailableStatuses] = useState([])
  const [vehiclesWTires, setVehiclesWTires] = useState([])
  const [suggestedCode, setSuggestedCode] = useState("")

  // Estados de control
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Valores derivados memoizados
  const tireCount = useMemo(() => tires?.length || 0, [tires])

  // ========== FUNCIONES DE UTILIDAD ==========

  const triggerGlobalRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  const replaceTireInList = useCallback((updatedTire) => {
    setTires((prev) => prev.map((t) => (t._id === updatedTire._id ? updatedTire : t)))

    // También actualizar selectedTire si es la misma cubierta
    setSelectedTire((prev) => {
      if (prev && prev._id === updatedTire._id) {
        return updatedTire
      }
      return prev
    })
  }, [])

  const replaceVehicleInList = useCallback((updatedVehicle) => {
    setVehicles((prev) => prev.map((v) => (v._id === updatedVehicle._id ? updatedVehicle : v)))
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // ========== FUNCIONES DE CARGA DE DATOS ==========

  const loadTires = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchAllTires()
      setTires(result)
      setSuggestedCode(getSuggestedCode(result))
    } catch (err) {
      console.error("Error cargando cubiertas:", err)
      setError("Error al obtener las cubiertas: " + err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadVehicles = useCallback(async () => {
    try {
      setError(null)
      const result = await fetchAllVehicles()
      setVehicles(result)
    } catch (err) {
      console.error("Error cargando vehículos:", err)
      setError("Error al obtener vehículos: " + err.message)
    }
  }, [])

  const loadTireById = useCallback(
    async (id) => {
      try {
        setSelectedLoading(true)
        setError(null)
        const result = await fetchTireById(id)
        setSelectedTire(result)

        // También actualizar en la lista principal
        replaceTireInList(result)

        return result
      } catch (err) {
        console.error("Error cargando cubierta por ID:", err)
        setError("Error al obtener la cubierta: " + err.message)
        throw err
      } finally {
        setSelectedLoading(false)
      }
    },
    [replaceTireInList],
  )

  const loadVehicleById = useCallback(async (id) => {
    try {
      setSelectedLoading(true)
      setError(null)
      const result = await fetchVehicleById(id)
      setSelectedVehicle(result)
      return result
    } catch (err) {
      console.error("Error cargando vehículo por ID:", err)
      setError("Error al obtener el vehículo: " + err.message)
      throw err
    } finally {
      setSelectedLoading(false)
    }
  }, [])

  // ========== FUNCIONES DE CRUD PARA TIRES ==========

  const handleCreateTire = useCallback(
    async (data) => {
      console.log("🔧 Contexto: Creando cubierta con datos:", data)
      try {
        setError(null)
        const result = await createTire(data)
        console.log("✅ Contexto: Cubierta creada exitosamente:", result)
        triggerGlobalRefresh()
        return result
      } catch (err) {
        console.error("❌ Contexto: Error creando cubierta:", err)
        setError("Error al crear cubierta: " + err.message)
        throw err
      }
    },
    [triggerGlobalRefresh],
  )

  const handleUpdateTireStatus = useCallback(
    async (tireId, data) => {
      console.log("🔧 Contexto: Actualizando estado - ID:", tireId, "Data:", data)
      try {
        setError(null)
        const result = await updateTireStatus(tireId, data)
        console.log("✅ Contexto: Estado actualizado:", result)

        if (result?.tire) {
          replaceTireInList(result.tire)
        }

        return result
      } catch (err) {
        console.error("❌ Contexto: Error actualizando estado:", err)
        setError("Error al actualizar estado: " + err.message)
        throw err
      }
    },
    [replaceTireInList],
  )

  const handleAssignTire = useCallback(
    async (tireId, data) => {
      console.log("🔧 Contexto: Asignando cubierta - ID:", tireId, "Data:", data)
      try {
        setError(null)
        const result = await assignTireToVehicle(tireId, data)
        console.log("✅ Contexto: Cubierta asignada:", result)

        if (result?.tire) {
          replaceTireInList(result.tire)
        }

        return result
      } catch (err) {
        console.error("❌ Contexto: Error asignando cubierta:", err)
        setError("Error al asignar cubierta: " + err.message)
        throw err
      }
    },
    [replaceTireInList],
  )

  const handleUnassignTire = useCallback(
    async (tireId, data) => {
      try {
        setError(null)
        const result = await unassignTireFromVehicle(tireId, data)

        if (result?.tire) {
          replaceTireInList(result.tire)
        }

        return result
      } catch (err) {
        console.error("Error desasignando cubierta:", err)
        setError("Error al desasignar cubierta: " + err.message)
        throw err
      }
    },
    [replaceTireInList],
  )

  const handleCorrectTire = useCallback(
    async (tireId, data) => {
      try {
        setError(null)
        const result = await updateTireDataCorrection(tireId, data)

        if (result?.tire) {
          replaceTireInList(result.tire)
        }

        return result
      } catch (err) {
        console.error("Error corrigiendo cubierta:", err)
        setError("Error al corregir cubierta: " + err.message)
        throw err
      }
    },
    [replaceTireInList],
  )

  const handleUndoHistoryEntry = useCallback(
    async (tireId, historyId, data) => {
      try {
        setError(null)
        const result = await undoHistoryEntry(tireId, historyId, data)

        if (result?.tire) {
          replaceTireInList(result.tire)
        }

        return result
      } catch (err) {
        console.error("Error deshaciendo entrada:", err)
        setError("Error al deshacer entrada: " + err.message)
        throw err
      }
    },
    [replaceTireInList],
  )

  const handleUpdateHistoryEntry = useCallback(
    async (tireId, data, entry) => {
      try {
        setError(null)
        const result = await updateTireHistoryEntry(tireId, data, entry)

        if (result?.tire) {
          replaceTireInList(result.tire)
        }

        return result
      } catch (err) {
        console.error("Error actualizando historial:", err)
        setError("Error al actualizar historial: " + err.message)
        throw err
      }
    },
    [replaceTireInList],
  )

  // ========== FUNCIONES DE CRUD PARA VEHICLES ==========

  const handleCreateVehicle = useCallback(
    async (data) => {
      try {
        setError(null)
        const result = await createVehicle(data)
        await loadVehicles()
        return result
      } catch (err) {
        console.error("Error creando vehículo:", err)
        setError("Error al crear vehículo: " + err.message)
        throw err
      }
    },
    [loadVehicles],
  )

  const handleUpdateVehicle = useCallback(
    async (id, data) => {
      try {
        setError(null)
        const result = await updateVehicle(id, data)
        replaceVehicleInList(result)
        return result
      } catch (err) {
        console.error("Error actualizando vehículo:", err)
        setError("Error al actualizar vehículo: " + err.message)
        throw err
      }
    },
    [replaceVehicleInList],
  )

  // ========== FUNCIONES DE ORDERS ==========

  const handleCheckOrderNumber = useCallback(async (orderNumber) => {
    try {
      setError(null)
      const result = await checkOrderNumber(orderNumber)
      return result
    } catch (err) {
      console.error("Error verificando número de orden:", err)
      setError("Error al verificar número de orden: " + err.message)
      throw err
    }
  }, [])

  // ========== EFECTOS ==========

  // Efecto para carga inicial
  useEffect(() => {
    const initializeData = async () => {
      console.log("🚀 Inicializando datos del contexto...")
      await Promise.all([loadTires(), loadVehicles()])
    }
    initializeData()
  }, [])

  // Efecto para recargar cuando cambia refreshTrigger
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log("🔄 Refrescando datos...")
      loadTires()
    }
  }, [refreshTrigger, loadTires])

  // Efecto para filtrar datos
  useEffect(() => {
    let filtered = [...tires]

    // Filtro por búsqueda
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (tire) =>
          tire.code.toString().includes(q) ||
          Object.values(tire).some((value) => typeof value === "string" && value.toLowerCase().includes(q)) ||
          tire.vehicle?.mobile?.toLowerCase().includes(q),
      )
    }

    // Filtros específicos
    if (filters.status) {
      filtered = filtered.filter((t) => t.status.toLowerCase() === filters.status.toLowerCase())
    }

    if (filters.brand) {
      filtered = filtered.filter((t) => t.brand === filters.brand)
    }

    if (filters.vehicle) {
      if (filters.vehicle.toLowerCase() === "sin asignar") {
        filtered = filtered.filter((t) => !t.vehicle || t.vehicle === "sin asignar")
      } else {
        filtered = filtered.filter((t) => t.vehicle?.mobile === filters.vehicle)
      }
    }

    if (filters.kmFrom) {
      filtered = filtered.filter((t) => t.kilometers >= Number.parseInt(filters.kmFrom))
    }

    if (filters.kmTo) {
      filtered = filtered.filter((t) => t.kilometers <= Number.parseInt(filters.kmTo))
    }

    // Ordenamiento
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case "status":
            return STATE_ORDER.indexOf(a.status) - STATE_ORDER.indexOf(b.status)
          case "codeAsc":
            return a.code - b.code
          case "codeDesc":
            return b.code - a.code
          case "kmAsc":
            return a.kilometers - b.kilometers
          case "kmDesc":
            return b.kilometers - a.kilometers
          default:
            return 0
        }
      })
    }

    setFilteredTireData(filtered)
  }, [searchQuery, filters, tires])

  // Efecto para actualizar datos derivados
  useEffect(() => {
    if (tires.length > 0) {
      setAvailableStatuses(STATE_ORDER.filter((status) => tires.some((t) => t.status === status)))
      setAvailableBrands([...new Set(tires.map((t) => t.brand))])
      setVehiclesWTires([...new Set(tires.map((t) => t.vehicle?.mobile || "Sin asignar"))])
    }
  }, [tires])

  // Valor del contexto memoizado
  const contextValue = useMemo(
    () => ({
      // Datos
      tires,
      vehicles,
      selectedTire,
      selectedVehicle,
      vehiclesWTires,
      availableBrands,
      filteredTireData,
      availableStatuses,
      suggestedCode,
      tireCount,

      // Estados
      error,
      loading,
      selectedLoading,

      // Filtros y búsqueda
      filters,
      searchQuery,
      setFilters,
      setSearchQuery,

      // Funciones de carga
      loadTires,
      loadVehicles,
      loadTireById,
      loadVehicleById,

      // Funciones de CRUD para tires
      handleCreateTire,
      handleUpdateTireStatus,
      handleAssignTire,
      handleUnassignTire,
      handleCorrectTire,
      handleUndoHistoryEntry,
      handleUpdateHistoryEntry,

      // Funciones de CRUD para vehicles
      handleCreateVehicle,
      handleUpdateVehicle,

      // Funciones de orders
      handleCheckOrderNumber,
      getReceiptNumber,

      // Funciones de utilidad
      triggerGlobalRefresh,
      replaceTireInList,
      replaceVehicleInList,
      clearError,

      // Setters (para casos específicos)
      setTires,
      setSelectedTire,
      setSelectedVehicle,
    }),
    [
      tires,
      vehicles,
      selectedTire,
      selectedVehicle,
      vehiclesWTires,
      availableBrands,
      filteredTireData,
      availableStatuses,
      suggestedCode,
      tireCount,
      error,
      loading,
      selectedLoading,
      filters,
      searchQuery,
    ],
  )

  return <ApiContext.Provider value={contextValue}>{children}</ApiContext.Provider>
}

export default ApiContext
