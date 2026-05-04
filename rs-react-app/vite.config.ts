import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // Add /v3.1 here so it becomes the base for all proxied calls
        target: 'https://restcountries.com',
        changeOrigin: true,
        // This removes '/api' from your local request before sending it to the target
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
