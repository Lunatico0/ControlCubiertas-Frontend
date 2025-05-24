const URL = import.meta.env.VITE_API_URL;

// ✅ 1. Obtener todos los vehículos
export const fetchAllVehicles = async () => {
  try {
    const res = await fetch(`${URL}/api/vehicles`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al obtener vehículos");
    return data;
  } catch (error) {
    throw new Error(`Error al obtener vehículos: ${error.message}`);
  }
};

// ✅ 2. Obtener vehículo por ID
export const fetchVehicleById = async (id) => {
  try {
    const res = await fetch(`${URL}/api/vehicles/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al obtener el vehículo");
    return data;
  } catch (error) {
    throw new Error(`Error al obtener el vehículo: ${error.message}`);
  }
};

// ✅ 3. Crear un nuevo vehículo
export const createVehicle = async (vehicleData) => {
  try {
    const res = await fetch(`${URL}/api/vehicles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vehicleData),
    });
    const data = await res.json();

    if (!res.ok) {
      // Para manejar error específico de conflicto de cubiertas
      const errorMsg =
        data?.message || "Error desconocido al crear el vehículo.";
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    throw new Error(`Error al crear vehículo: ${error.message}`);
  }
};

// ✅ 4. Actualizar un vehículo existente
export const updateVehicle = async (id, vehicleData) => {
  try {
    const res = await fetch(`${URL}/api/vehicles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vehicleData),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMsg =
        data?.message || "Error desconocido al actualizar el vehículo.";
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    throw new Error(`Error al actualizar vehículo: ${error.message}`);
  }
};
