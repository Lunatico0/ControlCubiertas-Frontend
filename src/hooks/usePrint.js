import usePrintEngine from "./usePrintEngine"
import useSettings from "./useSettings"
import { generateReceiptHTML } from "@utils/receipt-html"
import { getCompanyCached } from "@api/company"

// Impresión del comprobante que acompaña a una acción sobre una cubierta.
//
// Devuelve SIEMPRE un resultado explícito, nunca un booleano:
//   { status: "dispatched" } → se abrió el diálogo de impresión
//   { status: "disabled" }   → el tenant tiene la impresión automática apagada
// y rechaza si la ventana no se pudo abrir (popup bloqueado). Nunca dice "impreso": el motor
// no puede saberlo (ver usePrintEngine).
//
// La impresión NO gatea la acción. Para el lado del usuario: si te quedaste sin papel o cerraste
// el diálogo, el movimiento igual quedó registrado y el comprobante se reimprime desde el
// historial. Gatearla al revés (imprimir y recién ahí persistir) exigiría reservar el número de
// comprobante por adelantado, que es justamente lo que quemaba correlativos en los intentos
// fallidos.
export const usePrint = () => {
  const { printHtml, isPrinting } = usePrintEngine()
  // El layout sale del contexto de ajustes, que es la única fuente. Leer localStorage acá
  // era lo que producía un comprobante distinto al que mostraba la pantalla de Ajustes.
  const { receiptLayout: layoutMode } = useSettings()

  const print = async (data) => {
    const company = await getCompanyCached()

    // Preferencia del tenant. Ausente (company null por un fetch fallido, o un tenant viejo sin
    // el campo) = prendida: el default histórico es imprimir.
    if (company?.autoPrint === false) return { status: "disabled" }

    const html = generateReceiptHTML(data, layoutMode, company?.receiptDesign, company)
    const title = `Comprobante-${data?.receiptNumber || "0000-00000000"}`
    await printHtml(html, title)
    return { status: "dispatched" }
  }

  return { print, isPrinting, layoutMode }
}

export default usePrint
