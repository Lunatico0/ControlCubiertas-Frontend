import { useState, useContext, useMemo } from "react"
import ApiContext from "@context/apiContext"
import { useTheme } from "@context/ThemeContext"
import { showToast } from "@utils/toast"
import { dialog } from "@utils/dialog"
import isElectron from "@utils/isElectron"
import { tint, fmtKm } from "./status"
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded"
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded"
import TripOriginOutlinedIcon from "@mui/icons-material/TripOriginOutlined"
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined"
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined"
import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import Button from "@components/UI/Button"
import Callout from "@components/common/Callout"
import { useAxleConfig } from "./useAxleConfig"
import AxleEditor from "./AxleEditor"
import TruckDiagram from "./TruckDiagram"

// Configurar/reconfigurar ejes de un vehículo. Dos vistas: lista de pendientes (vehículos
// con axles vacío, migración) + editor. El "tipo de vehículo" se DERIVA del layout de ejes
// (se compara contra el catálogo = presets del front + tipos custom del tenant). Si no
// coincide con ninguno → se puede nombrar y guardar como tipo custom (persistido por tenant,
// GET/POST /api/vehicles/types). Guard duro: los ejes con cubierta montada quedan bloqueados
// (hay que desasignar primero); el backend además rechaza (409) lo que orfanaría una cubierta.
// El editor (estado + UI) es compartido con el alta: hook useAxleConfig + AxleEditor +
// TruckDiagram; acá se le pasa typeHint (nombre previo del vehículo) e isAxleLocked (bloqueo
// por eje ocupado). La lista de pendientes y el guardado (updateAxles) son propios de esta pantalla.

