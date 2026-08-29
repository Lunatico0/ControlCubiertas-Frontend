import { describe, it, expect } from "vitest"
import { mensajeDeError } from "@utils/apiError"

// t73 — Dieciséis handlers hacían setError("Error al X: " + err.message), donde err.message
// sale de error.response.data.message. Cuando el backend devuelve un 5xx sin `message`,
// err.message es el texto crudo de axios y al operario le aparecía "Error al obtener las
// cubiertas: Request failed with status code 500". Peor: ante un error de validación de
// Mongo se filtraba estructura interna.
//
// El mensaje que ve el operario se deriva del STATUS. El mensaje del backend sólo se muestra
// cuando es un 4xx, que por contrato es un error de NEGOCIO redactado para el usuario
// (utils/httpError.js). El detalle técnico viaja aparte, para Sentry.

describe("mensajeDeError", () => {
  it("usa el mensaje del backend en un 4xx (es de negocio, escrito para el usuario)", () => {
    expect(mensajeDeError({ status: 409, message: "La cubierta ya está asignada a otro móvil" }))
      .toBe("La cubierta ya está asignada a otro móvil")
  })

  it("NUNCA muestra el mensaje del backend en un 5xx", () => {
    const m = mensajeDeError({ status: 500, message: "E11000 duplicate key error collection: tenant_acme.tires" })
    expect(m).not.toMatch(/E11000/)
    expect(m).not.toMatch(/tenant_acme/)
  })

  it("nunca deja pasar el texto crudo de axios", () => {
    const m = mensajeDeError({ status: 500, message: "Request failed with status code 500" })
    expect(m).not.toMatch(/Request failed/)
    expect(m).toMatch(/servidor|intent/i)
  })

  it("traduce el 403 a un mensaje de permisos", () => {
    expect(mensajeDeError({ status: 403 })).toMatch(/permiso/i)
  })

  it("traduce el 404 a un mensaje de no encontrado", () => {
    expect(mensajeDeError({ status: 404 })).toMatch(/no (se )?encontr/i)
  })

  it("traduce el 429 a un mensaje de reintentar más tarde", () => {
    expect(mensajeDeError({ status: 429 })).toMatch(/demasiad|espera|minuto/i)
  })

  it("traduce el 413 a un mensaje de contenido muy grande", () => {
    expect(mensajeDeError({ status: 413 })).toMatch(/grande|pesa|límite/i)
  })

  it("un error de red (sin status) dice que no hay conexión", () => {
    expect(mensajeDeError({ message: "Network Error" })).toMatch(/conex|red|internet/i)
  })

  it("acepta un contexto para dar una frase entera", () => {
    expect(mensajeDeError({ status: 500 }, "No se pudieron cargar las cubiertas"))
      .toMatch(/^No se pudieron cargar las cubiertas/)
  })

  it("con contexto y un 4xx antepone el contexto al mensaje de negocio", () => {
    const m = mensajeDeError({ status: 400, message: "El kilometraje no puede ser negativo" }, "No se pudo dar de alta")
    expect(m).toMatch(/No se pudo dar de alta/)
    expect(m).toMatch(/El kilometraje no puede ser negativo/)
  })

  it("tolera null y undefined", () => {
    expect(typeof mensajeDeError(null)).toBe("string")
    expect(typeof mensajeDeError(undefined)).toBe("string")
  })

  it("un 4xx SIN mensaje también cae al genérico por status", () => {
    expect(mensajeDeError({ status: 400 })).toBeTruthy()
    expect(mensajeDeError({ status: 400 })).not.toMatch(/undefined/)
  })
})
