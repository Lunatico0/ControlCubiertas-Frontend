import { button } from "@utils/tokens"

const Button = ({ variant = "primary", children, className = "", ...props }) => {
  const variantStyle = button[variant] || button.primary
  return (
    <button className={`${variantStyle} ${className}`} {...props}>
      {children}
    </button>
  )
}

export default Button
