import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate, useLocation, Navigate } from "react-router-dom"
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined"
import MailOutlineIcon from "@mui/icons-material/MailOutline"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined"
import { useAuth } from "@context/AuthContext"

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white py-2.5 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"

const Login = () => {
  const { login, isAuthenticated, mustChangePassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState("")
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  const from = location.state?.from?.pathname || "/"

  // Ya logueado: no mostrar el login de nuevo.
  if (isAuthenticated) {
    return <Navigate to={mustChangePassword ? "/cambiar-password" : from} replace />
  }

  const onSubmit = async ({ email, password }) => {
    setServerError("")
    try {
      const user = await login(email, password)
      navigate(user.mustChangePassword ? "/cambiar-password" : from, { replace: true })
    } catch (err) {
      setServerError(err.message || "No pudimos iniciar sesión")
    }
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950">
      {/* Panel de marca — solo desktop */}
      <aside className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-slate-900 p-12 text-white">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-500 text-slate-900">
            <LocalShippingOutlinedIcon fontSize="medium" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">ControlCubiertas</span>
        </div>
        <div className="max-w-md">
          <h1 className="font-display text-4xl font-bold leading-tight">
            El control de tu flota, bajo control.
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            Cubiertas, recapados y vehículos. Cada movimiento registrado, cada cubierta trazada.
          </p>
        </div>
        <p className="text-sm text-slate-500">© {new Date().getFullYear()} ControlCubiertas</p>
      </aside>

      {/* Panel de formulario */}
      <main className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          {/* Marca compacta — solo mobile */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-500 text-slate-900">
              <LocalShippingOutlinedIcon />
            </span>
            <span className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              ControlCubiertas
            </span>
          </div>

          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Iniciar sesión</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Ingresá con tu cuenta para continuar.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
            {serverError && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
              >
                {serverError}
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>
              <div className="relative">
                <MailOutlineIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fontSize="small" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="vos@empresa.com"
                  className={`${inputClass} pl-10 pr-3`}
                  {...register("email", { required: "Ingresá tu email" })}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Contraseña
              </label>
              <div className="relative">
                <LockOutlinedIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fontSize="small" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`${inputClass} pl-10 pr-10`}
                  {...register("password", { required: "Ingresá tu contraseña" })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <VisibilityOffOutlinedIcon fontSize="small" />
                  ) : (
                    <VisibilityOutlinedIcon fontSize="small" />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-brand-500 px-4 py-2.5 font-medium text-slate-900 transition hover:bg-brand-600 focus:ring-2 focus:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Ingresando…" : "Ingresar"}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default Login
