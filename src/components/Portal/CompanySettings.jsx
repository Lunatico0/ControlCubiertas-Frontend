import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded"
import { getCompany, updateCompany, getSummary } from "@api/admin"
import { showToast } from "@utils/toast"

const inputClass =
  "w-full rounded-[10px] border border-(--bd) bg-(--input) px-3 py-2.5 text-sm text-(--tx) placeholder:text-(--tx-6) outline-none transition focus:border-(--ink-lime)"
const labelClass = "mb-1.5 block text-sm font-medium text-(--tx-3)"
const cardClass = "rounded-xl border border-(--bd) bg-(--card) p-6"

// Presets de color + fallback automático (mismo criterio que /op: escalera por posición).
const COLOR_PRESETS = ["#C4ED2B", "#3FD9BE", "#6E97F5", "#B39CF7", "#F0A85A", "#F0716A", "#5AC8F0", "#F078C8", "#9AE86A", "#E8C84A"]
const STOCK_HEX = ["#C4ED2B", "#3FD9BE", "#6E97F5", "#B39CF7"]
const autoColor = (role, stockIdx) => (role === "recap" ? "#F0A85A" : role === "discard" ? "#F0716A" : STOCK_HEX[stockIdx % STOCK_HEX.length])
const ORDINALS = { 1: "1er", 2: "2do", 3: "3er", 4: "4to", 5: "5to", 6: "6to", 7: "7mo", 8: "8vo", 9: "9no", 10: "10mo" }
const ordinal = (n) => ORDINALS[n] || `${n}º`
const ROLE_LABEL = { initial: "Inicial", stock: "Recapado", recap: "A recapar", discard: "Baja" }
const isFixed = (role) => role === "initial" || role === "recap" || role === "discard"

