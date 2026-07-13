import { useTheme } from "@context/ThemeContext"
import { Link } from "react-router-dom"
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded"
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded"
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded"
import BoltRoundedIcon from "@mui/icons-material/BoltRounded"
import InfoRoundedIcon from "@mui/icons-material/InfoRounded"
import WarningRoundedIcon from "@mui/icons-material/WarningRounded"
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded"

// Guía de uso completa (rediseño Claude Design "Guia de Uso.dc.html"). Manual del usuario
// operativo: página propia (ruta /guia, abre en pestaña nueva desde Ayuda). Respeta el
// tema claro/oscuro. Contenido estático organizado en 8 secciones con TOC lateral.
const TOC = [
  { num: "1", label: "Qué es", href: "#intro" },
  { num: "2", label: "Inicio", href: "#inicio" },
  { num: "3", label: "Cubiertas", href: "#cubiertas" },
  { num: "4", label: "Vehículos y ejes", href: "#vehiculos" },
  { num: "5", label: "Comprobantes", href: "#comprobantes" },
  { num: "6", label: "Configuración", href: "#config" },
  { num: "7", label: "Atajos", href: "#atajos" },
  { num: "8", label: "Preguntas frecuentes", href: "#faq" },
]
// Colores de estado (datos, espejo de /op) — se ven igual en claro y oscuro.
const ESTADOS = [
  { label: "Nueva", color: "#C4ED2B", dot: "#C4ED2B", bg: "rgba(196,237,43,.13)", desc: "Recién ingresada al inventario, sin usar." },
  { label: "1er Recapado", color: "#3FD9BE", dot: "#1FD0B4", bg: "rgba(24,184,158,.14)", desc: "Pasó por su primer recapado y está operativa." },
  { label: "2do Recapado", color: "#6E97F5", dot: "#6E97F5", bg: "rgba(110,151,245,.16)", desc: "Segundo recapado completado." },
  { label: "3er Recapado", color: "#9D90F5", dot: "#B39CF7", bg: "rgba(157,144,245,.16)", desc: "Tercer recapado — último tramo de vida útil." },
  { label: "A recapar", color: "#F0A85A", dot: "#F0851F", bg: "rgba(240,133,31,.13)", desc: "Desgaste al límite: esperando recapado en el taller." },
  { label: "Descartada", color: "#F0716A", dot: "#F0564A", bg: "rgba(240,86,74,.14)", desc: "Fin de vida útil. Conserva su historial pero no se puede montar." },
]
const FAQS = [
  { q: "Asigné una cubierta y la lista no cambió", a: "No debería pasar: los cambios se reflejan al instante. Si ves algo raro, volvé a entrar a la sección — no hace falta refrescar la página." },
  { q: "El vehículo dice “ejes sin configurar”", a: "Es un vehículo migrado sin esquema. Abrí su detalle y usá “Reconfigurar ejes” para definir la cantidad y tipo de ejes; recién ahí vas a poder montar cubiertas." },
  { q: "¿Puedo corregir un movimiento mal cargado?", a: "Sí. En el historial de la cubierta cada movimiento tiene la opción de corregir, que genera un comprobante de corrección sin borrar el original." },
  { q: "¿Cómo vuelvo a ver el tour de bienvenida?", a: "Desde el botón de ayuda (el signo de pregunta, abajo en el menú lateral) → “Ver guía interactiva”. Se puede reproducir las veces que quieras." },
]

const H2 = ({ id, children }) => (
  <h2 id={id} className="mt-12 pb-3 text-[26px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)", borderBottom: "1px solid var(--bd)", scrollMarginTop: 24 }}>{children}</h2>
)
const H3 = ({ children }) => <h3 className="mb-2 mt-[26px] text-[17px] font-semibold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>{children}</h3>
const P = ({ children }) => <p className="text-[15px]" style={{ lineHeight: 1.7, color: "var(--tx-2)" }}>{children}</p>
const B = ({ children }) => <b style={{ color: "var(--tx)" }}>{children}</b>
const UL = ({ children }) => <ul className="pl-[22px] text-[15px]" style={{ lineHeight: 1.8, color: "var(--tx-2)" }}>{children}</ul>
const Callout = ({ Icon, tone, children }) => (
  <div className="mt-3.5 flex gap-[11px] rounded-[11px] px-4 py-3.5" style={{ border: `1px solid color-mix(in srgb, ${tone} 30%, transparent)`, background: `color-mix(in srgb, ${tone} 7%, transparent)` }}>
    <span className="inline-flex flex-none" style={{ color: tone }}><Icon sx={{ fontSize: 18 }} /></span>
    <div className="text-[13.5px]" style={{ lineHeight: 1.6, color: "var(--tx-2)" }}>{children}</div>
  </div>
)
const Kbd = ({ children }) => <span style={{ fontFamily: "'IBM Plex Mono'", background: "var(--input)", border: "1px solid var(--bd-strong)", borderRadius: 5, padding: "1px 7px" }}>{children}</span>

