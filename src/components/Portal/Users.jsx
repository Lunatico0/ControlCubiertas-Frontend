import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded"
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded"
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded"
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded"
import { showToast, showConfirm } from "@utils/toast"
import { useAuth } from "@context/AuthContext"
import Modal from "@components/UI/Modal"
import { listUsers, setUserStatus, resetPassword } from "../../api/admin"
import UserForm from "./UserForm"

const roleLabel = { "tenant-admin": "Administrador", operator: "Operario" }
const initialsOf = (u) => (u.name || u.email || "?").slice(0, 2).toUpperCase()
const COLS = "2.2fr 1fr 0.9fr 1.3fr"

const Users = () => {
  const { user: me } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [tempCred, setTempCred] = useState(null)
  const [resetTarget, setResetTarget] = useState(null) // { user, tempPassword } tras un reset
  const [resetting, setResetting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setUsers(await listUsers())
    } catch (err) {
      showToast("error", err.message || "No se pudieron cargar los usuarios")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const toggleStatus = async (u) => {
    const next = u.status === "active" ? "inactive" : "active"
    const ok = await showConfirm({
      title: next === "inactive" ? "¿Desactivar usuario?" : "¿Activar usuario?",
      text: next === "inactive" ? `${u.email} no podrá ingresar hasta que lo reactives.` : `${u.email} volverá a poder ingresar.`,
      confirmButtonText: next === "inactive" ? "Sí, desactivar" : "Sí, activar",
    })
    if (!ok) return
    try {
      const updated = await setUserStatus(u._id, next)
      setUsers((prev) => prev.map((x) => (x._id === updated._id ? updated : x)))
      showToast("success", "Estado actualizado")
    } catch (err) {
      showToast("error", err.message || "No se pudo cambiar el estado")
    }
  }

  const onCreated = ({ user, tempPassword }) => {
    setUsers((prev) => [...prev, user])
    setTempCred({ user, tempPassword })
    showToast("success", "Usuario creado")
  }

  const copyPassword = async () => {
    try { await navigator.clipboard.writeText(tempCred.tempPassword); showToast("success", "Contraseña copiada") }
    catch { showToast("error", "No se pudo copiar") }
  }

  // Reset por admin: genera una temporal y la muestra (una vez). Al ingresar con ella, el
  // usuario cae en el flujo de primer ingreso (mustChangePassword) y define una nueva.
  const doReset = async (u) => {
    setResetting(true)
    try {
      const { tempPassword } = await resetPassword(u._id)
      setResetTarget({ user: u, tempPassword })
    } catch (err) {
      showToast("error", err.message || "No se pudo restablecer la contraseña")
    } finally {
      setResetting(false)
    }
  }
  const regenReset = async () => {
    try {
      const { tempPassword } = await resetPassword(resetTarget.user._id)
      setResetTarget((p) => ({ ...p, tempPassword }))
      showToast("info", "Se generó otra contraseña temporal")
    } catch (err) {
      showToast("error", err.message || "No se pudo regenerar")
    }
  }
  const copyReset = async () => {
    try { await navigator.clipboard.writeText(resetTarget.tempPassword); showToast("success", "Contraseña copiada") }
    catch { showToast("error", "No se pudo copiar") }
  }

  return (
    <div style={{ maxWidth: 1040 }}>
      <div className="mb-[22px] flex items-start gap-5">
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-[-.02em]" style={{ color: "var(--tx)", fontFamily: "'Space Grotesk'" }}>Usuarios</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--tx-4)" }}>Quién accede a TireOps</p>
        </div>
        <button onClick={() => setShowForm(true)} className="ml-auto inline-flex items-center gap-2 rounded-[10px] px-[17px] py-[11px] text-sm font-bold"
          style={{ background: "var(--ink-lime)", color: "var(--bg)" }}>
          <PersonAddAltRoundedIcon sx={{ fontSize: 17 }} /> Crear usuario
        </button>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: "var(--tx-5)" }}>Cargando usuarios…</p>
      ) : users.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--tx-5)" }}>Todavía no hay usuarios.</p>
      ) : (
        <div className="overflow-hidden rounded-[14px]" style={{ background: "var(--card)", border: "1px solid var(--bd)" }}>
          <div className="grid gap-3 px-5 py-3 text-[10.5px] font-semibold uppercase tracking-wider" style={{ gridTemplateColumns: COLS, background: "var(--elev)", borderBottom: "1px solid var(--bd)", fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>
            <div>Usuario</div><div>Rol</div><div>Estado</div><div className="text-right">Acciones</div>
          </div>
          {users.map((u) => {
            const isAdmin = u.role === "tenant-admin"
            const active = u.status === "active"
            const isYou = me && (u._id === me._id || u.email === me.email)
            return (
              <div key={u._id} className="grid items-center gap-3 px-5 py-3.5" style={{ gridTemplateColumns: COLS, borderBottom: "1px solid var(--bd-faint)", opacity: active ? 1 : 0.6 }}>
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex flex-none items-center justify-center rounded-[9px] text-xs font-bold" style={{ width: 36, height: 36, fontFamily: "'Space Grotesk'", background: isAdmin ? "color-mix(in srgb, var(--ink-lime) 14%, transparent)" : "var(--bd-strong)", color: isAdmin ? "var(--ink-lime)" : "var(--tx-2)" }}>{initialsOf(u)}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-[7px] text-[13.5px] font-semibold" style={{ color: "var(--tx)" }}>
                      {u.name || "—"}
                      {isYou && <span className="rounded-full px-[7px] py-px text-[9.5px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--ink-lime)", background: "color-mix(in srgb, var(--ink-lime) 13%, transparent)" }}>VOS</span>}
                    </div>
                    <div className="truncate text-[12px]" style={{ color: "var(--tx-5)" }}>{u.email}</div>
                  </div>
                </div>
                <div>
                  <span className="inline-flex items-center rounded-full px-[11px] py-[3px] text-[11.5px] font-semibold" style={{ color: isAdmin ? "var(--ink-lime)" : "var(--tx-3)", background: isAdmin ? "color-mix(in srgb, var(--ink-lime) 13%, transparent)" : "var(--bd-strong)" }}>{roleLabel[u.role] || u.role}</span>
                </div>
                <div>
                  <span className="inline-flex items-center gap-[7px] text-[12px] font-medium" style={{ color: active ? "var(--ink-teal)" : "var(--tx-5)" }}>
                    <span className="rounded-full" style={{ width: 7, height: 7, background: active ? "var(--ink-teal)" : "var(--tx-6)" }} />
                    {active ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => (isYou ? navigate("/cambiar-password") : doReset(u))} disabled={!isYou && resetting}
                    title={isYou ? "Cambiar mi contraseña" : "Restablecer contraseña"}
                    className="inline-flex h-[32px] w-[32px] flex-none items-center justify-center rounded-lg" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx-3)", cursor: "pointer" }}>
                    <LockResetRoundedIcon sx={{ fontSize: 16 }} />
                  </button>
                  <button onClick={() => toggleStatus(u)} disabled={isYou} title={isYou ? "No podés cambiar tu propio estado" : ""}
                    className="rounded-lg px-3 py-[7px] text-[12px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: active ? "var(--ink-red)" : "var(--ink-teal)", opacity: isYou ? 0.4 : 1, cursor: isYou ? "not-allowed" : "pointer" }}>
                    {active ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && <UserForm onClose={() => setShowForm(false)} onCreated={onCreated} />}

      {tempCred && (
        <Modal title="Usuario creado" onClose={() => setTempCred(null)} maxWidth="md">
          <p className="text-sm" style={{ color: "var(--tx-3)" }}>
            Compartile estos datos a <span className="font-medium" style={{ color: "var(--tx)" }}>{tempCred.user.email}</span>. La contraseña es temporal: se la pedirá cambiar en el primer ingreso.
          </p>
          <div className="mt-4 rounded-lg p-4" style={{ border: "1px solid color-mix(in srgb, var(--ink-orange) 35%, transparent)", background: "color-mix(in srgb, var(--ink-orange) 10%, transparent)" }}>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--ink-orange)" }}>Contraseña temporal — no se vuelve a mostrar</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <code className="font-mono text-lg font-semibold" style={{ color: "var(--tx)" }}>{tempCred.tempPassword}</code>
              <button onClick={copyPassword} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium" style={{ border: "1px solid color-mix(in srgb, var(--ink-orange) 40%, transparent)", color: "var(--ink-orange)" }}>
                <ContentCopyRoundedIcon fontSize="inherit" /> Copiar
              </button>
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button onClick={() => setTempCred(null)} className="rounded-lg px-4 py-2.5 text-sm font-medium" style={{ background: "var(--ink-lime)", color: "var(--bg)" }}>Listo</button>
          </div>
        </Modal>
      )}

      {resetTarget && (
        <Modal title="Restablecer contraseña" onClose={() => setResetTarget(null)} maxWidth="md">
          <p className="text-sm" style={{ color: "var(--tx-3)" }}>
            Contraseña temporal para <span className="font-medium" style={{ color: "var(--tx)" }}>{resetTarget.user.name || resetTarget.user.email}</span>. Pasásela al usuario: al ingresar, el sistema le pedirá definir una nueva y segura.
          </p>
          <div className="mt-4 rounded-lg p-4" style={{ border: "1px solid color-mix(in srgb, var(--ink-orange) 35%, transparent)", background: "color-mix(in srgb, var(--ink-orange) 10%, transparent)" }}>
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--ink-orange)" }}>Contraseña temporal — se muestra una sola vez</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <code className="font-mono text-lg font-semibold" style={{ color: "var(--tx)" }}>{resetTarget.tempPassword}</code>
              <div className="flex flex-none gap-2">
                <button onClick={regenReset} title="Generar otra" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium" style={{ border: "1px solid var(--bd-strong)", color: "var(--tx-3)" }}>
                  <RefreshRoundedIcon fontSize="inherit" /> Otra
                </button>
                <button onClick={copyReset} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium" style={{ border: "1px solid color-mix(in srgb, var(--ink-orange) 40%, transparent)", color: "var(--ink-orange)" }}>
                  <ContentCopyRoundedIcon fontSize="inherit" /> Copiar
                </button>
              </div>
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button onClick={() => setResetTarget(null)} className="rounded-lg px-4 py-2.5 text-sm font-medium" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx-2)" }}>Cancelar</button>
            <button onClick={async () => { await copyReset(); setResetTarget(null) }} className="rounded-lg px-4 py-2.5 text-sm font-medium" style={{ background: "var(--ink-lime)", color: "var(--bg)" }}>Copiar y listo</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Users
