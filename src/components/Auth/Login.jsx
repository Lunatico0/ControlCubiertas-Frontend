import { useState, useEffect } from "react"
import { useNavigate, useLocation, Navigate } from "react-router-dom"
import { useAuth } from "@context/AuthContext"
import BrandLogo from "@components/BrandLogo"
import tireOpsDark from "@/assets/TireOpsDark.svg"
import isElectron from "@utils/isElectron"

// Login del rediseño (Claude Design). Pantalla DARK FIJA (no sigue el toggle de tema): usa los
// hex de la paleta TireOps directo, no los tokens var(--x). Auth real via useAuth().login.
// Inputs con label flotante (el label hace de placeholder y flota al enfocar/completar).
// "¿Olvidaste tu contraseña?" deriva a pedirla al admin (no hay reset por email en el backend).
const LIME = "#C4ED2B"
const BORDER = "#2A3033"
const BAD = "#F0716A"

const inputStyle = (bad, focused) => ({
  width: "100%", height: 52, padding: "0 15px",
  border: `1.5px solid ${bad ? BAD : focused ? LIME : BORDER}`, borderRadius: 12,
  background: "#0C0E0F", color: "#fff", fontSize: "14.5px", fontFamily: "'IBM Plex Sans'", outline: "none",
})

// Estilo del label flotante: abajo (hace de placeholder) cuando el campo está vacío y sin foco;
// arriba, chico y "notcheando" el borde (bg = color del input) cuando hay foco o valor.
const floatLabel = (focused, val, bad) => {
  const up = focused || !!val
  return {
    position: "absolute", left: 11, top: up ? 0 : 26, transform: "translateY(-50%)",
    fontSize: up ? "11.5px" : "14.5px",
    color: bad ? BAD : focused ? LIME : "#8B9197",
    background: up ? "#0C0E0F" : "transparent",
    padding: "0 5px", pointerEvents: "none", transition: "all .16s ease",
    fontWeight: up ? 600 : 400, fontFamily: "'IBM Plex Sans'",
  }
}

