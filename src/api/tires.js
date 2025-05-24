const URL = import.meta.env.VITE_API_URL;

// ✅ 1. Obtener todas las cubiertas
export const fetchAllTires = async () => {
  const res = await fetch(`${URL}/api/tires`);
  if (!res.ok) throw new Error("Error al obtener las cubiertas");
  return res.json();
};

// ✅ 2. Obtener cubierta por ID
export const fetchTireById = async (id) => {
  const res = await fetch(`${URL}/api/tires/${id}`);
  if (!res.ok) throw new Error("Error al obtener la cubierta");
  return res.json();
};

// ✅ 3. Crear una nueva cubierta
export const createTire = async (data) => {
  const res = await fetch(`${URL}/api/tires`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok) throw result;
  return result;
};

// ✅ 4. Actualizar estado de una cubierta
export const updateTireStatus = async (tireId, data) => {
  try {
    const res = await fetch(`${URL}/api/tires/${tireId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || "Error al actualizar el estado de la cubierta.");
    }

    return result;
  } catch (error) {
    console.error("Error en updateTireStatus:", error);
    throw error;
  }
};

// ✅ 5. Asignar cubierta a vehículo
export const assignTireToVehicle = async (tireId, data) => {
  try {
    const res = await fetch(`${URL}/api/tires/${tireId}/assign`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || "Error al asignar la cubierta al vehículo.");
    }

    return result;
  } catch (error) {
    console.error("Error en assignTireToVehicle:", error);
    throw error;
  }
};

// ✅ 6. Desasignar cubierta de vehículo
export const unassignTireFromVehicle = async (tireId, data) => {
  try {
    const res = await fetch(`${URL}/api/tires/${tireId}/unassign`, {
      method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || "Error al desasignar la cubierta del vehículo.");
    }

    return result;
  } catch (error) {
    console.error("Error en unassignTireFromVehicle:", error);
    throw error;
  }
};

// ✅ 7. Corregir información de una cubierta
export const updateTireDataCorrection = async (tireId, data) => {
  try {
    const res = await fetch(`${URL}/api/tires/${tireId}/correct`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || "Error al corregir la información de la cubierta.");
    }

    return result;
  } catch (error) {
    console.error("Error en correctTireInfo:", error);
    throw error;
  }
};

// ✅ 8. Obtener el próximo número de recibo
export const getReceiptNumber = async () => {
  try {
    const res = await fetch(`${URL}/api/tires/next-number`);

    const data  = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Error al obtener el número de recibo.");
    }

    return data.receiptNumber;
  } catch (error) {
    console.error("Error en getReceiptNumber:", error);
    throw error;
  }
}
