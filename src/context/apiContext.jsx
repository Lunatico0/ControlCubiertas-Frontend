import React, { createContext, useState, useEffect } from 'react';

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
  const [data, setData] = useState(null); // Datos generales
  const [selectedTire, setSelectedTire] = useState(null); // Detalles de una rueda
  const [loading, setLoading] = useState(true);
  const [selectedLoading, setSelectedLoading] = useState(true);
  const [error, setError] = useState(null);
  const URL = import.meta.env.VITE_API_URL;

  // Fetch general (traer todas las ruedas)
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${URL}/api/tires`);
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError('Error al obtener los datos');
    } finally {
      setLoading(false);
    }
  };

  // Fetch para traer una rueda específica por ID
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

  // POST para guardar o actualizar una rueda
  const updateTire = async (id, updatedData) => {
    try {
      setLoading(true);
      const response = await fetch(`${URL}/api/tires/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      const result = await response.json();
      // Opcional: actualiza el estado con el resultado
      return result;
    } catch (err) {
      setError('Error al actualizar los datos de la rueda');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Carga inicial de datos
  }, []);

  return (
    <ApiContext.Provider value={{ data, loading, error, fetchTireById, selectedTire, updateTire, selectedLoading }}>
      {children}
    </ApiContext.Provider>
  );
};

export default ApiContext;
