import { useForm } from "react-hook-form"
import Modal from "@components/UI/Modal"
import { showToast } from "@utils/toast"
import { createUser } from "../../api/admin"

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
const labelClass = "mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"

// Alta de usuario del tenant. Devuelve { user, tempPassword } al padre: la password
// temporal se muestra UNA vez (el usuario nuevo entra con ella y la cambia).
const UserForm = ({ onClose, onCreated }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { role: "operator" } })

  const onSubmit = async (data) => {
    try {
      const result = await createUser(data)
      onCreated(result)
      onClose()
    } catch (err) {
      showToast("error", err.message || "No se pudo crear el usuario")
    }
  }

  return (
    <Modal title="Nuevo usuario" onClose={onClose} maxWidth="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="u-email" className={labelClass}>Email</label>
          <input
            id="u-email"
            type="email"
            autoComplete="off"
            placeholder="empleado@empresa.com"
            className={inputClass}
            {...register("email", { required: "Ingresá el email" })}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="u-name" className={labelClass}>Nombre <span className="text-slate-400">(opcional)</span></label>
          <input
            id="u-name"
            type="text"
            autoComplete="off"
            placeholder="Nombre y apellido"
            className={inputClass}
            {...register("name")}
          />
        </div>

        <div>
          <label htmlFor="u-role" className={labelClass}>Rol</label>
          <select id="u-role" className={inputClass} {...register("role")}>
            <option value="operator">Operario — solo opera la app</option>
            <option value="tenant-admin">Administrador — gestiona usuarios y empresa</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-brand-600 focus:ring-2 focus:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creando…" : "Crear usuario"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default UserForm
