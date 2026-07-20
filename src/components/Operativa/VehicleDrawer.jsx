import { useState, useEffect } from "react"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import EditRoundedIcon from "@mui/icons-material/EditRounded"
import SettingsInputComponentRoundedIcon from "@mui/icons-material/SettingsInputComponentRounded"
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined"
import EditarVehiculo from "./EditarVehiculo"
import ConfigurarEjes from "./ConfigurarEjes"

// Detalle del vehículo (rediseño Claude Design "DRAWER VEHÍCULO"): stats + posiciones
// (ver/montar cubierta) + acciones (reconfigurar ejes, editar datos). Recibe el item ya
// computado por Vehiculos (v + positions derivadas de axles + cubiertas montadas).
const VehicleDrawer = ({ item, onClose, onNavigate }) => {
  const [showEdit, setShowEdit] = useState(false)
  const [showReconfig, setShowReconfig] = useState(false)
  const { v, positions, hasAxles, countLabel, countColor, tipoColor, tipoBg, kmLabel } = item

  useEffect(() => {
    // Mientras está abierto el editor de ejes, Esc no cierra el detalle (el editor tiene su
    // propio Cancelar/volver); evita cerrar todo de un tecla.
    const onKey = (e) => { if (e.key === "Escape" && !showReconfig) onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose, showReconfig])

  const mounted = positions.filter((p) => !p.empty).length
  const total = positions.length
  const mountedLabel = hasAxles ? `${mounted}/${total}` : countLabel

  // Ver la cubierta montada → inventario filtrado por su código. Montar en una posición
  // vacía → inventario para asignar. Ambos navegan (Vehiculos se desmonta con el drawer).
  const verCubierta = (p) => onNavigate?.("cubiertas", { query: String(p.tireCode) })
  // Montar en ESTA posición: va a Cubiertas (tab Disponibles) con el montaje dirigido; al
  // tocar "Asignar" en una cubierta, el drawer abre con vehículo + posición ya cargados.
  const montar = (p) => onNavigate?.("cubiertas", { tab: "disponibles", assignTo: { vehicleId: v._id, mobile: v.mobile, position: p.label } })

  // Editor de ejes: toma el área de contenido (respeta el sidebar). El drawer y su backdrop
  // se retiran para no atenuar el sidebar ni capturar sus clics (antes cerraba todo).
  if (showReconfig) return <ConfigurarEjes vehicle={v} onClose={() => setShowReconfig(false)} />

  return (
    <div className="fixed inset-0 z-40 flex justify-end" style={{ background: "rgba(4,5,6,.55)" }} onClick={onClose}>
      <aside
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-[480px] flex-col"
        style={{ background: "var(--elev)", borderLeft: "1px solid var(--bd)", animation: "opDrawerIn .22s cubic-bezier(.22,1,.36,1)" }}
      >
        {/* Header */}
        <div className="flex flex-none items-start gap-3.5 px-6 py-5" style={{ borderBottom: "1px solid var(--bd-soft)" }}>
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-[11px]" style={{ background: tipoBg, color: tipoColor }}>
            <LocalShippingOutlinedIcon sx={{ fontSize: 24 }} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <span className="text-[24px] font-bold leading-none" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>{v.mobile || "—"}</span>
              {v.type && <span className="rounded-full px-2.5 py-[3px] text-[11px] font-semibold" style={{ color: tipoColor, background: tipoBg }}>{v.type}</span>}
            </div>
            <div className="mt-[3px] text-[12px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-5)" }}>{v.licensePlate || "—"} · {v.brand || "—"}</div>
          </div>
          <button onClick={onClose} title="Cerrar" className="rounded-lg p-1.5" style={{ color: "var(--tx-5)" }}><CloseRoundedIcon sx={{ fontSize: 20 }} /></button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-[22px]">
          {/* Stats */}
          <div className="mb-[22px] grid grid-cols-2 gap-2.5">
            <div className="rounded-[11px] px-[15px] py-[13px]" style={{ border: "1px solid var(--bd-soft)" }}>
              <div className="text-[11.5px]" style={{ color: "var(--tx-5)" }}>Km del vehículo</div>
              <div className="mt-[3px] text-[19px] font-semibold" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx)" }}>{kmLabel}</div>
            </div>
            <div className="rounded-[11px] px-[15px] py-[13px]" style={{ border: "1px solid var(--bd-soft)" }}>
              <div className="text-[11.5px]" style={{ color: "var(--tx-5)" }}>Cubiertas montadas</div>
              <div className="mt-[3px] text-[19px] font-semibold" style={{ fontFamily: "'IBM Plex Mono'", color: countColor }}>{mountedLabel}</div>
            </div>
          </div>

          {/* Posiciones */}
          {hasAxles ? (
            <>
              <div className="mb-3 text-[10.5px] tracking-[.06em]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>POSICIONES</div>
              <div className="flex flex-col gap-2">
                {positions.map((p, i) => (
                  <div key={i} className="flex items-center gap-[13px] rounded-[11px] px-3.5 py-3" style={{ border: "1px solid var(--bd-soft)", background: "var(--card)" }}>
                    <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[9px] text-[10px] font-semibold" style={{ fontFamily: "'IBM Plex Mono'", background: p.empty ? "var(--input)" : p.bg, border: p.empty ? "1.5px dashed var(--bd-strong)" : "1.5px solid transparent", color: p.empty ? "var(--tx-6)" : p.dot }}>{p.label}</span>
                    <div className="min-w-0 flex-1">
                      {p.empty ? (
                        <>
                          <div className="text-[13.5px] font-semibold" style={{ color: "var(--tx-5)" }}>Posición vacía</div>
                          <div className="text-[11.5px]" style={{ color: "var(--tx-6)" }}>Sin cubierta montada</div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>#{p.tireCode}</span>
                          <span className="inline-flex items-center gap-[5px] rounded-full px-[9px] py-[2px] text-[11px] font-semibold" style={{ color: p.dot, background: p.bg }}>
                            <span className="rounded-full" style={{ width: 6, height: 6, background: p.dot }} />{p.status}
                          </span>
                        </div>
                      )}
                    </div>
                    {p.empty ? (
                      <button onClick={() => montar(p)} className="inline-flex h-[34px] flex-none items-center gap-1.5 rounded-lg px-3 text-[12px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--ink-lime)" }}>
                        <AddRoundedIcon sx={{ fontSize: 15 }} /> Montar
                      </button>
                    ) : (
                      <button onClick={() => verCubierta(p)} className="inline-flex h-[34px] flex-none items-center gap-1.5 rounded-lg px-3 text-[12px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx-2)" }}>
                        Ver <ChevronRightRoundedIcon sx={{ fontSize: 15 }} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-[11px] px-4 py-3.5 text-[12.5px]" style={{ background: "var(--input)", border: "1px dashed var(--bd-strong)", color: "var(--tx-4)" }}>
              Ejes sin configurar. Reconfigurá el vehículo para definir su esquema y habilitar el montaje de cubiertas.
            </div>
          )}

          {/* Acciones */}
          <div className="mt-5 flex gap-2.5">
            <button onClick={() => setShowReconfig(true)} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[10px] text-[13px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--card)", color: "var(--tx)" }}>
              <SettingsInputComponentRoundedIcon sx={{ fontSize: 16 }} /> Reconfigurar ejes
            </button>
            <button onClick={() => setShowEdit(true)} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[10px] text-[13px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--card)", color: "var(--tx)" }}>
              <EditRoundedIcon sx={{ fontSize: 16 }} /> Editar datos
            </button>
          </div>
        </div>
      </aside>

      {/* Editar datos: modal sobre el drawer. Al guardar cierra todo → la lista se refresca. */}
      {showEdit && <EditarVehiculo vehicle={v} onClose={() => setShowEdit(false)} onSaved={onClose} />}
    </div>
  )
}

export default VehicleDrawer
