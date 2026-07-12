import { useForm } from "react-hook-form"
import Modal from "@components/UI/Modal"
import { showToast } from "@utils/toast"
import { createUser } from "../../api/admin"

const inputClass =
  "w-full rounded-[10px] border border-(--bd) bg-(--input) px-3 py-2.5 text-sm text-(--tx) placeholder:text-(--tx-6) outline-none transition focus:border-(--ink-lime)"
const labelClass = "mb-1.5 block text-sm font-medium text-(--tx-3)"

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
          {errors.email && <p className="mt-1 text-xs text-(--ink-red)">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="u-name" className={labelClass}>Nombre <span className="text-(--tx-6)">(opcional)</span></label>
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
            className="rounded-[10px] border border-(--bd-strong) bg-(--elev) px-4 py-2.5 text-sm font-medium text-(--tx-3) transition hover:bg-(--hover)"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-[10px] bg-(--ink-lime) px-4 py-2.5 text-sm font-bold text-(--bg) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creando…" : "Crear usuario"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default UserForm
