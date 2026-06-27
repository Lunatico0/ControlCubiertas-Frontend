// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Detectar si el build es para Electron (via variable de entorno)
const isElectron = process.env.BUILD_TARGET === 'electron';

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
