import { colors } from "@utils/tokens"

const InfoRow = ({ label, value, valueClass = "" }) => (
  <div className="flex justify-between items-center">
    <span className={`${colors.muted} font-medium`}>{label}:</span>
    <span className={`font-medium truncate max-w-[120px] text-right ${valueClass}`} title={value}>
      {value}
    </span>
  </div>
)

export default InfoRow
