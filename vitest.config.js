// Config de tests, SEPARADA de vite.config.js a propósito: `vite build` nunca lee este
// archivo, así que el build de producción (web y Electron) jamás importa vitest ni sus
// dependencias. Los alias y plugins se heredan de la config real vía mergeConfig, para que
// un alias nuevo en vite.config.js no haya que duplicarlo acá.
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true, // describe/it/expect sin importar, y el cleanup automático de RTL
      setupFiles: ['./src/tests/setup.js'],
      include: ['src/**/*.test.{js,jsx}'],
      css: false, // los tests no miran estilos; parsear Tailwind solo los haría lentos
      restoreMocks: true,
    },
  })
)
