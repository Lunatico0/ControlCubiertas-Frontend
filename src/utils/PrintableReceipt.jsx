import React, { forwardRef } from 'react';

const PrintableReceipt = forwardRef(({ data }, ref) => {
  // Es una buena práctica verificar 'data' aquí, aunque AssignTireModal debería asegurar que se pase.
  if (!data || !data.tire || !data.vehicle) {
    // Si los datos cruciales no están, podrías retornar null o un placeholder.
    // Esto podría ayudar a diagnosticar si el problema es la falta de datos.
    // Sin embargo, si esto ocurre, printRef.current podría no asignarse correctamente.
    // Por ahora, asumimos que 'data' y sus propiedades principales vienen completas.
    // Considera retornar null aquí si data es inválida para evitar errores de renderizado.
    // if (!data) return null;
  }

  return (
    <div
      ref={ref}
      className="w-[210mm] min-h-[297mm] bg-white text-black text-sm font-sans" // min-h en lugar de h para flexibilidad
    >
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className="w-full h-[148mm] border-b border-black p-6 relative flex flex-col"
        >
          <img
            src="/TMBC.png" // Revisa que esta ruta sea correcta desde la carpeta 'public'
            alt="Marca de agua TMBC"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10 w-1/2 z-0"
          />

          <div className="relative z-10 flex-grow"> {/* flex-grow para ocupar espacio disponible */}
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs font-bold">TMBC</p>
                <p className="text-xs">Ruta Nac. Nº 12 Km 1, Nogoyá</p>
                <p className="text-xs">Tel: 03435 - 423694</p>
              </div>
              <div className="text-right text-xs">
                <p><strong>{i === 0 ? 'ORIGINAL' : 'DUPLICADO'}</strong></p>
                <p>Recibo Nº: {data?.receiptNumber || '0000-00000000'}</p>
                <p>Fecha: {new Date().toLocaleDateString('es-AR')}</p>
              </div>
            </div>

            <p className="text-center font-bold underline my-2">COMPROBANTE</p>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-2">
              <div>
                <p><strong>Cubierta:</strong> #{data?.tire?.code}</p>
                <p><strong>N° Serie:</strong> {data?.tire?.serialNumber}</p>
                <p><strong>Marca:</strong> {data?.tire?.brand}</p>
                <p><strong>Dibujo:</strong> {data?.tire?.pattern}</p>
              </div>
              <div>
                <p><strong>Vehículo:</strong> {data?.vehicle?.mobile}</p>
                <p><strong>Patente:</strong> {data?.vehicle?.licensePlate}</p>
                <p><strong>Orden:</strong> {data?.orderNumber}</p>
                <p><strong>Acción:</strong> {data?.actionType}</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-auto"> {/* mt-auto para empujar al final */}
            <div className="flex justify-between mt-6 text-xs">
              <p>Firma Responsable: ___________________________</p>
              <p>Firma Chofer: ___________________________</p>
            </div>

            <p className="mt-8 border-t border-gray-300 pt-1 text-xs">
              <strong>Nota:</strong> Este comprobante se emite automáticamente por el sistema.
            </p>
          </div>
        </div>
      ))}
    </div>
  );
});

PrintableReceipt.displayName = 'PrintableReceipt';

export default PrintableReceipt;
