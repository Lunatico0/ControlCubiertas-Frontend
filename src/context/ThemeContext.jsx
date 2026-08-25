import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem("theme")
    if (stored === "dark") return true
    if (stored === "light") return false
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  useEffect(() => {
    const root = document.documentElement
    // `color-scheme` tiene que ir en <html>: es de donde el navegador saca el chrome NATIVO
    // (scrollbars, la lista desplegable de un <select>, el amarillo del autofill). Sin esto,
    // sobre el tema oscuro esos controles salian con el chrome claro del sistema. No alcanza
    // ponerlo en el div del shell, que es donde vive data-app-theme.
    root.style.colorScheme = isDarkMode ? "dark" : "light"
    if (isDarkMode) {
      root.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      root.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [isDarkMode])

  const toggleTheme = () => setIsDarkMode((prev) => !prev)

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
