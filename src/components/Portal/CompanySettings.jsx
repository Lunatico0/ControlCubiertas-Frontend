import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded"
import { getCompany, updateCompany, getSummary } from "@api/admin"
import { invalidateCompanyCache } from "@api/company"
import { showToast } from "@utils/toast"
import Button from "@components/UI/Button"
import FloatingField from "@components/UI/FloatingField"
import { formatPlate } from "@utils/plateFormat"
import { tituloPantalla } from "@utils/tokens"
import Toggle from "@components/common/Toggle"
import { mensajeDeError } from "@utils/apiError"

const inputClass =
  "w-full rounded-[var(--r-md)] border border-(--bd) bg-(--input) px-3 py-2.5 text-sm text-(--tx) placeholder:text-(--tx-6) outline-none transition focus:border-(--ink-lime)"
const labelClass = "mb-1.5 block text-sm font-medium text-(--tx-3)"
const cardClass = "rounded-[var(--r-lg)] border border-(--bd) bg-(--card) p-6"

// Presets de color + fallback automático (mismo criterio que /op: escalera por posición).
// Los colores del ciclo de vida son TOKENS, no hexes literales.
//
// Con hexes fijos los swatches computaban lo mismo en claro y en oscuro, y en tema claro
// quedaban ilegibles: medido sobre el fondo real (#f5f7f1), el lima de marca (--brand) daba 1,26:1 contra
// el 3:1 que WCAG pide para componentes de UI. El estado "Nueva" era un cuadrado casi blanco.
// Los tokens --st-* ya tenían su variante light en index.css y no se estaban usando acá.
//
// Además, un color guardado como hex queda congelado en la base y deja de adaptarse al tema
// para siempre; guardado como token, se resuelve en el cliente según el tema activo.
const STOCK_TOKENS = ["var(--st-lime)", "var(--st-teal)", "var(--st-blue)", "var(--st-purple)"]
const COLOR_PRESETS = [...STOCK_TOKENS, "var(--st-orange)", "var(--st-red)"]
const autoColor = (role, stockIdx) => (role === "recap" ? "var(--st-orange)" : role === "discard" ? "var(--st-red)" : STOCK_TOKENS[stockIdx % STOCK_TOKENS.length])

