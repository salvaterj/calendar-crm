import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      proxy: {
        '/crm': {
          target: 'https://api.helena.run',
          changeOrigin: true,
          headers: {
            Authorization: env.VITE_API_TOKEN || ''
          }
        }
      }
    }
  }
})
