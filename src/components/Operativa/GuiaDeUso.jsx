import GuiaShell, { H2, H3, P, B, UL, Kbd, Callout, Faqs } from "./GuiaShell"
import BoltRoundedIcon from "@mui/icons-material/BoltRounded"
import InfoRoundedIcon from "@mui/icons-material/InfoRounded"
import WarningRoundedIcon from "@mui/icons-material/WarningRounded"
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded"

// Guía de uso completa del OPERATIVO (rediseño Claude Design "Guia de Uso.dc.html"). Página
// propia (ruta /guia). El shell (TOC fijo + toggle tema + layout) vive en GuiaShell.
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

const GuiaDeUso = () => (
  <GuiaShell
    sidebarTitle="GUÍA DE USO"
    eyebrow="MANUAL DEL USUARIO OPERATIVO"
    title="Cómo usar Control Cubiertas"
    intro="Esta guía cubre todo el día a día de la app: buscar y dar de alta cubiertas, seguir su ciclo de recapado, montarlas y desmontarlas de los vehículos, reconfigurar ejes e imprimir comprobantes. Está pensada para leerse de corrido o consultarse por sección."
    toc={TOC}
    backTo="/"
    backLabel="Volver a la app"
    footer="Control Cubiertas · Guía del usuario operativo"
  >
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
    <Callout Icon={BoltRoundedIcon} tone="var(--ink-lime)"><B>Atajo:</B> apretá <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> en cualquier pantalla para saltar directo al buscador de cubiertas.</Callout>

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
    <P>Si un vehículo quedó con un esquema de ejes equivocado, en el detalle tocá <B>Reconfigurar ejes</B>. Se abre un editor con presets (Auto, Camión 4×2 / 6×4, Semi, Bus, Moto), ajuste eje por eje (simple/dual, agregar/quitar) y preview en vivo.</P>
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
      {[["Ctrl + K", "Ir al buscador de cubiertas"], ["Esc", "Cerrar paneles y ventanas abiertas"]].map(([k, d]) => (
        <div key={k} className="flex items-center gap-3.5 rounded-[9px] px-3.5 py-[11px]" style={{ border: "1px solid var(--bd)", background: "var(--card)" }}>
          <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: 13, background: "var(--input)", border: "1px solid var(--bd-strong)", borderRadius: 6, padding: "3px 11px", color: "var(--ink-lime)" }}>{k}</span>
          <span className="text-[14px]" style={{ color: "var(--tx-2)" }}>{d}</span>
        </div>
      ))}
    </div>

    <H2 id="faq">8 · Preguntas frecuentes</H2>
    <Faqs items={FAQS} />
  </GuiaShell>
)

export default GuiaDeUso
