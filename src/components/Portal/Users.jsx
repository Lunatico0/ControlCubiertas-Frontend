import { useState, useEffect, useCallback } from "react"
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded"
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded"
import { showToast, showConfirm } from "@utils/toast"
import Modal from "@components/UI/Modal"
import { listUsers, setUserStatus } from "../../api/admin"
import UserForm from "./UserForm"

const roleLabel = { "tenant-admin": "Administrador", operator: "Operario" }

const RoleBadge = ({ role }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
      role === "tenant-admin"
        ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
    }`}
  >
    {roleLabel[role] || role}
  </span>
)

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 text-xs font-medium ${
      status === "active" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
    }`}
  >
    <span className={`h-1.5 w-1.5 rounded-full ${status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
    {status === "active" ? "Activo" : "Inactivo"}
  </span>
)

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [tempCred, setTempCred] = useState(null) // { user, tempPassword } recién creada

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

  useEffect(() => {
    load()
  }, [load])

  const toggleStatus = async (u) => {
    const next = u.status === "active" ? "inactive" : "active"
    const ok = await showConfirm({
      title: next === "inactive" ? "¿Desactivar usuario?" : "¿Activar usuario?",
      text:
        next === "inactive"
          ? `${u.email} no podrá ingresar hasta que lo reactives.`
          : `${u.email} volverá a poder ingresar.`,
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
    try {
      await navigator.clipboard.writeText(tempCred.tempPassword)
      showToast("success", "Contraseña copiada")
    } catch {
      showToast("error", "No se pudo copiar")
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Usuarios</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Las personas que pueden ingresar a tu empresa.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-brand-600 focus:ring-2 focus:ring-brand-500/40"
        >
          <PersonAddAltRoundedIcon fontSize="small" />
          Nuevo usuario
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Cargando usuarios…</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Todavía no hay usuarios.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u._id} className="text-slate-700 dark:text-slate-200">
                  <td className="px-4 py-3 font-medium">{u.email}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{u.name || "—"}</td>
                  <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleStatus(u)}
                      className="text-xs font-medium text-slate-500 transition hover:text-brand-600 dark:text-slate-400"
                    >
                      {u.status === "active" ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && <UserForm onClose={() => setShowForm(false)} onCreated={onCreated} />}

      {tempCred && (
        <Modal title="Usuario creado" onClose={() => setTempCred(null)} maxWidth="md">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Compartile estos datos a <span className="font-medium">{tempCred.user.email}</span>. La contraseña es
            temporal: se la pedirá cambiar en el primer ingreso.
          </p>
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700/50 dark:bg-amber-950/30">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
              Contraseña temporal — no se vuelve a mostrar
            </p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <code className="font-mono text-lg font-semibold text-slate-900 dark:text-white">
                {tempCred.tempPassword}
              </code>
              <button
                onClick={copyPassword}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-800 transition hover:bg-amber-100 dark:border-amber-700/50 dark:text-amber-300 dark:hover:bg-amber-900/30"
              >
                <ContentCopyRoundedIcon fontSize="inherit" />
                Copiar
              </button>
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button
              onClick={() => setTempCred(null)}
              className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-brand-600"
            >
              Listo
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Users
