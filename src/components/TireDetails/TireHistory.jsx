import React from 'react';
import { getRowStyle, dictionary } from '../../utils/getRowStyle.js';

const TireHistory = ({ history, code, serialNumber, tire }) => {
  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-2">Historial</h3>
      <div className="overflow-x-auto border rounded max-h-64">
        <table className="min-w-full text-sm text-left table-fixed">
          <thead className="bg-gray-300 dark:bg-gray-700 sticky top-0 z-10">
            <tr>
              <th className="p-2 text-nowrap">Fecha</th>
              <th className="p-2 text-nowrap">N° Orden</th>
              <th className="p-2 text-nowrap">Móvil</th>
              <th className="p-2 text-nowrap">Patente</th>
              <th className="p-2 text-nowrap">Km Alta</th>
              <th className="p-2 text-nowrap">Km Baja</th>
              <th className="p-2 text-nowrap">Km Total</th>
              <th className="p-2 text-nowrap">Estado</th>
              <th className="p-2 text-nowrap">N° Int</th>
              <th className="p-2 text-nowrap">N° Serie</th>
              <th className="p-2 text-center text-nowrap">Info</th>
            </tr>
          </thead>
          <tbody>
            {[...history].reverse().map((record, i) => (
              <tr key={i}
                className={`border-b border-gray-300 ${getRowStyle(record.type, record.flag)}`}>
                <td className="p-2">{new Date(record.date).toLocaleDateString('es-AR')}</td>
                <td className="p-2 text-center text-nowrap">{record.orderNumber || '-'}</td>
                <td className="p-2 text-center text-nowrap">{record.vehicle?.mobile || '-'}</td>
                <td className="p-2 text-center text-nowrap">{record.vehicle?.licensePlate || '-'}</td>
                <td className="p-2 text-center text-nowrap">{record.kmAlta ?? '-'}</td>
                <td className="p-2 text-center text-nowrap">{record.kmBaja ?? '-'}</td>
                <td className="p-2 text-center text-nowrap">{record.km || '-'}</td>
                <td className="p-2 text-center truncate max-w-20 relative group">{record.status || '-'}</td>
                <td className="p-2 text-center text-nowrap">{code}</td>
                <td className="p-2 text-center text-nowrap">{serialNumber}</td>
                <td className="p-2 text-center text-nowrap relative group">
                  {record.type === 'correccion' ? (
                    <span className="cursor-pointer text-yellow-700 dark:text-yellow-400 font-bold">🛈
                      <div className="fixed z-[9999] bg-gray-800 text-white text-xs text-start p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                      >
                        <div><strong>Tipo:</strong> {dictionary[record.type]}</div>
                        <div><strong>Campos editados:</strong>
                          {
                            Array.isArray(record.editedFields)
                              ? record.editedFields
                                .map((field) => dictionary[field])
                                .filter(Boolean) // Esto elimina cualquier 'undefined' si una clave no existe en el diccionario
                                .join(' ,')
                              : dictionary[record.editedFields]
                          }
                        </div>
                        <div><strong>Razón:</strong> {dictionary[record.reason] || 'No especificada'}</div>
                      </div>
                    </span>
                  ) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TireHistory;
