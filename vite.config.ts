import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const auth = env.HELENA_API_TOKEN || env.VITE_API_TOKEN || ''
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      proxy: {
        '/core': {
          target: 'https://api.helena.run',
          changeOrigin: true,
          headers: {
            Authorization: auth
          }
        },
        '/crm': {
          target: 'https://api.helena.run',
          changeOrigin: true,
          headers: {
            Authorization: auth
          }
        }
      }
    }
  }
})
