import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { etiquetaDeRol } from '@utils/roles'
import NotFound from '@components/NotFound.jsx'

// t121, t148, t149, t151 y t152 de la auditoría.
//
// t121 — el MISMO admin aparecía como "Operativo" en el sidebar de la operativa y como
// "Tenant Admin" en el del panel, con estilos idénticos y texto distinto; y el panel de
// Usuarios lo llamaba "Administrador", un tercer nombre. La causa de fondo: la operativa
// mostraba una etiqueta fija, o sea que describía el SHELL en el que estabas parado, no quién
// sos. Un admin que entra a la operativa sigue siendo admin.
//
// t151 — entrar a /admin con sesión de operario redirigía a la raíz EN SILENCIO. La ruta
// inexistente, en cambio, mostraba un 404 propio prolijo con botón de volver. Un redirect
// mudo se lee como "se colgó", no como "no tenés permiso".

vi.mock('@context/ThemeContext', () => ({ useTheme: () => ({ isDarkMode: true }) }))

describe('t121 · una sola etiqueta de rol en toda la app', () => {
  it('el vocabulario es el del panel donde el rol se administra', () => {
    expect(etiquetaDeRol('tenant-admin')).toBe('Administrador')
    expect(etiquetaDeRol('operator')).toBe('Operario')
  })

  it('un rol desconocido cae al menos privilegiado, no a un texto crudo', () => {
    expect(etiquetaDeRol('cualquiera')).toBe('Operario')
    expect(etiquetaDeRol(undefined)).toBe('Operario')
  })

  it('ningún shell hardcodea su propia etiqueta', () => {
    const raiz = resolve(__dirname, '../..')
    const op = readFileSync(resolve(raiz, 'src/components/Operativa/OperativaLayout.jsx'), 'utf8')
    const admin = readFileSync(resolve(raiz, 'src/components/Portal/AdminLayout.jsx'), 'utf8')

    expect(op).not.toMatch(/roleLabel: "Operativo"/)
    expect(admin).not.toMatch(/roleLabel: "Tenant Admin"/)
    expect(op).toMatch(/etiquetaDeRol\(user\?\.role\)/)
    expect(admin).toMatch(/etiquetaDeRol\(user\?\.role\)/)
  })
})

describe('t151 · el 403 explica, no redirige mudo', () => {
  it('la vista de callejón sirve para el 403, no solo para el 404', () => {
    render(<MemoryRouter><NotFound codigo="403" titulo="No tenés permiso" mensaje="El panel es solo para administradores." /></MemoryRouter>)

    expect(screen.getByText('403')).toBeInTheDocument()
    expect(screen.getByText(/No tenés permiso/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Volver al inicio/i })).toBeInTheDocument()
  })

  it('sin props sigue siendo el 404 de siempre', () => {
    render(<MemoryRouter><NotFound /></MemoryRouter>)

    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText(/Página no encontrada/)).toBeInTheDocument()
  })

  it('RequireAuth ya no manda un Navigate mudo cuando falta el permiso', () => {
    const src = readFileSync(resolve(__dirname, '../..', 'src/components/Auth/RequireAuth.jsx'), 'utf8')

    expect(src).not.toMatch(/requireAdmin && !isAdmin\) \{\s*return <Navigate to="\/" replace \/>/)
    expect(src).toMatch(/codigo="403"/)
  })
})

describe('t149 · cerrar sesión no es un clic al vacío', () => {
  const sidebar = readFileSync(resolve(__dirname, '../..', 'src/components/Layout/AppSidebar.jsx'), 'utf8')

  it('confirma antes de cerrar, por el diálogo destructivo', () => {
    expect(sidebar).toMatch(/showDanger/)
    expect(sidebar).toMatch(/¿Cerrar sesión\?/)
  })

  it('los dos íconos del pie tienen nombre accesible, no solo title', () => {
    expect(sidebar).toMatch(/aria-label="Cerrar sesión"/)
    expect(sidebar).toMatch(/aria-label="Ayuda"/)
  })
})

describe('t148/t152 · el buscador dice cuántos quedaron y ofrece la salida', () => {
  const raiz = resolve(__dirname, '../..')
  const header = readFileSync(resolve(raiz, 'src/components/UI/ScreenHeader.jsx'), 'utf8')

  it('el contador vive en la cabecera, no adentro del panel de Filtros', () => {
    expect(header).toMatch(/\{count\} resultado/)
  })

  it('el input tiene una x para limpiar lo tipeado', () => {
    expect(header).toMatch(/aria-label="Limpiar la búsqueda"/)
  })

  it.each([
    ['src/components/Operativa/Cubiertas.jsx', 'Limpiar búsqueda y filtros'],
    ['src/components/Operativa/Vehiculos.jsx', 'Limpiar búsqueda y filtros'],
  ])('%s ofrece desarmar el filtro desde el estado vacío', (archivo, texto) => {
    const src = readFileSync(resolve(raiz, archivo), 'utf8')

    expect(src).toMatch(texto)
    // Y dice QUÉ está escondiendo el resultado, que es la mitad del problema.
    expect(src).toMatch(/escondidoPor/)
  })
})
