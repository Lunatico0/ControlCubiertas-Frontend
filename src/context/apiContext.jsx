import React, { createContext, useState, useEffect } from 'react';
import { getSuggestedCode } from "../utils/suggestedCode";

import {
  fetchAllTires,
  fetchTireById,
  createTire,
  updateTireStatus,
  assignTireToVehicle,
  unassignTireFromVehicle,
  updateTireDataCorrection,
  getReceiptNumber
} from "../api/tires";

import {
  fetchAllVehicles,
  fetchVehicleById,
  createVehicle,
  updateVehicle
} from "../api/vehicles";

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const [tires, setTires] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [filteredTireData, setFilteredTireData] = useState([]);
  const [selectedTire, setSelectedTire] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLoading, setSelectedLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    brand: "",
    vehicle: "",
    kmFrom: "",
    kmTo: "",
    sortBy: "",
  });

  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [vehiclesWTires, setVehiclesWTires] = useState([]);
  const [suggestedCode, setSuggestedCode] = useState("");
  const [updateTrigger, setUpdateTrigger] = useState(false);

  const tireCount = tires?.length || 0;
  const stateOrder = ['Nueva', '1er Recapado', '2do Recapado', '3er Recapado', 'A recapar', 'Descartada'];

  const triggerGlobalRefresh = () => {
    setRefreshFlag(prev => !prev); // cambia de true <-> false para que los useEffect reaccionen
  };

  const replaceTireInList = (updatedTire) => {
    setTires(prev =>
      prev.map(t => t._id === updatedTire._id ? updatedTire : t)
    );
  };

  const loadTires = async () => {
    try {
      setLoading(true);
      const result = await fetchAllTires();
      setTires(result);
      setFilteredTireData(result);
      setSuggestedCode(getSuggestedCode(result));
    } catch (err) {
      setError('Error al obtener las cubiertas');
    } finally {
      setLoading(false);
    }
  };

  const loadVehicles = async () => {
    try {
      const result = await fetchAllVehicles();
      setVehicles(result);
    } catch (err) {
      console.error("Error al obtener vehículos:", err);
    }
  };

  const loadTireById = async (id) => {
    try {
      setSelectedLoading(true);
      const result = await fetchTireById(id);
      setSelectedTire(result);
    } catch {
      setError("Error al obtener la cubierta");
    } finally {
      setSelectedLoading(false);
    }
  };

  const handleCreateTire = async (data) => {
    const result = await createTire(data);
    setUpdateTrigger(prev => !prev);
    return result;
  };

  const handleCreateVehicle = async (data) => {
    const result = await createVehicle(data);
    await loadVehicles();
    return result;
  };

  useEffect(() => {
    let filtered = [...tires];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((tire) =>
        tire.code.toString().includes(q) ||
        Object.values(tire).some(value =>
          typeof value === "string" && value.toLowerCase().includes(q)
        ) || (tire.vehicle?.mobile?.toLowerCase().includes(q))
      );
    }

    if (filters.status) {
      filtered = filtered.filter(t => t.status.toLowerCase() === filters.status.toLowerCase());
    }

    if (filters.brand) {
      filtered = filtered.filter(t => t.brand === filters.brand);
    }

    if (filters.vehicle) {
      if (filters.vehicle.toLowerCase() === "sin asignar") {
        filtered = filtered.filter(t => !t.vehicle || t.vehicle === "sin asignar");
      } else {
        filtered = filtered.filter(t => t.vehicle?.mobile === filters.vehicle);
      }
    }

    if (filters.kmFrom) {
      filtered = filtered.filter(t => t.kilometers >= parseInt(filters.kmFrom));
    }

    if (filters.kmTo) {
      filtered = filtered.filter(t => t.kilometers <= parseInt(filters.kmTo));
    }

    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case "status": return stateOrder.indexOf(a.status) - stateOrder.indexOf(b.status);
          case "codeAsc": return a.code - b.code;
          case "codeDesc": return b.code - a.code;
          case "kmAsc": return a.kilometers - b.kilometers;
          case "kmDesc": return b.kilometers - a.kilometers;
          default: return 0;
        }
      });
    }

    setFilteredTireData(filtered);
  }, [searchQuery, filters, tires]);

  useEffect(() => {
    if (tires.length) {
      setAvailableStatuses(
        stateOrder.filter(status => tires.some(t => t.status === status))
      );
      setAvailableBrands([...new Set(tires.map(t => t.brand))]);
      setVehiclesWTires([...new Set(tires.map(t => t.vehicle?.mobile || 'Sin asignar'))]);
    }
  }, [tires]);

  useEffect(() => {
    loadVehicles();
    loadTires();
  }, []);

  useEffect(() => {
    loadTires();
  }, [updateTrigger]);

  return (
    <ApiContext.Provider
      value={{
        // Datos
        tires,
        vehicles,
        selectedTire,
        vehiclesWTires,
        availableBrands,
        filteredTireData,
        availableStatuses,

        // Estados
        error,
        loading,
        tireCount,
        refreshFlag,
        suggestedCode,
        selectedLoading,

        // Acciones
        loadTires,
        loadVehicles,
        loadTireById,
        updateVehicle,
        handleCreateTire,
        updateTireStatus,
        getReceiptNumber,
        fetchVehicleById,
        replaceTireInList,
        handleCreateVehicle,
        assignTireToVehicle,
        triggerGlobalRefresh,
        unassignTireFromVehicle,
        updateTireDataCorrection,

        // UI
        setTires,
        setFilters,
        setSearchQuery,
        filters,
        searchQuery,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export default ApiContext;
