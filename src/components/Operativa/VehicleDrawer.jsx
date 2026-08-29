import { useState, useContext, useCallback } from "react"
import ApiContext from "@context/apiContext"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import SettingsInputComponentOutlinedIcon from "@mui/icons-material/SettingsInputComponentOutlined"
import PauseCircleOutlineRoundedIcon from "@mui/icons-material/PauseCircleOutlineRounded"
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded"
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined"
import EditarVehiculo from "./EditarVehiculo"
import ConfigurarEjes from "./ConfigurarEjes"
import { formatPlate } from "@utils/plateFormat"
import { setVehicleService } from "@api/vehicles"
import { showToast } from "@utils/toast"
import { tint } from "./status"
import Callout from "@components/common/Callout"
import Drawer from "@components/common/Drawer"
import Pill from "@components/common/Pill"
import MonoLabel from "@components/common/MonoLabel"

// Detalle del vehículo (rediseño Claude Design "DRAWER VEHÍCULO"): stats + posiciones
// (ver/montar cubierta) + acciones (reconfigurar ejes, editar datos). Recibe el item ya
// computado por Vehiculos (v + positions derivadas de axles + cubiertas montadas).
const VehicleDrawer = ({ item, onClose, onNavigate }) => {
  const { data, utils } = useContext(ApiContext)
  const [showEdit, setShowEdit] = useState(false)
  const [showReconfig, setShowReconfig] = useState(false)
  // t145: fuera de servicio es un HECHO del vehículo, no una preferencia del dispositivo: si
  // el acoplado está parado, lo está para todos. El estado local es solo el optimista mientras
  // vuelve el PATCH; la fuente sigue siendo el vehículo.
  const [fueraDeServicio, setFueraDeServicio] = useState(!!item.v.outOfService)
  const [cambiandoServicio, setCambiandoServicio] = useState(false)
  const { v, positions, hasAxles, countLabel, countColor, tipoColor, tipoBg, kmLabel } = item

  // Cierre guardado por !showReconfig: mientras está abierto el editor de ejes, Esc/backdrop no
  // cierran el detalle (el editor tiene su propio Cancelar/volver). El <Drawer> ni siquiera se
  // monta durante showReconfig (return anticipado abajo), así que el guard es defensivo.
  const handleClose = useCallback(() => { if (!showReconfig) onClose() }, [showReconfig, onClose])

  const mounted = positions.filter((p) => !p.empty).length
  const total = positions.length
  const mountedLabel = hasAxles ? `${mounted}/${total}` : countLabel

  // Ver la cubierta montada → inventario filtrado por su código. Montar en una posición
  // vacía → inventario para asignar. Ambos navegan (Vehiculos se desmonta con el drawer).
  const toggleServicio = async () => {
    const siguiente = !fueraDeServicio
    setCambiandoServicio(true)
    try {
      const actualizado = await setVehicleService(v._id, siguiente)
      setFueraDeServicio(siguiente)
      // La LISTA tiene que enterarse: si no, el badge de la card y el conteo del Inicio siguen
      // mostrando el estado viejo hasta el próximo refresco global.
      utils?.replaceVehicleInList?.(actualizado)
      showToast("success", siguiente
        ? `${v.mobile} quedó fuera de servicio: deja de aparecer en los pendientes del día.`
        : `${v.mobile} vuelve al servicio.`)
    } catch (e) {
      showToast("error", e?.message || "No se pudo cambiar el estado de servicio")
    } finally {
      setCambiandoServicio(false)
    }
  }

  const verCubierta = (p) => onNavigate?.("cubiertas", { query: String(p.tireCode) })
  // Montar en ESTA posición: va a Cubiertas (tab Disponibles) con el montaje dirigido; al
  // tocar "Asignar" en una cubierta, el drawer abre con vehículo + posición ya cargados.
  const montar = (p) => onNavigate?.("cubiertas", { tab: "disponibles", assignTo: { vehicleId: v._id, mobile: v.mobile, position: p.label } })

  // Editor de ejes: toma el área de contenido (respeta el sidebar). El drawer y su backdrop
  // se retiran para no atenuar el sidebar ni capturar sus clics (antes cerraba todo).
  if (showReconfig) return <ConfigurarEjes vehicle={v} onClose={() => setShowReconfig(false)} />

  return (
    <>
      <Drawer
        onClose={handleClose}
        z={40}
        backdrop="rgba(4,5,6,.55)"
        maxWidth="480px"
        background="var(--elev)"
        animation="opDrawerIn var(--t-base) var(--t-ease)"
      >
        {/* Header */}
        <div className="flex flex-none items-start gap-3.5 px-6 py-5" style={{ borderBottom: "1px solid var(--bd-soft)" }}>
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-[var(--r-md)]" style={{ background: tipoBg, color: tipoColor }}>
            <LocalShippingOutlinedIcon sx={{ fontSize: 24 }} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <span className="text-[24px] font-bold leading-none" style={{ fontFamily: "var(--font-display)", color: "var(--tx)" }}>{v.mobile || "—"}</span>
              {v.type && <Pill style={{ color: tipoColor, background: tipoBg }}>{v.type}</Pill>}
              {fueraDeServicio && <Pill style={{ color: "var(--ink-orange)", background: tint("var(--ink-orange)", 16) }}>FUERA DE SERVICIO</Pill>}
            </div>
            <div className="mt-[3px] text-[12px]" style={{ fontFamily: "var(--font-mono)", color: "var(--tx-5)" }}>{formatPlate(v.licensePlate, data.plateSep) || "—"} · {v.brand || "—"}</div>
          </div>
          {/* t146: las dos acciones del vehículo viven ACÁ, no al fondo. En un semirremolque de
              12 posiciones había que scrollear las 12 filas para encontrarlas, sin una sola
              pista desde arriba de que existían — y corregir un esquema mal cargado es justo
              lo que se hace apenas se da de alta el vehículo. */}
          <div className="flex flex-none items-center gap-1.5">
            <button onClick={() => setShowReconfig(true)} title="Reconfigurar ejes" aria-label="Reconfigurar ejes" className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--r-md)]" style={{ border: "1px solid var(--bd-strong)", background: "var(--card)", color: "var(--tx-3)" }}>
              <SettingsInputComponentOutlinedIcon sx={{ fontSize: 17 }} />
            </button>
            <button onClick={() => setShowEdit(true)} title="Editar datos del vehículo" aria-label="Editar datos del vehículo" className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--r-md)]" style={{ border: "1px solid var(--bd-strong)", background: "var(--card)", color: "var(--tx-3)" }}>
              <EditOutlinedIcon sx={{ fontSize: 17 }} />
            </button>
            <button onClick={onClose} title="Cerrar" className="rounded-[var(--r-md)] p-1.5" style={{ color: "var(--tx-5)" }}><CloseRoundedIcon sx={{ fontSize: 20 }} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-6 py-[22px]">
          {/* Stats */}
          <div className="mb-[22px] grid grid-cols-2 gap-2.5">
            <div className="rounded-[var(--r-md)] px-[15px] py-[13px]" style={{ border: "1px solid var(--bd-soft)" }}>
              <div className="text-[11.5px]" style={{ color: "var(--tx-5)" }}>Km del vehículo</div>
              <div className="mt-[3px] text-[19px] font-semibold" style={{ fontFamily: "var(--font-mono)", color: "var(--tx)" }}>{kmLabel}</div>
            </div>
            <div className="rounded-[var(--r-md)] px-[15px] py-[13px]" style={{ border: "1px solid var(--bd-soft)" }}>
              <div className="text-[11.5px]" style={{ color: "var(--tx-5)" }}>Cubiertas montadas</div>
              <div className="mt-[3px] text-[19px] font-semibold" style={{ fontFamily: "var(--font-mono)", color: countColor }}>{mountedLabel}</div>
            </div>
          </div>

          {/* Posiciones */}
          {hasAxles ? (
            <>
              <MonoLabel className="mb-3 text-[10.5px] tracking-[.06em]" style={{ color: "var(--tx-6)" }}>POSICIONES</MonoLabel>
              <div className="flex flex-col gap-2">
                {positions.map((p, i) => (
                  <div key={i} className="flex items-center gap-[13px] rounded-[var(--r-md)] px-3.5 py-3" style={{ border: "1px solid var(--bd-soft)", background: "var(--card)" }}>
                    <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[var(--r-md)] text-[10px] font-semibold" style={{ fontFamily: "var(--font-mono)", background: p.empty ? "var(--input)" : p.bg, border: p.empty ? "1.5px dashed var(--bd-strong)" : "1.5px solid transparent", color: p.empty ? "var(--tx-6)" : p.dot }}>{p.label}</span>
                    <div className="min-w-0 flex-1">
                      {p.empty ? (
                        <>
                          <div className="text-[13.5px] font-semibold" style={{ color: "var(--tx-5)" }}>Posición vacía</div>
                          <div className="text-[11.5px]" style={{ color: "var(--tx-6)" }}>Sin cubierta montada</div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--tx)" }}>#{p.tireCode}</span>
                          <Pill className="gap-[5px] px-[9px] py-[2px] text-[11px] font-semibold" style={{ color: p.dot, background: p.bg }}>
                            <span className="rounded-full" style={{ width: 6, height: 6, background: p.dot }} />{p.status}
                          </Pill>
                        </div>
                      )}
                    </div>
                    {p.empty ? (
                      <button onClick={() => montar(p)} className="inline-flex h-[34px] flex-none items-center gap-1.5 rounded-[var(--r-md)] px-3 text-[12px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--ink-lime)" }}>
                        <AddRoundedIcon sx={{ fontSize: 15 }} /> Montar
                      </button>
                    ) : (
                      <button onClick={() => verCubierta(p)} className="inline-flex h-[34px] flex-none items-center gap-1.5 rounded-[var(--r-md)] px-3 text-[12px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--elev)", color: "var(--tx-2)" }}>
                        Ver <ChevronRightRoundedIcon sx={{ fontSize: 15 }} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <Callout tone="var(--bd-strong)" dashed className="">
              Ejes sin configurar. Reconfigurá el vehículo para definir su esquema y habilitar el montaje de cubiertas.
            </Callout>
          )}

          {/* Acciones. Se mantienen acá ADEMÁS de en la cabecera (t146): el que ya scrolleó
              hasta el fondo no tiene que volver arriba, y con rótulo se leen mejor que un ícono. */}
          <div className="mt-5 flex gap-2.5">
            <button onClick={() => setShowReconfig(true)} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[var(--r-md)] text-[13px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--card)", color: "var(--tx)" }}>
              <SettingsInputComponentOutlinedIcon sx={{ fontSize: 16 }} /> Reconfigurar ejes
            </button>
            <button onClick={() => setShowEdit(true)} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[var(--r-md)] text-[13px] font-semibold" style={{ border: "1px solid var(--bd-strong)", background: "var(--card)", color: "var(--tx)" }}>
              <EditOutlinedIcon sx={{ fontSize: 16 }} /> Editar datos
            </button>
          </div>

          {/* t145: la salida para el acoplado de temporada y el móvil parado, que si no quedan
              clavados en "PARA HOY" todos los días hasta que la lista deja de creerse. */}
          <button
            onClick={toggleServicio}
            disabled={cambiandoServicio}
            className="mt-2.5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--r-md)] text-[13px] font-semibold"
            style={{
              border: `1px solid ${fueraDeServicio ? tint("var(--ink-teal)", 40) : "var(--bd-strong)"}`,
              background: fueraDeServicio ? tint("var(--ink-teal)", 10) : "var(--card)",
              color: fueraDeServicio ? "var(--ink-teal)" : "var(--tx-3)",
              opacity: cambiandoServicio ? 0.6 : 1,
            }}
          >
            {fueraDeServicio
              ? <><PlayCircleOutlineRoundedIcon sx={{ fontSize: 17 }} /> Volver al servicio</>
              : <><PauseCircleOutlineRoundedIcon sx={{ fontSize: 17 }} /> Marcar fuera de servicio</>}
          </button>
          <div className="mt-1.5 text-center text-[11.5px]" style={{ color: "var(--tx-5)" }}>
            {fueraDeServicio
              ? "No cuenta como pendiente. Las cubiertas montadas siguen montadas."
              : "Un vehículo parado deja de aparecer en los pendientes del día."}
          </div>
        </div>
      </Drawer>

      {/* Editar datos: modal sobre el drawer. Al guardar cierra todo → la lista se refresca. */}
      {showEdit && <EditarVehiculo vehicle={v} onClose={() => setShowEdit(false)} onSaved={onClose} />}
    </>
  )
}

export default VehicleDrawer
