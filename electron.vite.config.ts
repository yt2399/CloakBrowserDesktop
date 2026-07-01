import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@main': resolve('src/main')
      }
    },
    build: {
      rollupOptions: {
        output: {
          format: 'cjs'
        }
      }
    },
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version)
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        output: {
          format: 'cjs'
        }
      }
    },
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version)
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@': resolve('src/renderer/src')
      }
    },
    plugins: [react(), tailwindcss()],
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version)
    }
  }
})
