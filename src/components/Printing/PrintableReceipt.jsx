import { forwardRef } from "react"

/**
 * Componente para renderizar un recibo imprimible
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.data - Datos del recibo
 * @param {React.Ref} ref - Referencia para el componente
 */
const PrintableReceipt = forwardRef(({ data }, ref) => {
  if (!data || !data.tire) {
    return null
  }

  return (
    <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white text-black text-sm font-sans">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="w-full h-[148mm] border-b border-black p-6 relative flex flex-col">
          {/* Marca de agua */}
          <img
            src="/TMBC.png"
            alt="Marca de agua TMBC"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10 w-1/2 z-0"
          />

          {/* Contenido */}
          <div className="relative z-10 flex-grow">
            {/* Encabezado */}
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-xs font-bold">TMBC</p>
                <p className="text-xs">Ruta Nac. Nº 12 Km 1, Nogoyá</p>
                <p className="text-xs">Tel: 03435 - 423694</p>
              </div>
              <div className="text-right text-xs">
                <p>
                  <strong>{i === 0 ? "ORIGINAL" : "DUPLICADO"}</strong>
                </p>
                <p>Recibo Nº: {data?.receiptNumber || "0000-00000000"}</p>
                <p>Fecha: {new Date().toLocaleDateString("es-AR")}</p>
              </div>
            </div>

            {/* Título */}
            <p className="text-center font-bold underline my-2">COMPROBANTE</p>

            {/* Detalles */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-2">
              {/* Información de la cubierta */}
              <div>
                <p>
                  <strong>Cubierta:</strong> #{data?.tire?.code}
                </p>
                <p>
                  <strong>N° Serie:</strong> {data?.tire?.serialNumber}
                </p>
                <p>
                  <strong>Marca:</strong> {data?.tire?.brand}
                </p>
                <p>
                  <strong>Dibujo:</strong> {data?.tire?.pattern}
                </p>
                {data?.tire?.status && (
                  <p>
                    <strong>Estado:</strong> {data?.tire?.status}
                  </p>
                )}
                {data?.tire?.kilometers !== undefined && (
                  <p>
                    <strong>Km totales:</strong> {data?.tire?.kilometers.toLocaleString()} km
                  </p>
                )}
              </div>

              {/* Información del vehículo y acción */}
              <div>
                <p>
                  <strong>Vehículo:</strong> {data?.vehicle?.mobile || "Sin asignar"}
                </p>
                <p>
                  <strong>Patente:</strong> {data?.vehicle?.licensePlate || "Sin asignar"}
                </p>
                <p>
                  <strong>Orden:</strong> {data?.orderNumber || data?.correction?.orderNumber || ""}
                </p>
                <p>
                  <strong>Acción:</strong> {data?.actionType || ""}
                </p>

                {/* Estados previo y actual si existen */}
                {data?.tire?.prevStatus && (
                  <p>
                    <strong>Estado anterior:</strong> {data.tire.prevStatus}
                  </p>
                )}
                {data?.tire?.newStatus && (
                  <p>
                    <strong>Estado actual:</strong> {data.tire.newStatus}
                  </p>
                )}

                {/* Información de kilometraje */}
                {data?.kmAlta && (
                  <p>
                    <strong>Km Alta:</strong> {data.kmAlta.toLocaleString()} km
                  </p>
                )}
                {data?.kmBaja && (
                  <p>
                    <strong>Km Baja:</strong> {data.kmBaja.toLocaleString()} km
                  </p>
                )}
                {data?.kmRecorridos && (
                  <p>
                    <strong>Km en este viaje:</strong> {data.kmRecorridos.toLocaleString()} km
                  </p>
                )}
              </div>
            </div>

            {/* Información de corrección si existe */}
            {data?.correction && (
              <div className="mt-2 p-2 border border-gray-300 rounded text-xs">
                <p className="font-bold">Detalles de la corrección:</p>
                <p>
                  <strong>Motivo:</strong> {data.correction.reason}
                </p>
                {data.correction.editedFields && (
                  <p>
                    <strong>Campos editados:</strong> {data.correction.editedFields}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Pie de página */}
          <div className="relative z-10 mt-auto">
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
  )
})

PrintableReceipt.displayName = "PrintableReceipt"

export default PrintableReceipt