const ConfigurarEjes = ({ onClose, vehicle }) => {
  const { data, vehicles } = useContext(ApiContext)
  const { isDarkMode } = useTheme()
  const tires = data?.tires || []
  // Modo puntual: si viene `vehicle`, arranca en el editor de ESE vehículo. Sin `vehicle`, es
  // el flujo batch de migración (lista de pendientes).
  const [view, setView] = useState(vehicle ? "editor" : "list")
  const [sel, setSel] = useState(vehicle || null)
  const [saving, setSaving] = useState(false)

  // Ocupación por eje. Solo en RECONFIGURACIÓN (el vehículo ya tiene ejes): una cubierta
  // montada en E{n}-… ocupa el eje n. Montada SIN posición (legacy) → no se puede verificar
  // → se bloquea todo. En primera config (axles vacío) no hay nada ocupado.
  const isReconfig = !!(sel?.axles?.length)
  const { occupiedAxles, hasPositionless, mountedCount } = useMemo(() => {
    const occ = new Set()
    let posless = false
    let count = 0
    if (isReconfig && sel) {
      tires
        .filter((t) => String(t.vehicle?._id || t.vehicle || "") === String(sel._id))
        .forEach((t) => {
          count += 1
          const m = t.position && String(t.position).match(/^E(\d+)-/)
          if (m) occ.add(Number(m[1]))
          else posless = true
        })
    }
    return { occupiedAxles: occ, hasPositionless: posless, mountedCount: count }
  }, [tires, sel, isReconfig])

  const axleLocked = (i) => isReconfig && (hasPositionless || occupiedAxles.has(i + 1))

  // Editor de ejes compartido con el alta. typeHint desempata presets con el mismo layout
  // usando el nombre previo del vehículo; isAxleLocked aplica el guard de ejes ocupados.
  const {
    axles, setAxles, catalog, matchedKey, isCustom, typeName, total,
    customName, setCustomName, savingType, saveCustomType,
    applyPreset, addAxle, removeAxle, setAxleType,
  } = useAxleConfig({
    initialAxles: vehicle?.axles?.length ? vehicle.axles.map((a) => a.type || "simple") : ["simple", "dual"],
    typeHint: sel?.type,
    isAxleLocked: axleLocked,
  })

  // Pendientes de migración: vehículos sin esquema de ejes.
  const pending = useMemo(() => {
    return (data?.vehicles || [])
      .filter((v) => !(v.axles && v.axles.length))
      .map((v) => ({ ...v, cubiertas: tires.filter((t) => String(t.vehicle?._id || t.vehicle || "") === String(v._id)).length }))
      .sort((a, b) => (a.mobile || "").localeCompare(b.mobile || "", "es", { numeric: true }))
  }, [data?.vehicles, tires])

  const openEditor = (v) => { setSel(v); setAxles(v?.axles?.length ? v.axles.map((a) => a.type || "simple") : ["simple", "dual"]); setCustomName(""); setView("editor") }
  const backToList = () => { if (vehicle) return onClose(); setView("list"); setSel(null) }

  const save = async () => {
    if (!sel) return
    setSaving(true)
    try {
      await vehicles.updateAxles(sel._id, {
        axles: axles.map((t) => ({ type: t })),
        type: isCustom ? (customName.trim() || sel.type || "Personalizado") : typeName,
      })
      showToast("success", `Esquema guardado · ${sel.mobile} · ${total} posiciones`)
      backToList()
    } catch (e) {
      const status = e?.response?.status
      const msg = e?.response?.data?.message || e.message
      if (status === 409) {
        await dialog.notice("error", { title: "No se puede reconfigurar", text: msg || "Hay cubiertas montadas. Desasignalas antes de reconfigurar los ejes." })
      } else {
        showToast("error", msg || "No se pudo guardar el esquema")
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div data-app-theme={isDarkMode ? "dark" : "light"} className="fixed bottom-0 right-0 left-64 z-60 flex flex-col" style={{ top: isElectron() ? 38 : 0, background: "var(--bg)", color: "var(--tx)", fontFamily: "'IBM Plex Sans',system-ui,sans-serif", borderLeft: "1px solid var(--bd-faint)" }}>
      {view === "list" ? (
        /* ===================== LISTA DE PENDIENTES ===================== */
        <>
          <div className="flex-none px-[30px] py-5" style={{ background: "var(--sidebar)", borderBottom: "1px solid var(--bd-faint)" }}>
            <div className="flex items-center gap-3.5">
              <button onClick={onClose} title="Volver" className="inline-flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[9px]" style={{ border: "1px solid var(--bd)", background: "var(--elev)", color: "var(--tx-3)" }}>
                <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
              </button>
              <div>
                <h1 className="m-0 text-[21px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>Configurar ejes</h1>
                <p className="mt-1 text-[13px]" style={{ color: "var(--tx-4)" }}>Vehículos sin esquema de ejes. Definí su configuración para habilitar el montaje de cubiertas.</p>
              </div>
              {pending.length > 0 && (
                <div className="ml-auto inline-flex items-center gap-2 rounded-[9px] px-[13px] py-[7px] text-[12.5px] font-semibold" style={{ color: "var(--ink-orange)", background: tint("var(--ink-orange)", 10), border: `1px solid ${tint("var(--ink-orange)", 30)}` }}>
                  <ReportProblemOutlinedIcon sx={{ fontSize: 15 }} /> {pending.length} {pending.length === 1 ? "pendiente" : "pendientes"}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-[30px] py-6">
            {pending.length === 0 ? (
              <div className="mx-auto my-10 max-w-[460px] text-center">
                <div className="mx-auto mb-4 flex h-[58px] w-[58px] items-center justify-center rounded-[14px]" style={{ background: tint("var(--ink-teal)", 14), color: "var(--ink-teal)" }}>
                  <CheckRoundedIcon sx={{ fontSize: 28 }} />
                </div>
                <div className="text-[18px] font-semibold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>Todo configurado</div>
                <div className="mt-1.5 text-[13px]" style={{ color: "var(--tx-4)" }}>No quedan vehículos pendientes de configuración de ejes.</div>
              </div>
            ) : (
              <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(420px,1fr))" }}>
                {pending.map((v) => (
                  <div key={v._id} className="flex flex-col gap-3.5 rounded-[14px] p-[18px]" style={{ border: "1px solid var(--bd)", background: "var(--card)" }}>
                    <div className="flex items-start gap-3">
                      <span className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-[11px]" style={{ background: tint("var(--ink-blue)", 16), color: "var(--ink-blue)" }}><LocalShippingOutlinedIcon sx={{ fontSize: 22 }} /></span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[18px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>{v.mobile || "—"}</div>
                        <div className="mt-0.5 text-[12px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-5)" }}>{v.licensePlate || "—"} · {v.brand || "—"}</div>
                      </div>
                    </div>
                    <Callout Icon={ReportProblemOutlinedIcon} tone="var(--ink-orange)" dashed className="">
                      Ejes sin configurar — definí el esquema del vehículo.
                    </Callout>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-[7px] text-[12.5px] font-semibold" style={{ color: v.cubiertas === 0 ? "var(--ink-orange)" : "var(--ink-teal)" }}>
                        <TripOriginOutlinedIcon sx={{ fontSize: 15 }} />{v.cubiertas} {v.cubiertas === 1 ? "cubierta" : "cubiertas"}
                      </span>
                      <span className="text-[12.5px]" style={{ color: "var(--tx-5)", fontFamily: "'IBM Plex Mono'" }}>{fmtKm(v.kilometers)}</span>
                      <Button variant="lime" onClick={() => openEditor(v)} className="ml-auto h-10 text-[13.5px]" style={{ background: "#C4ED2B", color: "#0A0C0D" }}>
                        Configurar ejes <ArrowForwardRoundedIcon sx={{ fontSize: 15 }} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* ===================== EDITOR ===================== */
        <>
          <div className="flex h-16 flex-none items-center gap-3.5 px-6" style={{ background: "var(--sidebar)", borderBottom: "1px solid var(--bd-faint)" }}>
            <button onClick={backToList} title="Volver" className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-[9px]" style={{ border: "1px solid var(--bd)", background: "var(--elev)", color: "var(--tx-3)" }}>
              <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
            </button>
            <div style={{ lineHeight: 1.2 }}>
              <div className="text-[17px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>Configurar ejes · {sel?.mobile}</div>
              <div className="text-[11.5px]" style={{ color: "var(--tx-5)", fontFamily: "'IBM Plex Mono'" }}>{sel?.licensePlate} · {sel?.brand}</div>
            </div>
            <div className="ml-auto flex items-center gap-2.5">
              <button onClick={backToList} className="h-10 rounded-[9px] px-[15px] text-[13.5px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx)" }}>Cancelar</button>
              <Button variant="lime" onClick={save} disabled={saving || hasPositionless} className="h-10 text-[13.5px]" style={{ background: "#C4ED2B", color: "#0A0C0D", opacity: saving || hasPositionless ? 0.5 : 1, cursor: hasPositionless ? "not-allowed" : "pointer" }}>{saving ? "Guardando…" : "Guardar esquema"}</Button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1">
            {/* controles */}
            <div className="w-[430px] flex-none overflow-y-auto" style={{ background: "var(--elev)", borderRight: "1px solid var(--bd)" }}>
              {/* Aviso de cubiertas montadas (guard) */}
              {mountedCount > 0 && (
                <Callout Icon={ReportProblemOutlinedIcon} tone="var(--ink-orange)" className="mx-6 mt-5">
                  {hasPositionless
                    ? `Este vehículo tiene ${mountedCount} cubierta${mountedCount === 1 ? "" : "s"} montada${mountedCount === 1 ? "" : "s"} sin posición. Desasignalas para poder reconfigurar los ejes.`
                    : `Los ejes con cubierta montada están bloqueados. Desasigná esas cubiertas para reconfigurarlos.`}
                </Callout>
              )}

              {/* TIPO DE VEHÍCULO + EJES (editor compartido, con bloqueo por eje ocupado) */}
              <AxleEditor
                catalog={catalog}
                matchedKey={matchedKey}
                applyPreset={applyPreset}
                isCustom={isCustom}
                customName={customName}
                setCustomName={setCustomName}
                savingType={savingType}
                saveCustomType={saveCustomType}
                axles={axles}
                total={total}
                addAxle={addAxle}
                removeAxle={removeAxle}
                setAxleType={setAxleType}
                isAxleLocked={axleLocked}
              />
            </div>

            {/* preview */}
            <TruckDiagram
              axles={axles}
              total={total}
              isCustom={isCustom}
              typeName={typeName}
              subtitle={`Vista superior · ${total} cubiertas`}
              spineClass="top-4 bottom-4"
              axlesGapClass="gap-6"
              statsMarginClass="mt-6"
              positionsLabel="posiciones"
            />
          </div>
        </>
      )}
    </div>
  )
}

export default ConfigurarEjes
