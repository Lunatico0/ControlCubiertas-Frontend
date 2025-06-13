// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Detectar si el build es para Electron (via variable de entorno)
const isElectron = process.env.BUILD_TARGET === 'electron';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: isElectron ? '../desktop/build' : 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@context': path.resolve(__dirname, './src/context'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@api': path.resolve(__dirname, './src/api'),
    },
  },
})
