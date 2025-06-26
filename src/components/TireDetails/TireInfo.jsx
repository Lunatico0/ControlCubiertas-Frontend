import { statusStyles } from "@utils/statusStyle";
import { colors, text } from "@utils/tokens";
import InfoItem from "@components/UI/InfoItem";

// Componente visual del estado (imagen y estado)
export const TireInfoVisual = ({ tire }) => (
  <div className={`${statusStyles[tire.status] || "bg-gray-100 dark:bg-gray-800"} flex flex-col items-center justify-center p-6 rounded-xl shadow-sm h-full`}>
    <div className="size-32 mb-4 flex items-center justify-center">
      <img
        src="/Cubierta.png"
        alt="Cubierta"
        className="size-28 object-contain"
      />
    </div>
    <p className="text-xl font-bold uppercase tracking-wide">{tire.status}</p>
    <p className="text-sm opacity-75 mt-1">Estado actual</p>
  </div>
);

// Tarjetas con la información detallada
export const TireInfoData = ({ tire }) => {
  const altaEntry = tire.history?.find(h => h.type === "Alta");
  const currentVehicle = tire.vehicle;
  const totalKm = tire.kilometers || 0;
  const totalAssignments = tire.history?.filter(h => h.type === "Asignación").length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Identificación */}
      <div
        className="px-4 py-2 flex flex-col gap-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      >
        <h4 className={`${text.heading} text-base font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 mb-2`}>
          Identificación
        </h4>
        <InfoItem label="Código interno" value={tire.code} />
        <InfoItem label="Número de serie" value={tire.serialNumber} />
        <InfoItem label="Marca" value={tire.brand} />
        <InfoItem label="Rodado" value={tire.size} />
        <InfoItem label="Dibujo" value={tire.pattern} />
      </div>

      {/* Estado actual */}
      <div className="px-4 py-2 flex flex-col gap-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h4 className={`${text.heading} text-base font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 mb-2`}>
          Estado actual
        </h4>
        <InfoItem
          label="Vehículo actual"
          value={currentVehicle ? `${currentVehicle.mobile} (${currentVehicle.licensePlate})` : "Sin asignar"}
          className={`${currentVehicle ? "text-green-600 dark:text-green-400" : "text-gray-500"}`}
        />
        <InfoItem
          label="Fecha de alta"
          value={altaEntry ? new Date(altaEntry.date).toLocaleDateString("es-AR") : "No registrada"}
        />
      </div>

      {/* Estadísticas */}
      <div className="px-4 py-2 flex flex-col gap-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h4 className={`${text.heading} text-base font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 mb-2`}>
          Estadísticas
        </h4>
        <InfoItem label="Kilómetros totales" value={`${totalKm.toLocaleString()} km`} />
        <InfoItem label="Total asignaciones" value={totalAssignments} />
        {tire.history?.length > 0 && (
          <InfoItem
            label="Última actividad"
            value={new Date(tire.history.at(-1)?.date).toLocaleDateString("es-AR")}
          />
        )}
      </div>
    </div>
  );
};
