import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In local dev (two separate `npm run dev` terminals), proxy relative
    // /api requests to the backend running on :5000. In production, both
    // frontend and backend deploy together as one Vercel project, so /api
    // is already same-origin and this proxy is never used there.
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
