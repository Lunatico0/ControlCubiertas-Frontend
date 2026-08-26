import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Login from '@components/Auth/Login'

// t95 de la auditoría visual: había CUATRO geometrías de input conviviendo, y la peor parte es
// que el comentario de index.css llama a .ff "el patrón del login" mientras el login NO usaba .ff
// y difería en alto (52 vs 46), radio (12 vs 10), borde y padding (15 vs 13).
//
// El login ahora usa el mismo FloatingField que el resto de la app. El dark fijo de la pantalla
// sale de data-app-theme="dark" en el contenedor, no de hex sueltos, así los tokens de .ff
// resuelven contra la paleta oscura sin duplicar estilos.
//
// Este test es el blindaje: si alguien vuelve a escribir inputs a mano en el login, falla.

vi.mock('@context/AuthContext', () => ({ useAuth: () => ({ login: vi.fn(), user: null }) }))
// BrandLogo elige el SVG segun el tema; el login vive fuera del ThemeProvider en el test.
vi.mock('@context/ThemeContext', () => ({ useTheme: () => ({ isDarkMode: true }) }))

const renderLogin = () => render(<MemoryRouter><Login /></MemoryRouter>)

describe('campos del login', () => {
  it('email y contraseña usan .ff-control, el mismo control que el resto de la app', () => {
    renderLogin()

    expect(screen.getByLabelText('Email')).toHaveClass('ff-control')
    expect(screen.getByLabelText('Contraseña')).toHaveClass('ff-control')
  })

  it('la pantalla declara el tema oscuro en el contenedor, no con hex por campo', () => {
    const { container } = renderLogin()

    expect(container.querySelector('[data-app-theme="dark"]')).toBeInTheDocument()
  })

  it('el ojo de mostrar contraseña sigue estando y alterna el type del campo', () => {
    renderLogin()

    const pwd = screen.getByLabelText('Contraseña')
    expect(pwd).toHaveAttribute('type', 'password')

    fireEvent.click(screen.getByTitle('Mostrar'))

    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'text')
  })
})
