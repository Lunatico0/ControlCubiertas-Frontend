import { text, Label } from "@utils/tokens";

const TireField = ({ label, children, error, id }) => (
  <div className="relative w-full font-inter mb-6">
    {children}
    <label htmlFor={id} className={`${Label.base} ${Label.light} ${Label.dark}`}>
      {label}
    </label>
    {error && <p className={text.error}>{error}</p>}
  </div>
)

export default TireField
