// vite.config.ts
import { defineConfig } from "file:///Users/markusannuk/personal-development/frontend-react/node_modules/.pnpm/vite@5.4.10_@types+node@22.9.0_terser@5.36.0/node_modules/vite/dist/node/index.js";
import react from "file:///Users/markusannuk/personal-development/frontend-react/node_modules/.pnpm/@vitejs+plugin-react-swc@3.7.1_vite@5.4.10_@types+node@22.9.0_terser@5.36.0_/node_modules/@vitejs/plugin-react-swc/index.mjs";
import tailwindcss from "file:///Users/markusannuk/personal-development/frontend-react/node_modules/.pnpm/tailwindcss@3.4.14/node_modules/tailwindcss/lib/index.js";
import tsconfigPaths from "file:///Users/markusannuk/personal-development/frontend-react/node_modules/.pnpm/vite-tsconfig-paths@5.1.0_typescript@5.6.3_vite@5.4.10_@types+node@22.9.0_terser@5.36.0_/node_modules/vite-tsconfig-paths/dist/index.js";
import { TanStackRouterVite } from "file:///Users/markusannuk/personal-development/frontend-react/node_modules/.pnpm/@tanstack+router-plugin@1.79.0_vite@5.4.10_@types+node@22.9.0_terser@5.36.0__webpack-sources@3.2.3_webpack@5.96.1/node_modules/@tanstack/router-plugin/dist/esm/vite.js";
var vite_config_default = defineConfig({
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
      overlay: false
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvbWFya3VzYW5udWsvcGVyc29uYWwtZGV2ZWxvcG1lbnQvZnJvbnRlbmQtcmVhY3RcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9tYXJrdXNhbm51ay9wZXJzb25hbC1kZXZlbG9wbWVudC9mcm9udGVuZC1yZWFjdC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvbWFya3VzYW5udWsvcGVyc29uYWwtZGV2ZWxvcG1lbnQvZnJvbnRlbmQtcmVhY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0LXN3YydcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tIFwidGFpbHdpbmRjc3NcIjtcbmltcG9ydCB0c2NvbmZpZ1BhdGhzIGZyb20gJ3ZpdGUtdHNjb25maWctcGF0aHMnXG5pbXBvcnQgeyBUYW5TdGFja1JvdXRlclZpdGUgfSBmcm9tICdAdGFuc3RhY2svcm91dGVyLXBsdWdpbi92aXRlJ1xuLy8gaHR0cHM6Ly92aXRlLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICB0c2NvbmZpZ1BhdGhzKCksXG4gICAgVGFuU3RhY2tSb3V0ZXJWaXRlKHtcbiAgICAgIHJvdXRlVG9rZW46IFwibGF5b3V0XCJcbiAgICB9KVxuICBdLFxuICBjc3M6IHtcbiAgICBwb3N0Y3NzOiB7XG4gICAgICBwbHVnaW5zOiBbdGFpbHdpbmRjc3MoKV1cbiAgICB9XG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIGhtcjoge1xuICAgICAgb3ZlcmxheTogZmFsc2UsXG4gICAgfVxuICB9XG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvVixTQUFTLG9CQUFvQjtBQUNqWCxPQUFPLFdBQVc7QUFDbEIsT0FBTyxpQkFBaUI7QUFDeEIsT0FBTyxtQkFBbUI7QUFDMUIsU0FBUywwQkFBMEI7QUFFbkMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sY0FBYztBQUFBLElBQ2QsbUJBQW1CO0FBQUEsTUFDakIsWUFBWTtBQUFBLElBQ2QsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLEtBQUs7QUFBQSxJQUNILFNBQVM7QUFBQSxNQUNQLFNBQVMsQ0FBQyxZQUFZLENBQUM7QUFBQSxJQUN6QjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLEtBQUs7QUFBQSxNQUNILFNBQVM7QUFBQSxJQUNYO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
