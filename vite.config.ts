import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from 'vite-tsconfig-paths'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    tailwindcss(),
    TanStackRouterVite({
      routeToken: "layout"
    })
  ],
  esbuild: {
    legalComments: "none",
    keepNames: true,
    minifyIdentifiers: false
  },
  server: {
    hmr: {
      overlay: false,
    }
  }
})
