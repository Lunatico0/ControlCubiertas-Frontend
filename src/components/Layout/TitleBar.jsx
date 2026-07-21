import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { useTheme } from "@context/ThemeContext"
import isElectron from "@utils/isElectron"
import BrandLogo from "@components/BrandLogo"

// Titlebar custom para la app de escritorio (frameless — main.js usa frame:false). Solo se
// renderiza en Electron; en la web devuelve null (se usa la barra del navegador). Se funde con
// el sidebar (var(--sidebar)) y sigue el tema; en el login queda oscura fija. Toda la barra es
// zona de arrastre (-webkit-app-region:drag) menos los controles (no-drag), que van por IPC.
const Ctrl = ({ onClick, title, danger, children }) => {
  const [hover, setHover] = useState(false)
  return (
    <div
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 46, height: 38, display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", WebkitAppRegion: "no-drag",
        color: hover ? (danger ? "#fff" : "var(--tx)") : "var(--tx-4)",
        background: hover ? (danger ? "#E81123" : "var(--hover)") : "transparent",
      }}
    >
      {children}
    </div>
  )
}

const TitleBar = () => {
  const { isDarkMode } = useTheme()
  const { pathname } = useLocation()
  const [isMax, setIsMax] = useState(true) // la ventana arranca maximizada (main.js)

  useEffect(() => {
    if (!isElectron()) return
    window.electronAPI?.isWindowMaximized?.().then((v) => setIsMax(!!v)).catch(() => {})
    const onMax = (_e, v) => setIsMax(!!v)
    window.electronAPI?.onMaximizeChange?.(onMax)
    return () => window.electronAPI?.removeListener?.("win:maximized", onMax)
  }, [])

  if (!isElectron()) return null

  const theme = pathname === "/login" ? "dark" : isDarkMode ? "dark" : "light"
  const win = window.electronAPI || {}

  return (
    <div
      data-app-theme={theme}
      onDoubleClick={() => win.maximizeWindow?.()}
      style={{ flex: "none", height: 38, display: "flex", alignItems: "center", background: "var(--sidebar)", borderBottom: "1px solid var(--bd-faint)", WebkitAppRegion: "drag", userSelect: "none" }}
    >
      <div style={{ display: "flex", alignItems: "center", padding: "0 14px" }}>
        <BrandLogo variant={theme} height={17} />
      </div>
      <div style={{ marginLeft: "auto", display: "flex", WebkitAppRegion: "no-drag" }}>
        <Ctrl onClick={() => win.minimizeWindow?.()} title="Minimizar">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M1 6h10" /></svg>
        </Ctrl>
        <Ctrl onClick={() => win.maximizeWindow?.()} title={isMax ? "Restaurar" : "Maximizar"}>
          {isMax ? (
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="2.7" y="1.3" width="8" height="8" /><path d="M1.3 3.7v7h7" /></svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="1.5" y="1.5" width="9" height="9" /></svg>
          )}
        </Ctrl>
        <Ctrl onClick={() => win.closeWindow?.()} title="Cerrar" danger>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M1.5 1.5l9 9M10.5 1.5l-9 9" /></svg>
        </Ctrl>
      </div>
    </div>
  )
}

export default TitleBar
