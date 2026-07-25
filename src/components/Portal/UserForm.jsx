import { useState } from "react"
import { useForm } from "react-hook-form"
import { showToast } from "@utils/toast"
import Modal from "@components/common/Modal"
import Button from "@components/UI/Button"
import Callout from "@components/common/Callout"
import FloatingField from "@components/UI/FloatingField"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
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
// El shell (overlay + card + header + X + portal + Escape) lo aporta <Modal/>.
const UserForm = ({ user, onClose, onCreated, onSaved }) => {
  const isEdit = Boolean(user)
  const [role, setRole] = useState(isEdit ? user.role : "operator")
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: isEdit ? user.email : "", name: isEdit ? user.name || "" : "" } })

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

  const footer = (
    <div className="flex justify-end gap-2.5 px-[22px] py-4" style={{ borderTop: "1px solid var(--bd-soft)" }}>
      <button type="button" onClick={onClose} className="rounded-[9px] px-4 py-2.5 text-[14px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx)" }}>
        Cancelar
      </button>
      <Button type="submit" variant="lime" disabled={isSubmitting} className="text-[14px]" style={{ background: "#C4ED2B", color: "#0A0C0D" }}>
        {isSubmitting ? (isEdit ? "Guardando…" : "Creando…") : isEdit ? "Guardar cambios" : "Crear usuario"}
      </Button>
    </div>
  )

  return (
    <Modal
      title={isEdit ? "Editar usuario" : "Nuevo usuario"}
      onClose={onClose}
      maxWidth={448}
      portal
      onSubmit={handleSubmit(onSubmit)}
      footer={footer}
      bodyClassName="flex flex-col gap-[15px] p-[22px]"
    >
      <FloatingField
        label="Email"
        type="email"
        autoComplete="off"
        required={!isEdit}
        disabled={isEdit}
        error={!isEdit ? errors.email?.message : false}
        {...register("email", isEdit ? {} : { required: "Ingresá el email" })}
      />

      <FloatingField label="Nombre" type="text" autoComplete="off" {...register("name")} />

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
        // Ámbar: el design system no tiene var ámbar, se conserva el hex del diseño como tono.
        <Callout Icon={InfoOutlinedIcon} tone="#F0B81F" className="">
          Al crear, el sistema genera una <b style={{ color: "#F0C955" }}>contraseña temporal</b>; el usuario la cambia en su primer ingreso.
        </Callout>
      )}
    </Modal>
  )
}

export default UserForm