const Login = () => {
  const { login, isAuthenticated, mustChangePassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || "/"

  const [step, setStep] = useState("login") // "login" | "forgot"
  const [email, setEmail] = useState("")
  const [pwd, setPwd] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [fEmail, setFEmail] = useState(false)
  const [fPwd, setFPwd] = useState(false)
  const [err, setErr] = useState({})
  const [credErr, setCredErr] = useState("")
  const [loggingIn, setLoggingIn] = useState(false)
  const [ver, setVer] = useState("")

  useEffect(() => { window.electronAPI?.getVersion?.().then((v) => setVer(v || "")).catch(() => {}) }, [])

  if (isAuthenticated) return <Navigate to={mustChangePassword ? "/cambiar-password" : from} replace />

  const doLogin = async () => {
    const e = {}
    const em = email.trim().toLowerCase()
    if (!em) e.email = "Ingresá tu email."
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) e.email = "Ese email no parece válido."
    if (!pwd) e.pwd = "Ingresá tu contraseña."
    if (Object.keys(e).length) { setErr(e); return }
    setErr({}); setCredErr(""); setLoggingIn(true)
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
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#0A0C0D", color: "#fff", overflow: "hidden", textAlign: "left", fontFamily: "'IBM Plex Sans',system-ui,sans-serif" }}>
      {/* Panel de marca — oculto en pantallas chicas */}
      <div className="hidden lg:flex" style={{ flex: 1.1, position: "relative", overflow: "hidden", background: "#070809", borderRight: "1px solid #181C1E", flexDirection: "column", padding: "44px 48px" }}>
        <div style={{ position: "relative", zIndex: 1 }}><BrandLogo variant="dark" height={50} /></div>
        <img src={tireOpsDark} alt="" style={{ position: "absolute", right: -180, top: "50%", transform: "translateY(-50%)", width: 640, height: "auto", opacity: 0.05, pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 420 }}>
          <div style={{ fontFamily: "'Space Grotesk'", fontSize: 30, fontWeight: 700, lineHeight: 1.2, letterSpacing: "-.01em" }}>Cada cubierta,<br />bajo control.</div>
          <div style={{ fontSize: "14.5px", color: "#8B9197", lineHeight: 1.6, marginTop: 12 }}>Trazabilidad completa del ciclo de vida: alta, montaje, recapados y descarte, con comprobante de cada movimiento.</div>
          <div style={{ display: "flex", gap: 18, marginTop: 26 }}>
            {[["Inventario vivo", "#C4ED2B"], ["Recapados", "#1FD0B4"], ["Flota completa", "#6E97F5"]].map(([label, dot]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "12.5px", color: "#7B8186" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot }} />{label}
              </div>
            ))}
          </div>
        </div>
        {isElectron() && <div style={{ position: "relative", zIndex: 1, fontFamily: "'IBM Plex Mono'", fontSize: 11, color: "#5E646A" }}>{ver ? `v${ver} · ` : ""}TireOps</div>}
      </div>

      {/* Panel de formulario */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto", padding: "40px 24px" }}>
        <div style={{ width: 400, maxWidth: "100%", margin: "auto" }}>
          {step === "login" ? (
            <>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ margin: 0, fontFamily: "'Space Grotesk'", fontSize: 26, fontWeight: 700 }}>Iniciar sesión</h1>
                <p style={{ margin: "7px 0 0 0", fontSize: 14, color: "#8B9197" }}>Ingresá con tu cuenta de la empresa.</p>
              </div>

              {credErr && (
                <div role="alert" style={{ display: "flex", gap: 10, padding: "12px 14px", border: "1px solid rgba(240,86,74,.4)", borderRadius: 11, background: "rgba(240,86,74,.08)", marginBottom: 18 }}>
                  <span style={{ color: BAD, flex: "none", marginTop: 1 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9.2" /><path d="M12 8v5M12 16h.01" /></svg>
                  </span>
                  <span style={{ fontSize: "12.5px", color: "#F0A9A4", lineHeight: 1.5 }}>{credErr}</span>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <div style={{ position: "relative" }}>
                    <input aria-label="Email" value={email} onChange={(e) => { setEmail(e.target.value); setErr((p) => ({ ...p, email: null })); setCredErr("") }} onKeyDown={onKey} onFocus={() => setFEmail(true)} onBlur={() => setFEmail(false)} style={inputStyle(!!err.email, fEmail)} />
                    <span style={floatLabel(fEmail, email, !!err.email)}>Email</span>
                  </div>
                  {err.email && <div style={{ marginTop: 6, fontSize: 12, color: BAD }}>{err.email}</div>}
                </div>

                <div>
                  <div style={{ position: "relative" }}>
                    <input aria-label="Contraseña" value={pwd} onChange={(e) => { setPwd(e.target.value); setErr((p) => ({ ...p, pwd: null })); setCredErr("") }} onKeyDown={onKey} onFocus={() => setFPwd(true)} onBlur={() => setFPwd(false)} type={showPwd ? "text" : "password"} style={{ ...inputStyle(!!err.pwd, fPwd), padding: "0 48px 0 15px" }} />
                    <span style={floatLabel(fPwd, pwd, !!err.pwd)}>Contraseña</span>
                    <span onClick={() => setShowPwd((v) => !v)} title={showPwd ? "Ocultar" : "Mostrar"} style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", color: "#7B8186", cursor: "pointer", borderRadius: 9 }}>
                      {showPwd ? (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" /><circle cx="12" cy="12" r="2.8" /><path d="M4 4l16 16" /></svg>
                      ) : (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" /><circle cx="12" cy="12" r="2.8" /></svg>
                      )}
                    </span>
                  </div>
                  {err.pwd && <div style={{ marginTop: 6, fontSize: 12, color: BAD }}>{err.pwd}</div>}
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 7 }}>
                    <span onClick={() => setStep("forgot")} style={{ fontSize: 12, color: LIME, cursor: "pointer" }}>¿Olvidaste tu contraseña?</span>
                  </div>
                </div>

                <button onClick={doLogin} disabled={loggingIn} style={{ width: "100%", height: 50, border: "none", background: LIME, color: "#0A0C0D", borderRadius: 13, fontSize: 15, fontWeight: 700, fontFamily: "'IBM Plex Sans'", cursor: loggingIn ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 4, opacity: loggingIn ? 0.75 : 1 }}>
                  {loggingIn && <span className="animate-spin" style={{ width: 17, height: 17, borderRadius: "50%", border: "2.5px solid rgba(10,12,13,.25)", borderTopColor: "#0A0C0D" }} />}
                  {loggingIn ? "Ingresando…" : "Ingresar"}
                </button>
              </div>

              <div style={{ marginTop: 24, padding: "13px 15px", border: "1px dashed #2A3033", borderRadius: 11, fontSize: 12, color: "#7B8186", lineHeight: 1.6 }}>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: "9.5px", fontWeight: 600, letterSpacing: ".08em", color: "#9D90F5", background: "rgba(157,144,245,.16)", padding: "2px 8px", borderRadius: 20, marginRight: 8 }}>DEMO · ANDES CARGO</span>
                  admin@andescargo.com / operario@andescargo.com · contraseña: <span style={{ fontFamily: "'IBM Plex Mono'", color: "#9AA0A4" }}>tireops</span>
                </div>
                <div style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7B8186" strokeWidth="1.9" strokeLinecap="round" style={{ flex: "none", marginTop: 2 }}><circle cx="12" cy="12" r="9.2" /><path d="M12 7.5V12l3 2" /></svg>
                  <span>Entorno de prueba: los datos de Andes Cargo se restauran cada 48 horas. Lo que cargues no se guarda en la base: queda solo en este equipo y se borra a las 48 hs de creado.</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 20 }}>
                <h1 style={{ margin: 0, fontFamily: "'Space Grotesk'", fontSize: 24, fontWeight: 700 }}>Recuperar acceso</h1>
                <p style={{ margin: "7px 0 0 0", fontSize: "13.5px", color: "#8B9197", lineHeight: 1.6 }}>Las contraseñas las gestiona el administrador de tu empresa.</p>
              </div>
              <div style={{ display: "flex", gap: 10, padding: "13px 15px", border: "1px solid #2A3033", borderRadius: 11, background: "#0C0E0F", marginBottom: 18 }}>
                <span style={{ color: "#6E97F5", flex: "none", marginTop: 1 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8h.01" /></svg>
                </span>
                <span style={{ fontSize: 13, color: "#9AA0A4", lineHeight: 1.6 }}>Pedile a tu administrador que te genere una nueva desde <b style={{ color: "#D6D9D5" }}>Usuarios</b>. Te va a dar una contraseña temporal para tu próximo ingreso.</span>
              </div>
              <button onClick={() => setStep("login")} style={{ width: "100%", height: 48, border: "1px solid #2A3033", background: "transparent", color: "#D6D9D5", borderRadius: 12, fontSize: "13.5px", fontWeight: 600, fontFamily: "'IBM Plex Sans'", cursor: "pointer" }}>Volver a iniciar sesión</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login
