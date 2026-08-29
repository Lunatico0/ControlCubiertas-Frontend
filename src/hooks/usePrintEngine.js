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
// TODA LA LÓGICA CORRE EN EL OPENER, NUNCA EN LA VENTANA HIJA
//
// El build declara una Content-Security-Policy con `script-src 'self'`, y una ventana abierta
// con window.open("") HEREDA la CSP de quien la abrió. La versión anterior escribía un <script>
// inline en esa ventana: con la CSP puesta queda bloqueado, o sea que la impresión no se
// dispara y la promesa se resuelve sólo por el timeout. La ventana es same-origin, así que el
// opener puede medir, escalar y llamar print() sobre ella directamente. De paso desaparece el
// postMessage, que existía únicamente para cruzar esa frontera.
//
// Cuánto esperamos como MÁXIMO a que la ventana avise. Pasado eso la damos por despachada
// igual: el comprobante siempre se puede reimprimir desde el historial, pero dejar el botón
// colgado en "Guardando…" sobre una acción YA ejecutada no tiene arreglo desde la UI.
const TIMEOUT_MS = 15000
const POLL_MS = 1000

// Área imprimible de una A4 en px CSS a 96dpi (297mm menos 18mm de márgenes).
const ALTO_IMPRIMIBLE = 1045

// Red de seguridad: si el comprobante excede la hoja, se escala lo justo para que SIEMPRE
// entre en una sola, sin importar cuántos datos tenga.
function ajustarAlaHoja(doc) {
  try {
    const raiz = doc.getElementById("print-root")
    const contenido = raiz && raiz.querySelector(".receipt-container")
    if (!contenido) return
    const alto = contenido.scrollHeight
    if (alto <= ALTO_IMPRIMIBLE) return
    const escala = ALTO_IMPRIMIBLE / alto
    contenido.style.transformOrigin = "top left"
    contenido.style.transform = `scale(${escala})`
    contenido.style.width = `${100 / escala}%`
    raiz.style.height = `${ALTO_IMPRIMIBLE}px`
    raiz.style.overflow = "hidden"
  } catch (err) {
    console.error("No se pudo ajustar el comprobante a la hoja:", err)
  }
}

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
            </body>
          </html>
        `)
        printWindow.document.close()

        // `settled` es una variable de la promesa, NO estado de React. Antes el guard de los
        // dos caminos de rescate era `if (isPrinting)`, y `isPrinting` es el valor capturado
        // en el render de la llamada: vale false SIEMPRE (setIsPrinting(true) recién aplica en
        // el próximo render). O sea que ni el timeout ni el detector de ventana cerrada podían
        // resolver nunca, y si el aviso no llegaba la promesa quedaba colgada para siempre
        // — con el botón en "Guardando…" sobre una acción que YA se ejecutó.
        let settled = false
        let fallback
        let checkClosed

        const limpiar = () => {
          clearTimeout(fallback)
          clearInterval(checkClosed)
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

        pendingRef.current.add(limpiar)
        fallback = setTimeout(finish, TIMEOUT_MS)
        checkClosed = setInterval(() => {
          // Si el usuario cierra la ventana sin imprimir, onafterprint puede no llegar.
          if (printWindow.closed) finish()
        }, POLL_MS)

        // Esperar a que carguen las tipografías: sin eso el impreso no coincide con el preview.
        const fuentesListas = printWindow.document.fonts?.ready || Promise.resolve()
        Promise.resolve(fuentesListas)
          .catch(() => {})
          .then(() => {
            if (settled || printWindow.closed) return
            ajustarAlaHoja(printWindow.document)
            printWindow.onafterprint = () => {
              finish()
              setTimeout(() => {
                try {
                  printWindow.close()
                } catch {
                  // La ventana ya se cerró sola: no hay nada que hacer.
                }
              }, 500)
            }
            printWindow.print()
          })
          .catch((err) => {
            console.error("❌ Error al despachar la impresión:", err)
            finish()
          })
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
