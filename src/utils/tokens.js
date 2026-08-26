// Colores base
export const colors = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  danger: "bg-red-500 hover:bg-red-600 text-white",
  muted: "text-gray-500 dark:text-gray-400",
  bgSidebar: 'bg-gray-100 dark:bg-gray-800',
  bgActive: 'bg-gray-300 dark:bg-gray-700',
  surface: "bg-white dark:bg-gray-700",
  borderSider: "border-gray-200 dark:border-gray-600",
  shadow: "shadow-md hover:shadow-lg",
}

// Tipografía
// Título de PANTALLA (h1 de una sección). Medido antes de unificar: la operativa en 32px/48,
// el resumen del panel en 30/36, Usuarios-Reportes-Empresa-Comprobantes en 28/42, el login en
// 26 y el 404 en 22/33. Cuatro tamaños y cuatro line-heights para el mismo nivel semántico:
// navegar entre secciones hacía saltar el título, y con line-height distinto saltaba también
// la línea de base de todo lo que venía abajo.
//
// NO aplica a los h1 de drawer y modal (21px), que son otro nivel, ni a la portada de la guía
// (40px), que es una tapa.
export const tituloPantalla = "font-display text-[28px] leading-[1.25] font-bold tracking-[-.02em]"

export const text = {
  heading: "text-xl font-semibold text-gray-900 dark:text-white",
  label: "text-sm font-medium text-gray-700 dark:text-gray-300",
  value: "font-medium text-right text-gray-900 dark:text-gray-100",
  muted: 'text-gray-500 dark:text-gray-400',
  placeholder: "placeholder-gray-500 dark:placeholder-gray-400",
  error: "text-sm text-red-500 mt-1",
}

// Labels flotantes
export const Label = {
  base: "absolute rounded-full left-3 -top-2.5 text-sm px-1 backdrop-blur-sm z-10",
  light: "bg-gray-100 text-gray-600",
  dark: "dark:bg-gray-800 dark:text-gray-300",
}

// Inputs
export const input = {
  base: `
    peer w-full px-4 py-3 border rounded-md shadow-sm text-sm
    bg-white dark:bg-gray-900 text-black dark:text-white
    border-gray-300 dark:border-gray-600
    placeholder-transparent
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
  `.trim(),
}

// Botones
export const button = {
  base: "px-4 py-2 rounded-xl font-medium transition shadow-sm hover:shadow-md",
  primary: "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-6 py-2 rounded-md transition flex items-center gap-2",
  secondary: "bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 font-semibold px-6 py-2 rounded-md transition",
  danger: "bg-red-600 hover:bg-red-700 text-white",
  warning: "bg-yellow-600 hover:bg-yellow-700 text-white",
  success: "bg-green-600 hover:bg-green-700 text-white",
  purple: "bg-purple-600 hover:bg-purple-700 text-white",
  indigo: "bg-indigo-600 hover:bg-indigo-700 text-white",
  outline: "border border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-300",
  ghost: "text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700",
  menu: "w-full px-4 py-3 text-sm text-left transition-colors",
  // Botón de acción principal de la operativa (lima). Color lima BRILLANTE FIJO en ambos temas
  // (#C4ED2B/#0A0C0D) — es el diseño intencional de la app (no theme-aware; ver comentario en
  // Inicio.jsx). Tipografía/padding centralizados; el tamaño (alto/ancho) se ajusta por caso con className.
  // El token fija tamaño, line-height Y ALTURA. Sin la altura, el mismo botón "Crear usuario"
  // medía 40px en la página y 43px dentro del modal: no era el padding ni el line-height (los
  // dos tenían 10px y 20px), era que el de la página lleva un ícono. Un <svg> de 17px como
  // flex item deja la caja del contenido en los 20px del line-height, mientras que un botón
  // de solo texto usa la altura real de su caja de línea, ~23px con IBM Plex Sans a 14px.
  // Por eso la altura es FIJA (h-10): un min-height no baja lo que ya quedó más alto.
  lime: "inline-flex items-center justify-center gap-2 h-10 bg-[#C4ED2B] text-[#0A0C0D] text-[14px] leading-5 font-bold px-5 rounded-[10px] transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed",
}

// Utilidades visuales
export const utility = {
  hoverBg: "hover:bg-gray-100 dark:hover:bg-gray-700",
  borderT: "border-t border-gray-200 dark:border-gray-600",
}
