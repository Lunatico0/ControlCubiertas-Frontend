import { useContext } from "react";
import ApiContext from "@context/apiContext";
import { statusStyles } from "@utils/statusStyle";
import { formatTireCode } from "@utils/tireCode";
import QuickActions from "@components/actions/QuickActions";

const SidebarInfoItem = ({ label, value, className = "" }) => (
  <div className="flex justify-between">
    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    <p className={`font-semibold text-sm ${className}`}>{value || "-"}</p>
  </div>
);

const TireStatusSidebar = ({ tire, refreshTire }) => {
  const { data } = useContext(ApiContext);
  const tireCodePrefix = data?.tireCodePrefix || "";

  return (
  <div className="w-full lg:w-80 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 flex flex-col">
    {/* Estado y datos clave */}
    <div className="p-6 pt-8 flex-1 space-y-6">
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${statusStyles[tire.status] || "bg-gray-200"}`}>
        <div className="w-2 h-2 rounded-full bg-current" />
        <span>{tire.status}</span>
      </div>

      <div className="space-y-4">
        {/* El "#" queda como decoración; el prefijo configurable va pegado al número */}
        <SidebarInfoItem label="Código Interno" value={`#${formatTireCode(tire.code, tireCodePrefix)}`} className="text-lg" />
        <SidebarInfoItem label="Número de Serie" value={tire.serialNumber} />
        <SidebarInfoItem label="Marca" value={tire.brand} />
        <SidebarInfoItem label="Rodado" value={tire.size} />
        <SidebarInfoItem label="Dibujo" value={tire.pattern} />
        <SidebarInfoItem
          label="Vehículo Actual"
          value={tire.vehicle ? `${tire.vehicle.mobile} (${tire.vehicle.licensePlate})` : "En depósito"}
          className={tire.vehicle ? "text-green-600 dark:text-green-400" : ""}
        />
      </div>
    </div>

    {/* Acciones */}
    <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <h3 className="font-semibold mb-4 text-sm">Acciones rápidas</h3>
      <QuickActions tire={tire} refreshTire={refreshTire} />
    </div>
  </div>
  );
};

export default TireStatusSidebar;
