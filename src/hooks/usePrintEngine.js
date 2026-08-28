import { useState, useCallback, useRef, useEffect } from "react"
import { FUENTES_CSS } from "@utils/fonts"

// LO QUE ESTE MOTOR PUEDE Y NO PUEDE SABER
//
// No puede saber si el comprobante SE IMPRIMIÓ. La web no lo expone: `window.print()` no
// devuelve resultado, `onafterprint` dispara igual cuando el usuario cancela el diálogo, y el
// `beforeunload` de la ventana llega tanto si imprimió como si la cerró de una. Todo lo que
// sabemos es que el diálogo se DESPACHÓ.
//
// Por eso `printHtml` resuelve `{ dispatched: true }` y nunca un booleano "impreso": un booleano
// invitaba a construir mensajes y reglas de negocio sobre un dato que no existe. Si no se puede
// ni abrir la ventana (popup bloqueado), rechaza — eso sí es observable.
//
// Cuánto esperamos como MÁXIMO a que la ventana avise. Pasado eso la damos por despachada
// igual: el comprobante siempre se puede reimprimir desde el historial, pero dejar el botón
// colgado en "Guardando…" sobre una acción YA ejecutada no tiene arreglo desde la UI.
const TIMEOUT_MS = 15000
const POLL_MS = 1000

const usePrintEngine = () => {
  const [isPrinting, setIsPrinting] = useState(false)
  // Los timers vivos, para poder limpiarlos si el componente se desmonta a mitad de impresión.
  const pendingRef = useRef(new Set())

  useEffect(
    () => () => {
      pendingRef.current.forEach((limpiar) => limpiar())
      pendingRef.current.clear()
    },
    [],
  )

  const printHtml = useCallback((htmlContent, title = "Comprobante") => {
    return new Promise((resolve, reject) => {
      // El origen del padre, para que el popup no tenga que postear a "*".
      const origen = window.location.origin

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
              <!-- Fuentes del BUNDLE, no del CDN: el comprobante tiene que salir igual sin
                   internet (ver @utils/fonts). -->
              <style>${FUENTES_CSS}</style>
            </head>
            <body>
              <div id="print-root"><div class="receipt-container">${htmlContent}</div></div>
              <script>
                var PARENT_ORIGIN = ${JSON.stringify(origen)};

                function notifyParent(printed) {
                  if (window.opener) {
                    // Origen explícito, no "*": el aviso es sólo para la app que abrió esta ventana.
                    window.opener.postMessage({ printed: printed }, PARENT_ORIGIN);
                  }
                }

                // Red de seguridad: si el contenido excede el área imprimible de la A4
                // (297mm - 18mm de márgenes ≈ 1045px CSS a 96dpi), lo escala lo justo para
                // que SIEMPRE entre en una sola hoja, sin importar cuántos datos tenga.
                function fitToPage() {
                  try {
                    var root = document.getElementById("print-root");
                    var content = root && root.querySelector(".receipt-container");
                    if (!content) return;
                    var maxH = 1045;
                    var h = content.scrollHeight;
                    if (h > maxH) {
                      var scale = maxH / h;
                      content.style.transformOrigin = "top left";
                      content.style.transform = "scale(" + scale + ")";
                      content.style.width = (100 / scale) + "%";
                      root.style.height = maxH + "px";
                      root.style.overflow = "hidden";
                    }
                  } catch (err) {
                    console.error("fitToPage error", err);
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
                  ready.then(() => { fitToPage(); setTimeout(launchPrint, 250); }).catch(() => { fitToPage(); setTimeout(launchPrint, 500); });
                };

                window.addEventListener("beforeunload", () => notifyParent(true));
              </script>
            </body>
          </html>
        `)
        printWindow.document.close()

        // `settled` es una variable de la promesa, NO estado de React. Antes el guard de los
        // dos caminos de rescate era `if (isPrinting)`, y `isPrinting` es el valor capturado
        // en el render de la llamada: vale false SIEMPRE (setIsPrinting(true) recién aplica en
        // el próximo render). O sea que ni el timeout ni el detector de ventana cerrada podían
        // resolver nunca, y si el postMessage no llegaba la promesa quedaba colgada para
        // siempre — con el botón en "Guardando…" sobre una acción que YA se ejecutó.
        let settled = false
        let fallback
        let checkClosed

        const limpiar = () => {
          clearTimeout(fallback)
          clearInterval(checkClosed)
          window.removeEventListener("message", handleMessage)
          pendingRef.current.delete(limpiar)
        }

        // `dispatched` significa "el diálogo de impresión llegó a abrirse", NO "se imprimió".
        const finish = () => {
          if (settled) return
          settled = true
          limpiar()
          setIsPrinting(false)
          resolve({ dispatched: true })
        }

        function handleMessage(event) {
          // Sólo escuchamos a NUESTRA ventana de impresión: cualquier otra podía resolver la
          // promesa antes de tiempo y cerrar el flujo de un comprobante que no era éste.
          if (event.source !== printWindow) return
          if (event.origin !== origen) return
          if (event.data?.printed === undefined) return
          finish()
        }

        window.addEventListener("message", handleMessage)
        pendingRef.current.add(limpiar)

        fallback = setTimeout(finish, TIMEOUT_MS)

        checkClosed = setInterval(() => {
          // Si el usuario cierra la ventana sin imprimir, el beforeunload puede no llegar.
          if (printWindow.closed) finish()
        }, POLL_MS)
      } catch (error) {
        console.error("❌ Error imprimiendo:", error)
        setIsPrinting(false)
        reject(error)
      }
    })
  }, [])

  return { printHtml, isPrinting }
}

export default usePrintEngine
