import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@context/AuthContext"
import { useTheme } from "@context/ThemeContext"
import { showToast } from "@utils/toast"
import BrandLogo from "@components/BrandLogo"
import Button from "@components/UI/Button"
import FloatingField from "@components/UI/FloatingField"

// Establecer/cambiar contraseña (rediseño Claude Design "primer ingreso"). Dos modos:
//  - mustChangePassword (primer ingreso / tras un reset): solo pide la nueva; el backend
//    no re-pide la actual porque ya se autenticó con la temporal.
//  - voluntario: pide la contraseña actual + la nueva.
const KeyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="4.5" /><path d="m10.5 12.5 8-8M16 6l2 2M19 3l2 2" /></svg>
)

const ChangePassword = () => {
  const { changePassword, mustChangePassword, logout } = useAuth()
  const { isDarkMode } = useTheme()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState("")
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm()
  const newPassword = watch("newPassword")

  const onSubmit = async ({ currentPassword, newPassword }) => {
    setServerError("")
    try {
      await changePassword(mustChangePassword ? undefined : currentPassword, newPassword)
      if (mustChangePassword) {
        navigate("/", { replace: true })
      } else {
        showToast("success", "Contraseña actualizada")
        navigate(-1)
      }
    } catch (err) {
      setServerError(err.message || "No pudimos cambiar la contraseña")
    }
  }

  return (
    <div data-app-theme={isDarkMode ? "dark" : "light"} className="flex h-full items-center justify-center p-6" style={{ background: "var(--sidebar)", color: "var(--tx)", fontFamily: "'IBM Plex Sans',system-ui,sans-serif" }}>
      <div className="w-full" style={{ maxWidth: 408 }}>
        <div className="mb-6 flex items-center justify-center">
          <BrandLogo height={38} />
        </div>

        <div className="rounded-[14px] p-8" style={{ background: "var(--card)", border: "1px solid var(--bd)", boxShadow: "var(--elev-2)" }}>
          <div className="mb-[15px] inline-flex items-center gap-[7px] rounded-[7px] px-2.5 py-1 text-[10.5px] font-semibold" style={{ fontFamily: "'IBM Plex Mono'", letterSpacing: ".05em", color: "var(--ink-lime)", background: "color-mix(in srgb, var(--ink-lime) 12%, transparent)" }}>
            <KeyIcon /> {mustChangePassword ? "PRIMER INGRESO" : "SEGURIDAD"}
          </div>
          <h1 className="text-[21px] font-semibold" style={{ fontFamily: "'Space Grotesk'", letterSpacing: "-.01em", color: "var(--tx)" }}>
            {mustChangePassword ? "Cambiá tu contraseña temporal" : "Cambiar contraseña"}
          </h1>
          <p className="mb-[22px] mt-[7px] text-[13.5px]" style={{ color: "var(--tx-4)" }}>
            {mustChangePassword ? "Te dieron una contraseña provisoria. Elegí una propia para continuar." : "Ingresá tu contraseña actual y elegí una nueva."}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {serverError && (
              <div role="alert" className="mb-4 rounded-[9px] px-4 py-3 text-[13px]" style={{ border: "1px solid color-mix(in srgb, var(--ink-red) 40%, transparent)", background: "color-mix(in srgb, var(--ink-red) 10%, transparent)", color: "var(--ink-red)" }}>
                {serverError}
              </div>
            )}

            {!mustChangePassword && (
              <div className="mb-[14px]">
                <FloatingField
                  label="Contraseña actual"
                  type="password"
                  autoComplete="current-password"
                  required
                  error={errors.currentPassword?.message}
                  {...register("currentPassword", { required: "Ingresá tu contraseña actual" })}
                />
              </div>
            )}

            <div className="mb-[14px]">
              <FloatingField
                label="Nueva contraseña"
                type="password"
                autoComplete="new-password"
                required
                error={errors.newPassword?.message}
                {...register("newPassword", { required: "Ingresá una contraseña nueva", minLength: { value: 6, message: "Mínimo 6 caracteres" } })}
              />
            </div>

            <div className="mb-[22px]">
              <FloatingField
                label="Repetir contraseña"
                type="password"
                autoComplete="new-password"
                required
                error={errors.confirmPassword?.message}
                {...register("confirmPassword", { required: "Repetí la contraseña", validate: (v) => v === newPassword || "Las contraseñas no coinciden" })}
              />
            </div>

            <Button type="submit" variant="lime" disabled={isSubmitting} className="w-full text-[15px]" style={{ background: "#C4ED2B", color: "#0A0C0D", opacity: isSubmitting ? 0.6 : 1 }}>
              {isSubmitting ? "Guardando…" : mustChangePassword ? "Guardar y entrar" : "Guardar"}
            </Button>
            <button type="button" onClick={mustChangePassword ? logout : () => navigate(-1)} className="mt-3 w-full text-center text-[13px]" style={{ color: "var(--tx-5)", background: "none", border: "none", cursor: "pointer" }}>
              {mustChangePassword ? "Salir" : "Cancelar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChangePassword
