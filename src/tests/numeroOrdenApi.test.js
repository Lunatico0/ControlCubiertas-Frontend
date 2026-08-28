import { describe, it, expect, vi, beforeEach } from "vitest"

// t5 — El número de orden se manda al backend SIEMPRE en su forma canónica AAAA-NNNNNN.
//
// Hasta ahora el formateo vivía en TireForm.jsx, así que el panel viejo mandaba "2026-000123"
// y la operativa /op (AltaDrawer, TireDrawer) mandaba los dígitos crudos "123": en la misma
// base de un tenant conviven las dos formas para el mismo dato. El formateo pasa a la CAPA DE
// API, que es por donde salen los dos caminos, y así ninguna pantalla nueva puede saltearlo.

const patch = vi.fn(async () => ({ data: {} }))
const post = vi.fn(async () => ({ data: {} }))
const get = vi.fn(async () => ({ data: {} }))

vi.mock("@api/client", () => ({
  createAPI: () => ({ patch, post, get }),
  default: {},
}))

const cargar = async () => import("@api/tires")

beforeEach(() => {
  patch.mockClear()
  post.mockClear()
  get.mockClear()
})

const anio = new Date().getFullYear()

describe("la capa de API formatea el número de orden", () => {
  it("createTire formatea los dígitos crudos", async () => {
    const { createTire } = await cargar()
    await createTire({ code: 1, orderNumber: "123" })
    expect(post.mock.calls[0][1].orderNumber).toBe(`${anio}-000123`)
  })

  it("updateTireStatus formatea los dígitos crudos", async () => {
    const { updateTireStatus } = await cargar()
    await updateTireStatus("abc", { status: "A recapar", orderNumber: "7" })
    expect(patch.mock.calls[0][1].orderNumber).toBe(`${anio}-000007`)
  })

  it("assignTireToVehicle formatea los dígitos crudos", async () => {
    const { assignTireToVehicle } = await cargar()
    await assignTireToVehicle("abc", { kmAlta: 10, orderNumber: "45" })
    expect(patch.mock.calls[0][1].orderNumber).toBe(`${anio}-000045`)
  })

  it("unassignTireFromVehicle formatea los dígitos crudos", async () => {
    const { unassignTireFromVehicle } = await cargar()
    await unassignTireFromVehicle("abc", { kmBaja: 10, orderNumber: "45" })
    expect(patch.mock.calls[0][1].orderNumber).toBe(`${anio}-000045`)
  })

  it("undoHistoryEntry formatea los dígitos crudos", async () => {
    const { undoHistoryEntry } = await cargar()
    await undoHistoryEntry("abc", "def", { orderNumber: "9" })
    expect(post.mock.calls[0][1].orderNumber).toBe(`${anio}-000009`)
  })

  it("respeta un número que ya viene en forma canónica", async () => {
    const { updateTireStatus } = await cargar()
    await updateTireStatus("abc", { status: "X", orderNumber: "2024-000500" })
    expect(patch.mock.calls[0][1].orderNumber).toBe("2024-000500")
  })

  it("formatea también el orderNumber que viaja dentro de form (correcciones)", async () => {
    const { updateTireDataCorrection } = await cargar()
    await updateTireDataCorrection("abc", { form: { brand: "X", orderNumber: "12" } })
    expect(patch.mock.calls[0][1].form.orderNumber).toBe(`${anio}-000012`)
  })

  it("no inventa un número cuando no viene: deja que el backend rechace", async () => {
    const { updateTireStatus } = await cargar()
    await updateTireStatus("abc", { status: "X" })
    expect(patch.mock.calls[0][1].orderNumber).toBeUndefined()
  })

  it("deja pasar un valor inválido tal cual para que el backend dé el error de campo", async () => {
    const { updateTireStatus } = await cargar()
    await updateTireStatus("abc", { status: "X", orderNumber: "ABC" })
    expect(patch.mock.calls[0][1].orderNumber).toBe("ABC")
  })
})
