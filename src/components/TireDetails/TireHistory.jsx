import { useContext, useState } from "react";
import ApiContext from "@context/apiContext";
import useTooltip from "@hooks/useTooltip";
import useContextMenu from "@hooks/useContextMenu";
import { useReprint } from "@hooks/useReprint.js";
import UndoHistoryEntryModal from "@components/Actions/modals/UndoHistoryEntryModal";
import { buildReprintData } from "@utils/print-data";
import { getRowStyle, dictionary } from "@utils/historyStyles";
import { colors, text, button, utility } from "@utils/tokens";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';

const TireHistory = ({ history = [], code, serialNumber, tire, onEditEntry }) => {
  const { tires } = useContext(ApiContext);
  const [undoEntry, setUndoEntry] = useState(null);
  const reversedHistory = [...history];

  const { tooltip, showTooltip, hideTooltip } = useTooltip();
  const { openIndex, position, setOpenIndex, openMenu, menuRef } = useContextMenu();
  const { execute: reprintEntry } = useReprint();

  const handleRefreshTire = async () => tire?._id && await tires.loadById(tire._id);
  const handleEditEntry = (entry) => { setOpenIndex(null); onEditEntry(entry); };
  const handleUndoEntry = (entry) => { setOpenIndex(null); setUndoEntry(entry); };
  const handleReprintEntry = (entry) => { setOpenIndex(null); reprintEntry({ entry, tire }); };

  return (
    <div className="h-auto flex flex-col">
      <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
        <h3 className={`${text.heading} text-base`}>Historial</h3>
        <span className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-gray-500">
          {history.length} registro(s)
        </span>
      </div>

      {history.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg mx-6 text-gray-500">
            No hay registros en el historial
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 px-6 pb-6">
          <div className="border rounded-lg shadow-sm max-h-96 flex flex-col overflow-hidden">
            <div className="bg-gray-100 dark:bg-gray-800 flex-shrink-0 grid grid-cols-11 gap-2 p-3 text-xs font-medium">
              {["Fecha", "N° Orden", "Móvil", "Patente", "Km Alta", "Km Baja", "Km Total", "Estado", "N° Int", "N° Serie", "Acciones"]
                .map((label, i) => <div key={i} className="text-center">{label}</div>)}
            </div>

            <div className="flex-1 overflow-y-auto">
              {reversedHistory.map((record, i) => (
                <HistoryRow
                  key={`${record._id || i}-${record.date}`}
                  record={record}
                  index={i}
                  code={code}
                  serialNumber={serialNumber}
                  onShowTooltip={showTooltip}
                  onHideTooltip={hideTooltip}
                  onOpenMenu={openMenu}
                  openMenuIndex={openIndex}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {tooltip.visible && (
        <div
          className="fixed z-50 bg-gray-800 text-white text-xs p-3 rounded-lg shadow-lg max-w-xs"
          style={{ top: tooltip.y, left: tooltip.x }}
        >
          <div className="space-y-1">
            <div><strong>Tipo:</strong> {tooltip.content.tipo}</div>
            <div><strong>Campos editados:</strong> {tooltip.content.campos}</div>
            <div><strong>Razón:</strong> {tooltip.content.reason}</div>
          </div>
        </div>
      )}

      {openIndex !== null && (
        <div
          ref={menuRef}
          className="fixed z-50 max-w-fit flex flex-col items-start gap-2 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg"
          style={{ top: `${position.y}px`, left: `${position.x}px` }}
        >
          <button className={`${button.base} ${utility.hoverBg} w-full text-start`} onClick={() => handleReprintEntry(reversedHistory[openIndex])}>
            <PrintRoundedIcon fontSize="small" /> Reimprimir comprobante
          </button>
          <button className={`${button.base} ${utility.hoverBg} w-full text-start`} onClick={() => handleEditEntry(reversedHistory[openIndex])}>
            <EditNoteRoundedIcon fontSize="small" /> Editar entrada
          </button>
          <div className={`${utility.borderT} pt-2 w-full text-start`}>
            <button className={`${button.base} ${utility.hoverBg} w-full text-start`} onClick={() => handleUndoEntry(reversedHistory[openIndex])}>
              <UndoRoundedIcon fontSize="small" /> Deshacer entrada
            </button>
          </div>
        </div>
      )}

      {undoEntry && (
        <UndoHistoryEntryModal
          tire={tire}
          entry={undoEntry}
          onClose={() => setUndoEntry(null)}
          refreshTire={handleRefreshTire}
        />
      )}
    </div>
  );
};

const HistoryRow = ({ record, index, code, serialNumber, onShowTooltip, onHideTooltip, onOpenMenu }) => {
  const format = (v, isDate) => {
    if (isDate) return new Date(v).toLocaleDateString("es-AR");
    if (v === null || v === undefined) return "-";
    return typeof v === "number" ? v.toLocaleString() : v;
  };

  return (
    <div className={`grid grid-cols-11 gap-2 pt-4 pb-2 text-xs border-b ${getRowStyle(record.type, record.flag)} hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors`}>
      <div className="text-center">{format(record.date, true)}</div>
      <div className="text-center">{record.orderNumber || "-"}</div>
      <div className="text-center">{record.vehicle?.mobile || "-"}</div>
      <div className="text-center">{record.vehicle?.licensePlate || "-"}</div>
      <div className="text-center">{format(record.kmAlta)}</div>
      <div className="text-center">{format(record.kmBaja)}</div>
      <div className="text-center">{format(record.km)}</div>
      <div className="text-center">{record.status || "-"}</div>
      <div className="text-center">{code}</div>
      <div className="text-center">{serialNumber}</div>
      <div className="px-2 flex items-center justify-between gap-2">
        {record.flag ? (
          <span
            className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 cursor-pointer"
            onMouseEnter={(e) => onShowTooltip(e, {
              tipo: "Corrección",
              campos: Array.isArray(record.editedFields)
                ? record.editedFields.map(f => dictionary[f] || f).join(", ")
                : dictionary[record.editedFields] || record.editedFields || "No especificado",
              reason: record.reason || "No especificada"
            })}
            onMouseLeave={onHideTooltip}
          >
            <InfoOutlinedIcon sx={{ fontSize: 15 }} />
          </span>
        ) : (
          <span className="min-w-[15px]" />
        )}
        <button onClick={(e) => onOpenMenu(index, e)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <MoreVertRoundedIcon fontSize="small" />
        </button>
      </div>
    </div>
  );
};

export default TireHistory;
