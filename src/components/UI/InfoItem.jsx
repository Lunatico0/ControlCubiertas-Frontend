import { colors } from "@utils/tokens"

const InfoItem = ({ label, value, className = "" }) => (
  <div className="space-y-1">
    <span className={`${colors.muted} text-xs font-medium`}>{label}:</span>
    <p className={`font-semibold text-sm ${className}`}>{value}</p>
  </div>
)

export default InfoItem;
