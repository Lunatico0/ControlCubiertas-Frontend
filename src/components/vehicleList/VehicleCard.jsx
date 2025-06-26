import { colors, text, button } from "@utils/tokens";
import DirectionsBusFilledRoundedIcon from "@mui/icons-material/DirectionsBusFilledRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";

const VehicleCard = ({ vehicle, onClick = () => { }, onEdit = () => { }, isLoading = false }) => {
  const tireCount = vehicle.tires?.length || 0;

  return (
    <div
      className={`
        relative group transition-all duration-300 transform hover:scale-[1.015]
        ${colors.surface} ${colors.border} ${colors.shadow}
        rounded-xl overflow-hidden cursor-pointer flex flex-col h-full
        ${isLoading ? "opacity-50 pointer-events-none" : ""}
      `}
      onClick={() => onClick(vehicle._id)}
      tabIndex="0"
    >
      {/* Botón de editar */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit(vehicle._id);
        }}
        disabled={isLoading}
        className={`
          absolute top-3 right-3 z-20 ${button.primary}
          text-white rounded-lg transition-transform transform hover:scale-105
          opacity-0 group-hover:opacity-100
        `}
        title="Editar vehículo"
      >
        <EditNoteRoundedIcon />
      </button>

      {/* Cabecera visual */}
      <div
        className={`relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-700`
        }
      >
        <div className="absolute inset-0 z-0 group-hover:bg-black/10 transition-all duration-300">
          <img
            src="Camion.png"
            alt="Camion"
            className={`w-full h-full object-contain transition-transform duration-300 group-hover:scale-110`
            }
          />
        </div>
      </div>

      {/* Cuerpo de la tarjeta */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className={`${text.heading} text-lg font-bold`}>{vehicle.mobile}</h3>
            <span className={`${colors.muted} text-sm`}>{vehicle.licensePlate}</span>
          </div>

          <div className={`${vehicle.type && 'flex'} items-center justify-between`}>
            <p className={`${colors.muted} text-sm`}>{vehicle.brand}</p>
            <p className={`${colors.muted} text-sm`}>{vehicle.type}</p>
          </div>
        </div>

        {/* Estado */}
        {/* {tireCount === 0 ? (
          <div className="mt-3 text-xs text-orange-600 dark:text-orange-400 font-medium">
            ¡Este vehículo no tiene cubiertas asignadas!
          </div>
        ) : (
          <p className="text-sm text-gray-700 dark:text-gray-200">
            {tireCount > 0 && `${tireCount} cubierta(s) asignada(s)`}
          </p>
        )} */}

        <p className={`${tireCount < 1 ? 'mt-3 text-xs text-orange-600 dark:text-orange-400 font-medium'
          :
          'text-sm text-gray-700 dark:text-gray-200'}`}>
          {
            tireCount == 0 ?
              '¡Este vehículo no tiene cubiertas asignadas!'
              :
              `${tireCount} cubierta(s) asignada(s)`
          }
        </p>

      </div>
    </div>
  );
};

export default VehicleCard;
