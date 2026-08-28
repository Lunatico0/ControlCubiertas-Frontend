// Tokens del sistema de diseño. Es la ÚNICA fuente de verdad.
//
// Hasta el 2026-08-28 este archivo exportaba además la paleta anterior completa (blue-600,
// indigo-600, gray-100/800, rounded-xl, shadow-md): una segunda fuente de verdad contradictoria
// que estaba a un import de distancia de cualquiera, y de la que salían varios de los radios y
// sombras que rompían la escala (t119). Se aisló primero en @utils/legacyTokens y desapareció
// con la UI legacy (t78).
//
// El resto de los tokens del sistema son variables CSS y viven en index.css: --tx, --card,
// --bd, --ink-*, --r-*, --t-*. Acá quedan los que necesitan ser una clase de Tailwind.

// Título de PANTALLA (h1 de una sección). Medido antes de unificar: la operativa en 32px/48,
// el resumen del panel en 30/36, Usuarios-Reportes-Empresa-Comprobantes en 28/42, el login en
// 26 y el 404 en 22/33. Cuatro tamaños y cuatro line-heights para el mismo nivel semántico:
// navegar entre secciones hacía saltar el título, y con line-height distinto saltaba también
// la línea de base de todo lo que venía abajo.
//
// NO aplica a los h1 de drawer y modal (21px), que son otro nivel, ni a la portada de la guía
// (40px), que es una tapa.
export const tituloPantalla = "font-display text-[28px] leading-[1.25] font-bold tracking-[-.02em]"

export const button = {
  // Botón de acción principal de la operativa (lima). Color lima BRILLANTE FIJO en ambos temas
  // (--brand sobre --brand-ink) — es el diseño intencional de la app (no theme-aware; ver el
  // comentario en Inicio.jsx). Tipografía/padding centralizados; el tamaño (alto/ancho) se
  // ajusta por caso con className.
  //
  // El token fija tamaño, line-height Y ALTURA. Sin la altura, el mismo botón "Crear usuario"
  // medía 40px en la página y 43px dentro del modal: no era el padding ni el line-height (los
  // dos tenían 10px y 20px), era que el de la página lleva un ícono. Un <svg> de 17px como
  // flex item deja la caja del contenido en los 20px del line-height, mientras que un botón
  // de solo texto usa la altura real de su caja de línea, ~23px con IBM Plex Sans a 14px.
  // Por eso la altura es FIJA (h-10): un min-height no baja lo que ya quedó más alto.
  lime: "inline-flex items-center justify-center gap-2 h-10 bg-[var(--brand)] text-[var(--brand-ink)] text-[14px] leading-5 font-bold px-5 rounded-[var(--r-md)] transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed",
}
