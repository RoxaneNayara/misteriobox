import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), '');
  const apiProxyTarget = environment.VITE_API_PROXY_TARGET || 'http://localhost:3333';
  const proxy = { '/api': { target: apiProxyTarget, changeOrigin: true } };

  return {
    plugins: [react()],
    server: { port: 5173, strictPort: true, proxy },
    preview: { port: 4173, strictPort: true, proxy },
  };
});
