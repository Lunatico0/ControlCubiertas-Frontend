import { statusStyles } from "@utils/statusStyle"

const StatusBadge = ({ status }) => {
  const baseStyle = "px-3 py-1 text-xs font-semibold text-white rounded-full shadow-sm ring-1 ring-black/10 dark:ring-white/10"

  return (
    <span className={`${baseStyle} ${statusStyles[status] || "bg-gray-600 dark:bg-gray-700"}`}>
      {status}
    </span>
  )
}

export default StatusBadge
