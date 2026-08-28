import { useState, useEffect } from "react"
import { useNavigate, useLocation, Navigate } from "react-router-dom"
import { useAuth } from "@context/AuthContext"
import BrandLogo from "@components/BrandLogo"
import FloatingField from "@components/UI/FloatingField"
import tireOpsDark from "@/assets/TireOpsDark.svg"
import isElectron from "@utils/isElectron"
import { useTheme } from "@context/ThemeContext"

// Login del rediseño (Claude Design). Dos paneles con temas distintos, a propósito:
//
//   IZQUIERDA (marca)      → SIEMPRE oscuro. Es la pieza de identidad, con el logo y la
//                            ilustración sobre negro; en claro no se lee.
//   DERECHA (formulario)   → sigue el TEMA DEL USUARIO. Antes toda la pantalla era dark fija,
//                            así que un usuario con tema claro guardado entraba por una pantalla
//                            negra y aterrizaba en una blanca: un salto de tema en cada ingreso.
//
// Cada panel lleva su propio data-app-theme y usa TOKENS, no hex sueltos: así los campos usan el
// MISMO FloatingField que el resto de la app y resuelven sus colores contra la paleta que toque.
// Antes los inputs eran una implementación aparte (52px de alto, radio 12, padding 0 15px) contra
// los 46/10/13 de .ff-control: cuatro geometrías de input conviviendo, y el comentario de
// index.css llamaba a .ff "el patrón del login" cuando el login no lo usaba.
//
// Auth real vía useAuth().login. "¿Olvidaste tu contraseña?" deriva a pedirla al admin (no hay
// reset por email en el backend).
// Dos limas, y no son intercambiables:
//   --brand    FILL de la acción primaria. Fijo, brillante, siempre con --brand-ink encima.
//   --ink-lime TEXTO en lima. Cambia con el tema: en claro se oscurece para pasar 4.5:1.
// Usar --brand como color de texto sobre el fondo claro deja el link prácticamente invisible.
const LIME_FILL = "var(--brand)"
const LIME_TEXTO = "var(--ink-lime)"
const BAD = "var(--ink-red)"

