import { describe, it, expect } from "vitest"
import { nombreComprobante } from "@utils/print-data"

// El título de la ventana de impresión es el nombre que el diálogo propone al guardar el
// comprobante como PDF. Tiene que identificarlo sin abrirlo: la acción y su número.
describe("nombreComprobante", () => {
  it("arma la acción seguida del número de comprobante", () => {
    expect(nombreComprobante({ actionType: "Desasignación", receiptNumber: "0001-00000049" })).toBe(
      "Desasignación 0001-00000049",
    )
  })

  it("en una reimpresión usa el tipo del movimiento original", () => {
    expect(nombreComprobante({ actionType: "Corrección-Asignación", receiptNumber: "0001-00000021" })).toBe(
      "Corrección-Asignación 0001-00000021",
    )
  })

  it("sin número real (el placeholder 0000-00000000) queda sólo la acción", () => {
    expect(nombreComprobante({ actionType: "Alta de cubierta", receiptNumber: "0000-00000000" })).toBe("Alta de cubierta")
  })

  it("sin acción cae a Comprobante", () => {
    expect(nombreComprobante({ receiptNumber: "0001-00000007" })).toBe("Comprobante 0001-00000007")
    expect(nombreComprobante(undefined)).toBe("Comprobante")
  })

  it("saca los caracteres que Windows no acepta en un nombre de archivo", () => {
    expect(nombreComprobante({ actionType: 'Envío a recapado: "R1" / lote?', receiptNumber: "0001-00000050" })).toBe(
      "Envío a recapado R1 lote 0001-00000050",
    )
  })
})
