import { useState, useCallback } from "react"

const usePrintEngine = () => {
  const [isPrinting, setIsPrinting] = useState(false)

  const printHtml = useCallback((htmlContent, title = "Comprobante") => {
    return new Promise((resolve, reject) => {
      try {
        setIsPrinting(true)
        const printWindow = window.open("", "", "width=800,height=600")
        if (!printWindow) throw new Error("No se pudo abrir la ventana de impresión")

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${title}</title>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <link rel="preconnect" href="https://fonts.googleapis.com" />
              <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
              <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </head>
            <body>
              <div class="receipt-container">${htmlContent}</div>
              <script>
                function notifyParent(printed) {
                  if (window.opener) {
                    window.opener.postMessage({ printed }, "*");
                  }
                }

                function launchPrint() {
                  try {
                    window.print();
                    window.onafterprint = () => {
                      notifyParent(true);
                      setTimeout(() => window.close(), 500);
                    };
                    window.onbeforeunload = () => notifyParent(true);
                  } catch (err) {
                    console.error("Print error", err);
                    notifyParent(false);
                  }
                }

                window.onload = function() {
                  // Esperar a que carguen las tipografías para que el impreso coincida con el preview.
                  var ready = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
                  ready.then(() => setTimeout(launchPrint, 250)).catch(() => setTimeout(launchPrint, 500));
                };

                window.addEventListener("beforeunload", () => notifyParent(true));
              </script>
            </body>
          </html>
        `)
        printWindow.document.close()

        const handleMessage = (event) => {
          if (event.data?.printed !== undefined) {
            window.removeEventListener("message", handleMessage)
            setIsPrinting(false)
            resolve(event.data.printed)
          }
        }

        window.addEventListener("message", handleMessage)

        const fallback = setTimeout(() => {
          if (isPrinting) {
            window.removeEventListener("message", handleMessage)
            setIsPrinting(false)
            resolve(true)
          }
        }, 15000)

        const checkClosed = setInterval(() => {
          if (printWindow.closed) {
            clearInterval(checkClosed)
            window.removeEventListener("message", handleMessage)
            if (isPrinting) {
              setIsPrinting(false)
              resolve(true)
            }
          }
        }, 1000)
      } catch (error) {
        console.error("❌ Error imprimiendo:", error)
        setIsPrinting(false)
        reject(error)
      }
    })
  }, [isPrinting])

  return { printHtml, isPrinting }
}

export default usePrintEngine
