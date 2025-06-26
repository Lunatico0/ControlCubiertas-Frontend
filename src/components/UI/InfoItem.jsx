import { colors } from "@utils/tokens"

const InfoItem = ({ label, value, className = "" }) => (
  <div className="flex items-start justify-between space-2">
    <span className={`${colors.muted} text-xs font-medium`}>{label}:</span>
    <p className={`font-semibold text-sm ${className}`}>{value}</p>
  </div>
)

export default InfoItem;