const CompanySettings = () => {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [meta, setMeta] = useState(null)
  const [statuses, setStatuses] = useState([]) // [{name, role, color?}] ordenado
  const [usage, setUsage] = useState({}) // { nombreEstado: cantidadDeCubiertas }
  const [editing, setEditing] = useState(null) // índice del estado en edición (popover)

  useEffect(() => {
    Promise.all([getCompany(), getSummary().catch(() => null)])
      .then(([c, s]) => {
        reset({
          name: c.name || "", cuit: c.cuit || "", phone: c.phone || "",
          address: c.address || "", receiptPrefix: c.receiptPrefix || "", receiptFooter: c.receiptFooter || "",
        })
        setStatuses(Array.isArray(c.stockStatuses) ? c.stockStatuses : [])
        setUsage(s?.cubiertas?.byStatus || {})
        setMeta({ plan: c.plan, status: c.status, dbName: c.dbName })
      })
      .catch((e) => setError(e.message || "No se pudo cargar la empresa"))
      .finally(() => setLoading(false))
  }, [reset])

  // Color efectivo (persistido o automático por posición en la escalera).
  const colorAt = (i) => {
    const s = statuses[i]
    if (s.color) return s.color
    const stockIdx = statuses.slice(0, i + 1).filter((x) => x.role === "initial" || x.role === "stock").length - 1
    return autoColor(s.role, stockIdx < 0 ? 0 : stockIdx)
  }
  const patchAt = (i, patch) => setStatuses((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))
  const recapCount = statuses.filter((s) => s.role === "stock").length

  // Reconstruye el ciclo ordenado (inicial → recapados → a recapar → baja).
  const rebuild = (stocks) => {
    const initial = statuses.filter((s) => s.role === "initial")
    const recap = statuses.filter((s) => s.role === "recap")
    const discard = statuses.filter((s) => s.role === "discard")
    setStatuses([...initial, ...stocks, ...recap, ...discard])
  }
  const addRecap = () => {
    const stocks = statuses.filter((s) => s.role === "stock")
    if (stocks.length >= 10) return
    rebuild([...stocks, { name: `${ordinal(stocks.length + 1)} Recapado`, role: "stock" }])
  }
  const removeRecap = () => {
    const stocks = statuses.filter((s) => s.role === "stock")
    if (!stocks.length) return
    const last = stocks[stocks.length - 1]
    if ((usage[last.name] || 0) > 0) return showToast("warning", `No se puede quitar "${last.name}": ${usage[last.name]} cubierta(s) lo usan.`)
    rebuild(stocks.slice(0, -1))
  }

  const onSubmit = async (data) => {
    try {
      const updated = await updateCompany({ ...data, stockStatuses: statuses })
      reset({
        name: updated.name || "", cuit: updated.cuit || "", phone: updated.phone || "",
        address: updated.address || "", receiptPrefix: updated.receiptPrefix || "", receiptFooter: updated.receiptFooter || "",
      })
      setStatuses(Array.isArray(updated.stockStatuses) ? updated.stockStatuses : [])
      setEditing(null)
      showToast("success", "Datos de la empresa actualizados")
    } catch (err) {
      showToast("error", err.message || "No se pudieron guardar los cambios")
    }
  }

  if (loading) return <p className="text-sm text-(--tx-5)">Cargando datos de la empresa…</p>
  if (error) return <p className="text-sm text-(--ink-red)">{error}</p>

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="font-display text-[28px] font-bold tracking-[-.02em] text-(--tx)" style={{ fontFamily: "'Space Grotesk'" }}>Empresa</h1>
        <p className="mt-1 text-sm text-(--tx-4)">Datos y preferencias de tu empresa.</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Datos generales */}
        <section className={cardClass}>
          <h2 className="mb-4 font-display text-lg font-semibold text-(--tx)" style={{ fontFamily: "'Space Grotesk'" }}>Datos generales</h2>
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
          <h2 className="mb-4 font-display text-lg font-semibold text-(--tx)" style={{ fontFamily: "'Space Grotesk'" }}>Recibos</h2>
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

        {/* Estados de stock (ciclo de vida configurable) */}
        <section className={cardClass}>
          <h2 className="font-display text-lg font-semibold text-(--tx)" style={{ fontFamily: "'Space Grotesk'" }}>Estados de stock</h2>
          <p className="mt-1 text-sm text-(--tx-4)">
            El ciclo tiene estados fijos que siempre existen; podés ajustar su nombre y color. La cantidad de recapados define cuántos estados intermedios hay.
          </p>

          {/* Recapados permitidos (stepper) */}
          <div className="mt-4 mb-5 flex items-center gap-4 rounded-xl border border-(--bd) bg-(--elev) p-4">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-(--tx-2)">Recapados permitidos</div>
              <div className="mt-0.5 text-xs text-(--tx-5)">Cuántas veces se puede recapar antes de descartar. Agrega o quita estados intermedios.</div>
            </div>
            <div className="flex flex-none items-center gap-1 rounded-lg border border-(--bd) bg-(--input) p-1">
              <button type="button" onClick={removeRecap} disabled={recapCount === 0} title="Menos"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-(--bd-strong) text-(--tx-3) transition hover:bg-(--hover) disabled:cursor-not-allowed disabled:opacity-40">
                <RemoveRoundedIcon sx={{ fontSize: 17 }} />
              </button>
              <div className="w-12 text-center font-display text-2xl font-bold text-(--tx)" style={{ fontFamily: "'Space Grotesk'" }}>{recapCount}</div>
              <button type="button" onClick={addRecap} disabled={recapCount >= 10} title="Más"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-(--bd-strong) text-(--tx-3) transition hover:bg-(--hover) disabled:cursor-not-allowed disabled:opacity-40">
                <AddRoundedIcon sx={{ fontSize: 17 }} />
              </button>
            </div>
          </div>

          {/* Ciclo · chips editables */}
          <div className="mb-2.5 font-mono text-[10px] tracking-wider text-(--tx-6)">CICLO · {statuses.length} ESTADOS · TOCÁ PARA EDITAR</div>
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
            {statuses.map((s, i) => {
              const inUse = (usage[s.name] || 0) > 0
              const fixed = isFixed(s.role)
              return (
                <div key={i} className="relative flex items-center gap-1.5">
                  <button type="button" onClick={() => setEditing(editing === i ? null : i)}
                    className="inline-flex items-center gap-2 rounded-full border border-(--bd) bg-(--elev) px-3 py-1.5 transition hover:border-(--bd-hover)"
                    title={ROLE_LABEL[s.role]}>
                    <span className="h-[11px] w-[11px] flex-none rounded-full" style={{ background: colorAt(i) }} />
                    <span className="text-[12.5px] font-semibold text-(--tx-2)">{s.name}</span>
                    {fixed && <LockOutlinedIcon sx={{ fontSize: 12 }} className="text-(--tx-6)" />}
                    {inUse && <CheckRoundedIcon sx={{ fontSize: 13 }} className="text-(--st-teal)" />}
                  </button>

                  {editing === i && (
                    <div className="absolute left-0 top-10 z-20 w-60 rounded-xl border border-(--bd) bg-(--card) p-3.5 shadow-2xl">
                      <div className="mb-1.5 font-mono text-[10px] font-semibold tracking-wider text-(--tx-6)">NOMBRE</div>
                      <input
                        value={s.name}
                        onChange={(e) => patchAt(i, { name: e.target.value })}
                        disabled={inUse}
                        title={inUse ? "En uso por cubiertas — no se puede renombrar" : ""}
                        className="mb-3 h-9 w-full rounded-lg border border-(--bd) bg-(--input) px-3 text-[13.5px] font-semibold text-(--tx) outline-none focus:border-(--ink-lime) disabled:opacity-50"
                      />
                      {inUse && <div className="-mt-2 mb-3 text-[11px] text-(--tx-5)">En uso ({usage[s.name]}) — el nombre no se puede cambiar.</div>}

                      <div className="mb-2 font-mono text-[10px] font-semibold tracking-wider text-(--tx-6)">COLOR</div>
                      <div className="grid grid-cols-5 gap-2">
                        {COLOR_PRESETS.map((c) => {
                          const sel = (colorAt(i) || "").toLowerCase() === c.toLowerCase()
                          return (
                            <button key={c} type="button" onClick={() => patchAt(i, { color: c })}
                              className="aspect-square w-full rounded-md transition hover:scale-110"
                              style={{ background: c, border: `2px solid ${sel ? "var(--tx)" : "transparent"}`, outline: "1px solid var(--bd-strong)", outlineOffset: -1 }} />
                          )
                        })}
                      </div>
                      <label className="mt-3 flex items-center gap-2 text-[11px] text-(--tx-4)">
                        <input type="color" value={/^#[0-9a-f]{6}$/i.test(colorAt(i)) ? colorAt(i) : "#C4ED2B"} onChange={(e) => patchAt(i, { color: e.target.value })}
                          className="h-7 w-9 cursor-pointer rounded border border-(--bd) bg-transparent p-0.5" />
                        Color personalizado
                      </label>
                    </div>
                  )}

                  {i < statuses.length - 1 && <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} className="text-(--tx-7)" />}
                </div>
              )
            })}
          </div>

          <div className="mt-4 space-y-1 text-[11.5px] text-(--tx-5)">
            <div className="flex items-center gap-1.5"><LockOutlinedIcon sx={{ fontSize: 12 }} /> Estados fijos: no se eliminan (inicial, a recapar y baja).</div>
            <div className="flex items-center gap-1.5"><CheckRoundedIcon sx={{ fontSize: 13 }} className="text-(--st-teal)" /> En uso por cubiertas: no se pueden quitar ni renombrar.</div>
          </div>
        </section>

        {/* Info del plan (no editable) */}
        {meta && (
          <section className={cardClass}>
            <h2 className="mb-4 font-display text-lg font-semibold text-(--tx)" style={{ fontFamily: "'Space Grotesk'" }}>Plan</h2>
            <div className="flex flex-wrap gap-6 text-sm">
              <div><p className="text-(--tx-5)">Plan</p><p className="mt-0.5 font-medium capitalize text-(--tx-2)">{meta.plan || "—"}</p></div>
              <div><p className="text-(--tx-5)">Estado</p><p className="mt-0.5 font-medium capitalize text-(--tx-2)">{meta.status || "—"}</p></div>
              <div><p className="text-(--tx-5)">Base de datos</p><p className="mt-0.5 font-mono text-xs text-(--tx-4)">{meta.dbName}</p></div>
            </div>
            <p className="mt-3 text-xs text-(--tx-5)">El plan y el estado los administra el equipo de TireOps.</p>
          </section>
        )}

        <div className="flex justify-end">
          <button type="submit" disabled={isSubmitting}
            className="rounded-[10px] bg-(--ink-lime) px-5 py-2.5 text-sm font-bold text-(--bg) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CompanySettings
