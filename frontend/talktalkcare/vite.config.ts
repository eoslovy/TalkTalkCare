import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/openvidu': {
        target: 'https://openvidu:4443',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
