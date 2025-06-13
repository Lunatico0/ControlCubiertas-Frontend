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
}

// Utilidades visuales
export const utility = {
  hoverBg: "hover:bg-gray-100 dark:hover:bg-gray-700",
  borderT: "border-t border-gray-200 dark:border-gray-600",
}
