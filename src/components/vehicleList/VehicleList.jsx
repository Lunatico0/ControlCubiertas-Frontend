import { useContext, useState } from "react";
import ApiContext from "@context/apiContext";
import { colors, text } from "@utils/legacyTokens";
import VehicleCard from "./VehicleCard";
import NewVehicle from "@components/New/NewVehicle";
import EmptyState from "@components/TireList/EmptyState";
import LoadingGrid from "@components/TireList/LoadingGrid";

const VehicleList = ({ setActive }) => {
  const { data, ui} = useContext(ApiContext);
  const [vehicleToEdit, setVehicleToEdit] = useState(null)

  // Sin efecto de carga propio: el ApiProvider ya carga al montar y recarga con
  // refreshTrigger. Tenerlo acá disparaba DOS peticiones concurrentes, con carrera entre
  // respuestas (ganaba la última en llegar, no la más nueva).

  const handleVehicleFilter = (vehicle) => {
    ui.setPresetVehicleFilter(vehicle.mobile)
    setActive("tires")
  }

  const handleCloseModal = () => setVehicleToEdit(null)

  const handleEditVehicle = (id) => {
    const vehicle = data.vehicles.find((v) => v._id === id)
    if (vehicle) setVehicleToEdit(vehicle)
  }

  if (ui.loading) return <LoadingGrid />;
  if (data.vehicleCount === 0) return <EmptyState message="No hay vehículos cargados." />;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col items-center justify-center mb-6">
        <h1 className={`${text.heading} text-2xl font-semibold`}>Listado de Vehículos</h1>
        <p className={`${colors.muted} text-sm`}>
          {data.vehicles.length} vehículo(s) en total
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle._id}
            vehicle={vehicle}
            onEdit={handleEditVehicle}
            onClick={() => handleVehicleFilter(vehicle)}
          />
        ))}
      </div>

      {vehicleToEdit && (
        <NewVehicle
          onClose={handleCloseModal}
          onSuccess={handleCloseModal}
          vehicleToEdit={vehicleToEdit}
        />
      )}
    </div>
  );
};

export default VehicleList;
