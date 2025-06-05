import { useState, useCallback } from "react"
import { generateReceiptHTML } from "@utils/receipt-html"

/**
 * Hook para manejar la impresión de comprobantes
 * @returns {Object} Funciones y estados para la impresión
 */
export const usePrint = () => {
  const [isPrinting, setIsPrinting] = useState(false)

  const print = useCallback(
    async (data) => {
      return new Promise((resolve, reject) => {
        try {
          setIsPrinting(true)
          console.log("🖨️ Iniciando proceso de impresión...")

          // Crear ventana de impresión
          const printWindow = window.open("", "", "width=800,height=600")

          if (!printWindow) {
            throw new Error("No se pudo abrir la ventana de impresión")
          }

          console.log("✅ Ventana de impresión abierta")

          // Escribir contenido HTML
          printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Comprobante-${data?.receiptNumber || "0000-00000000"}</title>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                @media print {
                  body { margin: 0; padding: 0; }
                  .receipt-container { width: 100%; max-width: 800px; margin: 0 auto; }
                  @page { size: auto; margin: 10mm; }
                }
                body { font-family: Arial, sans-serif; }
              </style>
            </head>
            <body>
              <div class="receipt-container">
                ${generateReceiptHTML(data)}
              </div>
              <script>
                console.log("📄 Documento cargado en ventana de impresión");

                // Función para notificar al padre
                function notifyParent(printed) {
                  console.log("📨 Enviando mensaje al padre:", printed);
                  if (window.opener) {
                    window.opener.postMessage({ printed: printed }, "*");
                  }
                }

                // Cuando la ventana termine de cargar
                window.onload = function() {
                  console.log("🔄 Ventana cargada, iniciando impresión automática...");

                  // Pequeño delay para asegurar que todo esté renderizado
                  setTimeout(function() {
                    try {
                      // Intentar imprimir automáticamente
                      window.print();
                      console.log("🖨️ Comando de impresión enviado");

                      // Configurar eventos de impresión
                      window.onafterprint = function() {
                        console.log("✅ Evento onafterprint disparado");
                        notifyParent(true);
                        setTimeout(function() {
                          window.close();
                        }, 500);
                      };

                      // Backup: Si onafterprint no funciona, usar beforeunload
                      window.onbeforeunload = function() {
                        console.log("⚠️ Ventana cerrándose (beforeunload)");
                        notifyParent(true);
                      };

                    } catch (printError) {
                      console.error("❌ Error al imprimir:", printError);
                      notifyParent(false);
                    }
                  }, 1000);
                };

                // Manejar cierre manual de la ventana
                window.addEventListener('beforeunload', function() {
                  console.log("🚪 Usuario cerró la ventana manualmente");
                  notifyParent(true); // Asumir que el usuario completó la acción
                });
              </script>
            </body>
          </html>
        `)

          printWindow.document.close()
          console.log("📄 Documento HTML escrito y cerrado")

          // Escuchar mensaje de confirmación
          const handleMessage = (event) => {
            console.log("📨 Mensaje recibido:", event.data)

            if (event.data?.printed !== undefined) {
              console.log("✅ Confirmación de impresión recibida:", event.data.printed)
              window.removeEventListener("message", handleMessage)
              setIsPrinting(false)
              resolve(event.data.printed)
            }
          }

          window.addEventListener("message", handleMessage)
          console.log("👂 Listener de mensajes configurado")

          // Timeout de seguridad más largo
          setTimeout(() => {
            console.log("⏰ Timeout alcanzado")
            if (isPrinting) {
              window.removeEventListener("message", handleMessage)
              setIsPrinting(false)
              // Resolver como exitoso en caso de timeout (el usuario probablemente completó la acción)
              resolve(true)
            }
          }, 15000) // 15 segundos de timeout

          // Detectar si la ventana se cierra sin mensaje
          const checkClosed = setInterval(() => {
            if (printWindow.closed) {
              console.log("🚪 Ventana cerrada detectada")
              clearInterval(checkClosed)
              if (isPrinting) {
                window.removeEventListener("message", handleMessage)
                setIsPrinting(false)
                resolve(true) // Asumir éxito si el usuario cerró la ventana
              }
            }
          }, 1000)
        } catch (error) {
          console.error("❌ Error durante la impresión:", error)
          setIsPrinting(false)
          reject(error)
        }
      })
    },
    [isPrinting],
  )

  return { print, isPrinting }
}

export default usePrint
