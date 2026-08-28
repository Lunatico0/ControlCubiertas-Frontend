// Tokens compartidos de los overlays centrados. ÚNICA fuente para los dos sistemas que
// conviven en la app y que el usuario ve en el MISMO flujo:
//   - DialogHost  → diálogos imperativos (confirm/danger/notice/print), vía @utils/dialog
//   - common/Modal → shell declarativo de los modales con formulario (UserForm, UpdaterModal)
//
// Antes cada uno traía sus propios números y no coincidían en NADA: ancho de card 420 vs 448,
// sombra .55 vs .6, velo .62 vs .66, título 17 vs 16px, y el cuerpo del modal en portal caía a
// la fuente del body en vez de IBM Plex Sans. Crear un usuario y confirmar su baja a continuación
// mostraba dos diseños distintos.
//
// No es un componente nuevo: los dos siguen con su markup, pero leen de acá. Cambiar un valor
// acá los mueve a los dos, que es exactamente lo que faltaba.

export const OVERLAY = {
  backdrop: "rgba(4,5,6,.62)",
  shadow: "var(--elev-3)",
  radius: 14,
  padding: 22, // padding horizontal del header, del cuerpo y del pie
  fontFamily: "var(--font-sans)",
  titleFont: "'Space Grotesk'",
  titleSize: 17,
  maxWidth: 440, // ancho por defecto de la card
  zIndex: 50,
}

// Base de la card. Cada variante le suma su borde y su animación.
export const dialogCard = {
  width: "100%",
  background: "var(--card)",
  borderRadius: OVERLAY.radius,
  boxShadow: OVERLAY.shadow,
  outline: "none",
}

const btnBase = {
  height: 44,
  borderRadius: "var(--r-md)",
  fontSize: 14,
  fontFamily: OVERLAY.fontFamily,
  cursor: "pointer",
}

export const neutralBtn = {
  ...btnBase,
  padding: "0 16px",
  border: "1px solid var(--bd-strong)",
  background: "var(--elev)",
  color: "var(--tx)",
  fontWeight: 600,
}

export const primaryBtn = {
  ...btnBase,
  padding: "0 20px",
  border: "none",
  background: "var(--brand)", // lima brillante fijo, igual que el resto de las acciones primarias
  color: "var(--brand-ink)",
  fontWeight: 700,
}
