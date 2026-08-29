// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Detectar si el build es para Electron (via variable de entorno)
const isElectron = process.env.BUILD_TARGET === 'electron';

// Content-Security-Policy del build.
//
// Va como <meta> y no como cabecera porque en Electron la app carga por file://, donde NO hay
// respuesta HTTP: ni session.webRequest.onHeadersReceived ni los headers de Vercel llegan a
// aplicarse. Sin esto el renderer corre sin ninguna restricción de origen, y todo lo que la
// app inyecta como HTML (el dataURL del logo, el comprobante, una nota de release en Markdown)
// se ejecuta sin límite.
//
// Las concesiones son explícitas:
//   'unsafe-inline' en style-src → Tailwind y los estilos inline de los componentes.
//   data:/blob: en img-src y font-src → el logo del tenant se persiste como dataURL.
//   connect-src → sólo el backend y Sentry. `VITE_API_URL` entra acá para que un despliegue
//                 contra otro backend no quede bloqueado en silencio.
const apiUrl = process.env.VITE_API_URL || 'https://controlcubiertas-backend.vercel.app';
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' ${apiUrl} https://*.sentry.io https://*.ingest.sentry.io`,
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

const cspPlugin = {
  name: 'tireops-csp',
  // Sólo en build: en dev, Vite y React Refresh inyectan scripts inline que `script-src 'self'`
  // bloquearía, y el HMR dejaría de funcionar.
  apply: 'build',
  transformIndexHtml(html) {
    return html.replace(
      '<head>',
      `<head>
    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`,
    );
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss(), cspPlugin],
  // Electron carga por file:// (rutas relativas); web/Vercel sirve desde la raíz del dominio.
  base: isElectron ? './' : '/',
  build: {
    outDir: isElectron ? '../desktop/build' : 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@context': path.resolve(__dirname, './src/context'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@api': path.resolve(__dirname, './src/api'),
    },
  },
})
