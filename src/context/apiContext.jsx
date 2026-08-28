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

import { fetchAllVehicles, fetchVehicleById, createVehicle, updateVehicle, updateDetails, updateVehicleAxles } from "../api/vehicles"

import { checkOrderNumber } from "../api/orders"
import { getCompanyCached } from "../api/company"
import { buildStatusMeta, setStatusCatalog } from "../components/Operativa/status"
import { mensajeDeError } from "@utils/apiError"

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

// Orden de estados de la ESCALERA CLÁSICA. Es solo el fallback para el arranque en frío,
// mientras la config del tenant no llegó: los estados son configurables por empresa, así que
// el orden real sale de tenant.stockStatuses (ver `stateOrder` abajo). Un tenant que renombre
// sus estados quedaba fuera de esta lista y perdía el filtro por estado entero.
const STATE_ORDER_FALLBACK = ["Nueva", "1er Recapado", "2do Recapado", "3er Recapado", "A recapar", "Descartada"]

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
  // Estados de cubierta configurables del tenant [{name,role}] — fuente para /op.
  const [statuses, setStatuses] = useState([])
  // Orden de estados del TENANT. Cae al clásico solo si la config todavía no llegó.
  const stateOrder = useMemo(
    () => (statuses.length ? statuses.map((st) => st.name) : STATE_ORDER_FALLBACK),
    [statuses],
  )
  const [plateSep, setPlateSep] = useState("") // separador de patente configurable (solo display)
  // Formatos de patente ACEPTADOS por el tenant (t138). Máscaras con A/0; lista vacía = no
  // validar. El backend es la autoridad; esto es para frenar el error de tipeo antes del viaje.
  const [plateFormats, setPlateFormats] = useState([])
  const [tireCodePrefix, setTireCodePrefix] = useState("") // prefijo del código interno (solo display)

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
      setError(mensajeDeError(err, "Error al obtener las cubiertas"))
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
      setError(mensajeDeError(err, "Error al obtener vehículos"))
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
        setError(mensajeDeError(err, "Error al obtener la cubierta"))
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
      setError(mensajeDeError(err, "Error al obtener el vehículo"))
      throw err
    } finally {
      setSelectedLoading(false)
    }
  }, [])

  // ========== FUNCIONES DE CRUD PARA TIRES ==========

  const handleCreateTire = useCallback(
    async (data) => {
      try {
        setError(null)
        const result = await createTire(data)
        triggerGlobalRefresh()
        return result
      } catch (err) {
        console.error("❌ Contexto: Error creando cubierta:", err)
        setError(mensajeDeError(err, "Error al crear cubierta"))
        throw err
      }
    },
    [triggerGlobalRefresh],
  )

  const handleUpdateTireStatus = useCallback(
    async (tireId, data) => {
      try {
        setError(null)
        const result = await updateTireStatus(tireId, data)

        if (result?.tire) {
          replaceTireInList(result.tire)
        }

        return result
      } catch (err) {
        console.error("❌ Contexto: Error actualizando estado:", err)
        setError(mensajeDeError(err, "Error al actualizar estado"))
        throw err
      }
    },
    [replaceTireInList],
  )

  const handleAssignTire = useCallback(
    async (tireId, data) => {
      try {
        setError(null)
        const result = await assignTireToVehicle(tireId, data)

        if (result?.tire) {
          replaceTireInList(result.tire)
        }

        return result
      } catch (err) {
        console.error("❌ Contexto: Error asignando cubierta:", err)
        setError(mensajeDeError(err, "Error al asignar cubierta"))
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
        setError(mensajeDeError(err, "Error al desasignar cubierta"))
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
        setError(mensajeDeError(err, "Error al corregir cubierta"))
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
        setError(mensajeDeError(err, "Error al deshacer entrada"))
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
        setError(mensajeDeError(err, "Error al actualizar historial"))
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
        setError(mensajeDeError(err, "Error al crear vehículo"))
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
        setError(mensajeDeError(err, "Error al actualizar vehículo"))
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
        setError(mensajeDeError(err, "Error al actualizar datos del vehículo"))
        throw err
      }
    },
    [replaceVehicleInList]
  )

  const handleUpdateVehicleAxles = useCallback(
    async (id, data) => {
      try {
        setError(null)
        const result = await updateVehicleAxles(id, data)
        await loadVehicles()
        return result
      } catch (err) {
        console.error("Error configurando ejes del vehículo:", err)
        setError(mensajeDeError(err, "Error al configurar ejes"))
        throw err
      }
    },
    [loadVehicles]
  )

  // ========== FUNCIONES DE ORDERS ==========

  const handleCheckOrderNumber = useCallback(async (orderNumber) => {
    try {
      setError(null)
      const result = await checkOrderNumber(orderNumber)
      return result
    } catch (err) {
      console.error("Error verificando número de orden:", err)
      setError(mensajeDeError(err, "Error al verificar número de orden"))
      throw err
    }
  }, [])

  // ========== EFECTOS ==========

  // Efecto para carga inicial
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([loadTires(), loadVehicles()])
    }
    initializeData()
  }, [])

  // Cargar los estados configurables del tenant y setear el catálogo (colores/roles) para /op.
  // Reintenta si llega vacío: sin catálogo, /op resuelve todos los roles al fallback y los
  // conteos por rol (ej. "A recapar") quedan en 0. Combinado con getCompanyCached, que ya no
  // cachea fallos, un miss transitorio en el arranque frío se autocorrige.
  useEffect(() => {
    let cancelled = false
    const loadStatuses = (attempt = 0) => {
      getCompanyCached()
        .then((c) => {
          if (cancelled) return
          setPlateSep(c?.plateSeparator || "") // separador de patente configurable (solo display)
          setPlateFormats(Array.isArray(c?.plateFormats) ? c.plateFormats : [])
          setTireCodePrefix(c?.tireCodePrefix || "") // prefijo del código interno (solo display)
          const st = Array.isArray(c?.stockStatuses) ? c.stockStatuses : []
          if (!st.length && attempt < 3) {
            setTimeout(() => loadStatuses(attempt + 1), 400 * (attempt + 1))
            return
          }
          setStatuses(st)
          setStatusCatalog(buildStatusMeta(st))
        })
        .catch(() => {})
    }
    loadStatuses()
    return () => { cancelled = true }
  }, [])

  // Efecto para recargar cuando cambia refreshTrigger.
  // Recarga cubiertas Y vehículos: asignar o desasignar cambia los dos lados, y antes esto
  // solo traía cubiertas. El listado de vehículos se refrescaba porque VehicleList tenía su
  // PROPIO efecto sobre refreshTrigger — o sea que el refresco global dependía de que esa
  // pantalla estuviera montada.
  useEffect(() => {
    if (refreshTrigger > 0) {
      loadTires()
      loadVehicles()
    }
  }, [refreshTrigger, loadTires, loadVehicles])

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
      const kmFrom = Number(filters.kmFrom);
      const kmTo = Number(filters.kmTo);
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
        // Un estado que no está en la config va al FINAL: con indexOf crudo, el -1 lo mandaba
        // al principio, así que los estados desconocidos encabezaban la lista.
        status: (a, b) => {
          const pos = (st) => { const i = stateOrder.indexOf(st); return i === -1 ? Number.MAX_SAFE_INTEGER : i }
          return pos(a.status) - pos(b.status)
        },
        codeAsc: (a, b) => a.code - b.code,
        codeDesc: (a, b) => b.code - a.code,
        kmAsc: (a, b) => a.kilometers - b.kilometers,
        kmDesc: (a, b) => b.kilometers - a.kilometers,
      }[filters.sortBy];

      if (compare) filtered.sort(compare);
    }

    setFilteredTireData(filtered);
  }, [searchQuery, filters, tires, stateOrder]);

  // Efecto para actualizar datos derivados
  useEffect(() => {
    // Sin el guard `tires.length > 0`: al vaciarse la lista, los derivados quedaban con los
    // valores anteriores y los dropdowns seguían ofreciendo marcas y estados inexistentes.
    const presentes = [...new Set(tires.map((t) => t.status))]
    // Primero los configurados por el tenant, en SU orden; después los huérfanos (estados que
    // todavía viven en alguna cubierta pero ya no están en la config), para no esconderlos.
    setAvailableStatuses([
      ...stateOrder.filter((st) => presentes.includes(st)),
      ...presentes.filter((st) => !stateOrder.includes(st)),
    ])
    setAvailableBrands([...new Set(tires.map((t) => t.brand))])
    setVehiclesWTires([...new Set(tires.map((t) => t.vehicle?.mobile || "Sin asignar"))])
  }, [tires, stateOrder])

  // Estados configurables derivados (para /op): catálogo + roles + escalera + orden.
  const statusHelpers = useMemo(() => {
    const byRole = (role) => statuses.find((s) => s.role === role)?.name
    return {
      statuses,
      plateSep,
      plateFormats,
      tireCodePrefix,
      statusMeta: buildStatusMeta(statuses),
      initialStatus: byRole("initial"),
      discardStatus: byRole("discard"),
      recapStatus: byRole("recap"),
      stockScale: statuses.filter((s) => s.role === "initial" || s.role === "stock").map((s) => s.name),
      stateOrder,
    }
  }, [statuses, stateOrder, plateSep, plateFormats, tireCodePrefix])

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
      ...statusHelpers,
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
      updateAxles: handleUpdateVehicleAxles,
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
    tires, vehicles, selectedTire, selectedVehicle,
    vehiclesWTires, availableBrands, filteredTireData,
    availableStatuses, suggestedCode, tireCount, statusHelpers,
    error, loading, selectedLoading, filters, searchQuery,
    // Faltaban, y se exponen en el contexto: los consumidores los usan como dep de sus
    // efectos de recarga. El refresco global funcionaba POR ACCIDENTE (el memo se recalculaba
    // porque `tires` cambiaba después); si loadTires fallaba, el trigger nunca llegaba.
    refreshTrigger, presetVehicleFilter,
  ])

  return <ApiContext.Provider value={contextValue}>{children}</ApiContext.Provider>
}

export default ApiContext
