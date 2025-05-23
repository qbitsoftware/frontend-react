import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from "tailwindcss";
import tsconfigPaths from 'vite-tsconfig-paths'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    TanStackRouterVite({
      routeToken: "layout"
    })
  ],
  css: {
    postcss: {
      plugins: [tailwindcss()]
    }
  },
  server: {
    hmr: {
      overlay: false,
    }
  }
})
