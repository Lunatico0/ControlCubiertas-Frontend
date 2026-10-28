import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { AxiosError } from "axios"

// S2 (auditoría 26/10): con la clave temporal sin cambiar, el backend responde 403
// PASSWORD_CHANGE_REQUIRED en toda la API salvo el cambio. El interceptor compartido
// (api/client.js) lleva a /cambiar-password con la misma lógica de destino que el cierre
// forzado: path en la web (BrowserRouter), hash en Electron (HashRouter, carga por file://).

let electron = false
vi.mock("@utils/isElectron", () => ({ default: () => electron }))
vi.mock("@sentry/react", () => ({ captureException: vi.fn() }))

import { createAPI } from "@api/client"
import { setTokens, getAccessToken } from "@api/tokenStore"

const MENSAJE = "Tenés que cambiar tu contraseña temporal antes de seguir."

// Cliente cuyo transporte responde siempre lo que se le pida, sin red.
const clienteQueResponde = (status, data) => {
  const client = createAPI("tires")
  client.defaults.adapter = async (config) => {
    throw new AxiosError("Request failed", "ERR_BAD_REQUEST", config, null, { status, data, headers: {}, config })
  }
  return client
}

const fakeLocation = (over = {}) => ({
  pathname: "/cubiertas",
  hash: "",
  assign: vi.fn(),
  reload: vi.fn(),
  ...over,
})

let loc
beforeEach(() => {
  electron = false
  loc = fakeLocation()
  vi.stubGlobal("location", loc)
  vi.spyOn(console, "error").mockImplementation(() => {})
})
afterEach(() => {
  vi.unstubAllGlobals()
})

describe("interceptor · cambio de contraseña obligatorio", () => {
  it("web: ante PASSWORD_CHANGE_REQUIRED navega a /cambiar-password y rechaza con el mensaje del backend", async () => {
    const client = clienteQueResponde(403, { code: "PASSWORD_CHANGE_REQUIRED", message: MENSAJE })

    const err = await client.get("/").catch((e) => e)

    expect(loc.assign).toHaveBeenCalledWith("/cambiar-password")
    expect(err.message).toBe(MENSAJE)
    expect(err.status).toBe(403)
    expect(err.code).toBe("PASSWORD_CHANGE_REQUIRED")
  })

  it("no cierra la sesión: los tokens siguen (el cambio necesita el token de la temporal)", async () => {
    setTokens({ accessToken: "acc-temporal", refreshToken: "ref-temporal" })
    const client = clienteQueResponde(403, { code: "PASSWORD_CHANGE_REQUIRED", message: MENSAJE })

    await client.get("/").catch(() => {})

    expect(getAccessToken()).toBe("acc-temporal")
  })

  it("web: si ya está en /cambiar-password no vuelve a navegar (sin bucle de recargas)", async () => {
    loc = fakeLocation({ pathname: "/cambiar-password" })
    vi.stubGlobal("location", loc)
    const client = clienteQueResponde(403, { code: "PASSWORD_CHANGE_REQUIRED", message: MENSAJE })

    await client.get("/").catch(() => {})

    expect(loc.assign).not.toHaveBeenCalled()
  })

  it("Electron: navega por hash y recarga, igual que el cierre forzado", async () => {
    electron = true
    const client = clienteQueResponde(403, { code: "PASSWORD_CHANGE_REQUIRED", message: MENSAJE })

    await client.get("/").catch(() => {})

    expect(loc.hash).toBe("#/cambiar-password")
    expect(loc.reload).toHaveBeenCalled()
    expect(loc.assign).not.toHaveBeenCalled()
  })

  it("Electron: si ya está en #/cambiar-password no recarga", async () => {
    electron = true
    loc = fakeLocation({ hash: "#/cambiar-password" })
    vi.stubGlobal("location", loc)
    const client = clienteQueResponde(403, { code: "PASSWORD_CHANGE_REQUIRED", message: MENSAJE })

    await client.get("/").catch(() => {})

    expect(loc.reload).not.toHaveBeenCalled()
  })

  it("un 403 común (permiso) no navega a ningún lado (control)", async () => {
    const client = clienteQueResponde(403, { message: "No autorizado para esta acción" })

    const err = await client.get("/").catch((e) => e)

    expect(loc.assign).not.toHaveBeenCalled()
    expect(err.message).toBe("No autorizado para esta acción")
  })
})
