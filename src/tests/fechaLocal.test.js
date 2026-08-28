import { describe, it, expect } from "vitest"
import { todayLocal, dateOnlyToLocalNoon, formatDateOnly } from "@utils/date"

// Bug 2 / t4 — Un input `date` entrega "2026-08-28". Mandarlo tal cual al backend hace que
// `new Date("2026-08-28")` se interprete como MEDIANOCHE UTC, que en GMT-3 es el 27 a las
// 21:00: la fecha de alta aparece corrida un día para atrás. El corrimiento afecta a
// CUALQUIER campo date manual, no sólo al alta, así que la normalización vive en un único
// util y no repetida en cada formulario.
//
// La solución es anclar el día suelto al MEDIODÍA local: con 12 horas de colchón a cada lado
// ninguna zona horaria real (UTC-11 a UTC+14) puede empujar la fecha a otro día.

describe("todayLocal", () => {
  it("devuelve el día de HOY en zona local, no el de UTC", () => {
    const hoy = new Date()
    const esperado = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`
    expect(todayLocal()).toBe(esperado)
  })

  it("tiene el formato que espera el input type=date", () => {
    expect(todayLocal()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe("dateOnlyToLocalNoon", () => {
  it("ancla un día suelto al mediodía local", () => {
    expect(dateOnlyToLocalNoon("2026-08-28")).toBe("2026-08-28T12:00:00")
  })

  it("el resultado NO se corre de día al pasar por Date", () => {
    const d = new Date(dateOnlyToLocalNoon("2026-08-28"))
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(7)
    expect(d.getDate()).toBe(28)
  })

  it("deja pasar un valor que ya trae hora", () => {
    expect(dateOnlyToLocalNoon("2026-08-28T15:30:00")).toBe("2026-08-28T15:30:00")
  })

  it("devuelve null con un valor vacío", () => {
    expect(dateOnlyToLocalNoon("")).toBeNull()
    expect(dateOnlyToLocalNoon(null)).toBeNull()
    expect(dateOnlyToLocalNoon(undefined)).toBeNull()
  })
})

describe("formatDateOnly", () => {
  it("convierte un Date a YYYY-MM-DD en zona local", () => {
    expect(formatDateOnly(new Date(2026, 7, 28, 23, 30))).toBe("2026-08-28")
  })

  it("devuelve cadena vacía con un valor inválido", () => {
    expect(formatDateOnly(null)).toBe("")
    expect(formatDateOnly("no es fecha")).toBe("")
  })
})
