import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const useMock = env.VITE_USE_MOCK === 'true'

  return {
    plugins: [
      react(),
      tailwindcss(),
      useMock ? mockDevServerPlugin() : null,
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        '^/api': 'http://127.0.0.1:8000'
      },
    },
  }
})