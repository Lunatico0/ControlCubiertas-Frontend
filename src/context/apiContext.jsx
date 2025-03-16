import React, { createContext, useState, useEffect } from 'react';

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const URL = import.meta.env.VITE_API_URL;
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTireData, setFilteredTireData] = useState([]);
  const [selectedTire, setSelectedTire] = useState(null);
  const [suggestedCode, setSuggestedCode] = useState("");
  const [availableBrands, setAvailableBrands] = useState([]);
  const [selectedLoading, setSelectedLoading] = useState(true);
  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [vehiclesWTires, setVehiclesWTires] = useState([]);
  const [updateTrigger, setUpdateTrigger] = useState(false);
  const tireCount = data?.length || 0;
  const stateOrder = ["Nueva", "1er Recapado", "2do Recapado", "3er Recapado", "Descartada"];
  const [filters, setFilters] = useState({
    status: "",
    brand: "",
    vehicle: "",
    kmFrom: "",
    kmTo: "",
    sortBy: "",
  });

  const suggestCode = (data) => {
    let currentCode = 0;
    data.forEach(tire => {
      currentCode <= tire.code && (currentCode = tire.code)
    });
    setSuggestedCode(prev => currentCode++);
  }

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${URL}/api/tires`);
      const result = await response.json();
      suggestCode(result)
      setData(result);
      setFilteredTireData(result);
    } catch (err) {
      setError('Error al obtener los datos');
    } finally {
      setLoading(false);
    }
  };

  const fetchNewVehicle = async (data) => {
    try {
      const response = await fetch(`${URL}/api/vehicles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw result;
      }

      return result;
    } catch (error) {
      console.error("Error en fetchNewVehicle:", error);
      throw error;
    }
  };

  const fetchNewTire = async (data) => {
    try {
      const response = await fetch(`${URL}/api/tires`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.message && result.message.includes("E11000 duplicate key error")) {
          const match = result.message.match(/dup key: { code: (\d+) }/);
          const duplicatedCode = match ? match[1] : "desconocido";
          throw new Error(`Error de código duplicado: el código ${duplicatedCode} ya existe.`);
        }

        throw new Error(result.message || "Error desconocido al guardar la cubierta.");
      }

      setUpdateTrigger(prev => !prev);
      return result;
    } catch (error) {
      console.error("Error en fetchNewTire:", error);
      throw error;
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${URL}/api/vehicles`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error("Error al obtener los vehículos");
      }

      setAvailableVehicles(result);
    } catch (error) {
      console.error("Error en fetchVehicles:", error);
    }
  };

  const fetchTireById = async (id) => {
    try {
      setSelectedLoading(true);
      const response = await fetch(`${URL}/api/tires/${id}`);
      const result = await response.json();
      setSelectedTire(result);
    } catch (err) {
      setError('Error al obtener los datos de la rueda');
    } finally {
      setSelectedLoading(false);
    }
  };

  const updateTire = async (id, data) => {
    const formattedData = {
      ...data,
      vehicle: data.vehicle ? { _id: data.vehicle } : null,
    };
    try {
      const response = await fetch(`${URL}/api/tires/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.message && result.message.includes("E11000 duplicate key error")) {
          const match = result.message.match(/dup key: { code: (\d+) }/);
          const duplicatedCode = match ? match[1] : "desconocido";
          throw new Error(`Error de código duplicado: el código ${duplicatedCode} ya existe.`);
        }

        throw new Error(result.message || "Error desconocido al actualizar la cubierta.");
      }

      setUpdateTrigger(prev => !prev);
      return result;
    } catch (error) {
      console.error("Error en updateTire:", error);
      throw error;
    }
  };

  useEffect(() => {
    let filtered = data;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((tire) =>
        tire.code.toString().includes(query) ||
        Object.values(tire).some(value =>
          typeof value === "string" ? value.toLowerCase().includes(query) : false
        ) || (tire.vehicle && tire.vehicle?.mobile.toLowerCase().includes(query))
      );
    }

    if (filters.status) {
      filtered = filtered.filter((tire) => tire.status.toLowerCase() === filters.status.toLowerCase());
    }

    if (filters.brand) {
      filtered = filtered.filter((tire) => tire.brand === filters.brand);
    }

    if (filters.vehicle) {
      if (filters.vehicle.toLowerCase() === "sin asignar") {
        filtered = filtered.filter(
          (tire) => tire.vehicle === null || tire.vehicle === "sin asignar"
        );
      } else {
        filtered = filtered.filter((tire) => tire.vehicle?.mobile === filters.vehicle);
      }
    }

    if (filters.kmFrom) {
      filtered = filtered.filter((tire) => tire.kilometers >= parseInt(filters.kmFrom));
    }

    if (filters.kmTo) {
      filtered = filtered.filter((tire) => tire.kilometers <= parseInt(filters.kmTo));
    }

    if (filters.sortBy) {
      filtered = [...filtered].sort((a, b) => {
        switch (filters.sortBy) {
          case "status":
            return stateOrder.indexOf(a.status) - stateOrder.indexOf(b.status);
          case "codeAsc":
            return a.code - b.code;
          case "codeDesc":
            return b.code - a.code;
          case "kmAsc":
            return a.kilometers - b.kilometers;
          case "kmDesc":
            return b.kilometers - a.kilometers;
          default:
            return 0;
        }
      });
    }

    setFilteredTireData(filtered);
  }, [searchQuery, filters, data]);


  useEffect(() => {
    if (data) {
      setAvailableStatuses(
        stateOrder.filter(status => data.some(tire => tire.status === status))
      );
      setAvailableBrands([...new Set(data.map(tire => tire.brand))]);
      setVehiclesWTires([...new Set(data.map(tire => tire.vehicle?.mobile || 'Sin asignar'))]);
    }
  }, [data]);

  useEffect(() => {
    fetchVehicles();
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [updateTrigger]);

  return (
    <ApiContext.Provider
      value={{
        data,
        loading,
        error,
        selectedTire,
        selectedLoading,
        filteredTireData,
        searchQuery,
        filters,
        availableBrands,
        availableStatuses,
        availableVehicles,
        tireCount,
        suggestedCode,
        vehiclesWTires,
        setVehiclesWTires,
        fetchTireById,
        updateTire,
        setSearchQuery,
        setFilters,
        fetchNewVehicle,
        fetchNewTire,
        fetchVehicles
      }}>
      {children}
    </ApiContext.Provider>
  );
};

export default ApiContext;
