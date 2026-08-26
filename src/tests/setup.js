// Setup común de los tests del frontend.
import '@testing-library/jest-dom/vitest'

// localStorage vive en jsdom, pero persiste entre tests del mismo archivo: la sesión que
// deja un test se filtraría al siguiente (tokenStore y AuthContext escriben ahí).
afterEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

// matchMedia no existe en jsdom y ThemeContext lo consulta para el tema del sistema.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })
}