const Login = () => {
  const { login, isAuthenticated, mustChangePassword } = useAuth()
  const { isDarkMode } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || "/"

  const [step, setStep] = useState("login") // "login" | "forgot"
  const [email, setEmail] = useState("")
  const [pwd, setPwd] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [err, setErr] = useState({})
  const [credErr, setCredErr] = useState("")
  // Mensaje de un cierre de sesión FORZADO (ej. tenant eliminado/suspendido) que dejó forceLogout
  // en sessionStorage. Va en un state APARTE de credErr a propósito: el onChange del email/pwd
  // limpia credErr (y el AUTOFILL del navegador lo dispara al montar), pero este mensaje debe
  // sobrevivir hasta que el usuario reintente loguear. Se lee en el initializer (StrictMode-safe:
  // solo lee, no borra) y se limpia en doLogin.
  const [logoutMsg, setLogoutMsg] = useState(() => {
    try { return sessionStorage.getItem("cc_logout_msg") || "" } catch { return "" }
  })
  const [loggingIn, setLoggingIn] = useState(false)
  const [ver, setVer] = useState("")

  useEffect(() => {
    window.electronAPI?.getVersion?.().then((v) => setVer(v || "")).catch(() => {})
  }, [])

  if (isAuthenticated) return <Navigate to={mustChangePassword ? "/cambiar-password" : from} replace />

  const doLogin = async () => {
    const e = {}
    const em = email.trim().toLowerCase()
    if (!em) e.email = "Ingresá tu email."
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) e.email = "Ese email no parece válido."
    if (!pwd) e.pwd = "Ingresá tu contraseña."
    if (Object.keys(e).length) { setErr(e); return }
    // Limpiar el mensaje de cierre forzado: el usuario ya lo vio y va a reintentar.
    try { sessionStorage.removeItem("cc_logout_msg") } catch { /* noop */ }
    setErr({}); setCredErr(""); setLogoutMsg(""); setLoggingIn(true)
    try {
      const user = await login(em, pwd)
      navigate(user.mustChangePassword ? "/cambiar-password" : from, { replace: true })
    } catch (error) {
      setCredErr(error?.message || "Email o contraseña incorrectos. Revisá los datos e intentá de nuevo.")
      setLoggingIn(false)
    }
  }
  const onKey = (ev) => { if (ev.key === "Enter") doLogin() }

  return (
    <div data-app-theme={isDarkMode ? "dark" : "light"} style={{ width: "100%", height: "100%", display: "flex", background: "var(--bg)", color: "var(--tx)", overflow: "hidden", textAlign: "left", fontFamily: "var(--font-sans)" }}>
      {/* Panel de marca — oculto en pantallas chicas */}
      <div data-app-theme="dark" className="hidden lg:flex" style={{ flex: 1.1, position: "relative", overflow: "hidden", background: "var(--sidebar)", color: "var(--tx)", borderRight: "1px solid var(--bd-faint)", flexDirection: "column", padding: "44px 48px" }}>
        <div style={{ position: "relative", zIndex: 1 }}><BrandLogo variant="dark" height={50} /></div>
        <img src={tireOpsDark} alt="" style={{ position: "absolute", right: -180, top: "50%", transform: "translateY(-50%)", width: 640, height: "auto", opacity: 0.05, pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 420 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, lineHeight: 1.2, letterSpacing: "-.01em" }}>Cada cubierta,<br />bajo control.</div>
          <div style={{ fontSize: "14.5px", color: "var(--tx-4)", lineHeight: 1.6, marginTop: 12 }}>Trazabilidad completa del ciclo de vida: alta, montaje, recapados y descarte, con comprobante de cada movimiento.</div>
          <div style={{ display: "flex", gap: 18, marginTop: 26 }}>
            {[["Inventario vivo", "var(--brand)"], ["Recapados", "var(--st-teal)"], ["Flota completa", "var(--st-blue)"]].map(([label, dot]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "12.5px", color: "var(--tx-5)" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot }} />{label}
              </div>
            ))}
          </div>
        </div>
        {isElectron() && <div style={{ position: "relative", zIndex: 1, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--tx-7)" }}>{ver ? `v${ver} · ` : ""}TireOps</div>}
      </div>

      {/* Panel de formulario */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto", padding: "40px 24px" }}>
        <div style={{ width: 400, maxWidth: "100%", margin: "auto" }}>
          {step === "login" ? (
            <>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700 }}>Iniciar sesión</h1>
                <p style={{ margin: "7px 0 0 0", fontSize: 14, color: "var(--tx-4)" }}>Ingresá con tu cuenta de la empresa.</p>
              </div>

              {(credErr || logoutMsg) && (
                <div role="alert" style={{ display: "flex", gap: 10, padding: "12px 14px", border: "1px solid color-mix(in srgb, var(--ink-red) 40%, transparent)", borderRadius: "var(--r-md)", background: "color-mix(in srgb, var(--ink-red) 8%, transparent)", marginBottom: 18 }}>
                  <span style={{ color: BAD, flex: "none", marginTop: 1 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><circle cx="12" cy="12" r="9.2" /><path d="M12 8v5M12 16h.01" /></svg>
                  </span>
                  <span style={{ fontSize: "12.5px", color: "var(--ink-red)", lineHeight: 1.5 }}>{credErr || logoutMsg}</span>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <FloatingField
                  label="Email"
                  type="text"
                  autoComplete="username"
                  error={err.email || false}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErr((p) => ({ ...p, email: null })); setCredErr("") }}
                  onKeyDown={onKey}
                />

                <div>
                  <FloatingField
                    label="Contraseña"
                    type={showPwd ? "text" : "password"}
                    autoComplete="current-password"
                    error={err.pwd || false}
                    value={pwd}
                    onChange={(e) => { setPwd(e.target.value); setErr((p) => ({ ...p, pwd: null })); setCredErr("") }}
                    onKeyDown={onKey}
                    className="pr-12"
                    rightAddon={
                      <button type="button" onClick={() => setShowPwd((v) => !v)} title={showPwd ? "Ocultar" : "Mostrar"} aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"} style={{ position: "absolute", right: 4, top: 4, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--tx-5)", cursor: "pointer", borderRadius: "var(--r-md)", border: "none", background: "transparent" }}>
                      {showPwd ? (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" /><circle cx="12" cy="12" r="2.8" /><path d="M4 4l16 16" /></svg>
                      ) : (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" /><circle cx="12" cy="12" r="2.8" /></svg>
                      )}
                      </button>
                    }
                  />
                  {err.pwd && <div style={{ marginTop: 6, fontSize: 12, color: BAD }}>{err.pwd}</div>}
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 7 }}>
                    <button type="button" onClick={() => setStep("forgot")} style={{ fontSize: 12, color: LIME_TEXTO, cursor: "pointer", border: "none", background: "transparent", padding: 0, fontFamily: "inherit" }}>¿Olvidaste tu contraseña?</button>
                  </div>
                </div>

                <button onClick={doLogin} disabled={loggingIn} style={{ width: "100%", height: 50, border: "none", background: LIME_FILL, color: "var(--brand-ink)", borderRadius: "var(--r-lg)", fontSize: 15, fontWeight: 700, fontFamily: "var(--font-sans)", cursor: loggingIn ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 4, opacity: loggingIn ? 0.75 : 1 }}>
                  {loggingIn && <span className="animate-spin" style={{ width: 17, height: 17, borderRadius: "50%", border: "2.5px solid color-mix(in srgb, var(--brand-ink) 25%, transparent)", borderTopColor: "var(--brand-ink)" }} />}
                  {loggingIn ? "Ingresando…" : "Ingresar"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 20 }}>
                <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700 }}>Recuperar acceso</h1>
                <p style={{ margin: "7px 0 0 0", fontSize: "13.5px", color: "var(--tx-4)", lineHeight: 1.6 }}>Las contraseñas las gestiona el administrador de tu empresa.</p>
              </div>
              <div style={{ display: "flex", gap: 10, padding: "13px 15px", border: "1px solid var(--bd-strong)", borderRadius: "var(--r-md)", background: "var(--input)", marginBottom: 18 }}>
                <span style={{ color: "var(--ink-blue)", flex: "none", marginTop: 1 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8h.01" /></svg>
                </span>
                <span style={{ fontSize: 13, color: "var(--tx-3)", lineHeight: 1.6 }}>Pedile a tu administrador que te genere una nueva desde <b style={{ color: "var(--tx-2)" }}>Usuarios</b>. Te va a dar una contraseña temporal para tu próximo ingreso.</span>
              </div>
              <button onClick={() => setStep("login")} style={{ width: "100%", height: 48, border: "1px solid var(--bd-strong)", background: "transparent", color: "var(--tx-2)", borderRadius: "var(--r-md)", fontSize: "13.5px", fontWeight: 600, fontFamily: "var(--font-sans)", cursor: "pointer" }}>Volver a iniciar sesión</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login
