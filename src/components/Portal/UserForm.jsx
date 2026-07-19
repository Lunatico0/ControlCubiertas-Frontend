import { useState } from "react"
import { useForm } from "react-hook-form"
import { showToast } from "@utils/toast"
import { useModalEscape } from "@hooks/useModalStack.js"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import { createUser, updateUser } from "../../api/admin"

// Roles como cards seleccionables (ceñido al diseño Panel Admin). Los títulos siguen la
// nomenclatura del resto del panel (Operario / Administrador); la descripción es la del diseño.
const ROLES = [
  { value: "operator", title: "Operario", desc: "Usa la app día a día" },
  { value: "tenant-admin", title: "Administrador", desc: "Todo + este panel" },
]

// Alta / edición de usuario del tenant (modal propio, ceñido a Panel Admin.dc.html).
// - SIN `user`: alta. Devuelve { user, tempPassword } vía onCreated (la temporal se muestra UNA vez).
// - CON `user`: edición de name + role. El email es el identificador → NO se edita (readonly).
//   Devuelve el usuario actualizado vía onSaved. El guard de auto-degradación se valida en backend.
const UserForm = ({ user, onClose, onCreated, onSaved }) => {
  const isEdit = Boolean(user)
  const [role, setRole] = useState(isEdit ? user.role : "operator")
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: isEdit ? user.email : "", name: isEdit ? user.name || "" : "" } })

  useModalEscape(onClose)

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        const updated = await updateUser(user._id, { name: data.name, role })
        onSaved(updated)
      } else {
        const result = await createUser({ email: data.email, name: data.name, role })
        onCreated(result)
      }
      onClose()
    } catch (err) {
      showToast("error", err.message || (isEdit ? "No se pudo actualizar el usuario" : "No se pudo crear el usuario"))
    }
  }

  const labelCls = "mb-[7px] block text-[12px] font-semibold"
  const inputCls = "w-full rounded-[9px] px-[13px] py-[11px] text-[14px] outline-none"
  const inputStyle = { border: "1px solid var(--bd-strong)", background: "var(--input)", color: "var(--tx)", fontFamily: "'IBM Plex Sans'" }
  const onFocus = (e) => (e.target.style.borderColor = "var(--ink-lime)")
  const onBlur = (e) => (e.target.style.borderColor = "var(--bd-strong)")

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(4,5,6,.66)" }}
      role="dialog"
      aria-modal="true"
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="w-full max-w-[448px] overflow-hidden rounded-[14px]"
        style={{ background: "var(--card)", border: "1px solid var(--bd-strong)", boxShadow: "0 24px 64px rgba(0,0,0,.6)" }}
      >
        {/* Header */}
        <div className="flex items-center px-[22px] py-[19px]" style={{ borderBottom: "1px solid var(--bd-soft)" }}>
          <div className="text-[16px] font-semibold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>
            {isEdit ? "Editar usuario" : "Nuevo usuario"}
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="ml-auto inline-flex rounded-[7px] p-1" style={{ color: "var(--tx-5)" }}>
            <CloseRoundedIcon sx={{ fontSize: 18 }} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-[15px] p-[22px]">
          <label className="block">
            <span className={labelCls} style={{ color: "var(--tx-4)" }}>Email</span>
            <input
              type="email"
              autoComplete="off"
              placeholder="nombre@empresa.com"
              className={inputCls}
              style={{ ...inputStyle, ...(isEdit ? { opacity: 0.6, cursor: "not-allowed" } : {}) }}
              disabled={isEdit}
              onFocus={onFocus}
              onBlur={onBlur}
              {...register("email", isEdit ? {} : { required: "Ingresá el email" })}
            />
            {!isEdit && errors.email && <span className="mt-1 block text-[11px]" style={{ color: "var(--ink-red)" }}>{errors.email.message}</span>}
          </label>

          <label className="block">
            <span className={labelCls} style={{ color: "var(--tx-4)" }}>Nombre</span>
            <input type="text" autoComplete="off" placeholder="Nombre y apellido" className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} {...register("name")} />
          </label>

          <div>
            <span className={labelCls} style={{ color: "var(--tx-4)" }}>Rol</span>
            <div className="flex gap-2.5">
              {ROLES.map((r) => {
                const on = role === r.value
                return (
                  <button
                    type="button"
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    className="flex-1 rounded-[10px] px-[13px] py-3 text-left transition-colors"
                    style={{ border: `1.5px solid ${on ? "var(--ink-lime)" : "var(--bd-strong)"}`, background: on ? "rgba(196,237,43,.08)" : "var(--input)" }}
                  >
                    <div className="text-[13.5px] font-semibold" style={{ color: on ? "var(--ink-lime)" : "var(--tx)" }}>{r.title}</div>
                    <div className="mt-0.5 text-[11.5px]" style={{ color: on ? "var(--tx-4)" : "var(--tx-5)" }}>{r.desc}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Nota de contraseña temporal — solo en alta */}
          {!isEdit && (
            <div className="flex items-start gap-2.5 rounded-[9px] px-[13px] py-[11px]" style={{ background: "rgba(240,184,31,.08)", border: "1px solid rgba(240,184,31,.30)" }}>
              <span className="inline-flex flex-none" style={{ color: "#F0B81F", marginTop: 1 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 16v-4M12 8h.01" /></svg>
              </span>
              <div className="text-[12px] leading-[1.5]" style={{ color: "#D8B968" }}>
                Al crear, el sistema genera una <b style={{ color: "#F0C955" }}>contraseña temporal</b>; el usuario la cambia en su primer ingreso.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2.5 px-[22px] py-4" style={{ borderTop: "1px solid var(--bd-soft)" }}>
          <button type="button" onClick={onClose} className="rounded-[9px] px-4 py-2.5 text-[14px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx)" }}>
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="rounded-[9px] px-[18px] py-2.5 text-[14px] font-bold disabled:opacity-60" style={{ background: "#C4ED2B", color: "#0A0C0D" }}>
            {isSubmitting ? (isEdit ? "Guardando…" : "Creando…") : isEdit ? "Guardar cambios" : "Crear usuario"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default UserForm
