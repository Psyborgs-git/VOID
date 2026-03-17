import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@void/core': resolve(__dirname, '../../packages/void-core/src'),
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@void/core': resolve(__dirname, '../../packages/void-core/src'),
      },
    },
  },
  renderer: {
    resolve: {
      alias: {
        '@void/core': resolve(__dirname, '../../packages/void-core/src'),
        '@': resolve(__dirname, './src/renderer'),
      },
    },
    plugins: [react()],
  },
})
