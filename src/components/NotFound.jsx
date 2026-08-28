import { useNavigate } from "react-router-dom"
import { useTheme } from "@context/ThemeContext"
import HomeRoundedIcon from "@mui/icons-material/HomeRounded"
import BrandLogo from "@components/BrandLogo"
import Button from "@components/UI/Button"
import { tituloPantalla } from "@utils/tokens"

// Vista 404 para rutas inexistentes (catch-all `*` en App.jsx). Theme-aware vía
// data-app-theme (los tokens var(--x) del design system viven en ese scope) + marca TireOps.
const NotFound = () => {
  const navigate = useNavigate()
  const { isDarkMode } = useTheme()

  return (
    <div
      data-app-theme={isDarkMode ? "dark" : "light"}
      className="flex h-full w-full flex-col items-center justify-center gap-6 px-8 text-center"
      style={{ background: "var(--bg)", color: "var(--tx)", fontFamily: "var(--font-sans)" }}
    >
      <BrandLogo height={64} />

      <div className="flex flex-col items-center gap-2">
        <div
          className="text-[88px] font-bold leading-none"
          style={{ fontFamily: "var(--font-display)", color: "var(--ink-lime)" }}
        >
          404
        </div>
        <h1 className={tituloPantalla} style={{ color: "var(--tx)" }}>
          Página no encontrada
        </h1>
        <p className="max-w-[420px] text-[14.5px]" style={{ color: "var(--tx-4)" }}>
          La dirección a la que intentaste entrar no existe o se movió. Volvé al inicio para seguir operando.
        </p>
      </div>

      <Button variant="lime" onClick={() => navigate("/")}>
        <HomeRoundedIcon sx={{ fontSize: 18 }} />
        Volver al inicio
      </Button>
    </div>
  )
}

export default NotFound
