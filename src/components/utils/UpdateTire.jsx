import React, { useState, useEffect, useContext } from 'react';
import apiContext from '../../context/apiContext.jsx';

const UpdateTire = ({ id, setIsUpdateTireModalOpen }) => {
  const { updateTire, fetchTireById, selectedTire, availableVehicles } = useContext(apiContext);

  const [formData, setFormData] = useState({
    brand: '',
    size: '',
    pattern: '',
    status: '',
    kilometers: '',
    vehicle: '',
  });

  useEffect(() => {
    const loadTireData = async () => {
      try {
        await fetchTireById(id);
        setFormData({
          brand: selectedTire?.brand || '',
          size: selectedTire?.size || '',
          pattern: selectedTire?.pattern || '',
          status: selectedTire?.status || '',
          kilometers: selectedTire?.kilometers || '',
          vehicle: selectedTire?.vehicle?._id || '',
        });
      } catch (error) {
        console.error("Error cargando los datos de la cubierta:", error);
      }
    };

    if (id) loadTireData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedData = {
      ...formData,
      vehicle: formData.vehicle === "Sin asignar" ? null : formData.vehicle,
    };
    try {
      console.log(formData)
      console.log("Datos enviados:", updatedData);
      await updateTire(id, updatedData);
      setIsUpdateTireModalOpen(false);
    } catch (error) {
      console.error("Error al actualizar la cubierta:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 w-full h-full"
      onClick={() => setIsUpdateTireModalOpen(false)}
    >
      <div
        className="bg-gray-200 text-black dark:bg-gray-900 dark:text-white w-1/2 max-w-screen-sm p-6 rounded-xl shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-1 right-2">
          <button onClick={() => setIsUpdateTireModalOpen(false)} className="text-gray-500 hover:text-gray-700">
            ✖
          </button>
        </div>

        <h2 className="text-xl font-bold mb-4 text-center">Editar cubierta</h2>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col space-y-4"
        >
          <input
            className="p-2 border rounded w-full"
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="Marca"
            required
          />

          <input
            className="p-2 border rounded w-full"
            type="text"
            name="size"
            value={formData.size}
            onChange={handleChange}
            placeholder="Medidas"
            required
          />

          <input
            className="p-2 border rounded w-full"
            type="text"
            name="pattern"
            value={formData.pattern}
            onChange={handleChange}
            placeholder="Dibujo"
            required
          />

          <select
            name="status"
            className="rounded bg-gray-300 text-black flex-grow p-2"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Nueva">Nueva</option>
            <option value="1er Recapado">1er Recapado</option>
            <option value="2do Recapado">2do Recapado</option>
            <option value="3er Recapado">3er Recapado</option>
            <option value="Descartada">Descartada</option>
          </select>

          <input
            className="p-2 border rounded w-full"
            type="number"
            name="kilometers"
            value={formData.kilometers}
            onChange={handleChange}
            placeholder="Kilómetros"
          />

          <select
            className="rounded bg-gray-300 text-black flex-grow p-2"
            name="vehicle"
            value={formData.vehicle}
            onChange={handleChange}
          >
            <option value="Sin asignar">Sin asignar</option>
            {availableVehicles.map((vehicle) => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.mobile !== 'Sin asignar' ? `${vehicle.mobile} Patente: ${vehicle.licensePlate}` : vehicle.mobile}
              </option>
            ))}
          </select>

          <button type="submit" className="bg-green-500 text-white py-2 rounded">Actualizar</button>
        </form>
      </div>
    </div>
  );
};

export default UpdateTire;
