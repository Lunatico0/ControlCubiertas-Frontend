import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined"
import { useAuth } from "@context/AuthContext"

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"

const ChangePassword = () => {
  const { changePassword, mustChangePassword, logout } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState("")
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm()

  const newPassword = watch("newPassword")

  const onSubmit = async ({ currentPassword, newPassword }) => {
    setServerError("")
    try {
      await changePassword(currentPassword, newPassword)
      navigate("/", { replace: true })
    } catch (err) {
      setServerError(err.message || "No pudimos cambiar la contraseña")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6 dark:bg-slate-950">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-500 text-slate-900">
          <LockResetOutlinedIcon />
        </span>

        <h1 className="mt-5 font-display text-2xl font-bold text-slate-900 dark:text-white">
          {mustChangePassword ? "Creá tu contraseña" : "Cambiar contraseña"}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {mustChangePassword
            ? "Es tu primer ingreso. Definí una contraseña nueva para continuar."
            : "Actualizá tu contraseña actual."}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5" noValidate>
          {serverError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
            >
              {serverError}
            </div>
          )}

          <div>
            <label htmlFor="currentPassword" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {mustChangePassword ? "Contraseña temporal" : "Contraseña actual"}
            </label>
            <input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              className={inputClass}
              {...register("currentPassword", { required: "Ingresá tu contraseña actual" })}
            />
            {errors.currentPassword && (
              <p className="mt-1 text-xs text-red-600">{errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Contraseña nueva
            </label>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              className={inputClass}
              {...register("newPassword", {
                required: "Ingresá una contraseña nueva",
                minLength: { value: 6, message: "Mínimo 6 caracteres" },
              })}
            />
            {errors.newPassword && <p className="mt-1 text-xs text-red-600">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Repetí la contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className={inputClass}
              {...register("confirmPassword", {
                required: "Repetí la contraseña",
                validate: (v) => v === newPassword || "Las contraseñas no coinciden",
              })}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-brand-500 px-4 py-2.5 font-medium text-slate-900 transition hover:bg-brand-600 focus:ring-2 focus:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Guardando…" : "Guardar y continuar"}
          </button>

          <button
            type="button"
            onClick={logout}
            className="w-full text-center text-sm text-slate-500 transition hover:text-slate-700 dark:text-slate-400"
          >
            Salir
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChangePassword
