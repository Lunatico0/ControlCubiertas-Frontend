import GuiaShell, { H2, H3, P, B, UL, Callout, Faqs } from "@components/Operativa/GuiaShell"
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded"
import WarningRoundedIcon from "@mui/icons-material/WarningRounded"
import InfoRoundedIcon from "@mui/icons-material/InfoRounded"

// Guía del ADMINISTRADOR (rediseño Claude Design "Guia Admin.dc.html"). Página propia
// (ruta /admin/guia). Comparte el shell con la guía operativa (GuiaShell).
const TOC = [
  { num: "1", label: "Acceso y roles", href: "#acceso" },
  { num: "2", label: "Resumen", href: "#resumen" },
  { num: "3", label: "Usuarios", href: "#usuarios" },
  { num: "4", label: "Empresa y estados", href: "#empresa" },
  { num: "5", label: "Comprobantes", href: "#comprobantes" },
  { num: "6", label: "Editor de comprobante", href: "#editor" },
  { num: "7", label: "Preguntas frecuentes", href: "#faq" },
]
const FAQS = [
  { q: "¿Cómo agrego a alguien del equipo?", a: "En Usuarios → Crear usuario. Cargás nombre, email y rol; se le envía una contraseña temporal que deberá cambiar en su primer ingreso." },
  { q: "Quiero permitir un recapado más", a: "En Empresa → Estados de stock, subí “Recapados permitidos” con el control +. Se agrega un estado intermedio al ciclo automáticamente." },
  { q: "¿Dónde cambio el pie o el prefijo del comprobante?", a: "En el Editor de comprobante. Toda la configuración del comprobante impreso vive ahí, con vista previa en vivo — ya no está en la sección Empresa." },
  { q: "No puedo desactivarme", a: "Si sos el único admin activo, el sistema lo impide para no dejar la empresa sin administrador. Designá a otro admin primero y luego podrás desactivarte." },
]

const GuiaAdmin = () => (
  <GuiaShell
    sidebarTitle="GUÍA DEL ADMIN"
    badge="SOLO TENANT-ADMIN"
    eyebrow="MANUAL DEL ADMINISTRADOR"
    title="Administrar tu empresa en Control Cubiertas"
    intro="El panel de administración es donde configurás tu organización: el equipo que accede, el ciclo de estados de las cubiertas, el diseño del comprobante impreso y el histórico de comprobantes. Solo lo ven los usuarios con rol tenant-admin."
    toc={TOC}
    backTo="/admin"
    backLabel="Volver al panel"
    footer="Control Cubiertas · Guía del administrador"
  >
    <H2 id="acceso">1 · Acceso y roles</H2>
    <P>Hay dos roles en Control Cubiertas:</P>
    <UL>
      <li><B>Tenant-admin:</B> además de operar, accede a este panel para gestionar equipo y configuración.</li>
      <li><B>Operativo:</B> usa la app del día a día (cubiertas, vehículos, comprobantes). No ve el panel de administración.</li>
    </UL>
    <Callout Icon={CheckCircleRoundedIcon} tone="var(--ink-lime)"><B>Primer ingreso:</B> el alta del admin llega con una contraseña temporal. Al entrar por primera vez se te pide cambiarla antes de continuar.</Callout>

    <H2 id="resumen">2 · Resumen (panorama)</H2>
    <P>La pantalla de inicio del panel muestra el estado general de la flota: totales de cubiertas por ubicación (en circulación, en depósito), cantidad de vehículos, la distribución por estado del ciclo y señales de atención (por ejemplo, cubiertas a recapar o vehículos sin cubiertas). Es solo lectura: un vistazo rápido para decidir dónde actuar.</P>

    <H2 id="usuarios">3 · Usuarios</H2>
    <P>Gestionás quién accede a Control Cubiertas dentro de tu empresa.</P>
    <UL>
      <li><B>Crear usuario:</B> nombre, email y rol. Se le envía una contraseña temporal para su primer ingreso.</li>
      <li><B>Editar / cambiar rol:</B> ajustás datos o pasás a alguien de operativo a admin y viceversa.</li>
      <li><B>Desactivar:</B> corta el acceso sin borrar el historial. Pide confirmación.</li>
    </UL>
    <Callout Icon={WarningRoundedIcon} tone="var(--ink-orange)">Si sos el <B>único administrador</B>, no podés desactivarte a vos mismo: siempre debe quedar al menos un admin activo. Primero designá a otro admin.</Callout>

    <H2 id="empresa">4 · Empresa y ciclo de estados</H2>
    <P>Acá viven los <B>datos de la organización</B> (nombre, CUIT, dirección, teléfono) y el <B>ciclo de estados</B> de las cubiertas.</P>
    <H3>Estados fijos y recapados</H3>
    <P>El ciclo tiene estados <B>fijos</B> que siempre existen (Nueva, A recapar, Descartada): podés cambiarles el nombre y el color, pero no eliminarlos. Los estados <B>intermedios</B> son los recapados: con el control de <B>“Recapados permitidos”</B> definís cuántas veces se puede recapar una cubierta antes de descartarla — eso agrega o quita estados intermedios.</P>
    <P>Tocá cualquier estado en la fila del ciclo para editar su <B>nombre</B> y <B>color</B>. Un candado marca los fijos; un tilde indica los que están en uso (con cubiertas), para evitar reducir por debajo de lo que ya se usa.</P>

    <H2 id="comprobantes">5 · Comprobantes (histórico)</H2>
    <P>El registro completo de comprobantes emitidos por cada movimiento (alta, asignación, desasignación, recapado, corrección, descarte). Podés <B>buscar</B> por número, cubierta o patente, <B>filtrar por tipo</B>, <B>reimprimir</B> o <B>ver</B> cualquiera, y <B>exportar a CSV</B>. El número mostrado siempre coincide con el del sistema.</P>

    <H2 id="editor">6 · Editor de comprobante</H2>
    <P>Diseñás cómo se ve el comprobante que sale por la impresora, con <B>vista previa en vivo</B> sobre una hoja A4. Podés ajustar:</P>
    <UL>
      <li><B>Encabezado:</B> nombre de la empresa, CUIT, teléfono y dirección; se puede mostrar u ocultar.</li>
      <li><B>Logo:</B> subir, posición y tamaño.</li>
      <li><B>Secciones:</B> mostrar/ocultar y reordenar (cubierta, vehículo, kilometraje, orden).</li>
      <li><B>Texto:</B> tipografía, tamaño (S/M/L), alineación y color de acento de la marca.</li>
      <li><B>Pie de comprobante</B> y <B>duplicado:</B> se imprime en A4 con línea de corte — arriba el original, abajo el duplicado. El toggle permite imprimir solo el original.</li>
    </UL>
    <Callout Icon={InfoRoundedIcon} tone="var(--ink-blue)">El prefijo y el pie del comprobante se configuran acá, en el editor — no en la sección Empresa. Todo lo del comprobante vive en un solo lugar.</Callout>

    <H2 id="faq">7 · Preguntas frecuentes</H2>
    <Faqs items={FAQS} />
  </GuiaShell>
)

export default GuiaAdmin
