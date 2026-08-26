import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import flowbiteReact from "flowbite-react/plugin/vite";

// Al correr con docker compose el backend no esta en localhost sino en el
// servicio "backend", por eso el destino es configurable.
const proxyTarget = process.env.VITE_PROXY_TARGET ?? 'http://localhost:8000'

export default defineConfig({
  plugins: [react(), tailwindcss(), flowbiteReact()],
  server: {
    port: 5173,
    // El proxy hace que en desarrollo /api apunte al backend local. Gracias a
    // esto el codigo del cliente usa rutas relativas ("/api/health") tanto en
    // desarrollo como en produccion, sin variables de entorno de por medio.
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    // Sin sourcemaps la imagen de Docker queda mas liviana.
    sourcemap: false,
  },
})