const Logo = ({ c = "var(--ink-lime)", s = 34 }) => (
  <svg width={s} height={s} viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke={c} strokeWidth="3.4" strokeDasharray="78 22" strokeLinecap="round" transform="rotate(-50 20 20)" /><circle cx="20" cy="20" r="6.4" stroke={c} strokeWidth="3.4" /></svg>
)

const GuiaDeUso = () => {
  const { isDarkMode, toggleTheme } = useTheme()
  return (
    <div data-app-theme={isDarkMode ? "dark" : "light"} className="flex h-screen w-full overflow-hidden text-left" style={{ background: "var(--bg)", color: "var(--tx)", fontFamily: "'IBM Plex Sans',system-ui,sans-serif" }}>
      {/* TOC — fijo (altura de viewport, no scrollea con el contenido) */}
      <aside className="hidden h-screen w-[270px] flex-none flex-col overflow-y-auto px-5 py-[26px] md:flex" style={{ background: "var(--sidebar)", borderRight: "1px solid var(--bd-faint)" }}>
        <div className="mb-[22px] flex items-center gap-[11px]">
          <Logo />
          <div style={{ lineHeight: 1 }}>
            <div className="text-[13px] font-bold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>GUÍA DE USO</div>
            <div className="mt-0.5 text-[10px]" style={{ fontFamily: "'IBM Plex Mono'", color: "var(--tx-6)" }}>Control Cubiertas</div>
          </div>
        </div>
        <nav className="flex flex-col gap-px">
          {TOC.map((t) => (
            <a key={t.href} href={t.href} className="flex items-center gap-2.5 rounded-lg px-[11px] py-[9px] text-[13px]" style={{ textDecoration: "none", color: "var(--tx-3)" }}>
              <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 10, color: "var(--tx-7)", width: 16 }}>{t.num}</span>{t.label}
            </a>
          ))}
        </nav>
        <div className="mt-auto pt-[18px]" style={{ borderTop: "1px solid var(--bd-faint)" }}>
          <button onClick={toggleTheme} className="mb-2.5 flex w-full items-center gap-2.5 rounded-[9px] border px-3 py-2.5 text-[13px] font-medium" style={{ borderColor: "var(--bd)", background: "var(--elev)", color: "var(--tx-2)" }}>
            <span className="inline-flex" style={{ color: "var(--ink-lime)" }}>{isDarkMode ? <DarkModeRoundedIcon sx={{ fontSize: 17 }} /> : <LightModeRoundedIcon sx={{ fontSize: 18 }} />}</span>
            {isDarkMode ? "Tema oscuro" : "Tema claro"}
          </button>
          <Link to="/" className="inline-flex items-center gap-2 text-[12.5px]" style={{ color: "var(--ink-lime)", textDecoration: "none" }}>
            <ChevronLeftRoundedIcon sx={{ fontSize: 16 }} /> Volver a la app
          </Link>
        </div>
      </aside>

      {/* CONTENIDO — el scroll vive acá (la página no scrollea, el TOC queda fijo) */}
      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto" style={{ maxWidth: 820, padding: "52px 48px 90px" }}>
        <div className="mb-3 text-[11px]" style={{ fontFamily: "'IBM Plex Mono'", letterSpacing: ".14em", color: "var(--ink-lime)" }}>MANUAL DEL USUARIO OPERATIVO</div>
        <h1 className="text-[40px] font-bold" style={{ fontFamily: "'Space Grotesk'", letterSpacing: "-.02em", color: "var(--tx)", lineHeight: 1.05 }}>Cómo usar Control Cubiertas</h1>
        <p className="mt-4 text-[16px]" style={{ lineHeight: 1.65, color: "var(--tx-3)", maxWidth: 640 }}>
          Esta guía cubre todo el día a día de la app: buscar y dar de alta cubiertas, seguir su ciclo de recapado, montarlas y desmontarlas de los vehículos, reconfigurar ejes e imprimir comprobantes. Está pensada para leerse de corrido o consultarse por sección.
        </p>
        <Callout Icon={PlayArrowRoundedIcon} tone="var(--ink-lime)">¿Preferís un recorrido guiado? Usá <B>Ayuda → Ver guía interactiva</B> en la app.</Callout>

        <H2 id="intro">1 · Qué es Control Cubiertas</H2>
        <P>Control Cubiertas es el sistema para administrar el ciclo de vida completo de cada cubierta de la flota: desde que ingresa nueva al depósito hasta que se descarta. Cada cubierta tiene un <B>código único</B>, un <B>estado</B> dentro del ciclo de recapado, una <B>ubicación</B> (depósito o montada en un vehículo) y un <B>historial</B> de todos sus movimientos.</P>
        <P>Cada movimiento (alta, montaje, desmontaje, recapado, descarte) genera automáticamente un <B>comprobante</B> con su número correlativo, que podés imprimir o reimprimir cuando quieras.</P>

        <H2 id="inicio">2 · La pantalla de Inicio</H2>
        <P>Es tu punto de partida. Pensada para operar rápido, tiene tres zonas:</P>
        <UL>
          <li><B>Búsqueda grande:</B> escribí código, marca o N° de serie para encontrar cualquier cubierta al instante.</li>
          <li><B>Botones grandes:</B> las acciones más frecuentes (dar de alta, buscar, montar, comprobantes) a un toque — cómodos también en tablet.</li>
          <li><B>Accesos por estado:</B> tarjetas con el conteo de cubiertas en stock, en circulación y a recapar. Tocá una para ir directo a ese grupo filtrado.</li>
        </UL>
        <Callout Icon={BoltRoundedIcon} tone="var(--ink-lime)"><B>Atajo:</B> apretá la tecla <Kbd>/</Kbd> en cualquier pantalla para saltar directo al buscador de cubiertas.</Callout>

        <H2 id="cubiertas">3 · Cubiertas (el inventario)</H2>
        <P>Es el corazón operativo. Podés verlo como <B>tarjetas</B> (más visual) o como <B>lista</B> (más densa) con el toggle de la esquina superior derecha.</P>
        <H3>Filtros rápidos</H3>
        <P>Arriba tenés los filtros por estado: <B>Todas</B>, <B>En stock</B>, <B>En circulación</B> y <B>A recapar</B>. El número al lado de cada uno te dice cuántas cubiertas hay en ese grupo.</P>
        <H3>El ciclo de vida y sus estados</H3>
        <P>Cada cubierta avanza por un ciclo. El estado siempre se muestra con su <B>nombre</B> (por accesibilidad) y con un <B>color</B> distinto como ayuda visual:</P>
        <div className="mt-3.5 flex flex-col gap-2">
          {ESTADOS.map((e) => (
            <div key={e.label} className="flex items-center gap-[13px] rounded-[9px] px-3.5 py-[11px]" style={{ border: "1px solid var(--bd)", borderLeft: `4px solid ${e.dot}`, background: "var(--card)" }}>
              <span className="inline-flex items-center gap-[7px] rounded-full px-[11px] py-[3px] text-[12.5px] font-semibold" style={{ color: e.color, background: e.bg, minWidth: 120 }}>
                <span className="rounded-full" style={{ width: 7, height: 7, background: e.dot }} />{e.label}
              </span>
              <span className="text-[13.5px]" style={{ color: "var(--tx-2)", lineHeight: 1.5 }}>{e.desc}</span>
            </div>
          ))}
        </div>
        <H3>Acciones sobre una cubierta</H3>
        <P>Desde la fila/tarjeta o desde el panel de detalle (se abre a la derecha al tocar una cubierta) tenés, según el estado:</P>
        <UL>
          <li><B>Asignar a vehículo:</B> montás la cubierta en una posición. Pedís km inicial y N° de orden; se genera el comprobante.</li>
          <li><B>Desasignar:</B> la bajás del vehículo. Con el km de baja se calculan los km recorridos en el período.</li>
          <li><B>Registrar km:</B> sumás kilómetros sin desmontar.</li>
          <li><B>Enviar a recapar / Recapado listo:</B> mueven la cubierta dentro del ciclo de recapado.</li>
          <li><B>Imprimir recibo:</B> reimprime el comprobante de un movimiento.</li>
          <li><B>Descartar:</B> marca el fin de vida útil. Se conserva el historial pero deja de estar disponible.</li>
        </UL>
        <Callout Icon={InfoRoundedIcon} tone="var(--ink-blue)">Cada cambio se refleja al instante en la lista y en el detalle — no hace falta refrescar. Y todo movimiento queda en el <B>historial</B> de la cubierta, con su comprobante.</Callout>

        <H2 id="vehiculos">4 · Vehículos y ejes</H2>
        <P>Cada vehículo muestra su <B>esquema de ejes</B> (vista superior) con las posiciones coloreadas según el estado de la cubierta montada, más el conteo de cubiertas y el kilometraje. Podés verlos como tarjetas o lista con el toggle.</P>
        <H3>Detalle del vehículo</H3>
        <P>Al tocar un vehículo se abre su panel a la derecha con todas las <B>posiciones</B>. En cada una podés <B>Ver</B> la cubierta montada (te lleva a su detalle) o <B>Montar</B> una si está vacía.</P>
        <H3>Reconfigurar ejes</H3>
        <P>Si un vehículo quedó con un esquema de ejes equivocado, en el detalle tocá <B>Reconfigurar ejes</B>. Se abre un editor con:</P>
        <UL>
          <li><B>Presets</B> para arrancar rápido (Auto, Camión 4×2 / 6×4, Semi, Bus, Moto).</li>
          <li>Ajuste <B>eje por eje</B>: cambiar entre simple (2 cubiertas) y dual (4), agregar o quitar ejes.</li>
          <li><B>Preview en vivo</B> del esquema con el total de posiciones.</li>
        </UL>
        <Callout Icon={WarningRoundedIcon} tone="var(--ink-orange)">Al reconfigurar, las cubiertas montadas se reubican por orden. Si reducís posiciones, las que sobran quedan liberadas al depósito.</Callout>

        <H2 id="comprobantes">5 · Comprobantes</H2>
        <P>Cada movimiento genera un comprobante con número correlativo. Desde el detalle de una cubierta o desde su historial podés <B>imprimir</B> o <B>reimprimir</B> cualquiera. El número mostrado coincide siempre con el del sistema.</P>

        <H2 id="config">6 · Configuración y accesibilidad</H2>
        <UL>
          <li><B>Modo claro / oscuro:</B> el modo claro es ideal para talleres con mucha luz. Cambialo desde el botón del menú lateral. Tu preferencia se recuerda.</li>
          <li><B>Barra de color por estado:</B> agrega un borde de color a la izquierda de cada fila para escaneo rápido. El estado igual siempre se lee con su nombre.</li>
        </UL>

        <H2 id="atajos">7 · Atajos de teclado</H2>
        <div className="mt-3.5 flex flex-col gap-2">
          {[["/", "Ir al buscador de cubiertas"], ["Esc", "Cerrar paneles y ventanas abiertas"]].map(([k, d]) => (
            <div key={k} className="flex items-center gap-3.5 rounded-[9px] px-3.5 py-[11px]" style={{ border: "1px solid var(--bd)", background: "var(--card)" }}>
              <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 13, background: "var(--input)", border: "1px solid var(--bd-strong)", borderRadius: 6, padding: "3px 11px", color: "var(--ink-lime)" }}>{k}</span>
              <span className="text-[14px]" style={{ color: "var(--tx-2)" }}>{d}</span>
            </div>
          ))}
        </div>

        <H2 id="faq">8 · Preguntas frecuentes</H2>
        <div className="mt-4 flex flex-col gap-3">
          {FAQS.map((f) => (
            <div key={f.q} className="rounded-[11px] px-[18px] py-4" style={{ border: "1px solid var(--bd)", background: "var(--card)" }}>
              <div className="mb-1.5 text-[15px] font-semibold" style={{ fontFamily: "'Space Grotesk'", color: "var(--tx)" }}>{f.q}</div>
              <div className="text-[14px]" style={{ lineHeight: 1.65, color: "var(--tx-2)" }}>{f.a}</div>
            </div>
          ))}
        </div>

        <div className="mt-14 flex items-center gap-2.5 pt-[22px] text-[12.5px]" style={{ borderTop: "1px solid var(--bd)", color: "var(--tx-7)", fontFamily: "'IBM Plex Mono'" }}>
          <Logo c="var(--tx-7)" s={20} /> Control Cubiertas · Guía del usuario operativo
        </div>
        </div>
      </main>
    </div>
  )
}

export default GuiaDeUso
