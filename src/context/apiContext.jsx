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

import { fetchAllVehicles, fetchVehicleById, createVehicle, updateVehicle, updateDetails } from "../api/vehicles"

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
  const [presetVehicleFilter, setPresetVehicleFilter] = useState(null);

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

  const handleUpdateVehicleDetails = useCallback(
    async (id, data) => {
      try {
        setError(null)
        const result = await updateDetails(id, data)
        replaceVehicleInList(result)
        return result
      } catch (err) {
        console.error("Error actualizando datos del vehículo:", err)
        setError("Error al actualizar datos del vehículo: " + err.message)
        throw err
      }
    },
    [replaceVehicleInList]
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
      loadTires()
    }
  }, [refreshTrigger, loadTires])

  // Efecto para filtrar datos
  useEffect(() => {
    let filtered = [...tires];

    const query = searchQuery.toLowerCase();

    const matchesSearch = (tire) =>
      tire.code.toString().includes(query) ||
      Object.values(tire).some((val) => typeof val === "string" && val.toLowerCase().includes(query)) ||
      tire.vehicle?.mobile?.toLowerCase().includes(query);

    const matchesVehicle = (tire) => {
      const v = filters.vehicle?.toLowerCase();
      if (!v) return true;
      if (v === "sin asignar") return !tire.vehicle || tire.vehicle === "sin asignar";
      if (v === "con asignacion") return !!tire.vehicle && tire.vehicle !== "sin asignar";
      return tire.vehicle?.mobile === filters.vehicle;
    };

    const matchesKm = (tire) => {
      const kmFrom = parseInt(filters.kmFrom);
      const kmTo = parseInt(filters.kmTo);
      if (filters.kmFrom && tire.kilometers < kmFrom) return false;
      if (filters.kmTo && tire.kilometers > kmTo) return false;
      return true;
    };

    const matchesStatus = (tire) => {
      if (filters.status) {
        return tire.status.toLowerCase() === filters.status.toLowerCase();
      }
      return true;
    };

    const matchesBrand = (tire) => {
      if (filters.brand) return tire.brand === filters.brand;
      return true;
    };

    const matchesStockRules = (tire) => {
      if (filters.mode === "stock") {
        return (
          (!tire.vehicle || tire.vehicle === "sin asignar") &&
          filters.stockStatuses?.includes(tire.status)
        );
      }
      return true;
    };


    filtered = filtered
      .filter(matchesSearch)
      .filter(matchesStatus)
      .filter(matchesBrand)
      .filter(matchesVehicle)
      .filter(matchesKm)
      .filter(matchesStockRules);

    if (filters.sortBy) {
      const compare = {
        status: (a, b) => STATE_ORDER.indexOf(a.status) - STATE_ORDER.indexOf(b.status),
        codeAsc: (a, b) => a.code - b.code,
        codeDesc: (a, b) => b.code - a.code,
        kmAsc: (a, b) => a.kilometers - b.kilometers,
        kmDesc: (a, b) => b.kilometers - a.kilometers,
      }[filters.sortBy];

      if (compare) filtered.sort(compare);
    }

    setFilteredTireData(filtered);
  }, [searchQuery, filters, tires]);

  // Efecto para actualizar datos derivados
  useEffect(() => {
    if (tires.length > 0) {
      setAvailableStatuses(STATE_ORDER.filter((status) => tires.some((t) => t.status === status)))
      setAvailableBrands([...new Set(tires.map((t) => t.brand))])
      setVehiclesWTires([...new Set(tires.map((t) => t.vehicle?.mobile || "Sin asignar"))])
    }
  }, [tires])

  // Valor del contexto memoizado
  const contextValue = useMemo(() => ({
    // ==========================
    data: {
      tires,
      vehicles,
      selectedTire,
      selectedVehicle,
      vehiclesWTires,
      availableBrands,
      availableStatuses,
      filteredTireData,
      suggestedCode,
      tireCount,
    },

    // ==========================
    ui: {
      error,
      loading,
      selectedLoading,
      filters,
      searchQuery,
      presetVehicleFilter,
      setFilters,
      setSearchQuery,
      setPresetVehicleFilter,
    },

    // ==========================
    tires: {
      load: loadTires,
      create: handleCreateTire,
      updateStatus: handleUpdateTireStatus,
      assign: handleAssignTire,
      unassign: handleUnassignTire,
      correct: handleCorrectTire,
      updateHistory: handleUpdateHistoryEntry,
      undoHistory: handleUndoHistoryEntry,
      loadById: loadTireById,
    },

    // ==========================
    vehicles: {
      load: loadVehicles,
      create: handleCreateVehicle,
      update: handleUpdateVehicle,
      updateData: handleUpdateVehicleDetails,
      loadById: loadVehicleById,
    },

    // ==========================
    orders: {
      checkNumber: handleCheckOrderNumber,
      getNextReceipt: getReceiptNumber,
    },

    // ==========================
    utils: {
      triggerGlobalRefresh,
      replaceTireInList,
      replaceVehicleInList,
      clearError,
      setTires,
      setSelectedTire,
      setSelectedVehicle,
    },

    // ==========================
    state: {
      refreshTrigger,
    }

  }), [
    // Dependencias (las mismas que antes, agrupadas si querés)
    tires, vehicles, selectedTire, selectedVehicle,
    vehiclesWTires, availableBrands, filteredTireData,
    availableStatuses, suggestedCode, tireCount,
    error, loading, selectedLoading, filters, searchQuery
  ])

  return <ApiContext.Provider value={contextValue}>{children}</ApiContext.Provider>
}

export default ApiContext
