import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8443',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/tts-api': {
        target: 'https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tts-api/, '/tts-premium/v1/tts')
      }
    }
    
  }
});