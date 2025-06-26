import { useContext, useEffect, useState } from "react";
import ApiContext from "@context/apiContext";
import { colors, text, button } from "@utils/tokens";
import VehicleCard from "./VehicleCard";
import NewVehicle from "@components/New/NewVehicle";
import EmptyState from "@components/TireList/EmptyState";
import LoadingGrid from "@components/TireList/LoadingGrid";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";

const VehicleList = ({ setActive }) => {
  const { data, ui, vehicles, state } = useContext(ApiContext);
  const [isNewVehicleOpen, setIsNewVehicleOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState(null)

  useEffect(() => {
    vehicles.load();
  }, [state.refreshTrigger]);

  const handleNewVehicle = () => setIsNewVehicleOpen(true);
  const handleVehicleFilter = (vehicle) => {
    ui.setPresetVehicleFilter(vehicle.mobile)
    setActive("tires")
  }

  const handleCloseModal = () => {
    setIsNewVehicleOpen(false)
    setVehicleToEdit(null)
  }

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

      {(isNewVehicleOpen || vehicleToEdit) && (
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
