import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { mockDevServerPlugin } from 'vite-plugin-mock-dev-server'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), 
            tailwindcss(),
            mockDevServerPlugin()],
  server: {
    proxy: {
      '^/api': 'http://example.com/'
    },
  },
})
