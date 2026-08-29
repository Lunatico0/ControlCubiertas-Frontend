import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Login from '@components/Auth/Login'

// El recuadro de la demo en el login.
//
// Dos cosas que tienen que ser ciertas al mismo tiempo:
//
// 1. **No puede aparecer en la instalación de un cliente real.** Un taller que compró TireOps
//    no puede ver "DEMO · ANDES CARGO · contraseña: tireops" en su pantalla de login. Va detrás
//    de una variable de entorno, apagado por default.
//
// 2. **La leyenda tiene que decir la verdad.** La versión original prometía que lo cargado "no
//    se guarda en la base, queda solo en este equipo": eso describía un sandbox en el navegador
//    que nunca existió, y que se decidió NO construir porque obligaba a simular el backend en
//    el browser. Lo que sí se construyó es un tenant efímero por visitante: una copia privada
//    en el servidor, con el backend real, que se borra a las 48 hs. La leyenda dice eso.

vi.mock('@context/AuthContext', () => ({ useAuth: () => ({ login: vi.fn(), isAuthenticated: false }) }))
vi.mock('@context/ThemeContext', () => ({ useTheme: () => ({ isDarkMode: true }) }))

const renderLogin = () => render(<MemoryRouter><Login /></MemoryRouter>)

afterEach(() => { vi.unstubAllEnvs() })

describe('recuadro demo · apagado por default', () => {
  it('sin la variable de entorno, el login no muestra credenciales de nadie', () => {
    renderLogin()

    expect(screen.queryByText(/DEMO/)).not.toBeInTheDocument()
    expect(screen.queryByText(/andescargo/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/tireops/i)).not.toBeInTheDocument()
  })

  it('con la variable en algo que no sea "true", tampoco aparece', () => {
    vi.stubEnv('VITE_DEMO_LOGIN', 'false')
    renderLogin()

    expect(screen.queryByText(/DEMO/)).not.toBeInTheDocument()
  })
})

describe('recuadro demo · encendido', () => {
  beforeEach(() => vi.stubEnv('VITE_DEMO_LOGIN', 'true'))

  it('muestra las credenciales de prueba', () => {
    renderLogin()

    expect(screen.getByText(/DEMO · ANDES CARGO/)).toBeInTheDocument()
    expect(screen.getByText(/admin@andescargo\.com/)).toBeInTheDocument()
    expect(screen.getByText(/operario@andescargo\.com/)).toBeInTheDocument()
  })

  it('dice que la copia es PRIVADA de quien ingresa', () => {
    renderLogin()

    expect(screen.getByText(/copia privada/i)).toBeInTheDocument()
  })

  it('dice cuándo se borra', () => {
    renderLogin()

    expect(screen.getByText(/48 horas/i)).toBeInTheDocument()
  })

  it('NO promete que los datos se quedan en el equipo: eso nunca fue cierto', () => {
    renderLogin()

    const caja = screen.getByTestId('demo-box')
    expect(caja).not.toHaveTextContent(/no se guarda en la base/i)
    expect(caja).not.toHaveTextContent(/solo en este equipo/i)
  })

  it('tampoco promete que los datos de Andes Cargo "se restauran": no se restauran, se clonan', () => {
    const caja = (renderLogin(), screen.getByTestId('demo-box'))

    expect(caja).not.toHaveTextContent(/se restauran/i)
  })
})
