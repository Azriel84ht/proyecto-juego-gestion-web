import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Esta sección es clave para el desarrollo con Docker
    proxy: {
      // Redirige cualquier petición que comience con /api
      '/api': {
        // El objetivo es el servicio backend definido en docker-compose.yml
        target: 'http://auth-service:3001',
        // Necesario para que el servidor de destino reciba el host correcto
        changeOrigin: true,
        // Reescribe el path para que coincida con la configuración del backend
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
    // Necesario para que Vite escuche en todas las interfaces de red dentro del contenedor
    host: '0.0.0.0',
    port: 5173, // Puerto por defecto de Vite
  },
})