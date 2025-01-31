import React, { createContext, useState, useEffect } from 'react';

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const URL = import.meta.env.VITE_API_URL;
  const [data, setData] = useState(null);
  const [selectedTire, setSelectedTire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLoading, setSelectedLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const tireCount = data?.length || 0;
  const [filters, setFilters] = useState({
    status: "",
    brand: "",
    vehicle: "",
    kmFrom: "",
    kmTo: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${URL}/api/tires`);
      const result = await response.json();
      setData(result);
      setFilteredData(result);
    } catch (err) {
      setError('Error al obtener los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = data;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();

      filtered = filtered.filter((tire) =>
        Object.values(tire).some(value =>
          typeof value === "string" && value.toLowerCase().includes(query)
        ) ||
        (tire.vehicle && tire.vehicle.mobile.toLowerCase().includes(query))
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

    setFilteredData(filtered);
  }, [searchQuery, filters, data]);

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

  const updateTire = async (id, updatedData) => {
    try {
      setLoading(true);
      const response = await fetch(`${URL}/api/tires/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      const result = await response.json();
      return result;
    } catch (err) {
      setError('Error al actualizar los datos de la rueda');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data) {
      setAvailableStatuses([...new Set(data.map(tire => tire.status))]);
      setAvailableBrands([...new Set(data.map(tire => tire.brand))]);
      setAvailableVehicles([...new Set(data.map(tire => tire.vehicle?.mobile || 'Sin asignar'))]);
    }
  }, [data]);


  useEffect(() => {
    fetchData();
  }, []);

  return (
    <ApiContext.Provider
      value={{
        data,
        loading,
        error,
        fetchTireById,
        selectedTire,
        updateTire,
        selectedLoading,
        filteredData,
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        availableBrands,
        availableStatuses,
        availableVehicles,
        tireCount,
      }}>
      {children}
    </ApiContext.Provider>
  );
};

export default ApiContext;
