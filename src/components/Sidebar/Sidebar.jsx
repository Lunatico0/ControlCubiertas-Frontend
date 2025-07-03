import { useEffect, useState } from "react";
import { colors, text, utility } from "@utils/tokens";
import { useTheme } from "@context/ThemeContext";
import isElectron from "@utils/isElectron";
import { useUpdater } from "@hooks/useUpdater";

import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import DirectionsBusRoundedIcon from "@mui/icons-material/DirectionsBusRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import TireRepairRoundedIcon from "@mui/icons-material/TireRepairRounded";
import CloudDownloadRoundedIcon from "@mui/icons-material/CloudDownloadRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

const navItems = [
  { icon: <TireRepairRoundedIcon />, label: "Cubiertas", key: "tires" },
  { icon: <DirectionsBusRoundedIcon />, label: "Vehículos", key: "vehicles" },
  { icon: <SettingsRoundedIcon />, label: "Configuración", key: "settings" },
];

const Sidebar = ({ active, setActive }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [version, setVersion] = useState("");
  const electron = isElectron();
  const triggerUpdateCheck = useUpdater(setHasUpdate);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    if (electron) {
      window.electronAPI.getVersion()
        .then(setVersion)
        .catch(() => setVersion("Desconocida"));
    }
  }, []);

  const sidebarClass = `
    fixed top-0 left-0 h-full z-50 transition-all duration-300
    ${isMobile ? (isMobileOpen ? "translate-x-0" : "-translate-x-full") : (expanded ? "w-56" : "w-14")}
    flex flex-col justify-between
    ${colors.bgSidebar} border-r ${colors.borderSider}
  `;

  return (
    <>
      {/* Botón flotante solo en móvil */}
      {isMobile && !isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed bottom-4 left-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all"
        >
          <MenuRoundedIcon />
        </button>
      )}

      <div
        className={sidebarClass}
        onMouseLeave={() => !isMobile && expanded && setExpanded(false)}
      >
        {/* Botón cerrar en móvil */}
        {isMobile && isMobileOpen && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="absolute top-2 right-3 text-white bg-gray-700 p-2 rounded-full hover:bg-gray-600"
          >
            <CloseRoundedIcon/>
          </button>
        )}

        {/* Top */}
        <div>
          <div className={`flex items-center justify-between px-4 py-3 border-b ${colors.borderSider}`}>
            {expanded && <span className={`${text.value} font-bold text-sm`}>Control Cubiertas</span>}
            {!isMobile && (
              <button onClick={() => setExpanded(!expanded)} className={`ml-auto ${text.value}`}>
                <MenuRoundedIcon />
              </button>
            )}
          </div>

          <nav className="flex flex-col p-2 pt-6 space-y-4">
            {navItems.map(({ icon, label, key }) => (
              <div
                key={label}
                onClick={() => {
                  setActive(key);
                  if (isMobile) setIsMobileOpen(false);
                }}
                className={`flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition-colors
                ${active === key ? `${colors.bgActive} ${colors.shadow}` : `${colors.shadow} ${utility.hoverBg} text-gray-400`}`}
              >
                <span className={`text-xl ${text.value}`}>{icon}</span>
                {(expanded || isMobile) && <span className={text.value}>{label}</span>}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom */}
        <div className={`px-2 py-3 ${utility.borderT} ${colors.borderSider}`}>
          {/* Botón actualizar */}
          {electron && (
            <div
              className={`relative flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors ${colors.shadow} ${utility.hoverBg} ${text.value}`}
              onClick={() => {
                setHasUpdate(false);
                triggerUpdateCheck();
              }}
            >
              <CloudDownloadRoundedIcon fontSize="small" />
              {hasUpdate && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              )}
              {(expanded || isMobile) && <span className={text.value}>Actualizar</span>}
            </div>
          )}

          {/* Botón toggle modo */}
          <div
            className={`mt-3 flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors
              ${colors.shadow} ${utility.hoverBg} ${text.value}`}
            onClick={toggleTheme}
          >
            {isDarkMode ? <LightModeRoundedIcon fontSize="small" /> : <DarkModeRoundedIcon fontSize="small" />}
            {(expanded || isMobile) && (
              <span className={text.value}>{isDarkMode ? "Claro" : "Oscuro"}</span>
            )}
          </div>

          {/* Versión */}
          {(expanded || isMobile) && version && (
            <div className={`text-xs ${text.value} mt-4 select-none pl-1`}>
              versión: <span className={text.muted}>{version}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
