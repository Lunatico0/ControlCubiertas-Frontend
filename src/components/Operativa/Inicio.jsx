import { useState, useContext } from "react"
import ApiContext from "@context/apiContext"
import { useAuth } from "@context/AuthContext"
import { showToast } from "@utils/toast"
import SearchRoundedIcon from "@mui/icons-material/SearchRounded"
import AddRoundedIcon from "@mui/icons-material/AddRounded"
import TripOriginRoundedIcon from "@mui/icons-material/TripOriginRounded"
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined"
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded"
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined"
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded"
import { tint } from "./status"

// Pantalla de Inicio del operario: saludo + buscador grande + accesos directos.
// onNavigate(section, intent) lo provee el OperativaLayout para saltar al inventario
// (opcionalmente con una búsqueda o un filtro ya aplicado).
const Inicio = ({ onNavigate }) => {
  const { data } = useContext(ApiContext)
  const { user } = useAuth()
  const tires = data?.tires || []
  const [q, setQ] = useState("")

  const displayName = user?.name || user?.email?.split("@")[0] || "Operario"
  const counts = {
    stock: tires.filter((t) => !t.vehicle).length,
    circ: tires.filter((t) => t.vehicle).length,
    recapar: tires.filter((t) => t.status === "A recapar").length,
  }

  const goSearch = () => onNavigate("cubiertas", { query: q.trim() })
  const soon = (m) => showToast("info", m)

  const TILES = [
    { key: "alta", title: "Alta de cubierta", sub: "Registrar una nueva", icon: <AddRoundedIcon />, primary: true, onClick: () => soon("Alta de cubierta — próximo hito") },
    { key: "buscar", title: "Buscar cubierta", sub: "Ver el inventario", icon: <TripOriginRoundedIcon />, accent: "var(--ink-lime)", onClick: () => onNavigate("cubiertas") },
    { key: "asignar", title: "Asignar a vehículo", sub: "Montar una cubierta", icon: <LocalShippingOutlinedIcon />, accent: "var(--ink-blue)", onClick: () => onNavigate("cubiertas", { tab: "stock" }) },
    { key: "comp", title: "Comprobantes", sub: "Imprimir / reimprimir", icon: <ReceiptLongRoundedIcon />, accent: "var(--ink-purple)", onClick: () => onNavigate("comprobantes") },
  ]

  const ACCESS = [
    { label: "En stock", count: counts.stock, icon: <Inventory2OutlinedIcon />, accent: "var(--ink-lime)", tab: "stock" },
    { label: "En circulación", count: counts.circ, icon: <LocalShippingOutlinedIcon />, accent: "var(--ink-blue)", tab: "circulacion" },
    { label: "A recapar · requieren acción", count: counts.recapar, icon: <WarningAmberRoundedIcon />, accent: "var(--ink-orange)", tab: "recapar", warn: true },
  ]

  return (
    <div className="mx-auto max-w-[1000px] px-8 pb-10 pt-12">
      <h1 className="text-[32px] font-bold tracking-[-.02em]" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>
        Hola, {displayName} 👋
      </h1>
      <p className="mt-[7px] text-[15px]" style={{ color: "var(--tx-4)" }}>¿Qué cubierta vas a operar hoy?</p>

      {/* Buscador grande */}
      <div className="relative mt-[26px]">
        <span className="absolute left-5 top-1/2 -translate-y-1/2" style={{ color: "var(--tx-7)" }}>
          <SearchRoundedIcon sx={{ fontSize: 22 }} />
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && goSearch()}
          placeholder="Buscar por código, marca o N° de serie…"
          className="h-16 w-full rounded-[14px] pl-14 pr-4 text-[17px] outline-none"
          style={{ background: "var(--card)", border: "1.5px solid var(--bd)", color: "var(--tx)" }}
          onFocus={(e) => (e.target.style.borderColor = "var(--ink-lime)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--bd)")}
        />
      </div>

      {/* Tiles de acción */}
      <div className="mt-[26px] grid grid-cols-1 gap-[14px] sm:grid-cols-2 lg:grid-cols-4">
        {TILES.map((t) => (
          <button
            key={t.key}
            onClick={t.onClick}
            className="flex min-h-[130px] flex-col justify-between rounded-[14px] p-5 text-left transition"
            style={t.primary
              ? { background: "var(--ink-lime)", color: "#0A0C0D" }
              : { background: "var(--card)", border: "1px solid var(--bd)", color: "var(--tx)" }}
          >
            <span className="grid h-11 w-11 place-items-center rounded-[11px]"
              style={t.primary ? { background: "rgba(10,12,13,.12)" } : { background: tint(t.accent, 14), color: t.accent }}>
              {t.icon}
            </span>
            <span>
              <span className="block text-[16px] font-bold" style={{ fontFamily: "'Space Grotesk'" }}>{t.title}</span>
              <span className="mt-0.5 block text-[12.5px]" style={{ color: t.primary ? "rgba(10,12,13,.7)" : "var(--tx-4)" }}>{t.sub}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Accesos rápidos por estado */}
      <div className="mb-3 mt-[30px] text-[11px] tracking-[.08em]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>ACCESO RÁPIDO</div>
      <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-3">
        {ACCESS.map((a) => (
          <button
            key={a.tab}
            onClick={() => onNavigate("cubiertas", { tab: a.tab })}
            className="flex items-center gap-[14px] rounded-[13px] p-[18px] text-left transition"
            style={{ background: "var(--card)", border: `1px solid ${a.warn ? tint(a.accent, 30) : "var(--bd)"}` }}
          >
            <span className="grid h-[46px] w-[46px] flex-none place-items-center rounded-[11px]" style={{ background: tint(a.accent, 14), color: a.accent }}>
              {a.icon}
            </span>
            <span>
              <span className="block text-[24px] font-bold leading-none" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>{a.count}</span>
              <span className="mt-[3px] block text-[13px]" style={{ color: a.warn ? a.accent : "var(--tx-4)" }}>{a.label}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default Inicio