// El input type=color solo entiende hex, así que para arrancar el picker hay que resolver el
// token al hex del tema activo.
const aHex = (color) => {
  if (/^#[0-9a-f]{6}$/i.test(color || "")) return color
  if (typeof window === "undefined") return "var(--brand)"
  const nombre = /^var\((--[\w-]+)\)$/.exec(color || "")?.[1]
  if (!nombre) return "var(--brand)"
  const valor = getComputedStyle(document.documentElement).getPropertyValue(nombre).trim()
  return /^#[0-9a-f]{6}$/i.test(valor) ? valor : "var(--brand)"
}
const ORDINALS = { 1: "1er", 2: "2do", 3: "3er", 4: "4to", 5: "5to", 6: "6to", 7: "7mo", 8: "8vo", 9: "9no", 10: "10mo" }
const ordinal = (n) => ORDINALS[n] || `${n}º`
const ROLE_LABEL = { initial: "Inicial", stock: "Recapado", recap: "A recapar", discard: "Baja" }
const isFixed = (role) => role === "initial" || role === "recap" || role === "discard"

// Separadores de patente para DISPLAY (la patente se guarda normalizada). Ver utils/plateFormat.js.
const PLATE_SEPS = [
  { v: "", label: "Ninguno" },
  { v: "-", label: "Guión" },
  { v: ".", label: "Punto" },
  { v: " ", label: "Espacio" },
  { v: "/", label: "Barra" },
]
const isPresetSep = (v) => PLATE_SEPS.some((p) => p.v === v)

// Formatos de patente ofrecidos (t138). La máscara se escribe con A (letra) y 0 (dígito) y se
// valida sobre la patente normalizada, así que el separador de display no la afecta.
const PLATE_FORMAT_PRESETS = [
  { mask: "AAA000", label: "Auto, dominio viejo" },
  { mask: "AA000AA", label: "Auto, Mercosur" },
  { mask: "A000AAA", label: "Moto, Mercosur" },
  { mask: "000AAA", label: "Moto, dominio viejo" },
]

const CompanySettings = () => {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [meta, setMeta] = useState(null)
  const [statuses, setStatuses] = useState([]) // [{name, role, color?}] ordenado
  const [usage, setUsage] = useState({}) // { nombreEstado: cantidadDeCubiertas }
  const [editing, setEditing] = useState(null) // índice del estado en edición (popover)
  const [plateSep, setPlateSep] = useState("") // separador de patente (solo display)
  // t138: formatos ACEPTADOS de patente. Máscaras con A (letra) y 0 (dígito); la lista vacía
  // apaga la validación, que es la salida para una flota con chapas extranjeras.
  const [plateFormats, setPlateFormats] = useState([])
  const [codePrefix, setCodePrefix] = useState("") // prefijo del código interno de cubierta (solo display)
  const [autoPrint, setAutoPrint] = useState(true) // imprimir el comprobante al confirmar una acción

  useEffect(() => {
    Promise.all([getCompany(), getSummary().catch(() => null)])
      .then(([c, s]) => {
        reset({
          name: c.name || "", cuit: c.cuit || "", phone: c.phone || "",
          address: c.address || "", receiptPrefix: c.receiptPrefix || "", receiptFooter: c.receiptFooter || "",
        })
        setStatuses(Array.isArray(c.stockStatuses) ? c.stockStatuses : [])
        setPlateSep(c.plateSeparator || "")
        setPlateFormats(Array.isArray(c.plateFormats) ? c.plateFormats : [])
        setCodePrefix(c.tireCodePrefix || "")
        setAutoPrint(c.autoPrint !== false)
        setUsage(s?.cubiertas?.byStatus || {})
        setMeta({ plan: c.plan, status: c.status, dbName: c.dbName })
      })
      .catch((e) => setError(mensajeDeError(e, "No se pudo cargar la empresa")))
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
      const updated = await updateCompany({ ...data, stockStatuses: statuses, plateSeparator: plateSep, plateFormats, tireCodePrefix: codePrefix, autoPrint })
      // Invalida la cache de company para que la operativa (/op) tome el nuevo separador/prefijo
      // al entrar, sin necesidad de hard-reload (Ctrl+Shift+R).
      invalidateCompanyCache()
      reset({
        name: updated.name || "", cuit: updated.cuit || "", phone: updated.phone || "",
        address: updated.address || "", receiptPrefix: updated.receiptPrefix || "", receiptFooter: updated.receiptFooter || "",
      })
      setStatuses(Array.isArray(updated.stockStatuses) ? updated.stockStatuses : [])
      setPlateSep(updated.plateSeparator || "")
      setPlateFormats(Array.isArray(updated.plateFormats) ? updated.plateFormats : [])
      setCodePrefix(updated.tireCodePrefix || "")
      setAutoPrint(updated.autoPrint !== false)
      setEditing(null)
      showToast("success", "Datos de la empresa actualizados")
    } catch (err) {
      showToast("error", mensajeDeError(err, "No se pudieron guardar los cambios"))
    }
  }

  if (loading) return <p className="text-sm text-(--tx-5)">Cargando datos de la empresa…</p>
  if (error) return <p className="text-sm text-(--ink-red)">{error}</p>

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className={tituloPantalla} style={{ color: "var(--tx)" }}>Empresa</h1>
        <p className="mt-1 text-sm text-(--tx-4)">Datos y preferencias de tu empresa.</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Datos generales */}
        <section className={cardClass}>
          <h2 className="mb-4 font-display text-lg font-semibold text-(--tx)" style={{ fontFamily: "var(--font-display)" }}>Datos generales</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FloatingField label="Nombre de la empresa" {...register("name")} />
            </div>
            <div>
              <FloatingField label="CUIT" {...register("cuit")} />
            </div>
            <div>
              <FloatingField label="Teléfono" {...register("phone")} />
            </div>
            <div className="sm:col-span-2">
              <FloatingField label="Dirección" {...register("address")} />
            </div>
          </div>
        </section>

        {/* Recibos */}
        <section className={cardClass}>
          <h2 className="mb-4 font-display text-lg font-semibold text-(--tx)" style={{ fontFamily: "var(--font-display)" }}>Recibos</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FloatingField label="Prefijo de recibo" {...register("receiptPrefix")} />
            </div>
            <div className="sm:col-span-2">
              <FloatingField as="textarea" label="Pie de recibo" rows={2} {...register("receiptFooter")} />
            </div>
          </div>
        </section>

        {/* Patentes (separador de display) */}
        <section className={cardClass}>
          <h2 className="font-display text-lg font-semibold text-(--tx)" style={{ fontFamily: "var(--font-display)" }}>Patentes</h2>
          <p className="mt-1 text-sm text-(--tx-4)">
            Separador para <span className="font-medium text-(--tx-3)">mostrar</span> las patentes. Es solo visual: la patente se guarda sin separadores.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {PLATE_SEPS.map((p) => {
              const sel = plateSep === p.v
              return (
                <button key={p.label} type="button" onClick={() => setPlateSep(p.v)}
                  className="rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition"
                  style={{
                    borderColor: sel ? "var(--ink-lime)" : "var(--bd)",
                    background: sel ? "color-mix(in srgb, var(--ink-lime) 14%, transparent)" : "var(--elev)",
                    color: sel ? "var(--tx)" : "var(--tx-3)",
                  }}>
                  {p.label}
                </button>
              )
            })}
            <label className="ml-1 flex items-center gap-2 text-[12px] text-(--tx-4)">
              Otro
              <input
                value={isPresetSep(plateSep) ? "" : plateSep}
                onChange={(e) => setPlateSep(e.target.value.slice(-1))}
                maxLength={1}
                placeholder="·"
                className="h-9 w-12 rounded-[var(--r-md)] border border-(--bd) bg-(--input) text-center text-[15px] font-semibold text-(--tx) outline-none focus:border-(--ink-lime)"
              />
            </label>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-(--tx-5)">
            Vista previa:
            <span className="rounded-[var(--r-sm)] border border-(--bd) bg-(--input) px-2.5 py-1 font-mono text-[13px] text-(--tx-2)">{plateSep ? `EEQ${plateSep}541` : "EEQ541"}</span>
          </div>

          {/* t138: formatos aceptados. Sin esto se cargaba "ABC1234XYZ" sin que nadie chistara. */}
          <div className="mt-6 border-t border-(--bd-faint) pt-5">
            <h3 className="text-[13.5px] font-semibold text-(--tx)">Formatos aceptados</h3>
            <p className="mt-1 text-sm text-(--tx-4)">
              Qué patentes se pueden cargar. Si no marcás ninguno, se acepta cualquier cosa: elegilo así solo si tu flota tiene chapas que no entran en ningún formato de acá.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PLATE_FORMAT_PRESETS.map((f) => {
                const sel = plateFormats.includes(f.mask)
                return (
                  <button key={f.mask} type="button"
                    onClick={() => setPlateFormats((prev) => (sel ? prev.filter((m) => m !== f.mask) : [...prev, f.mask]))}
                    className="rounded-[var(--r-md)] border px-3.5 py-2 text-left text-[12.5px] font-semibold transition"
                    style={{
                      borderColor: sel ? "var(--ink-lime)" : "var(--bd)",
                      background: sel ? "color-mix(in srgb, var(--ink-lime) 14%, transparent)" : "var(--elev)",
                      color: sel ? "var(--tx)" : "var(--tx-3)",
                    }}>
                    <span className="block font-mono text-[13px]">{formatPlate(f.mask, plateSep)}</span>
                    <span className="mt-0.5 block text-[11px] font-normal text-(--tx-5)">{f.label}</span>
                  </button>
                )
              })}
            </div>
            {plateFormats.length === 0 && (
              <p className="mt-3 text-[12.5px]" style={{ color: "var(--ink-orange)" }}>
                Sin formatos marcados no se valida la patente: un error de tipeo entra a la base tal cual.
              </p>
            )}
          </div>
        </section>

        {/* Cubiertas (prefijo del código interno · solo display) */}
        <section className={cardClass}>
          <h2 className="font-display text-lg font-semibold text-(--tx)" style={{ fontFamily: "var(--font-display)" }}>Cubiertas</h2>
          <p className="mt-1 text-sm text-(--tx-4)">
            Prefijo para <span className="font-medium text-(--tx-3)">mostrar</span> el código interno de las cubiertas. Es solo visual: el código se guarda como un número correlativo.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="tireCodePrefix" className={labelClass}>Prefijo del código interno</label>
              <input
                id="tireCodePrefix"
                value={codePrefix}
                onChange={(e) => setCodePrefix(e.target.value)}
                maxLength={10}
                placeholder="Ej. T- , CUB/"
                className={inputClass}
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-(--tx-5)">
            Vista previa:
            <span className="rounded-[var(--r-sm)] border border-(--bd) bg-(--input) px-2.5 py-1 font-mono text-[13px] text-(--tx-2)">{codePrefix ? `${codePrefix}12` : "12"}</span>
          </div>
        </section>

        {/* Impresión del comprobante */}
        <section className={cardClass}>
          <h2 className="font-display text-lg font-semibold text-(--tx)" style={{ fontFamily: "var(--font-display)" }}>Impresión</h2>
          <p className="mt-1 text-sm text-(--tx-4)">
            Qué pasa con el comprobante cuando el operario confirma un movimiento.
          </p>
          <div className="mt-4 flex items-center gap-4 rounded-[var(--r-lg)] border border-(--bd) bg-(--elev) p-4">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-(--tx-2)">Imprimir al confirmar</div>
              <div className="mt-0.5 text-xs text-(--tx-5)">
                {autoPrint
                  ? "Al confirmar un movimiento se abre el diálogo de impresión del comprobante."
                  : "El movimiento se registra sin abrir la impresión. El comprobante se reimprime desde el historial cuando haga falta."}
              </div>
              <div className="mt-2 text-xs text-(--tx-6)">
                El movimiento queda registrado igual: cancelar o cerrar la impresión nunca lo deshace.
              </div>
            </div>
            <Toggle on={autoPrint} onChange={setAutoPrint} label="Imprimir el comprobante al confirmar un movimiento" w={46} knob={20} />
          </div>
        </section>

        {/* Estados de stock (ciclo de vida configurable) */}
        <section className={cardClass}>
          <h2 className="font-display text-lg font-semibold text-(--tx)" style={{ fontFamily: "var(--font-display)" }}>Estados de stock</h2>
          <p className="mt-1 text-sm text-(--tx-4)">
            El ciclo tiene estados fijos que siempre existen; podés ajustar su nombre y color. La cantidad de recapados define cuántos estados intermedios hay.
          </p>

          {/* Recapados permitidos (stepper) */}
          <div className="mt-4 mb-5 flex items-center gap-4 rounded-[var(--r-lg)] border border-(--bd) bg-(--elev) p-4">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-(--tx-2)">Recapados permitidos</div>
              <div className="mt-0.5 text-xs text-(--tx-5)">Cuántas veces se puede recapar antes de descartar. Agrega o quita estados intermedios.</div>
            </div>
            <div className="flex flex-none items-center gap-1 rounded-[var(--r-md)] border border-(--bd) bg-(--input) p-1">
              <button type="button" onClick={removeRecap} disabled={recapCount === 0} title="Menos"
                className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--r-sm)] border border-(--bd-strong) text-(--tx-3) transition hover:bg-(--hover) disabled:cursor-not-allowed disabled:opacity-40">
                <RemoveRoundedIcon sx={{ fontSize: 17 }} />
              </button>
              <div className="w-12 text-center font-display text-2xl font-bold text-(--tx)" style={{ fontFamily: "var(--font-display)" }}>{recapCount}</div>
              <button type="button" onClick={addRecap} disabled={recapCount >= 10} title="Más"
                className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--r-sm)] border border-(--bd-strong) text-(--tx-3) transition hover:bg-(--hover) disabled:cursor-not-allowed disabled:opacity-40">
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
                    <div className="absolute left-0 top-10 z-20 w-60 rounded-[var(--r-lg)] border border-(--bd) bg-(--card) p-3.5" style={{ boxShadow: "var(--elev-1)" }}>
                      <div className="mb-1.5 font-mono text-[10px] font-semibold tracking-wider text-(--tx-6)">NOMBRE</div>
                      <input
                        value={s.name}
                        onChange={(e) => patchAt(i, { name: e.target.value })}
                        disabled={inUse}
                        title={inUse ? "En uso por cubiertas — no se puede renombrar" : ""}
                        className="mb-3 h-9 w-full rounded-[var(--r-md)] border border-(--bd) bg-(--input) px-3 text-[13.5px] font-semibold text-(--tx) outline-none focus:border-(--ink-lime) disabled:opacity-50"
                      />
                      {inUse && <div className="-mt-2 mb-3 text-[11px] text-(--tx-5)">En uso ({usage[s.name]}) — el nombre no se puede cambiar.</div>}

                      <div className="mb-2 font-mono text-[10px] font-semibold tracking-wider text-(--tx-6)">COLOR</div>
                      <div className="grid grid-cols-5 gap-2">
                        {COLOR_PRESETS.map((c) => {
                          const sel = (colorAt(i) || "").toLowerCase() === c.toLowerCase()
                          return (
                            <button key={c} type="button" onClick={() => patchAt(i, { color: c })}
                              className="aspect-square w-full rounded-[var(--r-sm)] transition hover:scale-110"
                              style={{ background: c, border: `2px solid ${sel ? "var(--tx)" : "transparent"}`, outline: "1px solid var(--bd-strong)", outlineOffset: -1 }} />
                          )
                        })}
                      </div>
                      <label className="mt-3 flex items-center gap-2 text-[11px] text-(--tx-4)">
                        <input type="color" value={aHex(colorAt(i))} onChange={(e) => patchAt(i, { color: e.target.value })}
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
            <h2 className="mb-4 font-display text-lg font-semibold text-(--tx)" style={{ fontFamily: "var(--font-display)" }}>Plan</h2>
            <div className="flex flex-wrap gap-6 text-sm">
              <div><p className="text-(--tx-5)">Plan</p><p className="mt-0.5 font-medium capitalize text-(--tx-2)">{meta.plan || "—"}</p></div>
              <div><p className="text-(--tx-5)">Estado</p><p className="mt-0.5 font-medium capitalize text-(--tx-2)">{meta.status || "—"}</p></div>
              <div><p className="text-(--tx-5)">Base de datos</p><p className="mt-0.5 font-mono text-xs text-(--tx-4)">{meta.dbName}</p></div>
            </div>
            <p className="mt-3 text-xs text-(--tx-5)">El plan y el estado los administra el equipo de TireOps.</p>
          </section>
        )}

        <div className="flex justify-end">
          <Button type="submit" variant="lime" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CompanySettings
