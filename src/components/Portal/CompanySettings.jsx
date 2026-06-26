import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import { getCompany, updateCompany } from "@api/admin"
import { showToast } from "@utils/toast"

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white placeholder:text-slate-500 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
const labelClass = "mb-1.5 block text-sm font-medium text-slate-300"
const cardClass = "rounded-xl border border-slate-800 bg-slate-950/60 p-6"

const CompanySettings = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [meta, setMeta] = useState(null) // plan/status/dbName (no editables)
  const [stockStatuses, setStockStatuses] = useState([])
  const [newStatus, setNewStatus] = useState("")

  useEffect(() => {
    getCompany()
      .then((c) => {
        reset({
          name: c.name || "",
          cuit: c.cuit || "",
          phone: c.phone || "",
          address: c.address || "",
          receiptPrefix: c.receiptPrefix || "",
          receiptFooter: c.receiptFooter || "",
        })
        setStockStatuses(c.stockStatuses || [])
        setMeta({ plan: c.plan, status: c.status, dbName: c.dbName })
      })
      .catch((e) => setError(e.message || "No se pudo cargar la empresa"))
      .finally(() => setLoading(false))
  }, [reset])

  const addStatus = () => {
    const v = newStatus.trim()
    if (v && !stockStatuses.includes(v)) setStockStatuses((prev) => [...prev, v])
    setNewStatus("")
  }
  const removeStatus = (s) => setStockStatuses((prev) => prev.filter((x) => x !== s))

  const onSubmit = async (data) => {
    try {
      const updated = await updateCompany({ ...data, stockStatuses })
      reset({
        name: updated.name || "",
        cuit: updated.cuit || "",
        phone: updated.phone || "",
        address: updated.address || "",
        receiptPrefix: updated.receiptPrefix || "",
        receiptFooter: updated.receiptFooter || "",
      })
      setStockStatuses(updated.stockStatuses || [])
      showToast("success", "Datos de la empresa actualizados")
    } catch (err) {
      showToast("error", err.message || "No se pudieron guardar los cambios")
    }
  }

  if (loading) return <p className="text-sm text-slate-400">Cargando datos de la empresa…</p>
  if (error) return <p className="text-sm text-red-400">{error}</p>

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Empresa</h1>
        <p className="mt-1 text-sm text-slate-400">Datos y preferencias de tu empresa.</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Datos generales */}
        <section className={cardClass}>
          <h2 className="mb-4 font-display text-lg font-semibold text-white">Datos generales</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className={labelClass}>Nombre de la empresa</label>
              <input id="name" className={inputClass} {...register("name")} />
            </div>
            <div>
              <label htmlFor="cuit" className={labelClass}>CUIT</label>
              <input id="cuit" className={inputClass} placeholder="30-12345678-9" {...register("cuit")} />
            </div>
            <div>
              <label htmlFor="phone" className={labelClass}>Teléfono</label>
              <input id="phone" className={inputClass} {...register("phone")} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="address" className={labelClass}>Dirección</label>
              <input id="address" className={inputClass} {...register("address")} />
            </div>
          </div>
        </section>

        {/* Recibos */}
        <section className={cardClass}>
          <h2 className="mb-4 font-display text-lg font-semibold text-white">Recibos</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="receiptPrefix" className={labelClass}>Prefijo de recibo</label>
              <input id="receiptPrefix" className={inputClass} placeholder="0001" {...register("receiptPrefix")} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="receiptFooter" className={labelClass}>Pie de recibo</label>
              <textarea id="receiptFooter" rows={2} className={inputClass} {...register("receiptFooter")} />
            </div>
          </div>
        </section>

        {/* Estados de stock */}
        <section className={cardClass}>
          <h2 className="font-display text-lg font-semibold text-white">Estados de stock</h2>
          <p className="mt-1 text-sm text-slate-400">Los estados que tus cubiertas pueden tener en depósito.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {stockStatuses.map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200">
                {s}
                <button type="button" onClick={() => removeStatus(s)} className="text-slate-500 transition hover:text-red-400" aria-label={`Quitar ${s}`}>
                  <CloseRoundedIcon sx={{ fontSize: 14 }} />
                </button>
              </span>
            ))}
            {stockStatuses.length === 0 && <span className="text-sm text-slate-500">Sin estados configurados.</span>}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addStatus()
                }
              }}
              placeholder="Agregar estado…"
              className={`${inputClass} max-w-xs`}
            />
            <button
              type="button"
              onClick={addStatus}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
            >
              <AddRoundedIcon fontSize="small" />
              Agregar
            </button>
          </div>
        </section>

        {/* Info del plan (no editable) */}
        {meta && (
          <section className={cardClass}>
            <h2 className="mb-4 font-display text-lg font-semibold text-white">Plan</h2>
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <p className="text-slate-500">Plan</p>
                <p className="mt-0.5 font-medium capitalize text-slate-200">{meta.plan || "—"}</p>
              </div>
              <div>
                <p className="text-slate-500">Estado</p>
                <p className="mt-0.5 font-medium capitalize text-slate-200">{meta.status || "—"}</p>
              </div>
              <div>
                <p className="text-slate-500">Base de datos</p>
                <p className="mt-0.5 font-mono text-xs text-slate-400">{meta.dbName}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">El plan y el estado los administra el equipo de ControlCubiertas.</p>
          </section>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600 focus:ring-2 focus:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CompanySettings
