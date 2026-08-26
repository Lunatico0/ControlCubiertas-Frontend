import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '@context/AuthContext'
import { getAccessToken, getRefreshToken } from '@api/tokenStore'

// La API real pega contra el backend; acá solo importa qué hace el contexto con la respuesta.
vi.mock('@api/auth', () => ({
  loginRequest: vi.fn(),
  changePasswordRequest: vi.fn(),
  refreshRequest: vi.fn(),
}))
// Las caches a nivel módulo tocan otros módulos (empresa, desgaste, catálogo de estados) que
// no son parte de lo que se prueba acá.
vi.mock('@api/sessionCache', () => ({ resetClientCaches: vi.fn() }))

import { loginRequest, changePasswordRequest } from '@api/auth'

// Sonda mínima: dispara las acciones del contexto y muestra su estado.
const Sonda = () => {
  const { user, isAuthenticated, isAdmin, mustChangePassword, login, logout, changePassword } = useAuth()
  return (
    <div>
      <span data-testid="estado">{isAuthenticated ? `dentro:${user.email}` : 'fuera'}</span>
      <span data-testid="admin">{isAdmin ? 'si' : 'no'}</span>
      <span data-testid="debe-cambiar">{mustChangePassword ? 'si' : 'no'}</span>
      <button onClick={() => login('admin@qa.test', 'pass')}>login</button>
      <button onClick={() => changePassword('vieja', 'nueva')}>cambiar</button>
      <button onClick={logout}>logout</button>
    </div>
  )
}

const montar = () => render(<AuthProvider><Sonda /></AuthProvider>)

const RESPUESTA_LOGIN = {
  accessToken: 'access-1',
  refreshToken: 'refresh-1',
  user: { id: 'u1', email: 'admin@qa.test', role: 'tenant-admin', mustChangePassword: false },
}

describe('AuthContext', () => {
  it('el login guarda los tokens y deja la sesión abierta', async () => {
    loginRequest.mockResolvedValue(RESPUESTA_LOGIN)
    montar()

    await userEvent.click(screen.getByText('login'))

    await waitFor(() => expect(screen.getByTestId('estado')).toHaveTextContent('dentro:admin@qa.test'))
    expect(getAccessToken()).toBe('access-1')
    expect(getRefreshToken()).toBe('refresh-1')
    expect(screen.getByTestId('admin')).toHaveTextContent('si')
  })

  it('el logout borra los tokens y el usuario', async () => {
    loginRequest.mockResolvedValue(RESPUESTA_LOGIN)
    montar()
    await userEvent.click(screen.getByText('login'))
    await waitFor(() => expect(getAccessToken()).toBe('access-1'))

    await userEvent.click(screen.getByText('logout'))

    await waitFor(() => expect(screen.getByTestId('estado')).toHaveTextContent('fuera'))
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })

  // El backend invalida TODOS los refresh vivos del usuario al cambiar la contraseña, el de
  // esta sesión incluido, y devuelve el par nuevo. Si el contexto no lo guarda, el propio
  // usuario que acaba de cambiarla se queda con un refresh muerto y la app lo desloguea sola
  // en cuanto vence el access token (15m).
  it('el cambio de contraseña guarda los tokens nuevos que devuelve el backend', async () => {
    loginRequest.mockResolvedValue(RESPUESTA_LOGIN)
    changePasswordRequest.mockResolvedValue({
      message: 'Contraseña actualizada',
      accessToken: 'access-2',
      refreshToken: 'refresh-2',
    })
    montar()
    await userEvent.click(screen.getByText('login'))
    await waitFor(() => expect(getRefreshToken()).toBe('refresh-1'))

    await userEvent.click(screen.getByText('cambiar'))

    await waitFor(() => expect(getRefreshToken()).toBe('refresh-2'))
    expect(getAccessToken()).toBe('access-2')
  })

  it('baja la marca de mustChangePassword tras cambiar la contraseña', async () => {
    loginRequest.mockResolvedValue({
      ...RESPUESTA_LOGIN,
      user: { ...RESPUESTA_LOGIN.user, mustChangePassword: true },
    })
    changePasswordRequest.mockResolvedValue({ message: 'ok', accessToken: 'a2', refreshToken: 'r2' })
    montar()
    await userEvent.click(screen.getByText('login'))
    await waitFor(() => expect(screen.getByTestId('debe-cambiar')).toHaveTextContent('si'))

    await userEvent.click(screen.getByText('cambiar'))

    await waitFor(() => expect(screen.getByTestId('debe-cambiar')).toHaveTextContent('no'))
  })

  it('si el backend no devolviera tokens, no pisa los que ya había con undefined', async () => {
    loginRequest.mockResolvedValue(RESPUESTA_LOGIN)
    changePasswordRequest.mockResolvedValue({ message: 'Contraseña actualizada' })
    montar()
    await userEvent.click(screen.getByText('login'))
    await waitFor(() => expect(getRefreshToken()).toBe('refresh-1'))

    await userEvent.click(screen.getByText('cambiar'))

    await waitFor(() => expect(screen.getByTestId('debe-cambiar')).toHaveTextContent('no'))
    expect(getRefreshToken()).toBe('refresh-1')
    expect(getAccessToken()).toBe('access-1')
  })
})
