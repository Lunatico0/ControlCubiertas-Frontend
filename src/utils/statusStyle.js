const statusVisuals = {
  "Nueva": {
    bg: "bg-blue-300 dark:bg-blue-300/60",
    text: "text-green-700 dark:text-green-400",
    border: "border-blue-300 dark:border-blue-700",
  },
  "1er Recapado": {
    bg: "bg-green-400 dark:bg-green-400/60",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-green-400 dark:border-green-700",
  },
  "2do Recapado": {
    bg: "bg-yellow-300 dark:bg-yellow-300/60",
    text: "text-purple-700 dark:text-purple-400",
    border: "border-yellow-300 dark:border-yellow-700",
  },
  "3er Recapado": {
    bg: "bg-orange-400 dark:bg-orange-400/60",
    text: "text-indigo-700 dark:text-indigo-400",
    border: "border-orange-400 dark:border-orange-700",
  },
  "A recapar": {
    bg: "bg-neutral-700 dark:bg-neutral-700/60",
    text: "text-yellow-700 dark:text-yellow-400",
    border: "border-neutral-700 dark:border-neutral-700",
  },
  "Descartada": {
    bg: "bg-red-500 dark:bg-red-500/60",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-500 dark:border-red-900",
  },
}

export const statusStyles = Object.fromEntries(
  Object.entries(statusVisuals).map(([key, val]) => [key, val.bg])
)

export const getStatusTextColor = (status) =>
  statusVisuals[status]?.text || "text-gray-700 dark:text-gray-400"

export const getStatusBorderColor = (status) =>
  statusVisuals[status]?.border || "border-gray-300 dark:border-gray-700"
